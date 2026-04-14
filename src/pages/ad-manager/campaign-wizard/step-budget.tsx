import { Input } from "@/components/ui/input";
import { Calendar, TrendingUp } from "lucide-react";
import type { WizardState } from "./wizard-types";

const BID_STRATEGIES = [
	{ id: "highest_volume", label: "Highest Volume", desc: "Get the most results for your budget" },
	{ id: "cost_cap", label: "Cost Cap", desc: "Keep average CPA at or below your cap" },
	{ id: "bid_cap", label: "Bid Cap", desc: "Set maximum bid per auction" },
	{ id: "roas_goal", label: "ROAS Goal", desc: "Optimize for minimum return on ad spend" },
	{ id: "highest_value", label: "Highest Value", desc: "Maximize total purchase value" },
] as const;

export function StepBudget({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	const estReach = state.budget * 200;
	const estClicks = Math.round(state.budget * 2.4);
	const estCpcLow = state.budget > 0 ? (state.budget / (estClicks * 1.5)).toFixed(2) : "0";
	const estCpcHigh = state.budget > 0 ? (state.budget / (estClicks * 0.5)).toFixed(2) : "0";

	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
			<h2 className="text-lg font-semibold text-[var(--foreground)]">Budget & Bid Strategy</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-5">Set your spending limits and bidding approach.</p>

			{/* Campaign Name + Budget Type */}
			<div className="grid grid-cols-2 gap-5 mb-5">
				<div>
					<label className="text-sm font-medium text-[var(--foreground)]">Campaign Name</label>
					<Input value={state.name} onChange={(e) => update({ name: e.target.value })} placeholder="My Campaign" className="mt-1" />
				</div>
				<div>
					<label className="text-sm font-medium text-[var(--foreground)]">Budget Type</label>
					<div className="flex gap-2 mt-1">
						{(["daily", "lifetime"] as const).map((t) => (
							<button key={t} onClick={() => update({ budget_type: t })}
								className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
									state.budget_type === t ? "bg-[var(--sq-primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
								}`}>{t === "daily" ? "Daily Budget" : "Lifetime Budget"}</button>
						))}
					</div>
				</div>
			</div>

			{/* Budget Amount + Start Date */}
			<div className="grid grid-cols-2 gap-5 mb-5">
				<div>
					<label className="text-sm font-medium text-[var(--foreground)]">{state.budget_type === "daily" ? "Daily" : "Lifetime"} Budget ($)</label>
					<Input type="number" min={1} step={1} value={state.budget} onChange={(e) => update({ budget: Number(e.target.value) })} className="mt-1" />
				</div>
				<div>
					<label className="text-sm font-medium text-[var(--foreground)]">Start Date</label>
					<div className="relative mt-1">
						<Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
						<Input type="date" value={state.start_date} onChange={(e) => update({ start_date: e.target.value })} />
					</div>
				</div>
			</div>

			{/* End Date + Ad Scheduling */}
			<div className="grid grid-cols-2 gap-5 mb-5">
				<div>
					<label className="text-sm font-medium text-[var(--muted-foreground)]">End Date <span className="text-xs">(optional)</span></label>
					<div className="relative mt-1">
						<Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
						<Input type="date" value={state.end_date} onChange={(e) => update({ end_date: e.target.value })} placeholder="dd/mm/yyyy" />
					</div>
				</div>
				<div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3 mt-6">
					<div>
						<p className="text-sm font-medium text-[var(--foreground)]">Ad Scheduling (Dayparting)</p>
						<p className="text-xs text-[var(--muted-foreground)]">Only run ads during specific days and hours</p>
					</div>
					<Toggle value={state.ad_scheduling} onChange={(v) => update({ ad_scheduling: v })} />
				</div>
			</div>

			{/* Bid Strategy */}
			<div className="mb-5">
				<label className="text-sm font-medium text-[var(--foreground)]">Bid Strategy</label>
				<div className="grid grid-cols-2 gap-3 mt-2">
					{BID_STRATEGIES.map((b) => (
						<div key={b.id} onClick={() => update({ bid_strategy: b.id })}
							className={`rounded-lg border p-3 cursor-pointer transition-all ${
								state.bid_strategy === b.id ? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
							}`}>
							<p className="text-sm font-semibold text-[var(--foreground)]">{b.label}</p>
							<p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{b.desc}</p>
						</div>
					))}
				</div>
				{/* Bid strategy input fields */}
				{(state.bid_strategy === "cost_cap" || state.bid_strategy === "bid_cap") && (
					<div className="mt-3 rounded-lg border border-[var(--border)] p-3">
						<label className="text-sm font-medium text-[var(--foreground)]">
							{state.bid_strategy === "cost_cap" ? "Target Cost Per Purchase (€)" : "Maximum Bid Per Auction (€)"}
						</label>
						<Input type="number" min={0.01} step={0.01} value={state.bid_cap_amount || ""} placeholder="e.g. 15.00"
							onChange={(e) => update({ bid_cap_amount: Number(e.target.value) })} className="mt-1 w-48" />
						<p className="text-[10px] text-[var(--muted-foreground)] mt-1">
							{state.bid_strategy === "cost_cap"
								? "Meta will try to keep your average cost per purchase at or below this amount."
								: "The maximum amount you're willing to pay per auction. Lower bids may reduce delivery."}
						</p>
					</div>
				)}
				{state.bid_strategy === "roas_goal" && (
					<div className="mt-3 rounded-lg border border-[var(--border)] p-3">
						<label className="text-sm font-medium text-[var(--foreground)]">Target ROAS</label>
						<Input type="number" min={0.1} step={0.1} value={state.roas_target || ""} placeholder="e.g. 4.0"
							onChange={(e) => update({ roas_target: Number(e.target.value) })} className="mt-1 w-48" />
						<p className="text-[10px] text-[var(--muted-foreground)] mt-1">
							Your minimum acceptable return on ad spend (e.g. 4.0 means €4 revenue per €1 spent).
						</p>
					</div>
				)}
			</div>

			{/* Budget Estimator */}
			<div className="rounded-lg border border-[var(--border)] p-4">
				<div className="flex items-center gap-2 mb-3">
					<TrendingUp size={16} className="text-[var(--sq-primary)]" />
					<p className="text-sm font-semibold text-[var(--foreground)]">Budget & Reach Estimator</p>
				</div>
				<div className="flex items-center justify-between mb-3">
					<span className="text-sm text-[var(--muted-foreground)]">Est. Daily Spend</span>
					<span className="text-lg font-bold text-[var(--foreground)]">${state.budget.toFixed(2)}</span>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<EstimateBar label="Daily Reach" value={`${Math.round(estReach * 0.67).toLocaleString()} – ${estReach.toLocaleString()}`} pct={65} />
					<EstimateBar label="Daily Clicks" value={`${Math.round(estClicks * 0.8)} – ${Math.round(estClicks * 2.4)}`} pct={45} />
					<EstimateBar label="Avg CPC" value={`$${estCpcLow} – $${estCpcHigh}`} pct={30} />
					<EstimateBar label="CTR" value="1.2%" pct={50} />
				</div>
				<div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
					<span className="text-sm text-[var(--muted-foreground)]">Est. Conversions/Day</span>
					<span className="text-sm font-medium text-[var(--foreground)]">1 – 3</span>
				</div>
				<p className="text-[10px] text-[var(--muted-foreground)] mt-2">Estimates are based on average platform benchmarks and are not guaranteed.</p>
			</div>
		</div>
	);
}

function EstimateBar({ label, value, pct }: { label: string; value: string; pct: number }) {
	return (
		<div>
			<p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">{label}</p>
			<p className="text-sm font-bold text-[var(--foreground)]">{value}</p>
			<div className="h-1 w-full rounded-full bg-[var(--border)] mt-1">
				<div className="h-full rounded-full bg-[var(--sq-primary)]" style={{ width: `${pct}%` }} />
			</div>
		</div>
	);
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
	return (
		<button onClick={() => onChange(!value)} className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-[var(--sq-primary)]" : "bg-gray-300"}`}>
			<span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
		</button>
	);
}
