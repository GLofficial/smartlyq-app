import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, AlertTriangle, FileText } from "lucide-react";
import { useSocialAnalytics } from "@/api/social";
import { PlatformIcon } from "./platform-icon";

const PERIODS = [
	{ value: "7d", label: "7 Days" },
	{ value: "30d", label: "30 Days" },
	{ value: "90d", label: "90 Days" },
];

export function AnalyticsPage() {
	const [period, setPeriod] = useState("30d");
	const { data, isLoading } = useSocialAnalytics(period);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Analytics</h1>
				<div className="flex gap-2">
					{PERIODS.map((p) => (
						<Button
							key={p.value}
							variant={period === p.value ? "default" : "outline"}
							size="sm"
							onClick={() => setPeriod(p.value)}
						>
							{p.label}
						</Button>
					))}
				</div>
			</div>

			{/* Summary stats */}
			<div className="grid gap-4 sm:grid-cols-3">
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<FileText size={20} className="text-[var(--sq-primary)]" />
						<div>
							<p className="text-2xl font-bold">{isLoading ? "..." : data?.total_posts ?? 0}</p>
							<p className="text-xs text-[var(--muted-foreground)]">Total Posts</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<TrendingUp size={20} className="text-green-600" />
						<div>
							<p className="text-2xl font-bold">{isLoading ? "..." : data?.published ?? 0}</p>
							<p className="text-xs text-[var(--muted-foreground)]">Published</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<AlertTriangle size={20} className="text-red-600" />
						<div>
							<p className="text-2xl font-bold">{isLoading ? "..." : data?.failed ?? 0}</p>
							<p className="text-xs text-[var(--muted-foreground)]">Failed</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Posts by Platform */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<BarChart3 size={18} />
							Posts by Platform
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Spinner />
						) : !data?.by_platform || Object.keys(data.by_platform).length === 0 ? (
							<p className="text-sm text-[var(--muted-foreground)]">No data yet.</p>
						) : (
							<div className="space-y-3">
								{Object.entries(data.by_platform)
									.sort(([, a], [, b]) => b - a)
									.map(([platform, count]) => (
										<div key={platform} className="flex items-center gap-3">
											<PlatformIcon platform={platform} size={18} />
											<span className="w-24 text-sm capitalize">{platform}</span>
											<div className="flex-1">
												<div className="h-6 rounded bg-[var(--muted)]">
													<div
														className="h-6 rounded bg-[var(--sq-primary)]"
														style={{
															width: `${Math.max(4, (count / Math.max(...Object.values(data.by_platform))) * 100)}%`,
														}}
													/>
												</div>
											</div>
											<span className="w-8 text-right text-sm font-medium">{count}</span>
										</div>
									))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Posts by Status */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<BarChart3 size={18} />
							Posts by Status
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Spinner />
						) : !data?.by_status || Object.keys(data.by_status).length === 0 ? (
							<p className="text-sm text-[var(--muted-foreground)]">No data yet.</p>
						) : (
							<div className="space-y-3">
								{Object.entries(data.by_status)
									.sort(([, a], [, b]) => b - a)
									.map(([status, count]) => (
										<div key={status} className="flex items-center justify-between rounded border border-[var(--border)] p-3">
											<StatusBadge status={status} />
											<span className="text-lg font-bold">{count}</span>
										</div>
									))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Daily Activity */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Daily Activity</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Spinner />
					) : !data?.daily.length ? (
						<p className="text-sm text-[var(--muted-foreground)]">No data yet.</p>
					) : (
						<div className="flex h-40 items-end gap-1">
							{data.daily.map((d) => {
								const maxCount = Math.max(...data.daily.map((x) => x.count));
								const height = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
								return (
									<div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date}: ${d.count} posts`}>
										<div
											className="w-full rounded-t bg-[var(--sq-primary)]"
											style={{ height: `${Math.max(2, height)}%` }}
										/>
										{data.daily.length <= 14 && (
											<span className="text-[9px] text-[var(--muted-foreground)]">
												{d.date.slice(5)}
											</span>
										)}
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function Spinner() {
	return (
		<div className="flex h-24 items-center justify-center">
			<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		scheduled: "bg-blue-100 text-blue-700",
		published: "bg-green-100 text-green-700",
		draft: "bg-gray-100 text-gray-600",
		failed: "bg-red-100 text-red-700",
		partially_published: "bg-yellow-100 text-yellow-700",
		processing: "bg-purple-100 text-purple-700",
	};
	return (
		<span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
			{status.replace("_", " ")}
		</span>
	);
}
