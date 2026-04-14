import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Eye, MousePointer, Target, TrendingUp, RefreshCw, ShoppingCart, BarChart3 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { AdToolbar } from "@/pages/ad-manager/ad-toolbar";
import { useAdContext } from "@/pages/ad-manager/ad-context";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { AdSpendChart, RevenueVsSpendChart, ROASByCampaignChart, SpendByPlatformChart } from "@/pages/ad-manager/ad-charts";

/* eslint-disable @typescript-eslint/no-explicit-any */

function useAdAnalytics() {
	const { queryString } = useAdContext();
	return useQuery({
		queryKey: ["ad-manager", "analytics", queryString],
		queryFn: () => apiClient.get<any>(`/api/spa/ad-manager/analytics?_=1${queryString}`),
		refetchInterval: 60000,
	});
}

function useAdCampaigns() {
	const { queryString } = useAdContext();
	return useQuery({
		queryKey: ["ad-manager", "campaigns-analytics", queryString],
		queryFn: () => apiClient.get<any>(`/api/spa/ad-manager/campaigns?_=1${queryString}`),
	});
}

function fmt(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return n.toLocaleString();
}

const TABS = ["Overview", "Campaigns", "Placements"] as const;

export function AdAnalyticsPage() {
	const { data, isLoading, refetch } = useAdAnalytics();
	const [tab, setTab] = useState<string>("Overview");
	const s = data?.summary ?? { spent: 0, impressions: 0, clicks: 0, conversions: 0, ctr: 0, cpc: 0, roas: 0, purchase_value: 0 };

	return (
		<div className="space-y-6">
			<AdToolbar />
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

			{/* Tabs */}
			<div className="flex gap-1 border-b border-[var(--border)] pb-px">
				{TABS.map((t) => (
					<button key={t} onClick={() => setTab(t)}
						className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
							tab === t ? "border-[var(--sq-primary)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
						}`}>{t}</button>
				))}
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
			) : tab === "Overview" ? (
				<OverviewTab summary={s} data={data} />
			) : tab === "Campaigns" ? (
				<CampaignsTab />
			) : (
				<PlacementsTab data={data} />
			)}
		</div>
	);
}

function OverviewTab({ summary: s, data }: { summary: any; data: any }) {
	const campaigns = (data?.by_platform ?? []).map((p: any) => ({
		name: p.platform, roas: p.spent > 0 ? (p.purchase_value ?? 0) / p.spent : 0, platform: p.platform,
	}));

	return (
		<>
			{/* 8 Metric Cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<MetricCard icon={DollarSign} label="Total Spend" value={`€${Number(s.spent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="text-red-500" bg="bg-red-50" />
				<MetricCard icon={ShoppingCart} label="Revenue" value={`€${Number(s.purchase_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="text-emerald-500" bg="bg-emerald-50" />
				<MetricCard icon={TrendingUp} label="ROAS" value={`${Number(s.roas ?? 0).toFixed(2)}x`} color="text-amber-500" bg="bg-amber-50" />
				<MetricCard icon={Target} label="Conversions" value={fmt(Number(s.conversions ?? 0))} color="text-purple-500" bg="bg-purple-50" />
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<MetricCard icon={Eye} label="Impressions" value={fmt(Number(s.impressions ?? 0))} color="text-blue-500" bg="bg-blue-50" />
				<MetricCard icon={MousePointer} label="Clicks" value={fmt(Number(s.clicks ?? 0))} color="text-green-500" bg="bg-green-50" />
				<MetricCard icon={BarChart3} label="CTR" value={`${Number(s.ctr ?? 0).toFixed(2)}%`} color="text-cyan-500" bg="bg-cyan-50" />
				<MetricCard icon={DollarSign} label="CPC" value={`€${Number(s.cpc ?? 0).toFixed(2)}`} color="text-indigo-500" bg="bg-indigo-50" />
			</div>

			{/* Charts Row 1 */}
			<div className="grid gap-6 lg:grid-cols-2">
				<RevenueVsSpendChart data={data?.spend_chart} />
				<ROASByCampaignChart campaigns={campaigns} />
			</div>

			{/* Charts Row 2 */}
			<div className="grid gap-6 lg:grid-cols-2">
				<AdSpendChart data={data?.spend_chart} />
				<SpendByPlatformChart platforms={data?.by_platform ?? []} />
			</div>

			{/* Platform Breakdown */}
			<Card>
				<div className="px-6 py-4 border-b border-[var(--border)]">
					<h2 className="text-lg font-semibold text-[var(--foreground)]">Spend by Platform</h2>
				</div>
				<CardContent className="p-0">
					{!(data?.by_platform ?? []).length ? (
						<div className="flex flex-col items-center gap-3 py-12"><p className="text-sm text-[var(--muted-foreground)]">No platform data.</p></div>
					) : (
						<div className="grid gap-0 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
							{(data?.by_platform ?? []).map((p: any) => {
								const pctSpend = Number(s.spent) > 0 ? ((Number(p.spent) / Number(s.spent)) * 100).toFixed(1) : "0";
								const pCtr = Number(p.impressions) > 0 ? ((Number(p.clicks) / Number(p.impressions)) * 100).toFixed(2) : "0.00";
								return (
									<div key={p.platform} className="p-5">
										<div className="flex items-center gap-3 mb-3">
											<PlatformIcon platform={p.platform === "meta" ? "facebook" : p.platform} size={24} />
											<div>
												<p className="text-sm font-semibold capitalize text-[var(--foreground)]">{p.platform === "meta" ? "Meta" : p.platform}</p>
												<p className="text-[11px] text-[var(--muted-foreground)]">{pctSpend}% of total spend</p>
											</div>
										</div>
										<div className="grid grid-cols-3 gap-3">
											<MiniStat label="Spend" value={`€${Number(p.spent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
											<MiniStat label="Impressions" value={fmt(Number(p.impressions))} />
											<MiniStat label="Clicks" value={fmt(Number(p.clicks))} />
											<MiniStat label="CTR" value={`${pCtr}%`} />
											<MiniStat label="Conversions" value={String(Number(p.conversions))} />
											<MiniStat label="ROAS" value={Number(p.spent) > 0 ? `${(Number(p.purchase_value ?? 0) / Number(p.spent)).toFixed(1)}x` : "—"} />
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
}

function CampaignsTab() {
	const { data, isLoading } = useAdCampaigns();
	const campaigns = (data?.campaigns ?? []) as any[];

	if (isLoading) return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;

	return (
		<Card><CardContent className="p-0">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
						<th className="px-4 py-3 font-medium">Campaign</th>
						<th className="px-3 py-3 font-medium">Platform</th>
						<th className="px-3 py-3 font-medium">Status</th>
						<th className="px-3 py-3 font-medium text-right">Spend</th>
						<th className="px-3 py-3 font-medium text-right">Impr.</th>
						<th className="px-3 py-3 font-medium text-right">Clicks</th>
						<th className="px-3 py-3 font-medium text-right">CTR</th>
						<th className="px-3 py-3 font-medium text-right">Conv.</th>
						<th className="px-3 py-3 font-medium text-right">CPA</th>
						<th className="px-3 py-3 font-medium text-right">ROAS</th>
					</tr>
				</thead>
				<tbody>
					{campaigns.map((c: any) => (
						<tr key={c.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30">
							<td className="px-4 py-3 font-medium text-[var(--foreground)]">{c.name}</td>
							<td className="px-3 py-3"><PlatformIcon platform={c.platform === "meta" ? "facebook" : c.platform} size={16} /></td>
							<td className="px-3 py-3"><StatusBadge status={c.status} /></td>
							<td className="px-3 py-3 text-right font-mono">€{Number(c.spent ?? 0).toFixed(2)}</td>
							<td className="px-3 py-3 text-right">{Number(c.impressions ?? 0).toLocaleString()}</td>
							<td className="px-3 py-3 text-right">{Number(c.clicks ?? 0).toLocaleString()}</td>
							<td className="px-3 py-3 text-right">{Number(c.ctr ?? 0).toFixed(2)}%</td>
							<td className="px-3 py-3 text-right">{Number(c.conversions ?? 0)}</td>
							<td className="px-3 py-3 text-right font-mono">€{Number(c.cpa ?? 0).toFixed(2)}</td>
							<td className="px-3 py-3 text-right font-medium">{Number(c.roas ?? 0).toFixed(1)}x</td>
						</tr>
					))}
				</tbody>
			</table>
		</CardContent></Card>
	);
}

function PlacementsTab({ data }: { data: any }) {
	const platforms = (data?.by_platform ?? []) as any[];
	return (
		<>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{platforms.map((p: any) => (
					<Card key={p.platform}>
						<CardContent className="p-4">
							<div className="flex items-center gap-2 mb-3">
								<PlatformIcon platform={p.platform === "meta" ? "facebook" : p.platform} size={20} />
								<span className="text-sm font-semibold capitalize text-[var(--foreground)]">{p.platform === "meta" ? "Meta" : p.platform}</span>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<MiniStat label="Spend" value={`€${Number(p.spent).toFixed(2)}`} />
								<MiniStat label="ROAS" value={Number(p.spent) > 0 ? `${(Number(p.purchase_value ?? 0) / Number(p.spent)).toFixed(1)}x` : "—"} />
								<MiniStat label="CTR" value={`${Number(p.impressions) > 0 ? ((Number(p.clicks) / Number(p.impressions)) * 100).toFixed(2) : "0"}%`} />
								<MiniStat label="CPA" value={`€${Number(p.conversions) > 0 ? (Number(p.spent) / Number(p.conversions)).toFixed(2) : "0"}`} />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
			<SpendByPlatformChart platforms={platforms} />
		</>
	);
}

function MetricCard({ icon: Icon, label, value, color, bg }: {
	icon: React.ElementType; label: string; value: string; color: string; bg: string;
}) {
	return (
		<Card>
			<CardContent className="p-5">
				<div className="flex items-center justify-between mb-3">
					<div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
						<Icon size={18} className={color} />
					</div>
				</div>
				<p className="text-xs text-[var(--muted-foreground)] mb-1">{label}</p>
				<p className="text-2xl font-bold text-[var(--foreground)] font-mono">{value}</p>
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

function StatusBadge({ status }: { status: string }) {
	const styles: Record<string, string> = {
		active: "bg-emerald-100 text-emerald-700", paused: "bg-amber-100 text-amber-700",
		draft: "bg-blue-100 text-blue-700", archived: "bg-gray-100 text-gray-600",
	};
	return (
		<span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
			<span className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : status === "paused" ? "bg-amber-500" : "bg-gray-400"}`} />
			{status}
		</span>
	);
}
