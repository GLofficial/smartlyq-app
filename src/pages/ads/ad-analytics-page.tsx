import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign, Eye, MousePointer, Target } from "lucide-react";
import { apiClient } from "@/lib/api-client";

function useAdAnalytics() {
	return useQuery({
		queryKey: ["ad-manager", "analytics"],
		queryFn: () => apiClient.get<AdAnalytics>("/api/spa/ad-manager/analytics"),
	});
}

interface AdAnalytics {
	summary: { spent: number; impressions: number; clicks: number; conversions: number; ctr: number; cpc: number };
	by_platform: { platform: string; spent: number; impressions: number; clicks: number; conversions: number }[];
}

export function AdAnalyticsPage() {
	const { data, isLoading } = useAdAnalytics();

	if (isLoading) {
		return (
			<div className="flex h-40 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
			</div>
		);
	}

	const s = data?.summary ?? { spent: 0, impressions: 0, clicks: 0, conversions: 0, ctr: 0, cpc: 0 };

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Ad Analytics</h1>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
				<StatCard icon={DollarSign} label="Total Spent" value={`$${s.spent.toFixed(2)}`} color="text-green-600" />
				<StatCard icon={Eye} label="Impressions" value={s.impressions.toLocaleString()} color="text-blue-600" />
				<StatCard icon={MousePointer} label="Clicks" value={s.clicks.toLocaleString()} color="text-purple-600" />
				<StatCard icon={Target} label="Conversions" value={s.conversions.toLocaleString()} color="text-orange-600" />
				<StatCard icon={BarChart3} label="CTR" value={`${s.ctr.toFixed(2)}%`} color="text-cyan-600" />
				<StatCard icon={DollarSign} label="Avg CPC" value={`$${s.cpc.toFixed(2)}`} color="text-emerald-600" />
			</div>

			<Card>
				<CardHeader><CardTitle className="text-lg">Performance by Platform</CardTitle></CardHeader>
				<CardContent>
					{!(data?.by_platform ?? []).length ? (
						<div className="flex flex-col items-center gap-3 py-12">
							<BarChart3 size={48} className="text-[var(--muted-foreground)]" />
							<p className="text-[var(--muted-foreground)]">No platform data yet.</p>
						</div>
					) : (
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-[var(--border)]">
									<th className="py-2 text-left font-medium">Platform</th>
									<th className="py-2 text-right font-medium">Spent</th>
									<th className="py-2 text-right font-medium">Impressions</th>
									<th className="py-2 text-right font-medium">Clicks</th>
									<th className="py-2 text-right font-medium">Conversions</th>
									<th className="py-2 text-right font-medium">CTR</th>
								</tr>
							</thead>
							<tbody>
								{data?.by_platform.map((p) => (
									<tr key={p.platform} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
										<td className="py-2 font-medium capitalize">{p.platform}</td>
										<td className="py-2 text-right">${p.spent.toFixed(2)}</td>
										<td className="py-2 text-right">{p.impressions.toLocaleString()}</td>
										<td className="py-2 text-right">{p.clicks.toLocaleString()}</td>
										<td className="py-2 text-right">{p.conversions.toLocaleString()}</td>
										<td className="py-2 text-right">{p.impressions > 0 ? ((p.clicks / p.impressions) * 100).toFixed(2) : "0.00"}%</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof DollarSign; label: string; value: string; color: string }) {
	return (
		<Card>
			<CardContent className="flex items-center gap-3 p-4">
				<Icon size={20} className={color} />
				<div>
					<p className="text-xl font-bold">{value}</p>
					<p className="text-xs text-[var(--muted-foreground)]">{label}</p>
				</div>
			</CardContent>
		</Card>
	);
}
