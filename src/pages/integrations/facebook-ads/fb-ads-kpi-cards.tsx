import { DollarSign, Eye, MousePointer, Target, CreditCard, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import type { FbAdsTotals } from "./fb-ads-types";

interface KpiCardsProps {
	totals: FbAdsTotals;
	totalsPrev: FbAdsTotals | null;
	currency: string;
}

function fmtMoney(n: number, currency: string): string {
	if (!currency) currency = "USD";
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
		}).format(n);
	} catch {
		return `${currency} ${n.toFixed(2)}`;
	}
}

function fmtNum(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
	return n.toLocaleString();
}

function delta(current: number, prev: number | undefined): { pct: number; up: boolean } | null {
	if (prev === undefined || prev === 0) return null;
	const pct = ((current - prev) / prev) * 100;
	return { pct, up: pct >= 0 };
}

const CARDS: {
	key: keyof FbAdsTotals;
	label: string;
	icon: typeof DollarSign;
	color: string;
	bg: string;
	format: "money" | "number" | "roas" | "money-small";
}[] = [
	{ key: "spend", label: "TOTAL SPEND", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", format: "money" },
	{ key: "impressions", label: "IMPRESSIONS", icon: Eye, color: "text-blue-600", bg: "bg-blue-50", format: "number" },
	{ key: "clicks", label: "CLICKS", icon: MousePointer, color: "text-orange-600", bg: "bg-orange-50", format: "number" },
	{ key: "conversions", label: "CONVERSIONS", icon: Target, color: "text-purple-600", bg: "bg-purple-50", format: "number" },
	{ key: "cpc", label: "AVG. CPC", icon: CreditCard, color: "text-indigo-600", bg: "bg-indigo-50", format: "money-small" },
	{ key: "roas", label: "AVG. ROAS", icon: TrendingUp, color: "text-pink-600", bg: "bg-pink-50", format: "roas" },
];

export function FbAdsKpiCards({ totals, totalsPrev, currency }: KpiCardsProps) {
	return (
		<div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
			{CARDS.map((c) => {
				const val = (totals[c.key] as number) ?? 0;
				const prevVal = totalsPrev ? (totalsPrev[c.key] as number) : undefined;
				const d = delta(val, prevVal);

				let display: string;
				if (c.format === "money") display = fmtMoney(val, currency);
				else if (c.format === "money-small") display = fmtMoney(val, currency);
				else if (c.format === "roas") display = `${val.toFixed(2)}x`;
				else display = fmtNum(val);

				const Icon = c.icon;

				return (
					<div key={c.key}
						className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-shadow hover:shadow-md">
						<div className="flex items-center justify-between mb-3">
							<div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.bg}`}>
								<Icon size={18} className={c.color} />
							</div>
							{d && (
								<span className={`flex items-center gap-0.5 text-[11px] font-semibold ${d.up ? "text-emerald-600" : "text-red-500"}`}>
									{d.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
									{Math.abs(d.pct).toFixed(1)}%
								</span>
							)}
						</div>
						<p className="text-lg font-bold text-[var(--foreground)] font-mono">{display}</p>
						<p className="text-[10px] font-medium tracking-wider text-[var(--muted-foreground)] mt-0.5">{c.label}</p>
					</div>
				);
			})}
		</div>
	);
}
