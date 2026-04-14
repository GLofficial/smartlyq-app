import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, FileText } from "lucide-react";
import type { WizardState } from "./wizard-layout";

export function StepTracking({ state, update, onLaunch, submitting }: {
	state: WizardState; update: (p: Partial<WizardState>) => void;
	onLaunch: (asDraft: boolean) => void; submitting: boolean;
}) {
	const t = state.tracking;
	const setT = (partial: Partial<typeof t>) => update({ tracking: { ...t, ...partial } });

	return (
		<div>
			<h2 className="text-lg font-semibold mb-1">Tracking & Review</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-6">Set up conversion tracking and review your campaign.</p>

			<div className="grid grid-cols-2 gap-6 mb-8">
				<div className="space-y-4">
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Pixel / Tag ID (optional)</label>
						<Input value={t.pixel_id} onChange={(e) => setT({ pixel_id: e.target.value })} placeholder="e.g. 123456789" className="mt-1" />
						<p className="text-[11px] text-[var(--muted-foreground)] mt-1">Meta Pixel, Google Tag, or TikTok Pixel ID</p>
					</div>
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Conversion Event (optional)</label>
						<Input value={t.conversion_event} onChange={(e) => setT({ conversion_event: e.target.value })} placeholder="e.g. Purchase, Lead, AddToCart" className="mt-1" />
					</div>
				</div>

				{/* Summary */}
				<Card>
					<CardContent className="p-5 space-y-3">
						<h3 className="text-sm font-semibold text-[var(--foreground)]">Campaign Summary</h3>
						<SummaryRow label="Name" value={state.name || "—"} />
						<SummaryRow label="Platform" value={state.platform || "—"} />
						<SummaryRow label="Objective" value={state.objective || "—"} />
						<SummaryRow label="Budget" value={`€${state.budget.toFixed(2)} ${state.budget_type}`} />
						<SummaryRow label="Locations" value={state.targeting.locations.join(", ") || "All"} />
						<SummaryRow label="Placements" value={`${state.placements.length} selected`} />
						<SummaryRow label="Format" value={state.creative.format} />
						<SummaryRow label="CTA" value={state.creative.cta.replace(/_/g, " ")} />
					</CardContent>
				</Card>
			</div>

			{/* Launch Actions */}
			<div className="flex items-center justify-center gap-4 py-6 border-t border-[var(--border)]">
				<Button variant="outline" size="lg" onClick={() => onLaunch(true)} disabled={submitting}>
					<FileText size={16} className="mr-2" /> Save as Draft
				</Button>
				<Button size="lg" onClick={() => onLaunch(false)} disabled={submitting} className="bg-[var(--sq-primary)]">
					<Rocket size={16} className="mr-2" /> Launch Campaign
				</Button>
			</div>
		</div>
	);
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between py-1 border-b border-[var(--border)] last:border-0">
			<span className="text-xs text-[var(--muted-foreground)]">{label}</span>
			<span className="text-xs font-medium text-[var(--foreground)] capitalize">{value}</span>
		</div>
	);
}
