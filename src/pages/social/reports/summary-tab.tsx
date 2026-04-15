import { Card, CardContent } from "@/components/ui/card";
import { useReportSummary, useReportChart, type ReportFilters } from "@/api/social-reports";
import { ArrowUp, ArrowDown, Users, Eye, MousePointerClick, Heart, MessageCircle, Share2, Bookmark, BarChart3 } from "lucide-react";
import {
	Area, AreaChart, Bar, BarChart, CartesianGrid,
	Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
	PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = {
	primary: "#3b82f6",
	green: "#22c55e",
	red: "#ef4444",
	purple: "#8b5cf6",
	orange: "#f97316",
	pink: "#ec4899",
	cyan: "#06b6d4",
	amber: "#f59e0b",
};

export function SummaryTab({ filters }: { filters: ReportFilters }) {
	const { data, isLoading } = useReportSummary(filters);
	const { data: chartData } = useReportChart(filters);

	if (isLoading) return <Skeleton />;
	if (!data) return <p className="text-sm text-[var(--muted-foreground)]">No data available.</p>;

	const imp = data.impressions ?? {};
	const aud = data.audience ?? {};
	const eng = data.engagement ?? {};
	const perf = data.performance ?? {};

	// Build time-series for the overview chart
	const timeSeriesData = (chartData?.labels ?? []).map((date: string, i: number) => ({
		date: fmtDate(date),
		Impressions: chartData?.series?.impressions?.[i] ?? 0,
		Reach: chartData?.series?.reach?.[i] ?? 0,
		Engagements: chartData?.series?.engagements?.[i] ?? 0,
	}));

	// Engagement breakdown for donut chart
	const engBreakdown = [
		{ name: "Likes", value: Number(eng.total_likes ?? 0), color: COLORS.red },
		{ name: "Comments", value: Number(eng.total_comments ?? 0), color: COLORS.primary },
		{ name: "Shares", value: Number(eng.total_shares ?? 0), color: COLORS.green },
		{ name: "Saves", value: Number(eng.total_saves ?? 0), color: COLORS.purple },
	].filter((d) => d.value > 0);

	// Performance metrics for bar chart
	const perfBars = [
		{ name: "Posts", value: Number(eng.total_posts ?? 0), color: COLORS.primary },
		{ name: "Engagements", value: Number(eng.total_engagements ?? 0), color: COLORS.green },
		{ name: "Impressions", value: Number(eng.total_impressions ?? 0), color: COLORS.orange },
		{ name: "Clicks", value: Number(eng.total_clicks ?? 0), color: COLORS.cyan },
	];

	return (
		<div className="space-y-6">
			{/* Impressions & Reach — KPI cards + area chart */}
			<Section title="Impressions & Reach">
				<div className="grid grid-cols-2 gap-4 mb-4">
					<StatCard icon={<Eye size={16} />} label="Page Views" value={Number(imp.page_views ?? 0)} trend={Number(imp.page_views_change ?? 0)} color={COLORS.primary} />
					<StatCard icon={<Users size={16} />} label="Page Reach" value={Number(imp.page_reach ?? 0)} trend={Number(imp.page_reach_change ?? 0)} color={COLORS.green} />
				</div>
				{timeSeriesData.length > 1 && (
					<Card>
						<CardContent className="p-4">
							<p className="text-xs font-medium text-[var(--muted-foreground)] mb-3">Impressions & Reach Over Time</p>
							<ResponsiveContainer width="100%" height={220}>
								<AreaChart data={timeSeriesData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
									<defs>
										<linearGradient id="fill-imp" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.15} />
											<stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
										</linearGradient>
										<linearGradient id="fill-reach" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor={COLORS.green} stopOpacity={0.15} />
											<stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
									<XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
									<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
									<Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
									<Area type="monotone" dataKey="Impressions" stroke={COLORS.primary} strokeWidth={2} fill="url(#fill-imp)" dot={false} />
									<Area type="monotone" dataKey="Reach" stroke={COLORS.green} strokeWidth={2} fill="url(#fill-reach)" dot={false} />
								</AreaChart>
							</ResponsiveContainer>
							<div className="flex items-center gap-5 mt-2 justify-center">
								<LegendDot color={COLORS.primary} label="Impressions" />
								<LegendDot color={COLORS.green} label="Reach" />
							</div>
						</CardContent>
					</Card>
				)}
			</Section>

			{/* Audience Summary */}
			<Section title="Audience Summary">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard icon={<Users size={16} />} label="Total Followers" value={Number(aud.total_followers ?? 0)} color={COLORS.primary} />
					<StatCard icon={<ArrowUp size={16} />} label="New Followers" value={Number(aud.new_followers ?? 0)} trend={Number(aud.new_followers_change ?? 0)} color={COLORS.green} />
					<StatCard icon={<ArrowDown size={16} />} label="Followers Lost" value={Number(aud.followers_lost ?? 0)} color={COLORS.red} />
					<StatCard label="Net Change" value={Number(aud.new_followers ?? 0) - Number(aud.followers_lost ?? 0)} color={COLORS.purple} />
				</div>
			</Section>

			{/* Post & Engagement — bar chart + KPIs */}
			<Section title="Post & Engagement">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
					<StatCard icon={<BarChart3 size={16} />} label="Total Posts" value={Number(eng.total_posts ?? 0)} color={COLORS.primary} />
					<StatCard icon={<Heart size={16} />} label="Engagements" value={Number(eng.total_engagements ?? 0)} color={COLORS.green} />
					<StatCard label="Avg. Engagement Rate" value={`${Number(eng.avg_engagement_rate ?? 0).toFixed(2)}%`} color={COLORS.orange} />
					<StatCard icon={<MousePointerClick size={16} />} label="Total Clicks" value={Number(eng.total_clicks ?? 0)} color={COLORS.cyan} />
				</div>
				{timeSeriesData.length > 1 && (
					<Card>
						<CardContent className="p-4">
							<p className="text-xs font-medium text-[var(--muted-foreground)] mb-3">Engagements Over Time</p>
							<ResponsiveContainer width="100%" height={200}>
								<LineChart data={timeSeriesData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
									<XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
									<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
									<Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
									<Line type="monotone" dataKey="Engagements" stroke={COLORS.green} strokeWidth={2.5} dot={false} />
								</LineChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				)}
			</Section>

			{/* Engagement Breakdown — donut + bars */}
			<Section title="Engagement Breakdown">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{/* Donut */}
					<Card>
						<CardContent className="p-4">
							<p className="text-xs font-medium text-[var(--muted-foreground)] mb-3">Breakdown</p>
							{engBreakdown.length === 0 ? (
								<p className="text-sm text-[var(--muted-foreground)] text-center py-8">No engagement data</p>
							) : (
								<ResponsiveContainer width="100%" height={220}>
									<PieChart>
										<Pie data={engBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
											{engBreakdown.map((d, i) => (
												<Cell key={i} fill={d.color} />
											))}
										</Pie>
										<Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
										<Legend iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
									</PieChart>
								</ResponsiveContainer>
							)}
						</CardContent>
					</Card>

					{/* Engagement metric cards */}
					<div className="grid grid-cols-2 gap-3">
						<StatCard icon={<Heart size={16} />} label="Likes" value={Number(eng.total_likes ?? 0)} color={COLORS.red} />
						<StatCard icon={<MessageCircle size={16} />} label="Comments" value={Number(eng.total_comments ?? 0)} color={COLORS.primary} />
						<StatCard icon={<Share2 size={16} />} label="Shares" value={Number(eng.total_shares ?? 0)} color={COLORS.green} />
						<StatCard icon={<Bookmark size={16} />} label="Saves" value={Number(eng.total_saves ?? 0)} color={COLORS.purple} />
					</div>
				</div>
			</Section>

			{/* Performance — bar chart */}
			<Section title="Performance">
				<div className="grid grid-cols-2 gap-4 mb-4">
					<StatCard label="Total Performance" value={Number(perf.total ?? 0)} trend={Number(perf.change_pct ?? 0)} color={COLORS.primary} />
					<StatCard label="Avg. Per Day" value={Number(perf.avg_per_day ?? 0).toFixed(1)} color={COLORS.green} />
				</div>
				<Card>
					<CardContent className="p-4">
						<p className="text-xs font-medium text-[var(--muted-foreground)] mb-3">Activity Overview</p>
						<ResponsiveContainer width="100%" height={200}>
							<BarChart data={perfBars} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
								<XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
								<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={fmtNum} />
								<Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
								<Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
									{perfBars.map((d, i) => (
										<Cell key={i} fill={d.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</Section>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div>
			<p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">{title}</p>
			{children}
		</div>
	);
}

function StatCard({ icon, label, value, trend, color }: { icon?: React.ReactNode; label: string; value: number | string; trend?: number; color?: string }) {
	const formatted = typeof value === "number" ? value.toLocaleString() : value;
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex items-center gap-2 mb-1.5">
					{icon && <span className="text-[var(--muted-foreground)]">{icon}</span>}
					<p className="text-xs text-[var(--muted-foreground)]">{label}</p>
				</div>
				<div className="flex items-center justify-between">
					<p className="text-xl font-bold" style={{ color: color ?? "var(--foreground)" }}>{formatted}</p>
					{trend != null && trend !== 0 && (
						<span className={`flex items-center gap-0.5 text-xs font-medium ${trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
							{trend > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
							{Math.abs(trend).toFixed(1)}%
						</span>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function LegendDot({ color, label }: { color: string; label: string }) {
	return (
		<div className="flex items-center gap-1.5">
			<span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
			<span className="text-[11px] text-[var(--muted-foreground)]">{label}</span>
		</div>
	);
}

function Skeleton() {
	return (
		<div className="space-y-4 animate-pulse">
			{[1, 2, 3].map((i) => (
				<div key={i} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((j) => <div key={j} className="h-20 rounded-lg bg-[var(--muted)]" />)}
				</div>
			))}
		</div>
	);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(d: string): string {
	try {
		const date = new Date(d);
		return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;
	} catch { return d; }
}

function fmtNum(v: number): string {
	if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
	if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
	return String(v);
}
