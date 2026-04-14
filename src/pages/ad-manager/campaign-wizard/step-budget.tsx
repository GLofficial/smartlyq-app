import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar } from "lucide-react";
import type { WizardState } from "./wizard-layout";

export function StepBudget({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	return (
		<div>
			<h2 className="text-lg font-semibold mb-1">Budget & Bid</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-6">Set your campaign budget and schedule.</p>

			<div className="grid grid-cols-2 gap-6">
				<div className="space-y-5">
					{/* Budget Type */}
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Budget Type</label>
						<div className="flex gap-3 mt-2">
							{["daily", "lifetime"].map((t) => (
								<Card key={t} className={`flex-1 cursor-pointer transition-all ${state.budget_type === t ? "ring-2 ring-[var(--sq-primary)]" : "hover:shadow-md"}`}
									onClick={() => update({ budget_type: t })}>
									<CardContent className="p-4 text-center">
										<p className="text-sm font-semibold capitalize text-[var(--foreground)]">{t}</p>
										<p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
											{t === "daily" ? "Spend up to this amount per day" : "Spend this total over the campaign lifetime"}
										</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>

					{/* Budget Amount */}
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Budget Amount (€)</label>
						<div className="relative mt-1">
							<DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
							<Input type="number" min={1} step={0.01} value={state.budget}
								onChange={(e) => update({ budget: Number(e.target.value) })} className="pl-9" />
						</div>
						<p className="text-[11px] text-[var(--muted-foreground)] mt-1">
							{state.budget_type === "daily"
								? `Estimated monthly: €${(state.budget * 30).toFixed(2)}`
								: `Total campaign budget: €${state.budget.toFixed(2)}`}
						</p>
					</div>
				</div>

				<div className="space-y-5">
					{/* Schedule */}
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Start Date</label>
						<div className="relative mt-1">
							<Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
							<Input type="date" value={state.start_date} onChange={(e) => update({ start_date: e.target.value })} className="pl-9" />
						</div>
					</div>
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">End Date (optional)</label>
						<div className="relative mt-1">
							<Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
							<Input type="date" value={state.end_date} onChange={(e) => update({ end_date: e.target.value })} className="pl-9" />
						</div>
						<p className="text-[11px] text-[var(--muted-foreground)] mt-1">Leave empty for ongoing campaign</p>
					</div>
				</div>
			</div>
		</div>
	);
}
