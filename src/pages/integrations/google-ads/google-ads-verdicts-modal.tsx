import { X, Check, XCircle, FlaskConical, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Recommendation {
	entity_id: string;
	suggested: string;
	reason: string;
}

interface VerdictsModalProps {
	open: boolean;
	onClose: () => void;
	recommendations: Recommendation[];
	rows: { key: string; entity_id?: string; spend: number; roas: number; conversions: number }[];
	onTriageChange?: (entityId: string, level: string, decision: string) => void;
}

const DECISION_CONFIG: Record<string, { icon: typeof Check; label: string; color: string; bg: string }> = {
	keep: { icon: Check, label: "Keep", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
	kill: { icon: XCircle, label: "Kill", color: "text-red-700", bg: "bg-red-50 border-red-200" },
	test: { icon: FlaskConical, label: "Test", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
};

export function GoogleAdsVerdictsModal({ open, onClose, recommendations, rows, onTriageChange }: VerdictsModalProps) {
	if (!open || !recommendations.length) return null;

	const enriched = recommendations.map((rec) => {
		const row = rows.find((r) => r.entity_id === rec.entity_id);
		return { ...rec, name: row?.key ?? rec.entity_id, spend: row?.spend ?? 0, roas: row?.roas ?? 0, conversions: row?.conversions ?? 0 };
	});

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
			<div className="w-full max-w-2xl max-h-[80vh] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
					<div className="flex items-center gap-2">
						<Sparkles size={18} className="text-[var(--sq-primary)]" />
						<h2 className="text-base font-semibold text-[var(--foreground)]">AI Verdicts — Keep / Kill / Test</h2>
					</div>
					<button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--muted)]"><X size={18} className="text-[var(--muted-foreground)]" /></button>
				</div>

				<div className="flex-1 overflow-y-auto p-5 space-y-3">
					{enriched.map((rec) => {
						const cfg = DECISION_CONFIG[rec.suggested] || DECISION_CONFIG.test!;
						const Icon = cfg.icon;
						return (
							<div key={rec.entity_id} className={`rounded-lg border p-4 ${cfg.bg}`}>
								<div className="flex items-start justify-between gap-3">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<Icon size={14} className={cfg.color} />
											<span className={`text-xs font-bold uppercase ${cfg.color}`}>{cfg.label}</span>
											<span className="text-sm font-medium text-[var(--foreground)] truncate">{rec.name}</span>
										</div>
										<p className="text-xs text-[var(--muted-foreground)]">{rec.reason}</p>
										<div className="flex gap-4 mt-2 text-[10px] text-[var(--muted-foreground)]">
											<span>Spend: {rec.spend > 0 ? `${rec.spend.toFixed(2)}` : "—"}</span>
											<span>ROAS: {rec.roas > 0 ? `${rec.roas.toFixed(2)}x` : "—"}</span>
											<span>Conv: {rec.conversions}</span>
										</div>
									</div>
									{onTriageChange && (
										<div className="flex gap-1 shrink-0">
											{(["keep", "kill", "test"] as const).map((d) => {
												const c = DECISION_CONFIG[d]!;
												const DIcon = c.icon;
												return (
													<button key={d} onClick={() => onTriageChange(rec.entity_id, "campaign", d)}
														className={`flex items-center gap-0.5 rounded px-2 py-1 text-[10px] font-medium border transition-colors ${rec.suggested === d ? `${c.bg} ${c.color}` : "border-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>
														<DIcon size={10} /> {c.label}
													</button>
												);
											})}
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>

				<div className="flex items-center justify-end px-5 py-3 border-t border-[var(--border)]">
					<Button variant="outline" size="sm" onClick={onClose}>Close</Button>
				</div>
			</div>
		</div>
	);
}
