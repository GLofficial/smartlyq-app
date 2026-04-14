import { Card, CardContent } from "@/components/ui/card";
import { useReportPostsEngagement, type ReportFilters } from "@/api/social-reports";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ExternalLink } from "lucide-react";

export function PostsTab({ filters }: { filters: ReportFilters }) {
	const { data, isLoading } = useReportPostsEngagement(filters);

	if (isLoading) return <div className="flex h-40 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;
	if (!data) return <p className="text-sm text-[var(--muted-foreground)]">No data available.</p>;

	const postsChart = (data.posts_vs_engagement?.labels ?? []).map((d: string, i: number) => ({
		date: fmtDate(d), posts: data.posts_vs_engagement.posts?.[i] ?? 0, engagements: data.posts_vs_engagement.engagements?.[i] ?? 0,
	}));

	const engImprChart = (data.engagements_vs_impressions?.labels ?? []).map((d: string, i: number) => ({
		date: fmtDate(d), impressions: data.engagements_vs_impressions.impressions?.[i] ?? 0, engagements: data.engagements_vs_impressions.engagements?.[i] ?? 0,
	}));

	return (
		<div className="space-y-6">
			{/* Posts Over Time */}
			{postsChart.length > 0 && (
				<Card>
					<CardContent className="p-5">
						<h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Posts Over Time</h3>
						<ResponsiveContainer width="100%" height={220}>
							<BarChart data={postsChart} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
								<XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
								<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
								<Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
								<Legend verticalAlign="top" height={30} iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
								<Bar dataKey="posts" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={24} name="Posts" />
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			)}

			{/* Engagements & Impressions */}
			{engImprChart.length > 0 && (
				<Card>
					<CardContent className="p-5">
						<h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Engagements & Impressions</h3>
						<ResponsiveContainer width="100%" height={220}>
							<LineChart data={engImprChart} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
								<XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
								<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
								<Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
								<Legend verticalAlign="top" height={30} iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
								<Line type="monotone" dataKey="engagements" stroke="#22c55e" strokeWidth={2} dot={false} name="Engagements" />
								<Line type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={2} dot={false} name="Impressions" />
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			)}

			{/* By Platform Breakdown */}
			{(data.breakdown ?? []).length > 0 && (
				<div>
					<p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">By Platform Breakdown</p>
					<Card><CardContent className="p-0">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
									<th className="px-4 py-3 font-medium">Account</th>
									<th className="px-3 py-3 font-medium text-right">Posts</th>
									<th className="px-3 py-3 font-medium text-right">Engagements</th>
									<th className="px-3 py-3 font-medium text-right">Impressions</th>
									<th className="px-3 py-3 font-medium text-right">Clicks</th>
								</tr>
							</thead>
							<tbody>
								{data.breakdown.map((b, i) => (
									<tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
										<td className="px-4 py-3">
											<div className="flex items-center gap-2">
												<PlatformIcon platform={b.platform} size={16} />
												<span className="font-medium text-[var(--foreground)]">{b.account_name}</span>
											</div>
										</td>
										<td className="px-3 py-3 text-right">{Number(b.posts).toLocaleString()}</td>
										<td className="px-3 py-3 text-right">{Number(b.engagements).toLocaleString()}</td>
										<td className="px-3 py-3 text-right">{Number(b.impressions).toLocaleString()}</td>
										<td className="px-3 py-3 text-right">{Number(b.clicks).toLocaleString()}</td>
									</tr>
								))}
							</tbody>
						</table>
					</CardContent></Card>
				</div>
			)}

			{/* Top Posts */}
			{(data.top_posts ?? []).length > 0 && (
				<div>
					<p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Top Posts</p>
					<Card><CardContent className="p-0">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
									<th className="px-4 py-3 font-medium">Post</th>
									<th className="px-3 py-3 font-medium">Platform</th>
									<th className="px-3 py-3 font-medium text-right">Impressions</th>
									<th className="px-3 py-3 font-medium text-right">Engagements</th>
									<th className="px-3 py-3 font-medium text-right">Likes</th>
									<th className="px-3 py-3 font-medium text-right">Comments</th>
									<th className="px-3 py-3 font-medium">Date</th>
									<th className="px-3 py-3 font-medium w-12" />
								</tr>
							</thead>
							<tbody>
								{(data.top_posts as any[]).slice(0, 10).map((p: any, i: number) => (
									<tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
										<td className="px-4 py-3 max-w-xs truncate text-[var(--foreground)]">{String(p.content ?? p.title ?? "—").slice(0, 60)}</td>
										<td className="px-3 py-3"><PlatformIcon platform={String(p.platform ?? "")} size={16} /></td>
										<td className="px-3 py-3 text-right">{Number(p.impressions ?? 0).toLocaleString()}</td>
										<td className="px-3 py-3 text-right">{Number(p.engagements ?? p.engagement_score ?? 0).toLocaleString()}</td>
										<td className="px-3 py-3 text-right">{Number(p.likes ?? 0).toLocaleString()}</td>
										<td className="px-3 py-3 text-right">{Number(p.comments_count ?? 0)}</td>
										<td className="px-3 py-3 text-xs text-[var(--muted-foreground)]">{p.published_at ? new Date(String(p.published_at)).toLocaleDateString() : "—"}</td>
										<td className="px-3 py-3">
											{p.post_urls && <a href={getPostUrl(p.post_urls)} target="_blank" rel="noopener noreferrer" className="text-[var(--sq-primary)]"><ExternalLink size={14} /></a>}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</CardContent></Card>
				</div>
			)}
		</div>
	);
}

function fmtDate(d: string): string {
	try { const date = new Date(d); return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`; }
	catch { return d; }
}

function getPostUrl(urls: any): string {
	if (typeof urls === "string") return urls;
	if (typeof urls === "object") {
		const first = Object.values(urls)[0];
		return Array.isArray(first) ? String(first[0] ?? "") : String(first ?? "");
	}
	return "";
}
