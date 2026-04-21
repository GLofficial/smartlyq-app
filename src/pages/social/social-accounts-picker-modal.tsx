import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertTriangle, Trash2, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PlatformIcon } from "./platform-icon";
import {
	useSocialAccountsPending,
	useActivateSocialAccounts,
	useDisconnectAccount,
	type PendingAccount,
} from "@/api/social-accounts";

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
	company: "Company Page",
};

export function SocialAccountsPickerModal({ platform, open, onClose }: Props) {
	const qc = useQueryClient();
	const pendingQ = useSocialAccountsPending(platform, open);
	const activateMut = useActivateSocialAccounts();
	const disconnectMut = useDisconnectAccount();
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const cancelFiredRef = useRef(false);

	// Memoize the derived arrays from react-query data so their reference is stable across
	// renders when the underlying query data hasn't changed. The old pattern (data?.x ?? [])
	// returned a new [] on every render when data was undefined, causing the useEffect below
	// to re-fire indefinitely (React error #185 — "Maximum update depth exceeded").
	const pendingRows: PendingAccount[] = useMemo(
		() => pendingQ.data?.pending ?? [],
		[pendingQ.data?.pending],
	);
	const activeRows: PendingAccount[] = useMemo(
		() => pendingQ.data?.active ?? [],
		[pendingQ.data?.active],
	);
	const planLimit = pendingQ.data?.plan_limit ?? null;
	const activeCountAll = pendingQ.data?.active_count ?? 0;

	// Stable primitive key that only changes when the SET of pending IDs changes. Using a
	// string in the useEffect dep array guarantees the effect doesn't re-fire on unrelated
	// re-renders (e.g. user ticks a checkbox, which changes selectedIds but not the pending list).
	const pendingIdsKey = useMemo(
		() => pendingRows.map((r) => r.id).join(","),
		[pendingRows],
	);

	// Pre-select every pending row on first successful load for this platform.
	useEffect(() => {
		if (!pendingQ.isSuccess) return;
		if (pendingIdsKey === "") return;
		setSelectedIds(new Set(pendingRows.map((r) => r.id)));
		// Intentionally omit pendingRows from deps — pendingIdsKey is the stable primitive
		// proxy for "did the pending set change" and prevents effect-setState-effect loops.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pendingQ.isSuccess, pendingIdsKey]);

	// Reset the cancel-guard when the modal opens so a fresh flow can vacuum on close.
	useEffect(() => {
		if (open) cancelFiredRef.current = false;
	}, [open]);

	const platformLabel = PLATFORM_LABELS[platform] ?? platform;

	const remaining = useMemo(() => {
		if (planLimit === null) return null;
		return Math.max(0, planLimit - activeCountAll);
	}, [planLimit, activeCountAll]);

	const selectedCount = selectedIds.size;
	const overLimit =
		planLimit !== null && remaining !== null && selectedCount > remaining;

	function toggle(id: number) {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	function selectAll() {
		// Respect plan limit when bulk-selecting.
		const ids = pendingRows.map((r) => r.id);
		if (planLimit !== null && remaining !== null && ids.length > remaining) {
			setSelectedIds(new Set(ids.slice(0, remaining)));
		} else {
			setSelectedIds(new Set(ids));
		}
	}

	function clearAll() {
		setSelectedIds(new Set());
	}

	async function handleDisconnect(row: PendingAccount) {
		try {
			await disconnectMut.mutateAsync(row.id);
			// Refetch picker data so plan-usage + active list update without closing the modal.
			await qc.invalidateQueries({ queryKey: ["social", "accounts", "pending", platform] });
			await qc.invalidateQueries({ queryKey: ["social", "accounts", "full"] });
		} catch (e) {
			toast.error((e as Error)?.message ?? "Disconnect failed");
		}
	}

	async function handleSave() {
		const ids = Array.from(selectedIds);
		if (ids.length === 0) {
			toast.error("Select at least one account to connect.");
			return;
		}
		if (overLimit) {
			toast.error("You've selected more accounts than your plan allows. Disconnect some first or reduce your selection.");
			return;
		}
		try {
			const r = await activateMut.mutateAsync({ platform, selected_ids: ids });
			toast.success(`Connected ${r.activated} account${r.activated === 1 ? "" : "s"}`);
			setSelectedIds(new Set());
			// Prevent Dialog's onOpenChange from triggering a second empty-activate after
			// the modal animates out.
			cancelFiredRef.current = true;
			onClose();
		} catch (e) {
			toast.error((e as Error)?.message ?? "Failed to connect accounts");
		}
	}

	// Guarded with a ref so onOpenChange(false) firing during Dialog close animation
	// doesn't cause a second vacuum call after handleSave already closed the modal.
	const handleCancel = useCallback(async () => {
		if (cancelFiredRef.current) return;
		cancelFiredRef.current = true;
		try {
			await activateMut.mutateAsync({ platform, selected_ids: [] });
		} catch {
			// Ignore — vacuum best-effort.
		}
		setSelectedIds(new Set());
		onClose();
	}, [activateMut, platform, onClose]);

	return (
		<Dialog open={open} onOpenChange={(o) => { if (!o) handleCancel(); }}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--muted)]">
							<PlatformIcon platform={platform} size={20} />
						</div>
						<div>
							<DialogTitle>Connect {platformLabel}</DialogTitle>
							<DialogDescription>
								Pick which {platformLabel} account{pendingRows.length === 1 ? "" : "s"} to connect. Already-connected accounts are shown below and can be disconnected to free up plan slots.
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				{/* Plan-usage pill — always visible. */}
				<div className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs ${
					overLimit ? "border-red-300 bg-red-50 text-red-900" :
					remaining === 0 ? "border-amber-300 bg-amber-50 text-amber-900" :
					"border-[var(--border)] bg-[var(--muted)]/50"
				}`}>
					<span className="font-medium">
						{planLimit === null ? "Unlimited accounts" : `${activeCountAll} / ${planLimit} accounts used`}
					</span>
					{planLimit !== null && remaining !== null && (
						<span className={overLimit ? "text-red-700 font-medium" : "text-[var(--muted-foreground)]"}>
							{overLimit ? `Over limit — selected ${selectedCount}, only ${remaining} slots free` :
							 remaining === 0 ? `All slots used — disconnect to free one` :
							 `${remaining} slot${remaining === 1 ? "" : "s"} available`}
						</span>
					)}
				</div>

				<div className="max-h-[55vh] overflow-y-auto -mx-2 px-2 space-y-4">
					{/* NEW accounts to connect */}
					{pendingQ.isLoading ? (
						<div className="flex items-center justify-center py-10">
							<Loader2 size={18} className="animate-spin text-[var(--muted-foreground)]" />
						</div>
					) : pendingRows.length === 0 ? (
						<div className="flex flex-col items-center gap-3 py-8 text-center">
							<AlertTriangle size={24} className="text-[var(--muted-foreground)]" />
							<p className="text-sm text-[var(--muted-foreground)]">
								No new {platformLabel} accounts were returned after authorization.
							</p>
							{platform === "instagram" ? (
								<div className="rounded-md border border-[var(--border)] bg-[var(--muted)]/30 p-3 text-left text-xs text-[var(--muted-foreground)] max-w-sm">
									<p className="flex items-start gap-2 mb-2">
										<Info size={13} className="mt-0.5 shrink-0 text-blue-600" />
										<span className="font-medium text-[var(--foreground)]">Instagram via Facebook requires:</span>
									</p>
									<ul className="list-disc ml-5 space-y-1">
										<li>Your Instagram is a <strong>Business</strong> or <strong>Creator</strong> account.</li>
										<li>It's <strong>linked to a Facebook Page</strong> you admin.</li>
										<li>You selected that Page during authorization.</li>
									</ul>
									<p className="mt-2">If all the above are true, try the <strong>Instagram Direct</strong> option instead — it doesn't require a linked Facebook Page.</p>
								</div>
							) : platform === "instagram_direct" ? (
								<p className="text-xs text-[var(--muted-foreground)] max-w-sm">
									Make sure your Instagram is a Business or Creator account. Personal accounts aren't supported by the Instagram Graph API.
								</p>
							) : (
								<p className="text-xs text-[var(--muted-foreground)]">
									Try reconnecting, or make sure your {platformLabel} account has the required permissions.
								</p>
							)}
						</div>
					) : (
						<div>
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
									Select accounts to connect
								</h3>
								<div className="flex items-center gap-2 text-xs">
									<button onClick={selectAll} className="text-[var(--sq-primary)] hover:underline" type="button">
										{remaining !== null && pendingRows.length > remaining ? `Select ${remaining}` : "Select all"}
									</button>
									<span className="text-[var(--muted-foreground)]">·</span>
									<button onClick={clearAll} className="text-[var(--muted-foreground)] hover:underline" type="button">
										Clear
									</button>
								</div>
							</div>
							<ul className="space-y-1.5">
								{pendingRows.map((r) => (
									<PickerRow
										key={r.id}
										row={r}
										checked={selectedIds.has(r.id)}
										onToggle={() => toggle(r.id)}
									/>
								))}
							</ul>
						</div>
					)}

					{/* ALREADY connected accounts for this platform — disconnect inline to free slots. */}
					{activeRows.length > 0 && (
						<div>
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
									Already connected ({activeRows.length})
								</h3>
							</div>
							<p className="text-[11px] text-[var(--muted-foreground)] mb-2">
								Social accounts are shared with everyone in this workspace. Accounts connected by teammates are listed here too.
							</p>
							<ul className="space-y-1.5">
								{activeRows.map((r) => (
									<ConnectedRow
										key={r.id}
										row={r}
										onDisconnect={() => handleDisconnect(r)}
										busy={disconnectMut.isPending}
									/>
								))}
							</ul>
						</div>
					)}
				</div>

				<DialogFooter className="gap-2">
					<Button variant="outline" onClick={handleCancel} disabled={activateMut.isPending}>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={activateMut.isPending || pendingRows.length === 0 || selectedCount === 0 || overLimit}
					>
						{activateMut.isPending ? (
							<><Loader2 size={14} className="mr-1.5 animate-spin" /> Connecting…</>
						) : selectedCount === 0 ? (
							"Select at least one"
						) : overLimit ? (
							"Over plan limit"
						) : (
							`Connect ${selectedCount} account${selectedCount === 1 ? "" : "s"}`
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function PickerRow({ row, checked, onToggle }: { row: PendingAccount; checked: boolean; onToggle: () => void }) {
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

function ConnectedRow({ row, onDisconnect, busy }: { row: PendingAccount; onDisconnect: () => void; busy: boolean }) {
	const kind = KIND_LABELS[row.account_type] ?? row.account_type;
	const connectedBy = row.connected_by_name?.trim() ?? "";
	return (
		<li className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--muted)]/30 p-2.5">
			{row.profile_picture ? (
				<img src={row.profile_picture} alt="" className="h-9 w-9 rounded-full object-cover" />
			) : (
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)]">
					<PlatformIcon platform={row.platform} size={16} />
				</div>
			)}
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium flex items-center gap-1.5">
					{row.account_name || row.account_username}
					<CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
				</p>
				<p className="truncate text-xs text-[var(--muted-foreground)]">
					{kind}
					{row.account_username && row.account_username !== row.account_name && ` · @${row.account_username}`}
					{connectedBy && <span className="ml-1 text-[var(--muted-foreground)]/70">· connected by {connectedBy}</span>}
				</p>
			</div>
			<Button
				variant="ghost"
				size="sm"
				className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
				onClick={onDisconnect}
				disabled={busy}
				title="Disconnect"
			>
				<Trash2 size={13} className="mr-1" /> Disconnect
			</Button>
		</li>
	);
}
