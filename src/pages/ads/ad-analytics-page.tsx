import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, DollarSign, Eye, MousePointer, Target, TrendingUp, RefreshCw, ShoppingCart } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { PlatformIcon } from "@/pages/social/platform-icon";

function useAdAnalytics() {
	return useQuery({
		queryKey: ["ad-manager", "analytics"],
		queryFn: () => apiClient.get<AdAnalytics>("/api/spa/ad-manager/analytics"),
		refetchInterval: 60000,
	});
}

interface AdAnalytics {
	summary: { spent: number; impressions: number; clicks: number; conversions: number; ctr: number; cpc: number };
	by_platform: { platform: string; spent: number; impressions: number; clicks: number; conversions: number }[];
}

function fmt(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return n.toLocaleString();
}

export function AdAnalyticsPage() {
	const { data, isLoading, refetch } = useAdAnalytics();
	const s = data?.summary ?? { spent: 0, impressions: 0, clicks: 0, conversions: 0, ctr: 0, cpc: 0 };
	const roas = s.spent > 0 ? ((s.conversions * 50) / s.spent).toFixed(2) : "0.00"; // approximate

	return (
		<div className="space-y-6 max-w-[1400px]">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[var(--foreground)]">Analytics</h1>
					<p className="text-sm text-[var(--muted-foreground)]">Deep insights into your advertising performance</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
					<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
					<span className="ml-1.5">Refresh</span>
				</Button>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
			) : (
				<>
					{/* Stat Cards */}
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<MetricCard icon={DollarSign} label="Total Spend" value={`€${s.spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="text-red-500" bg="bg-red-50" />
						<MetricCard icon={ShoppingCart} label="Revenue" value={`€${(s.conversions * 50).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="text-blue-500" bg="bg-blue-50" />
						<MetricCard icon={TrendingUp} label="ROAS" value={`${roas}x`} color="text-emerald-500" bg="bg-emerald-50" />
						<MetricCard icon={Target} label="Conversions" value={fmt(s.conversions)} color="text-purple-500" bg="bg-purple-50" />
					</div>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<MetricCard icon={Eye} label="Impressions" value={fmt(s.impressions)} color="text-amber-500" bg="bg-amber-50" />
						<MetricCard icon={MousePointer} label="Clicks" value={fmt(s.clicks)} color="text-green-500" bg="bg-green-50" />
						<MetricCard icon={BarChart3} label="CTR" value={`${s.ctr.toFixed(2)}%`} color="text-cyan-500" bg="bg-cyan-50" />
						<MetricCard icon={DollarSign} label="CPC" value={`€${s.cpc.toFixed(2)}`} color="text-indigo-500" bg="bg-indigo-50" />
					</div>

					{/* Platform Breakdown */}
					<Card>
						<div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
							<h2 className="text-lg font-semibold text-[var(--foreground)]">Spend by Platform</h2>
						</div>
						<CardContent className="p-0">
							{!(data?.by_platform ?? []).length ? (
								<div className="flex flex-col items-center gap-3 py-12">
									<BarChart3 size={40} className="text-[var(--muted-foreground)]" />
									<p className="text-sm text-[var(--muted-foreground)]">No platform data yet.</p>
								</div>
							) : (
								<div className="grid gap-0 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
									{data?.by_platform.map((p) => {
										const pctSpend = s.spent > 0 ? ((p.spent / s.spent) * 100).toFixed(1) : "0";
										const pCtr = p.impressions > 0 ? ((p.clicks / p.impressions) * 100).toFixed(2) : "0.00";
										return (
											<div key={p.platform} className="p-5">
												<div className="flex items-center gap-3 mb-3">
													<PlatformIcon platform={p.platform === "meta" ? "facebook" : p.platform} size={24} />
													<div>
														<p className="text-sm font-semibold capitalize text-[var(--foreground)]">{p.platform === "meta" ? "Meta" : p.platform}</p>
														<p className="text-[11px] text-[var(--muted-foreground)]">{pctSpend}% of total spend</p>
													</div>
												</div>
												<div className="grid grid-cols-2 gap-3">
													<MiniStat label="Spend" value={`€${p.spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
													<MiniStat label="Impressions" value={fmt(p.impressions)} />
													<MiniStat label="Clicks" value={fmt(p.clicks)} />
													<MiniStat label="CTR" value={`${pCtr}%`} />
													<MiniStat label="Conversions" value={String(p.conversions)} />
													<MiniStat label="ROAS" value={p.spent > 0 ? `${((p.conversions * 50) / p.spent).toFixed(1)}x` : "—"} />
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}

function MetricCard({ icon: Icon, label, value, color, bg }: {
	icon: React.ElementType; label: string; value: string; color: string; bg: string;
}) {
	return (
		<Card>
			<CardContent className="flex items-center gap-4 p-5">
				<div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
					<Icon size={20} className={color} />
				</div>
				<div>
					<p className="text-xl font-bold text-[var(--foreground)]">{value}</p>
					<p className="text-xs text-[var(--muted-foreground)]">{label}</p>
				</div>
			</CardContent>
		</Card>
	);
}

function MiniStat({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-xs text-[var(--muted-foreground)]">{label}</p>
			<p className="text-sm font-semibold text-[var(--foreground)]">{value}</p>
		</div>
	);
}
