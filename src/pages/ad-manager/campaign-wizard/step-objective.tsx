import { Eye, MousePointer, MessageSquare, Users, ShoppingCart, Smartphone } from "lucide-react";
import type { WizardState } from "./wizard-types";
import { PLATFORM_LABELS } from "./wizard-types";

const OBJECTIVES = [
	{ id: "awareness", label: "Awareness", desc: "Reach people likely to remember your ad", icon: Eye },
	{ id: "traffic", label: "Traffic", desc: "Send people to your website or app", icon: MousePointer },
	{ id: "engagement", label: "Engagement", desc: "Get more messages, likes, and comments", icon: MessageSquare },
	{ id: "leads", label: "Leads", desc: "Collect leads with instant forms", icon: Users },
	{ id: "app_promotion", label: "App Promotion", desc: "Get more app installs and events", icon: Smartphone },
	{ id: "sales", label: "Sales", desc: "Drive purchases and conversions", icon: ShoppingCart },
] as const;

export function StepObjective({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	const platformName = PLATFORM_LABELS[state.platform] || "your";
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
			<h2 className="text-lg font-semibold text-[var(--foreground)]">Campaign Objective</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-6">What's the goal of this {platformName} campaign?</p>
			<div className="grid grid-cols-2 gap-3">
				{OBJECTIVES.map((o) => {
					const selected = state.objective === o.id;
					return (
						<div key={o.id} onClick={() => update({ objective: o.id })}
							className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
								selected ? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
							}`}>
							<o.icon size={18} className={selected ? "text-[var(--sq-primary)] mt-0.5" : "text-[var(--muted-foreground)] mt-0.5"} />
							<div>
								<p className="text-sm font-semibold text-[var(--foreground)]">{o.label}</p>
								<p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{o.desc}</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
