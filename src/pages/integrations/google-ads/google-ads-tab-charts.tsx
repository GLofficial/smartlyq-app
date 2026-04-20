import { useState } from "react";
import {
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
	ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import type { GoogleAdsRow } from "./google-ads-types";

type HourMetric = "spend" | "impressions" | "clicks" | "conversions";
const HOUR_METRICS: { key: HourMetric; label: string }[] = [
	{ key: "spend", label: "Spend" },
	{ key: "impressions", label: "Impressions" },
	{ key: "clicks", label: "Clicks" },
	{ key: "conversions", label: "Conversions" },
];

/* ---------- helpers ---------- */

function fmtMoney(n: number, currency: string): string {
	if (!currency) currency = "USD";
	try {
		return new Intl.NumberFormat(undefined, { style: "currency", currency, notation: "compact" }).format(n);
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

function Card({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
				{right}
			</div>
			{children}
		</div>
	);
}

function MetricToggle({ value, onChange, options }: { value: string; onChange: (m: string) => void; options: { key: string; label: string }[] }) {
	return (
		<select value={value} onChange={(e) => onChange(e.target.value)}
			className="rounded border border-[var(--border)] bg-transparent px-2 py-1 text-xs">
			{options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
		</select>
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
   DevicesChart — donut by spend
   ================================================================ */

const DEVICE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#64748b"];

export function DevicesChart({ rows, currency }: { rows: GoogleAdsRow[]; currency: string }) {
	if (!rows.length) return null;
	const data = [...rows].sort((a, b) => b.spend - a.spend).slice(0, 5).map((r) => ({ name: r.key || "Unknown", value: r.spend }));
	return (
		<Card title="Spend by Device">
			<ResponsiveContainer width="100%" height={260}>
				<PieChart>
					<Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
						{data.map((_, i) => <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />)}
					</Pie>
					<Tooltip content={<SimpleTooltip formatter={(v: number) => fmtMoney(v, currency)} />} />
				</PieChart>
			</ResponsiveContainer>
		</Card>
	);
}

/* ================================================================
   GeoChart — horizontal bar top 10 countries by spend
   ================================================================ */

export function GeoChart({ rows, currency }: { rows: GoogleAdsRow[]; currency: string }) {
	if (!rows.length) return null;
	const data = [...rows].sort((a, b) => b.spend - a.spend).slice(0, 10)
		.map((r) => ({ name: truncate(r.key || "Unknown", 24), spend: r.spend }));
	return (
		<Card title="Top Countries by Spend">
			<ResponsiveContainer width="100%" height={Math.max(250, data.length * 36)}>
				<BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
					<defs>
						<linearGradient id="gadsGeoGrad" x1="0" y1="0" x2="1" y2="0">
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
					<Bar dataKey="spend" name="Spend" fill="url(#gadsGeoGrad)" radius={[0, 4, 4, 0]} maxBarSize={24} />
				</BarChart>
			</ResponsiveContainer>
		</Card>
	);
}

/* ================================================================
   HourOfDayChart — 24 columns
   ================================================================ */

export function HourOfDayChart({ rows, currency }: { rows: GoogleAdsRow[]; currency: string }) {
	const [metric, setMetric] = useState<HourMetric>("spend");
	if (!rows.length) return null;

	const hours: { hour: string; spend: number; impressions: number; clicks: number; conversions: number }[] =
		Array.from({ length: 24 }, (_, i) => ({
			hour: `${String(i).padStart(2, "0")}:00`,
			spend: 0, impressions: 0, clicks: 0, conversions: 0,
		}));

	for (const r of rows) {
		const h = parseInt(r.key, 10);
		const bucket = h >= 0 && h < 24 ? hours[h] : undefined;
		if (bucket) {
			bucket.spend += r.spend;
			bucket.impressions += r.impressions;
			bucket.clicks += r.clicks;
			bucket.conversions += r.conversions;
		}
	}

	const maxVal = Math.max(...hours.map((h) => h[metric]));
	const isMoney = metric === "spend";
	const title = metric === "spend" ? "Spend by Hour of Day"
		: metric === "impressions" ? "Impressions by Hour"
		: metric === "clicks" ? "Clicks by Hour" : "Conversions by Hour";

	return (
		<Card title={title} right={<MetricToggle value={metric} onChange={(m) => setMetric(m as HourMetric)} options={HOUR_METRICS} />}>
			<p className="text-xs text-[var(--muted-foreground)] mb-3 -mt-2">Identify &ldquo;golden hours&rdquo; with highest activity.</p>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={hours} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
					<defs>
						<linearGradient id="gadsHourGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
							<stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
						</linearGradient>
						<linearGradient id="gadsHourGolden" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95} />
							<stop offset="100%" stopColor="#f59e0b" stopOpacity={0.5} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
					<XAxis dataKey="hour" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						interval={1} />
					<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						tickFormatter={(v: number) => isMoney ? fmtMoney(v, currency) : fmtNum(v)} />
					<Tooltip content={<HourTooltip currency={currency} />} />
					<Bar dataKey={metric} name={title} radius={[3, 3, 0, 0]} maxBarSize={20}>
						{hours.map((h, i) => (
							<Cell key={i} fill={h[metric] > 0 && h[metric] === maxVal ? "url(#gadsHourGolden)" : "url(#gadsHourGrad)"} />
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
   NetworkChart — donut by spend per ad network
   ================================================================ */

export function NetworkChart({ rows, currency }: { rows: GoogleAdsRow[]; currency: string }) {
	if (!rows.length) return null;
	const data = [...rows].sort((a, b) => b.spend - a.spend).map((r) => ({ name: r.key || "Unknown", value: r.spend }));
	return (
		<Card title="Spend by Network">
			<ResponsiveContainer width="100%" height={260}>
				<PieChart>
					<Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
						{data.map((_, i) => <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />)}
					</Pie>
					<Tooltip content={<SimpleTooltip formatter={(v: number) => fmtMoney(v, currency)} />} />
				</PieChart>
			</ResponsiveContainer>
		</Card>
	);
}

/* ================================================================
   DemographicsChart — age + gender grouped bars
   ================================================================ */

export function DemographicsChart({ rows, currency }: { rows: GoogleAdsRow[]; currency: string }) {
	const [metric, setMetric] = useState<HourMetric>("spend");
	if (!rows.length) return null;

	const ageRows = rows.filter((r) => r.dimension === "age");
	const genderRows = rows.filter((r) => r.dimension === "gender");
	const isMoney = metric === "spend";
	const fmtVal = (v: number) => isMoney ? fmtMoney(v, currency) : fmtNum(v);
	const metricLabel = HOUR_METRICS.find((m) => m.key === metric)?.label || "Spend";

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2">
				{ageRows.length > 0 && (
					<Card title={`${metricLabel} by Age Range`} right={<MetricToggle value={metric} onChange={(m) => setMetric(m as HourMetric)} options={HOUR_METRICS} />}>
						<ResponsiveContainer width="100%" height={260}>
							<BarChart data={ageRows.map((r) => ({ name: r.age_range || r.key, val: (r as unknown as Record<string, number>)[metric] ?? 0 }))} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
								<XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
								<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
									tickFormatter={fmtVal} />
								<Tooltip content={<SimpleTooltip formatter={fmtVal} />} />
								<Bar dataKey="val" name={metricLabel} fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={30} />
							</BarChart>
						</ResponsiveContainer>
					</Card>
				)}
				{genderRows.length > 0 && (
					<Card title={`${metricLabel} by Gender`}>
						<ResponsiveContainer width="100%" height={260}>
							<PieChart>
								<Pie data={genderRows.map((r) => ({ name: r.gender || r.key, value: (r as unknown as Record<string, number>)[metric] ?? 0 }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={2}>
									{genderRows.map((_, i) => <Cell key={i} fill={["#3b82f6", "#ec4899", "#9ca3af"][i % 3]} />)}
								</Pie>
								<Tooltip content={<SimpleTooltip formatter={fmtVal} />} />
							</PieChart>
						</ResponsiveContainer>
					</Card>
				)}
			</div>
			{ageRows.length > 0 && <AgeEfficiencyChart rows={ageRows} currency={currency} />}
		</div>
	);
}

type EfficiencyMetric = "roas" | "ctr" | "cpc";
const EFFICIENCY_METRICS: { key: EfficiencyMetric; label: string }[] = [
	{ key: "roas", label: "ROAS" },
	{ key: "ctr", label: "CTR" },
	{ key: "cpc", label: "CPC" },
];

function AgeEfficiencyChart({ rows, currency }: { rows: GoogleAdsRow[]; currency: string }) {
	const [effMetric, setEffMetric] = useState<EfficiencyMetric>("roas");
	const data = rows.map((r) => {
		const ctr = r.impressions > 0 ? r.clicks / r.impressions : 0;
		const cpc = r.clicks > 0 ? r.spend / r.clicks : 0;
		return {
			name: r.age_range || r.key,
			spend: r.spend,
			roas: r.roas,
			ctr, cpc,
		};
	});
	const fmtSpend = (v: number) => fmtMoney(v, currency);
	const fmtEff = (v: number) => effMetric === "roas" ? `${v.toFixed(2)}x` : effMetric === "ctr" ? `${(v * 100).toFixed(2)}%` : fmtMoney(v, currency);

	return (
		<Card title="Age: Spend vs Efficiency" right={<MetricToggle value={effMetric} onChange={(m) => setEffMetric(m as EfficiencyMetric)} options={EFFICIENCY_METRICS} />}>
			<ResponsiveContainer width="100%" height={260}>
				<BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
					<XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
					<YAxis yAxisId="left" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						tickFormatter={fmtSpend} />
					<YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						tickFormatter={fmtEff} />
					<Tooltip />
					<Bar yAxisId="left" dataKey="spend" name="Spend" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={30} />
					<Bar yAxisId="right" dataKey={effMetric} name={effMetric.toUpperCase()} fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={30} />
				</BarChart>
			</ResponsiveContainer>
		</Card>
	);
}

/* ================================================================
   CompetitorsChart — impression share per campaign
   ================================================================ */

export function CompetitorsChart({ rows }: { rows: GoogleAdsRow[] }) {
	if (!rows.length) return null;
	const data = [...rows].sort((a, b) => (b.impression_share ?? 0) - (a.impression_share ?? 0)).slice(0, 10)
		.map((r) => ({
			name: truncate(r.key || "Unknown", 24),
			yours: (r.impression_share ?? 0) * 100,
			competitors: (r.competitor_share ?? 0) * 100,
		}));
	return (
		<Card title="Impression Share: You vs Competitors">
			<ResponsiveContainer width="100%" height={Math.max(250, data.length * 36)}>
				<BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }} stackOffset="expand">
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
					<XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						tickFormatter={(v: number) => `${v.toFixed(0)}%`} domain={[0, 100]} />
					<YAxis type="category" dataKey="name" width={150}
						tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
					<Tooltip content={<SimpleTooltip formatter={(v: number) => `${v.toFixed(1)}%`} />} />
					<Bar dataKey="yours" name="You" stackId="a" fill="#22c55e" maxBarSize={24} />
					<Bar dataKey="competitors" name="Competitors" stackId="a" fill="#ef4444" maxBarSize={24} />
				</BarChart>
			</ResponsiveContainer>
		</Card>
	);
}
