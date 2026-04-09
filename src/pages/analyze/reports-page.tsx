import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileBarChart, TrendingUp, AlertTriangle } from "lucide-react";
import { useReportOverview } from "@/api/reports";
import { PlatformIcon } from "@/pages/social/platform-icon";

const PERIODS = [
	{ value: "7d", label: "7 Days" },
	{ value: "30d", label: "30 Days" },
	{ value: "90d", label: "90 Days" },
];

export function ReportsPage() {
	const [period, setPeriod] = useState("30d");
	const { data, isLoading } = useReportOverview(period);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Reports</h1>
				<div className="flex gap-2">
					{PERIODS.map((p) => (
						<Button key={p.value} variant={period === p.value ? "default" : "outline"} size="sm" onClick={() => setPeriod(p.value)}>
							{p.label}
						</Button>
					))}
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<FileBarChart size={20} className="text-[var(--sq-primary)]" />
						<div>
							<p className="text-2xl font-bold">{isLoading ? "..." : data?.total ?? 0}</p>
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

			{/* By Platform */}
			<Card>
				<CardHeader><CardTitle className="text-lg">Posts by Platform</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-20 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !data?.by_platform || Object.keys(data.by_platform).length === 0 ? (
						<p className="text-sm text-[var(--muted-foreground)]">No data for this period.</p>
					) : (
						<div className="space-y-3">
							{Object.entries(data.by_platform).sort(([, a], [, b]) => b - a).map(([platform, count]) => (
								<div key={platform} className="flex items-center gap-3">
									<PlatformIcon platform={platform} size={18} />
									<span className="w-24 text-sm capitalize">{platform}</span>
									<div className="flex-1 h-6 rounded bg-[var(--muted)]">
										<div className="h-6 rounded bg-[var(--sq-primary)] transition-all" style={{ width: `${Math.max(4, (count / Math.max(...Object.values(data.by_platform))) * 100)}%` }} />
									</div>
									<span className="w-8 text-right text-sm font-medium">{count}</span>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
