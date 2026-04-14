import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Target, Eye, MousePointer, ShoppingCart, Users, MessageSquare } from "lucide-react";
import type { WizardState } from "./wizard-layout";

const OBJECTIVES = [
	{ id: "awareness", label: "Brand Awareness", desc: "Reach people likely to remember your ads", icon: Eye },
	{ id: "traffic", label: "Traffic", desc: "Drive visits to your website or app", icon: MousePointer },
	{ id: "engagement", label: "Engagement", desc: "Get more messages, video views, or interactions", icon: MessageSquare },
	{ id: "leads", label: "Lead Generation", desc: "Collect leads for your business", icon: Users },
	{ id: "conversions", label: "Conversions", desc: "Drive valuable actions on your website", icon: Target },
	{ id: "sales", label: "Sales / Shopping", desc: "Sell products from your catalog", icon: ShoppingCart },
] as const;

export function StepObjective({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	return (
		<div>
			<h2 className="text-lg font-semibold mb-1">Choose Campaign Objective</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-4">What result do you want from this campaign?</p>

			<div className="mb-6">
				<label className="text-sm font-medium text-[var(--foreground)]">Campaign Name</label>
				<Input value={state.name} onChange={(e) => update({ name: e.target.value })} placeholder="My Campaign" className="mt-1" />
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
				{OBJECTIVES.map((o) => {
					const selected = state.objective === o.id;
					return (
						<Card key={o.id} className={`cursor-pointer transition-all ${selected ? "ring-2 ring-[var(--sq-primary)]" : "hover:shadow-md"}`}
							onClick={() => update({ objective: o.id })}>
							<CardContent className="flex items-start gap-3 p-4 relative">
								{selected && <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[var(--sq-primary)] flex items-center justify-center"><Check size={12} className="text-white" /></div>}
								<o.icon size={20} className={selected ? "text-[var(--sq-primary)]" : "text-[var(--muted-foreground)]"} />
								<div>
									<p className="text-sm font-semibold text-[var(--foreground)]">{o.label}</p>
									<p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{o.desc}</p>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
