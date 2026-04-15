import { useState } from "react";
import {
	ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
	ResponsiveContainer,
} from "recharts";
import type { FbAdsTimeseriesPoint } from "./fb-ads-types";

interface PerformanceChartProps {
	timeseries: FbAdsTimeseriesPoint[];
	timeseriesPrev?: FbAdsTimeseriesPoint[] | null;
	currency: string;
}

type Metric = "spend" | "impressions" | "conversions";

const METRIC_CONFIG: Record<Metric, { label: string; color: string; format: (v: number, c: string) => string }> = {
	spend: { label: "Spend", color: "#3b82f6", format: (v, c) => fmtMoney(v, c) },
	impressions: { label: "Impressions", color: "#3b82f6", format: (v) => fmtNum(v) },
	conversions: { label: "Conversions", color: "#3b82f6", format: (v) => fmtNum(v) },
};

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
function fmtDate(d: string): string {
	try { const dt = new Date(d); return `${dt.getDate()} ${dt.toLocaleString("default", { month: "short" })}`; }
	catch { return d; }
}

export function FbAdsPerformanceChart({ timeseries, timeseriesPrev, currency }: PerformanceChartProps) {
	const [barMetric, setBarMetric] = useState<Metric>("spend");
	const lineMetric: Metric = barMetric === "spend" ? "conversions" : "spend";

	if (!timeseries.length) {
		return (
			<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 flex items-center justify-center h-72">
				<p className="text-sm text-[var(--muted-foreground)]">No performance data for this period</p>
			</div>
		);
	}

	const chartData = timeseries.map((pt, i) => ({
		date: fmtDate(pt.date),
		[barMetric]: pt[barMetric],
		[lineMetric]: pt[lineMetric],
		...(timeseriesPrev?.[i] ? { prev: timeseriesPrev[i][barMetric] } : {}),
	}));

	const barCfg = METRIC_CONFIG[barMetric];
	const lineCfg = METRIC_CONFIG[lineMetric];

	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h3 className="text-sm font-semibold text-[var(--foreground)]">Performance over time</h3>
					<div className="flex items-center gap-3 mt-1">
						<span className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
							<span className="h-2 w-2 rounded-full bg-blue-500" /> {barCfg.label} (bars)
						</span>
						<span className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
							<span className="h-2 w-2 rounded-full bg-purple-500" /> {lineCfg.label} (line)
						</span>
					</div>
				</div>
				<div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
					{(["spend", "impressions", "conversions"] as Metric[]).map((m) => (
						<button key={m} onClick={() => setBarMetric(m)}
							className={`px-3 py-1.5 text-xs font-medium transition-colors ${
								barMetric === m
									? "bg-[var(--sq-primary)] text-white"
									: "bg-[var(--card)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
							}`}>{METRIC_CONFIG[m].label}</button>
					))}
				</div>
			</div>

			<ResponsiveContainer width="100%" height={300}>
				<ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
					<defs>
						<linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
							<stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
					<XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
					<YAxis yAxisId="left" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						tickFormatter={(v: number) => barCfg.format(v, currency)} />
					<YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						tickFormatter={(v: number) => lineCfg.format(v, currency)} />
					<Tooltip content={<ChartTooltip barMetric={barMetric} lineMetric={lineMetric} currency={currency} />} />
					<Bar yAxisId="left" dataKey={barMetric} fill="url(#barGrad)" radius={[3, 3, 0, 0]} maxBarSize={24} />
					<Line yAxisId="right" type="monotone" dataKey={lineMetric} stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
					{timeseriesPrev && (
						<Line yAxisId="left" type="monotone" dataKey="prev" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
					)}
				</ComposedChart>
			</ResponsiveContainer>
		</div>
	);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function ChartTooltip({ active, payload, label, barMetric, lineMetric, currency }: any) {
	if (!active || !payload?.length) return null;
	const barCfg = METRIC_CONFIG[barMetric as Metric];
	const lineCfg = METRIC_CONFIG[lineMetric as Metric];

	return (
		<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg text-xs">
			<p className="font-medium text-[var(--foreground)] mb-1.5">{label}</p>
			{payload.map((p: any) => {
				const cfg = p.dataKey === barMetric ? barCfg : p.dataKey === lineMetric ? lineCfg : null;
				if (!cfg && p.dataKey !== "prev") return null;
				return (
					<div key={p.dataKey} className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
						<span className="text-[var(--muted-foreground)]">
							{p.dataKey === "prev" ? "Previous" : cfg?.label}:
						</span>
						<span className="font-medium text-[var(--foreground)]">
							{p.dataKey === "prev" ? barCfg.format(p.value, currency)
								: p.dataKey === barMetric ? barCfg.format(p.value, currency)
								: lineCfg.format(p.value, currency)}
						</span>
					</div>
				);
			})}
		</div>
	);
}
