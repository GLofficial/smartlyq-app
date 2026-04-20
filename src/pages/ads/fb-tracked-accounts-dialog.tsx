import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFbAdAccounts, useSetFbTrackedAccounts } from "@/api/ad-manager/settings";
import { Search } from "lucide-react";

interface Props {
	open: boolean;
	onClose: () => void;
}

/**
 * Multi-account opt-in picker for Meta ad accounts.
 *
 * Lists every account the connected Meta token can reach. User ticks
 * which to track; only ticked accounts are synced to Ad Manager. Nothing
 * in the UI auto-selects all — users must explicitly opt in per account.
 */
export function FbTrackedAccountsDialog({ open, onClose }: Props) {
	const { data, isLoading } = useFbAdAccounts();
	const saveMutation = useSetFbTrackedAccounts();

	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [query, setQuery] = useState("");

	// Seed selection from server on open so unchecked accounts aren't lost.
	useEffect(() => {
		if (open && data?.tracked) {
			setSelected(new Set(data.tracked));
		}
	}, [open, data?.tracked]);

	const available = data?.available ?? [];
	const filtered = query.trim() === ""
		? available
		: available.filter((a) => {
			const q = query.toLowerCase();
			return a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.account_id.toLowerCase().includes(q);
		});

	const toggle = (id: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const handleSave = async () => {
		await saveMutation.mutateAsync(Array.from(selected));
		onClose();
	};

	const allCount = available.length;
	const selCount = selected.size;

	return (
		<Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Choose Meta ad accounts to track</DialogTitle>
					<DialogDescription>
						Only the accounts you tick here are synced and shown in Ad Manager. We never pull data from accounts you haven&apos;t explicitly selected.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex h-40 items-center justify-center">
						<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
					</div>
				) : !data?.connected ? (
					<div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
						Connect Meta Ads first to pick accounts.
					</div>
				) : allCount === 0 ? (
					<div className="py-8 text-center text-sm text-[var(--muted-foreground)]">
						No ad accounts are reachable with the current Meta token.
					</div>
				) : (
					<>
						<div className="relative">
							<Search size={14} className="absolute left-3 top-2.5 text-[var(--muted-foreground)]" />
							<Input
								placeholder="Search by account name or id..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="pl-8"
							/>
						</div>

						<div className="max-h-80 overflow-y-auto rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
							{filtered.map((a) => {
								const checked = selected.has(a.id);
								return (
									<label key={a.id} className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--muted)]/50">
										<input
											type="checkbox"
											checked={checked}
											onChange={() => toggle(a.id)}
											className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[var(--sq-primary)]"
										/>
										<div className="flex-1 min-w-0">
											<div className="text-sm font-medium text-[var(--foreground)] truncate">{a.name || a.id}</div>
											<div className="text-xs text-[var(--muted-foreground)]">
												{a.id}
												{a.currency ? ` · ${a.currency}` : ""}
												{a.timezone ? ` · ${a.timezone}` : ""}
											</div>
										</div>
									</label>
								);
							})}
							{filtered.length === 0 && (
								<div className="px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">No accounts match your search.</div>
							)}
						</div>

						<div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
							<span>{selCount} of {allCount} selected</span>
							<div className="space-x-3">
								<button className="hover:underline" onClick={() => setSelected(new Set(filtered.map((a) => a.id)))}>Select all (filtered)</button>
								<button className="hover:underline" onClick={() => setSelected(new Set())}>Clear</button>
							</div>
						</div>
					</>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={saveMutation.isPending}>Cancel</Button>
					<Button onClick={handleSave} disabled={saveMutation.isPending || !data?.connected}>
						{saveMutation.isPending ? "Saving..." : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
