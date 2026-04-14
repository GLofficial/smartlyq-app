import { Card, CardContent } from "@/components/ui/card";
import { useReportSummary, type ReportFilters } from "@/api/social-reports";
import { ArrowUp, ArrowDown } from "lucide-react";

export function SummaryTab({ filters }: { filters: ReportFilters }) {
	const { data, isLoading } = useReportSummary(filters);

	if (isLoading) return <Skeleton />;
	if (!data) return <p className="text-sm text-[var(--muted-foreground)]">No data available.</p>;

	const imp = data.impressions ?? {};
	const aud = data.audience ?? {};
	const eng = data.engagement ?? {};
	const perf = data.performance ?? {};

	return (
		<div className="space-y-6">
			{/* Impressions */}
			<Section title="Impressions">
				<div className="grid grid-cols-2 gap-4">
					<StatCard label="Page Views" value={Number(imp.page_views ?? 0)} trend={Number(imp.page_views_change ?? 0)} />
					<StatCard label="Page Reach" value={Number(imp.page_reach ?? 0)} trend={Number(imp.page_reach_change ?? 0)} />
				</div>
			</Section>

			{/* Audience Summary */}
			<Section title="Audience Summary">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard label="Total Followers" value={Number(aud.total_followers ?? 0)} />
					<StatCard label="New Followers" value={Number(aud.new_followers ?? 0)} trend={Number(aud.new_followers_change ?? 0)} />
					<StatCard label="Followers Lost" value={Number(aud.followers_lost ?? 0)} />
					<StatCard label="Net Change" value={Number(aud.new_followers ?? 0) - Number(aud.followers_lost ?? 0)} />
				</div>
			</Section>

			{/* Post & Engagement */}
			<Section title="Post & Engagement">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard label="Total Posts" value={Number(eng.total_posts ?? 0)} />
					<StatCard label="Total Engagements" value={Number(eng.total_engagements ?? 0)} />
					<StatCard label="Avg. Engagement Rate" value={`${Number(eng.avg_engagement_rate ?? 0).toFixed(2)}%`} />
					<StatCard label="Total Impressions" value={Number(eng.total_impressions ?? 0)} />
				</div>
				<div className="grid grid-cols-1 gap-4 mt-4">
					<StatCard label="Total Clicks" value={Number(eng.total_clicks ?? 0)} />
				</div>
			</Section>

			{/* Engagement Breakdown */}
			<Section title="Engagement Breakdown">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard label="Likes" value={Number(eng.total_likes ?? 0)} />
					<StatCard label="Comments" value={Number(eng.total_comments ?? 0)} />
					<StatCard label="Shares" value={Number(eng.total_shares ?? 0)} />
					<StatCard label="Saves" value={Number(eng.total_saves ?? 0)} />
				</div>
			</Section>

			{/* Performance */}
			<Section title="Performance">
				<div className="grid grid-cols-2 gap-4">
					<StatCard label="Total Performance" value={Number(perf.total ?? 0)} trend={Number(perf.change_pct ?? 0)} />
					<StatCard label="Avg. Per Day" value={Number(perf.avg_per_day ?? 0).toFixed(1)} />
				</div>
			</Section>
		</div>
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div>
			<p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">{title}</p>
			{children}
		</div>
	);
}

function StatCard({ label, value, trend }: { label: string; value: number | string; trend?: number }) {
	const formatted = typeof value === "number" ? value.toLocaleString() : value;
	return (
		<Card>
			<CardContent className="p-4">
				<p className="text-xs text-[var(--muted-foreground)] mb-1">{label}</p>
				<div className="flex items-center justify-between">
					<p className="text-xl font-bold text-[var(--foreground)]">{formatted}</p>
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
