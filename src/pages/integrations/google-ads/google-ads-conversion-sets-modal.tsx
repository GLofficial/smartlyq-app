import { useState, useEffect, useMemo } from "react";
import { X, Target, ShoppingCart, Users as UsersIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface ConversionAction {
	id: string;
	name: string;
	category: string;
	type: string;
	status: string;
}

interface ApiResp {
	connected: number;
	customer_id: string;
	actions: ConversionAction[];
	sets: { leads: string[]; purchases: string[] };
	error?: string | null;
}

interface Props {
	open: boolean;
	onClose: () => void;
	onSaved?: () => void;
}

export function GoogleAdsConversionSetsModal({ open, onClose, onSaved }: Props) {
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [actions, setActions] = useState<ConversionAction[]>([]);
	const [leadIds, setLeadIds] = useState<Set<string>>(new Set());
	const [purchaseIds, setPurchaseIds] = useState<Set<string>>(new Set());
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setLoading(true);
		setError(null);
		apiClient.get<ApiResp>("/api/spa/integrations/google-ads/conversion-actions")
			.then((data) => {
				setActions(data.actions || []);
				setLeadIds(new Set(data.sets?.leads || []));
				setPurchaseIds(new Set(data.sets?.purchases || []));
				if (data.error) setError(data.error);
			})
			.catch((e: unknown) => setError((e as Error)?.message || "Failed to load"))
			.finally(() => setLoading(false));
	}, [open]);

	const grouped = useMemo(() => {
		const map = new Map<string, ConversionAction[]>();
		for (const a of actions) {
			const key = a.category || "OTHER";
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(a);
		}
		return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
	}, [actions]);

	function toggle(set: Set<string>, setter: (s: Set<string>) => void, id: string) {
		const next = new Set(set);
		if (next.has(id)) next.delete(id); else next.add(id);
		setter(next);
	}

	async function handleSave() {
		setSaving(true);
		try {
			const r = await apiClient.post<{ ok?: number; error?: string }>("/api/spa/integrations/google-ads/action", {
				action: "gads_set_conversion_sets",
				lead_actions: Array.from(leadIds),
				purchase_actions: Array.from(purchaseIds),
			});
			if (r.error) {
				toast.error(r.error);
			} else {
				toast.success("Conversion sets saved");
				onSaved?.();
				onClose();
			}
		} catch (e) {
			toast.error((e as Error)?.message || "Failed to save");
		} finally {
			setSaving(false);
		}
	}

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
			<div className="w-full max-w-3xl max-h-[85vh] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
					<div className="flex items-center gap-2">
						<Target size={18} className="text-[var(--sq-primary)]" />
						<div>
							<h2 className="text-base font-semibold text-[var(--foreground)]">Conversion Actions</h2>
							<p className="text-xs text-[var(--muted-foreground)]">
								Tick which conversion actions count as Leads vs Purchases. Leave empty to use Google Ads &ldquo;Conversions&rdquo; (unfiltered).
							</p>
						</div>
					</div>
					<button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--muted)]"><X size={18} className="text-[var(--muted-foreground)]" /></button>
				</div>

				<div className="flex-1 overflow-y-auto p-5">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 size={24} className="animate-spin text-[var(--sq-primary)]" />
						</div>
					) : error ? (
						<p className="text-sm text-red-500 py-8 text-center">{error}</p>
					) : actions.length === 0 ? (
						<p className="text-sm text-[var(--muted-foreground)] py-8 text-center">No conversion actions found for this account.</p>
					) : (
						<div className="space-y-5">
							{grouped.map(([cat, list]) => (
								<div key={cat}>
									<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">{cat.replace(/_/g, " ")}</p>
									<div className="rounded-lg border border-[var(--border)]">
										<div className="grid grid-cols-[1fr_110px_110px] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] border-b border-[var(--border)] bg-[var(--muted)]/30">
											<span>Name</span>
											<span className="text-center inline-flex items-center gap-1 justify-center"><UsersIcon size={10} /> Lead</span>
											<span className="text-center inline-flex items-center gap-1 justify-center"><ShoppingCart size={10} /> Purchase</span>
										</div>
										{list.map((a) => (
											<div key={a.id} className="grid grid-cols-[1fr_110px_110px] gap-2 px-3 py-2 text-sm border-b border-[var(--border)] last:border-0">
												<div className="min-w-0">
													<p className="font-medium truncate">{a.name}</p>
													<p className="text-[10px] text-[var(--muted-foreground)] truncate">{a.type.replace(/_/g, " ").toLowerCase()} · {a.status.toLowerCase()}</p>
												</div>
												<label className="inline-flex items-center justify-center cursor-pointer">
													<input type="checkbox" checked={leadIds.has(a.id)} onChange={() => toggle(leadIds, setLeadIds, a.id)} />
												</label>
												<label className="inline-flex items-center justify-center cursor-pointer">
													<input type="checkbox" checked={purchaseIds.has(a.id)} onChange={() => toggle(purchaseIds, setPurchaseIds, a.id)} />
												</label>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)]">
					<p className="text-xs text-[var(--muted-foreground)]">
						{leadIds.size} lead · {purchaseIds.size} purchase action{purchaseIds.size === 1 ? "" : "s"}
					</p>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
						<Button size="sm" onClick={handleSave} disabled={saving || loading} className="gap-1.5">
							{saving && <Loader2 size={12} className="animate-spin" />}
							Save
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
