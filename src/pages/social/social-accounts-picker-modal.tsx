import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PlatformIcon } from "./platform-icon";
import { useSocialAccountsPending, useActivateSocialAccounts, type PendingAccount } from "@/api/social-accounts";

interface Props {
	platform: string;
	open: boolean;
	onClose: () => void;
}

const PLATFORM_LABELS: Record<string, string> = {
	facebook: "Facebook",
	instagram: "Instagram",
	instagram_direct: "Instagram",
	linkedin: "LinkedIn",
	twitter: "X (Twitter)",
	tiktok: "TikTok",
	youtube: "YouTube",
	gmb: "Google Business",
	pinterest: "Pinterest",
	reddit: "Reddit",
	tumblr: "Tumblr",
	threads: "Threads",
};

const KIND_LABELS: Record<string, string> = {
	page: "Page",
	channel: "Channel",
	creator: "Creator",
	location: "Location",
	blog: "Blog",
	person: "Profile",
	user: "Profile",
	personal: "Profile",
	business: "Business",
};

export function SocialAccountsPickerModal({ platform, open, onClose }: Props) {
	const pendingQ = useSocialAccountsPending(platform, open);
	const activateMut = useActivateSocialAccounts();
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

	const rows = pendingQ.data?.pending ?? [];
	const planLimit = pendingQ.data?.plan_limit ?? null;
	const activeCount = pendingQ.data?.active_count ?? 0;

	// On first load, pre-select every pending row so single-candidate platforms are one click.
	useEffect(() => {
		if (rows.length === 0) {
			setSelectedIds(new Set());
			return;
		}
		setSelectedIds((prev) => (prev.size === 0 ? new Set(rows.map((r) => r.id)) : prev));
	}, [rows]);

	const platformLabel = PLATFORM_LABELS[platform] ?? platform;
	const remaining = useMemo(() => {
		if (planLimit === null) return null;
		return Math.max(0, planLimit - activeCount);
	}, [planLimit, activeCount]);

	function toggle(id: number) {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	async function handleSave() {
		const ids = Array.from(selectedIds);
		if (ids.length === 0) {
			toast.error("Select at least one account to connect.");
			return;
		}
		try {
			const r = await activateMut.mutateAsync({ platform, selected_ids: ids });
			toast.success(`Connected ${r.activated} account${r.activated === 1 ? "" : "s"}`);
			setSelectedIds(new Set());
			onClose();
		} catch (e) {
			toast.error((e as Error)?.message ?? "Failed to connect accounts");
		}
	}

	async function handleCancel() {
		// Vacuum pending rows — user chose not to connect any of them.
		try {
			await activateMut.mutateAsync({ platform, selected_ids: [] });
		} catch {
			// Ignore — vacuum best-effort.
		}
		setSelectedIds(new Set());
		onClose();
	}

	return (
		<Dialog open={open} onOpenChange={(o) => { if (!o) handleCancel(); }}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--muted)]">
							<PlatformIcon platform={platform} size={20} />
						</div>
						<div>
							<DialogTitle>Select {platformLabel} account{rows.length === 1 ? "" : "s"}</DialogTitle>
							<DialogDescription>
								Choose which {platformLabel} account{rows.length === 1 ? "" : "s"} to connect to your workspace.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{planLimit !== null && (
					<div className="flex items-center justify-between rounded-md bg-[var(--muted)]/60 px-3 py-1.5 text-xs">
						<span className="text-[var(--muted-foreground)]">Plan usage</span>
						<span className="font-medium">
							{activeCount} / {planLimit} accounts used
							{remaining !== null && remaining < rows.length && (
								<span className="ml-1 text-amber-600">(max {remaining} more)</span>
							)}
						</span>
					</div>
				)}

				<div className="max-h-[50vh] overflow-y-auto -mx-2 px-2">
					{pendingQ.isLoading ? (
						<div className="flex items-center justify-center py-10">
							<Loader2 size={18} className="animate-spin text-[var(--muted-foreground)]" />
						</div>
					) : rows.length === 0 ? (
						<div className="flex flex-col items-center gap-2 py-10 text-center">
							<AlertTriangle size={28} className="text-[var(--muted-foreground)]" />
							<p className="text-sm text-[var(--muted-foreground)]">
								No {platformLabel} accounts were returned after authorization.
							</p>
							<p className="text-xs text-[var(--muted-foreground)]">
								Try again, or make sure your {platformLabel} account has the required permissions.
							</p>
						</div>
					) : (
						<ul className="space-y-1.5 py-2">
							{rows.map((r) => (
								<Row key={r.id} row={r} checked={selectedIds.has(r.id)} onToggle={() => toggle(r.id)} />
							))}
						</ul>
					)}
				</div>

				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={handleCancel} disabled={activateMut.isPending}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={activateMut.isPending || rows.length === 0}>
						{activateMut.isPending ? (<><Loader2 size={14} className="mr-1.5 animate-spin" /> Connecting…</>) : `Connect ${selectedIds.size || ""}`.trim()}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function Row({ row, checked, onToggle }: { row: PendingAccount; checked: boolean; onToggle: () => void }) {
	const kind = KIND_LABELS[row.account_type] ?? row.account_type;
	return (
		<li>
			<button
				type="button"
				onClick={onToggle}
				className={`flex w-full items-center gap-3 rounded-md border p-2.5 text-left transition-colors ${
					checked
						? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5"
						: "border-[var(--border)] hover:border-[var(--muted-foreground)]/40"
				}`}
			>
				<Checkbox checked={checked} onCheckedChange={onToggle} onClick={(e) => e.stopPropagation()} />
				{row.profile_picture ? (
					<img src={row.profile_picture} alt="" className="h-9 w-9 rounded-full object-cover" />
				) : (
					<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)]">
						<PlatformIcon platform={row.platform} size={16} />
					</div>
				)}
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{row.account_name || row.account_username}</p>
					<p className="truncate text-xs text-[var(--muted-foreground)]">
						{kind}
						{row.account_username && row.account_username !== row.account_name && ` · @${row.account_username}`}
					</p>
				</div>
			</button>
		</li>
	);
}
