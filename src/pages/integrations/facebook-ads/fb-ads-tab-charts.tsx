import {
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
	ResponsiveContainer, Cell,
} from "recharts";
import type { FbAdsRow } from "./fb-ads-types";

/* ---------- helpers ---------- */

function fmtMoney(n: number, currency: string): string {
	if (!currency) currency = "USD";
	try {
		return new Intl.NumberFormat(undefined, {
			style: "currency", currency, notation: "compact",
		}).format(n);
	} catch { return `${n.toFixed(0)}`; }
}

function fmtNum(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return n.toLocaleString();
}

function truncate(s: string, max: number): string {
	return s.length > max ? s.slice(0, max - 1) + "\u2026" : s;
}

/* ---------- card wrapper ---------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
			<h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">{title}</h3>
			{children}
		</div>
	);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function SimpleTooltip({ active, payload, label, formatter }: any) {
	if (!active || !payload?.length) return null;
	return (
		<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg text-xs">
			<p className="font-medium text-[var(--foreground)] mb-1">{label}</p>
			{payload.map((p: any, i: number) => (
				<div key={i} className="flex items-center gap-2">
					<span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color ?? p.fill }} />
					<span className="text-[var(--muted-foreground)]">{p.name}:</span>
					<span className="font-medium text-[var(--foreground)]">
						{formatter ? formatter(p.value, p.name) : p.value}
					</span>
				</div>
			))}
		</div>
	);
}

/* ================================================================
   1. DemographicsChart — age x gender grouped bars
   ================================================================ */

interface DemographicsChartProps { rows: FbAdsRow[]; currency: string }

export function DemographicsChart({ rows, currency }: DemographicsChartProps) {
	if (!rows.length) return null;

	// Parse keys like "18-24 female", "25-34 male", "65+ unknown"
	const buckets = new Map<string, { male: number; female: number; unknown: number }>();
	for (const r of rows) {
		const parts = r.key.split(" ");
		const gender = (parts.pop() ?? "unknown").toLowerCase();
		const age = parts.join(" ") || "unknown";
		if (!buckets.has(age)) buckets.set(age, { male: 0, female: 0, unknown: 0 });
		const b = buckets.get(age)!;
		if (gender === "male") b.male += r.spend;
		else if (gender === "female") b.female += r.spend;
		else b.unknown += r.spend;
	}

	const data = Array.from(buckets.entries())
		.map(([age, v]) => ({ age, ...v }))
		.sort((a, b) => {
			const numA = parseInt(a.age); const numB = parseInt(b.age);
			if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
			return a.age.localeCompare(b.age);
		});

	if (!data.length) return null;

	return (
		<Card title="Spend by Age & Gender">
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
					<XAxis dataKey="age" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
					<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						tickFormatter={(v: number) => fmtMoney(v, currency)} />
					<Tooltip content={<SimpleTooltip formatter={(v: number) => fmtMoney(v, currency)} />} />
					<Bar dataKey="male" name="Male" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={20} />
					<Bar dataKey="female" name="Female" fill="#ec4899" radius={[3, 3, 0, 0]} maxBarSize={20} />
					<Bar dataKey="unknown" name="Unknown" fill="#9ca3af" radius={[3, 3, 0, 0]} maxBarSize={20} />
				</BarChart>
			</ResponsiveContainer>
		</Card>
	);
}

/* ================================================================
   2. PlacementChart — horizontal bar, top 10 by spend
   ================================================================ */

interface PlacementChartProps { rows: FbAdsRow[]; currency: string }

export function PlacementChart({ rows, currency }: PlacementChartProps) {
	if (!rows.length) return null;

	const data = [...rows]
		.sort((a, b) => b.spend - a.spend)
		.slice(0, 10)
		.map((r) => ({ name: truncate(r.key, 28), spend: r.spend }));

	if (!data.length) return null;

	return (
		<Card title="Top Placements by Spend">
			<ResponsiveContainer width="100%" height={Math.max(250, data.length * 36)}>
				<BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
					<defs>
						<linearGradient id="placementGrad" x1="0" y1="0" x2="1" y2="0">
							<stop offset="0%" stopColor="#3b82f6" stopOpacity={0.85} />
							<stop offset="100%" stopColor="#60a5fa" stopOpacity={0.95} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
					<XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						tickFormatter={(v: number) => fmtMoney(v, currency)} />
					<YAxis type="category" dataKey="name" width={150}
						tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
					<Tooltip content={<SimpleTooltip formatter={(v: number) => fmtMoney(v, currency)} />} />
					<Bar dataKey="spend" name="Spend" fill="url(#placementGrad)" radius={[0, 4, 4, 0]} maxBarSize={24} />
				</BarChart>
			</ResponsiveContainer>
		</Card>
	);
}

/* ================================================================
   3. HourOfDayChart — 24 columns, golden-hour highlight
   ================================================================ */

interface HourOfDayChartProps { rows: FbAdsRow[]; currency: string }

export function HourOfDayChart({ rows, currency }: HourOfDayChartProps) {
	if (!rows.length) return null;

	// Build per-hour buckets
	const hours: { hour: string; spend: number; clicks: number; conversions: number }[] =
		Array.from({ length: 24 }, (_, i) => ({
			hour: `${String(i).padStart(2, "0")}:00`,
			spend: 0, clicks: 0, conversions: 0,
		}));

	for (const r of rows) {
		const h = parseInt(r.key, 10);
		const bucket = h >= 0 && h < 24 ? hours[h] : undefined;
		if (bucket) {
			bucket.spend += r.spend;
			bucket.clicks += r.clicks;
			bucket.conversions += r.conversions;
		}
	}

	const maxSpend = Math.max(...hours.map((h) => h.spend));

	return (
		<Card title="Spend by Hour of Day">
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={hours} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
					<defs>
						<linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
							<stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
						</linearGradient>
						<linearGradient id="hourGolden" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95} />
							<stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
					<XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						interval={1} />
					<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						tickFormatter={(v: number) => fmtMoney(v, currency)} />
					<Tooltip content={<HourTooltip currency={currency} />} />
					<Bar dataKey="spend" name="Spend" radius={[3, 3, 0, 0]} maxBarSize={20}>
						{hours.map((h, i) => (
							<Cell key={i} fill={h.spend > 0 && h.spend === maxSpend ? "url(#hourGolden)" : "url(#hourGrad)"} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</Card>
	);
}

function HourTooltip({ active, payload, label, currency }: any) {
	if (!active || !payload?.length) return null;
	const d = payload[0]?.payload;
	return (
		<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg text-xs">
			<p className="font-medium text-[var(--foreground)] mb-1">{label}</p>
			<div className="space-y-0.5">
				<div className="text-[var(--muted-foreground)]">Spend: <span className="font-medium text-[var(--foreground)]">{fmtMoney(d?.spend ?? 0, currency)}</span></div>
				<div className="text-[var(--muted-foreground)]">Clicks: <span className="font-medium text-[var(--foreground)]">{fmtNum(d?.clicks ?? 0)}</span></div>
				<div className="text-[var(--muted-foreground)]">Conversions: <span className="font-medium text-[var(--foreground)]">{fmtNum(d?.conversions ?? 0)}</span></div>
			</div>
		</div>
	);
}

/* ================================================================
   4. ConversionFunnelChart — pure HTML/CSS horizontal funnel
   ================================================================ */

interface ConversionFunnelProps {
	totals: {
		impressions: number; clicks: number; conversions: number;
		link_clicks: number; add_to_cart?: number; initiate_checkout?: number;
	};
}

const FUNNEL_COLORS = ["#3b82f6", "#22c55e", "#eab308", "#a855f7", "#f97316", "#ef4444"];

export function ConversionFunnelChart({ totals }: ConversionFunnelProps) {
	const steps: { label: string; value: number }[] = [
		{ label: "Impressions", value: totals.impressions },
		{ label: "Clicks", value: totals.clicks },
		{ label: "Link Clicks", value: totals.link_clicks },
		{ label: "Add to Cart", value: totals.add_to_cart ?? 0 },
		{ label: "Checkout", value: totals.initiate_checkout ?? 0 },
		{ label: "Conversions", value: totals.conversions },
	].filter((s) => s.value > 0);

	if (steps.length < 2) {
		return (
			<Card title="Conversion Funnel">
				<p className="text-sm text-[var(--muted-foreground)]">Not enough funnel data</p>
			</Card>
		);
	}

	const maxVal = (steps[0]?.value) || 1;

	return (
		<Card title="Conversion Funnel">
			<div className="space-y-3">
				{steps.map((step, i) => {
					const pct = Math.max((step.value / maxVal) * 100, 8);
					const prev = i > 0 ? steps[i - 1] : undefined;
					const rate = prev && prev.value > 0
						? ((step.value / prev.value) * 100).toFixed(1) + "%"
						: null;
					const color = FUNNEL_COLORS[i % FUNNEL_COLORS.length];

					return (
						<div key={step.label}>
							<div className="flex items-center justify-between mb-1">
								<span className="text-xs font-medium text-[var(--foreground)]">{step.label}</span>
								<div className="flex items-center gap-2">
									{rate && (
										<span className="text-[10px] text-[var(--muted-foreground)]">{rate}</span>
									)}
									<span className="text-xs font-semibold text-[var(--foreground)]">{fmtNum(step.value)}</span>
								</div>
							</div>
							<div className="h-7 rounded-md overflow-hidden bg-[var(--border)]" style={{ opacity: 0.15 }}>
								{/* background track */}
							</div>
							<div
								className="h-7 rounded-md -mt-7 relative flex items-center pl-2"
								style={{ width: `${pct}%`, backgroundColor: color, transition: "width 0.5s ease" }}
							>
								<span className="text-[10px] font-medium text-white drop-shadow-sm">
									{fmtNum(step.value)}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</Card>
	);
}
