import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Eye, MousePointer, ShoppingCart, Target, TrendingUp, RefreshCw, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Campaign } from "@/api/tools";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { Link } from "react-router-dom";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { AdToolbar } from "./ad-toolbar";
import { useAdContext } from "./ad-context";

function fmt(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return n.toLocaleString();
}

export function AdManagerPage() {
	const { queryString } = useAdContext();
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["ad-manager", "dashboard", queryString],
		queryFn: () => apiClient.get<{
			campaigns: Campaign[]; total_spent: number; total_impressions: number; total_clicks: number;
		}>(`/api/spa/ad-manager?_=1${queryString}`),
	});
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const p = (path: string) => wsHash ? `/w/${wsHash}/${path}` : `/${path}`;
	const campaigns = data?.campaigns ?? [];
	const totalSpent = data?.total_spent ?? 0;
	const totalImpr = data?.total_impressions ?? 0;
	const totalClicks = data?.total_clicks ?? 0;

	const totalConversions = campaigns.reduce((s: number, c: Campaign) => s + (c.conversions ?? 0), 0);
	const totalPurchaseValue = campaigns.reduce((s: number, c: Campaign) => s + (c.purchase_value ?? 0), 0);
	const totalLeads = campaigns.reduce((s: number, c: Campaign) => s + (c.leads ?? 0), 0);

	return (
		<div className="space-y-6">
			<AdToolbar />
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[var(--foreground)]">Ad Manager</h1>
					<p className="text-sm text-[var(--muted-foreground)]">Overview of your advertising performance</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
						<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
						<span className="ml-1.5">Sync Now</span>
					</Button>
					<Button size="sm" asChild>
						<Link to={p("ad-manager/campaigns")}>
							<Plus size={14} /><span className="ml-1.5">New Campaign</span>
						</Link>
					</Button>
				</div>
			</div>

			{/* Stat Cards — 6 metrics like Bootstrap */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<StatCard icon={DollarSign} label="Total Spend" value={`€${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="text-red-500" bg="bg-red-50" loading={isLoading} />
				<StatCard icon={ShoppingCart} label="Purchase Value" value={`€${totalPurchaseValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="text-blue-500" bg="bg-blue-50" loading={isLoading} />
				<StatCard icon={Target} label="Leads" value={String(totalLeads)} color="text-purple-500" bg="bg-purple-50" loading={isLoading} />
				<StatCard icon={Eye} label="Impressions" value={fmt(totalImpr)} color="text-amber-500" bg="bg-amber-50" loading={isLoading} />
				<StatCard icon={MousePointer} label="Clicks" value={fmt(totalClicks)} color="text-green-500" bg="bg-green-50" loading={isLoading} />
				<StatCard icon={TrendingUp} label="Conversions" value={fmt(totalConversions)} color="text-indigo-500" bg="bg-indigo-50" loading={isLoading} />
			</div>

			{/* Active Campaigns */}
			<Card>
				<div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
					<h2 className="text-lg font-semibold text-[var(--foreground)]">Active Campaigns</h2>
					<Link to={p("ad-manager/campaigns")} className="text-sm text-[var(--sq-primary)] hover:underline">View All →</Link>
				</div>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : campaigns.length === 0 ? (
						<div className="flex flex-col items-center gap-3 py-16">
							<TrendingUp size={40} className="text-[var(--muted-foreground)]" />
							<p className="text-sm text-[var(--muted-foreground)]">No campaigns yet. Create your first campaign to get started.</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
										<th className="px-6 py-3 font-medium">Campaign</th>
										<th className="px-4 py-3 font-medium">Status</th>
										<th className="px-4 py-3 font-medium text-right">Budget</th>
										<th className="px-4 py-3 font-medium text-right">Spent</th>
										<th className="px-4 py-3 font-medium text-right">Impr.</th>
										<th className="px-4 py-3 font-medium text-right">Clicks</th>
										<th className="px-4 py-3 font-medium text-right">CTR</th>
										<th className="px-4 py-3 font-medium text-right">Conv.</th>
										<th className="px-4 py-3 font-medium text-right">ROAS</th>
									</tr>
								</thead>
								<tbody>
									{campaigns.map((c: Campaign) => (
										<tr key={c.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30 transition-colors">
											<td className="px-6 py-3">
												<div className="flex items-center gap-3">
													<PlatformIcon platform={c.platform || "facebook"} size={18} />
													<span className="font-medium text-[var(--foreground)]">{c.name}</span>
												</div>
											</td>
											<td className="px-4 py-3"><StatusBadge status={c.status} /></td>
											<td className="px-4 py-3 text-right font-mono text-[var(--foreground)]">€{Number(c.budget ?? 0).toFixed(2)}</td>
											<td className="px-4 py-3 text-right font-mono text-[var(--foreground)]">€{Number(c.spent ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
											<td className="px-4 py-3 text-right text-[var(--muted-foreground)]">{fmt(c.impressions ?? 0)}</td>
											<td className="px-4 py-3 text-right text-[var(--muted-foreground)]">{fmt(c.clicks ?? 0)}</td>
											<td className="px-4 py-3 text-right text-[var(--muted-foreground)]">{Number(c.ctr ?? 0).toFixed(2)}%</td>
											<td className="px-4 py-3 text-right text-[var(--muted-foreground)]">{c.conversions ?? 0}</td>
											<td className="px-4 py-3 text-right font-medium text-[var(--foreground)]">{Number(c.roas ?? 0).toFixed(1)}x</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function StatCard({ icon: Icon, label, value, color, bg, loading }: {
	icon: React.ElementType; label: string; value: string; color: string; bg: string; loading: boolean;
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
				<p className="text-2xl font-bold text-[var(--foreground)] font-mono">{loading ? "..." : value}</p>
			</CardContent>
		</Card>
	);
}

function StatusBadge({ status }: { status: string }) {
	const styles: Record<string, string> = {
		active: "bg-emerald-100 text-emerald-700",
		paused: "bg-amber-100 text-amber-700",
		draft: "bg-blue-100 text-blue-700",
		archived: "bg-gray-100 text-gray-600",
		error: "bg-red-100 text-red-700",
	};
	return (
		<span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] ?? styles.draft}`}>
			<span className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : status === "paused" ? "bg-amber-500" : "bg-gray-400"}`} />
			{status}
		</span>
	);
}
