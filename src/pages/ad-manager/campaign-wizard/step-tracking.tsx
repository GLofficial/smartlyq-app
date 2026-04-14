import { Input } from "@/components/ui/input";
import { ShoppingCart, ShoppingBag, Users, UserPlus, Eye, Settings } from "lucide-react";
import type { WizardState } from "./wizard-types";

const EVENTS = [
	{ id: "purchase", label: "Purchase", icon: ShoppingCart },
	{ id: "add_to_cart", label: "Add to Cart", icon: ShoppingBag },
	{ id: "lead", label: "Lead", icon: Users },
	{ id: "sign_up", label: "Sign Up", icon: UserPlus },
	{ id: "page_view", label: "Page View", icon: Eye },
	{ id: "custom", label: "Custom Event", icon: Settings },
] as const;

export function StepTracking({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
			<h2 className="text-lg font-semibold text-[var(--foreground)]">Conversion Tracking</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-5">Set up tracking to measure your campaign performance.</p>

			{/* Conversion Event */}
			<div className="mb-5">
				<label className="text-sm font-medium text-[var(--foreground)]">Conversion Event</label>
				<div className="grid grid-cols-3 gap-3 mt-2">
					{EVENTS.map((e) => {
						const sel = state.conversion_event === e.id;
						return (
							<div key={e.id} onClick={() => update({ conversion_event: e.id })}
								className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition-all ${
									sel ? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
								}`}>
								<e.icon size={16} className={sel ? "text-[var(--sq-primary)]" : "text-[var(--muted-foreground)]"} />
								<span className="text-sm font-medium text-[var(--foreground)]">{e.label}</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Pixel Tracking */}
			<div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3 mb-5">
				<div>
					<p className="text-sm font-medium text-[var(--foreground)]">Meta Pixel Tracking</p>
					<p className="text-xs text-[var(--muted-foreground)]">Enable Meta Pixel for conversion tracking</p>
				</div>
				<button onClick={() => update({ pixel_tracking: !state.pixel_tracking })}
					className={`relative h-6 w-11 rounded-full transition-colors ${state.pixel_tracking ? "bg-[var(--sq-primary)]" : "bg-gray-300"}`}>
					<span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${state.pixel_tracking ? "translate-x-5" : "translate-x-0.5"}`} />
				</button>
			</div>

			{/* UTM Parameters */}
			<div>
				<label className="text-sm font-medium text-[var(--muted-foreground)]">UTM Parameters <span className="text-xs">(optional)</span></label>
				<div className="grid grid-cols-3 gap-4 mt-2">
					<div>
						<label className="text-xs text-[var(--muted-foreground)]">Source</label>
						<Input value={state.utm_source} onChange={(e) => update({ utm_source: e.target.value })} placeholder="e.g. facebook" className="mt-1" />
					</div>
					<div>
						<label className="text-xs text-[var(--muted-foreground)]">Medium</label>
						<Input value={state.utm_medium} onChange={(e) => update({ utm_medium: e.target.value })} placeholder="e.g. cpc" className="mt-1" />
					</div>
					<div>
						<label className="text-xs text-[var(--muted-foreground)]">Campaign</label>
						<Input value={state.utm_campaign} onChange={(e) => update({ utm_campaign: e.target.value })} placeholder="e.g. summer_sale" className="mt-1" />
					</div>
				</div>
			</div>
		</div>
	);
}
