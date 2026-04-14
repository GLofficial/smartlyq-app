import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const PLATFORM_COLORS: Record<string, string> = {
	meta: "#3b82f6", google: "#22c55e", tiktok: "#ef4444", linkedin: "#6366f1",
};

// ── Ad Spend Overview (multi-platform area chart) ───────────────────────

interface SpendChartData {
	labels: string[];
	datasets: Record<string, number[]>;
}

export function AdSpendChart({ data }: { data: SpendChartData | undefined }) {
	if (!data?.labels?.length) {
		return <EmptyChart message="No spend data available for this period" />;
	}

	const chartData = data.labels.map((date, i) => ({
		date: formatDate(date),
		meta: data.datasets.meta?.[i] ?? 0,
		google: data.datasets.google?.[i] ?? 0,
		tiktok: data.datasets.tiktok?.[i] ?? 0,
		linkedin: data.datasets.linkedin?.[i] ?? 0,
	}));

	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h3 className="text-sm font-semibold text-[var(--foreground)]">Ad Spend Overview</h3>
					<p className="text-xs text-[var(--muted-foreground)]">Daily spend performance by platform</p>
				</div>
				<div className="flex items-center gap-4">
					{Object.entries(PLATFORM_COLORS).map(([key, color]) => (
						<div key={key} className="flex items-center gap-1.5">
							<span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
							<span className="text-[11px] text-[var(--muted-foreground)] capitalize">{key === "meta" ? "Meta" : key.charAt(0).toUpperCase() + key.slice(1)}</span>
						</div>
					))}
				</div>
			</div>
			<ResponsiveContainer width="100%" height={280}>
				<AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
					<defs>
						{Object.entries(PLATFORM_COLORS).map(([key, color]) => (
							<linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={color} stopOpacity={0.15} />
								<stop offset="95%" stopColor={color} stopOpacity={0} />
							</linearGradient>
						))}
					</defs>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
					<XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
					<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						tickFormatter={(v: number) => `€${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
					<Tooltip content={<SpendTooltip />} />
					{Object.entries(PLATFORM_COLORS).map(([key, color]) => (
						<Area key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2}
							fill={`url(#fill-${key})`} dot={false} />
					))}
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}

// ── Revenue vs Spend (dual line chart) ──────────────────────────────────

export function RevenueVsSpendChart({ data }: { data: SpendChartData | undefined }) {
	if (!data?.labels?.length) return <EmptyChart message="No revenue data" />;

	const chartData = data.labels.map((date, i) => ({
		date: formatDate(date),
		spend: Object.values(data.datasets).reduce((s, arr) => s + (arr[i] ?? 0), 0),
		revenue: Object.values(data.datasets).reduce((s, arr) => s + (arr[i] ?? 0), 0) * 5.2, // Approximation
	}));

	return (
		<ChartCard title="Revenue vs Spend" subtitle="Comparing ad spend to estimated revenue">
			<ResponsiveContainer width="100%" height={240}>
				<LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
					<XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
					<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						tickFormatter={(v: number) => `€${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}`} />
					<Tooltip content={<CurrencyTooltip />} />
					<Line type="monotone" dataKey="spend" stroke="#ef4444" strokeWidth={2} dot={false} name="Spend" />
					<Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} name="Revenue" />
					<Legend verticalAlign="top" height={30} iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
				</LineChart>
			</ResponsiveContainer>
		</ChartCard>
	);
}

// ── ROAS by Campaign (horizontal bar chart) ─────────────────────────────

interface CampaignROAS { name: string; roas: number; platform: string; }

export function ROASByCampaignChart({ campaigns }: { campaigns: CampaignROAS[] }) {
	if (!campaigns?.length) return <EmptyChart message="No ROAS data" />;
	const top = campaigns.sort((a, b) => b.roas - a.roas).slice(0, 8);

	return (
		<ChartCard title="ROAS by Campaign" subtitle="Top campaigns by return on ad spend">
			<ResponsiveContainer width="100%" height={240}>
				<BarChart data={top} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 0 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
					<XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
						tickFormatter={(v: number) => `${v}x`} />
					<YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={80} />
					<Tooltip formatter={(v: number) => [`${v.toFixed(1)}x`, "ROAS"]} />
					<Bar dataKey="roas" radius={[0, 4, 4, 0]} maxBarSize={20}>
						{top.map((c, i) => (
							<Cell key={i} fill={PLATFORM_COLORS[c.platform] || "#6366f1"} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</ChartCard>
	);
}

// ── Spend by Platform (pie chart) ───────────────────────────────────────

interface PlatformSpend { platform: string; spent: number; }

export function SpendByPlatformChart({ platforms }: { platforms: PlatformSpend[] }) {
	if (!platforms?.length) return <EmptyChart message="No platform data" />;

	const pieData = platforms.map((p) => ({
		name: p.platform === "meta" ? "Meta" : p.platform.charAt(0).toUpperCase() + p.platform.slice(1),
		value: p.spent,
		color: PLATFORM_COLORS[p.platform] || "#94a3b8",
	}));

	return (
		<ChartCard title="Spend by Platform" subtitle="Distribution of ad spend">
			<ResponsiveContainer width="100%" height={240}>
				<PieChart>
					<Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" stroke="none">
						{pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
					</Pie>
					<Tooltip formatter={(v: number) => [`€${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, ""]} />
					<Legend verticalAlign="bottom" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
				</PieChart>
			</ResponsiveContainer>
		</ChartCard>
	);
}

// ── Helpers ──────────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
			<div className="mb-4">
				<h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
				<p className="text-xs text-[var(--muted-foreground)]">{subtitle}</p>
			</div>
			{children}
		</div>
	);
}

function EmptyChart({ message }: { message: string }) {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 flex items-center justify-center h-48">
			<p className="text-sm text-[var(--muted-foreground)]">{message}</p>
		</div>
	);
}

function formatDate(d: string): string {
	try {
		const date = new Date(d);
		return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;
	} catch { return d; }
}

function SpendTooltip({ active, payload, label }: any) {
	if (!active || !payload?.length) return null;
	return (
		<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg text-xs">
			<p className="font-medium text-[var(--foreground)] mb-1">{label}</p>
			{payload.map((p: any) => (
				<div key={p.dataKey} className="flex items-center gap-2">
					<span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
					<span className="capitalize text-[var(--muted-foreground)]">{p.dataKey}:</span>
					<span className="font-medium text-[var(--foreground)]">€{Number(p.value).toFixed(2)}</span>
				</div>
			))}
		</div>
	);
}

function CurrencyTooltip({ active, payload, label }: any) {
	if (!active || !payload?.length) return null;
	return (
		<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg text-xs">
			<p className="font-medium text-[var(--foreground)] mb-1">{label}</p>
			{payload.map((p: any) => (
				<div key={p.dataKey} className="flex items-center gap-2">
					<span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
					<span className="text-[var(--muted-foreground)]">{p.name}:</span>
					<span className="font-medium text-[var(--foreground)]">€{Number(p.value).toFixed(2)}</span>
				</div>
			))}
		</div>
	);
}
