import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import type { WizardState } from "./wizard-types";
import { PLATFORM_LABELS } from "./wizard-types";

export function StepReview({ state, update, onLaunch, submitting }: {
	state: WizardState; update: (p: Partial<WizardState>) => void;
	onLaunch: (asDraft: boolean) => void; submitting: boolean;
}) {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
			<h2 className="text-lg font-semibold text-[var(--foreground)]">Review & Launch</h2>
			<p className="text-sm text-[var(--sq-primary)] mb-5">Double-check everything before going live.</p>

			<div className="divide-y divide-[var(--border)]">
				<Row label="Ad Account" value={state.account_name || "—"} />
				<Row label="Platform" value={PLATFORM_LABELS[state.platform] || state.platform || "—"} />
				<Row label="Objective" value={state.objective || "—"} />
				<Row label="Audience" value={state.locations.join(", ") || "All"} />
				<Row label="Languages" value={state.languages.join(", ") || "All"} />
				<Row label="Devices" value={state.devices.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")} />
				<Row label="Advantage+ Audience" value={state.advantage_audience ? "Enabled" : "Disabled"} />
				<Row label="Dynamic Creative" value={state.dynamic_creative ? "Enabled" : "Disabled"} />
				<Row label="Optimization Goal" value={state.conversion_event ? state.conversion_event.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—"} />
				<Row label="Budget" value={`$${state.budget}/${state.budget_type}`} />
				<Row label="Advantage Budget (CBO)" value="Disabled" />
				<Row label="Bid Strategy" value={state.bid_strategy.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} />
				<Row label="Ad Format" value={state.creative_format || "—"} />
				<Row label="CTA" value={state.cta || "—"} />
				<Row label="Conversion Event" value={state.conversion_event ? state.conversion_event.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—"} />
				<Row label="Meta Pixel" value={state.pixel_tracking ? "Enabled" : "Disabled"} />
				<Row label="Campaign Name" value={state.name || "Untitled"} />
				<Row label="Start Date" value={state.start_date || "—"} />
			</div>

			{/* Sandbox + Launch */}
			<div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border)]">
				<label className="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" checked={state.sandbox_mode} onChange={(e) => update({ sandbox_mode: e.target.checked })}
						className="rounded border-[var(--border)]" />
					<span className="text-sm text-[var(--muted-foreground)]">Sandbox Mode</span>
				</label>
				<Button onClick={() => onLaunch(false)} disabled={submitting} size="lg"
					className="bg-[var(--sq-primary)] hover:bg-[var(--sq-primary)]/90">
					<Rocket size={16} className="mr-2" /> Launch Campaign
				</Button>
			</div>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between py-3">
			<span className="text-sm text-[var(--muted-foreground)]">{label}</span>
			<span className="text-sm font-medium text-[var(--foreground)] capitalize">{value}</span>
		</div>
	);
}
