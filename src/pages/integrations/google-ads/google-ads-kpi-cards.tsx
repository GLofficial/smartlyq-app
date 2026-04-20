import { DollarSign, Eye, MousePointer, Target, CreditCard, TrendingUp, ArrowUp, ArrowDown, Percent, Zap } from "lucide-react";
import type { GoogleAdsTotals } from "./google-ads-types";

interface KpiCardsProps {
	totals: GoogleAdsTotals;
	totalsPrev: GoogleAdsTotals | null;
	currency: string;
}

function fmtMoney(n: number, currency: string): string {
	if (!currency) currency = "USD";
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
		}).format(n);
	} catch { return `${currency} ${n.toFixed(2)}`; }
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

interface CardDef {
	key: keyof GoogleAdsTotals;
	label: string;
	icon: typeof DollarSign;
	color: string;
	bg: string;
	format: "money" | "number" | "roas" | "money-small" | "pct" | "decimal";
	row: 1 | 2;
}

const CARDS: CardDef[] = [
	// Row 1 — primary
	{ key: "spend", label: "TOTAL SPEND", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", format: "money", row: 1 },
	{ key: "impressions", label: "IMPRESSIONS", icon: Eye, color: "text-blue-600", bg: "bg-blue-50", format: "number", row: 1 },
	{ key: "clicks", label: "CLICKS", icon: MousePointer, color: "text-orange-600", bg: "bg-orange-50", format: "number", row: 1 },
	{ key: "conversions", label: "CONVERSIONS", icon: Target, color: "text-purple-600", bg: "bg-purple-50", format: "number", row: 1 },
	{ key: "cpc", label: "AVG. CPC", icon: CreditCard, color: "text-indigo-600", bg: "bg-indigo-50", format: "money-small", row: 1 },
	{ key: "roas", label: "ROAS", icon: TrendingUp, color: "text-pink-600", bg: "bg-pink-50", format: "roas", row: 1 },
	// Row 2 — secondary
	{ key: "ctr", label: "CTR", icon: Percent, color: "text-amber-600", bg: "bg-amber-50", format: "pct", row: 2 },
	{ key: "cpm", label: "CPM", icon: DollarSign, color: "text-teal-600", bg: "bg-teal-50", format: "money-small", row: 2 },
	{ key: "conversion_rate", label: "CONV. RATE", icon: Percent, color: "text-amber-600", bg: "bg-amber-50", format: "pct", row: 2 },
	{ key: "cpa", label: "CPA", icon: CreditCard, color: "text-sky-600", bg: "bg-sky-50", format: "money-small", row: 2 },
	{ key: "revenue", label: "REVENUE", icon: DollarSign, color: "text-green-600", bg: "bg-green-50", format: "money", row: 2 },
	{ key: "aov", label: "AOV", icon: Zap, color: "text-violet-600", bg: "bg-violet-50", format: "money-small", row: 2 },
];

function formatValue(val: number, format: CardDef["format"], currency: string): string {
	switch (format) {
		case "money": return fmtMoney(val, currency);
		case "money-small": return fmtMoney(val, currency);
		case "roas": return `${val.toFixed(2)}x`;
		case "pct": return `${(val * 100).toFixed(2)}%`;
		case "decimal": return val.toFixed(2);
		default: return fmtNum(val);
	}
}

export function GoogleAdsKpiCards({ totals, totalsPrev, currency }: KpiCardsProps) {
	const row1 = CARDS.filter((c) => c.row === 1);
	const row2 = CARDS.filter((c) => c.row === 2);

	return (
		<div className="space-y-3">
			<div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
				{row1.map((c) => <KpiCard key={c.key} card={c} totals={totals} totalsPrev={totalsPrev} currency={currency} />)}
			</div>
			<div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
				{row2.map((c) => {
					const val = (totals[c.key] as number) ?? 0;
					if (val === 0 && (c.key === "aov" || c.key === "revenue")) return null;
					return <KpiCardMini key={c.key} card={c} totals={totals} totalsPrev={totalsPrev} currency={currency} />;
				})}
			</div>
		</div>
	);
}

function KpiCard({ card: c, totals, totalsPrev, currency }: { card: CardDef; totals: GoogleAdsTotals; totalsPrev: GoogleAdsTotals | null; currency: string }) {
	const val = (totals[c.key] as number) ?? 0;
	const prevVal = totalsPrev ? (totalsPrev[c.key] as number) : undefined;
	const d = delta(val, prevVal);
	const Icon = c.icon;

	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-shadow hover:shadow-md">
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
			<p className="text-lg font-bold text-[var(--foreground)] font-mono">{formatValue(val, c.format, currency)}</p>
			<p className="text-[10px] font-medium tracking-wider text-[var(--muted-foreground)] mt-0.5">{c.label}</p>
		</div>
	);
}

function KpiCardMini({ card: c, totals, totalsPrev, currency }: { card: CardDef; totals: GoogleAdsTotals; totalsPrev: GoogleAdsTotals | null; currency: string }) {
	const val = (totals[c.key] as number) ?? 0;
	const prevVal = totalsPrev ? (totalsPrev[c.key] as number) : undefined;
	const d = delta(val, prevVal);
	const Icon = c.icon;

	return (
		<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 transition-shadow hover:shadow-sm">
			<div className="flex items-center gap-2 mb-1">
				<Icon size={13} className={c.color} />
				<span className="text-[9px] font-medium tracking-wider text-[var(--muted-foreground)]">{c.label}</span>
				{d && (
					<span className={`ml-auto flex items-center gap-0.5 text-[9px] font-semibold ${d.up ? "text-emerald-600" : "text-red-500"}`}>
						{d.up ? <ArrowUp size={9} /> : <ArrowDown size={9} />}
						{Math.abs(d.pct).toFixed(0)}%
					</span>
				)}
			</div>
			<p className="text-sm font-bold text-[var(--foreground)] font-mono">{formatValue(val, c.format, currency)}</p>
		</div>
	);
}
