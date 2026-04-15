import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink } from "lucide-react";
import { useFbAdsInsights, useFbAdsAction, fbAdsExportUrl } from "@/api/facebook-ads-insights";
import { FbAdsHeader } from "./fb-ads-header";
import { FbAdsKpiCards } from "./fb-ads-kpi-cards";
import { FbAdsPerformanceChart } from "./fb-ads-performance-chart";
import { FbAdsDataTable } from "./fb-ads-data-table";
import { FbAdsDeviceBreakdown } from "./fb-ads-device-breakdown";
import { FbAdsAiInsights } from "./fb-ads-ai-insights";
import type { FbAdsTab, FbAdsAccount, FbAdsRow, FbAdsQueryParams } from "./fb-ads-types";

function defaultDateRange() {
	const end = new Date();
	const start = new Date();
	start.setDate(end.getDate() - 27);
	return {
		start: start.toISOString().slice(0, 10),
		end: end.toISOString().slice(0, 10),
		label: "Last 28 Days",
	};
}

export function FbAdsInsightsPage() {
	const [tab, setTab] = useState<FbAdsTab>("overview");
	const [dateRange, setDateRange] = useState(defaultDateRange);
	const [accountId, setAccountId] = useState("");
	const [cursor, setCursor] = useState("");
	const [accumulated, setAccumulated] = useState<FbAdsRow[]>([]);
	// Build query params
	const params: FbAdsQueryParams = {
		tab,
		start: dateRange.start,
		end: dateRange.end,
		...(accountId ? { ad_account_id: accountId } : {}),
		need_accounts: "1",
		...(cursor ? { after: cursor } : {}),
	};

	const { data, isLoading, refetch } = useFbAdsInsights(params);
	const actionMutation = useFbAdsAction();

	// Initialize account ID from response
	useEffect(() => {
		if (data?.account?.id && !accountId) {
			setAccountId(data.account.id);
		}
	}, [data?.account?.id, accountId]);

	// Reset accumulated rows when tab/date/account changes
	useEffect(() => {
		setAccumulated([]);
		setCursor("");
	}, [tab, dateRange.start, dateRange.end, accountId]);

	// Merge paginated rows
	useEffect(() => {
		if (data?.rows && cursor) {
			setAccumulated((prev) => [...prev, ...data.rows]);
		}
	}, [data?.rows, cursor]);

	const allRows = cursor && accumulated.length > 0 ? accumulated : (data?.rows ?? []);

	const handleAccountChange = useCallback((acc: FbAdsAccount) => {
		setAccountId(acc.id || acc.account_id);
		actionMutation.mutate({
			action: "fb_ads_set_account",
			ad_account_id: acc.id || acc.account_id,
			ad_account_name: acc.name,
			currency: acc.currency,
			timezone: acc.timezone,
		});
	}, [actionMutation]);

	const handleRefresh = useCallback(() => {
		refetch();
	}, [refetch]);

	const handleExport = useCallback((fmt: string) => {
		const url = fbAdsExportUrl(params, fmt);
		window.open(url, "_blank");
	}, [params]);

	const handleLoadMore = useCallback(() => {
		if (data?.next_cursor) {
			setCursor(data.next_cursor);
		}
	}, [data?.next_cursor]);

	const handleTabChange = useCallback((t: FbAdsTab) => {
		setTab(t);
	}, []);

	const currency = data?.account?.currency || data?.totals?.currency || "USD";

	// Not connected state
	if (data && !isLoading && data.error === "Facebook Ads is not connected") {
		return <NotConnected />;
	}

	// Token expired
	if (data && !isLoading && data.error?.includes("token missing")) {
		return <TokenExpired />;
	}

	const insights = data?.verdicts?.insights ?? [];

	return (
		<div className="space-y-5">
			<FbAdsHeader
				tab={tab}
				onTabChange={handleTabChange}
				dateRange={dateRange}
				onDateRangeChange={setDateRange}
				accounts={data?.accounts ?? []}
				selectedAccountId={accountId}
				onAccountChange={handleAccountChange}
				onRefresh={handleRefresh}
				onExport={handleExport}
				isLoading={isLoading}
				currency={currency}
			/>

			{isLoading && !data ? (
				<div className="flex h-48 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : data?.totals ? (
				<>
					<FbAdsKpiCards
						totals={data.totals}
						totalsPrev={data.totals_prev}
						currency={currency}
					/>

					{tab === "overview" ? (
						<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
							<div className="space-y-5">
								<FbAdsPerformanceChart
									timeseries={data.timeseries}
									timeseriesPrev={data.timeseries_prev}
									currency={currency}
								/>
								<DeviceBreakdownSection
									accountId={accountId}
									dateRange={dateRange}
								/>
								{allRows.length > 0 && (
									<FbAdsDataTable
										rows={allRows}
										tab="campaigns"
										currency={currency}
										nextCursor=""
										onLoadMore={() => {}}
										isLoadingMore={false}
									/>
								)}
							</div>
							<div>
								<FbAdsAiInsights insights={insights} isLoading={isLoading} />
							</div>
						</div>
					) : (
						<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
							<div className="space-y-5">
								<FbAdsPerformanceChart
									timeseries={data.timeseries}
									timeseriesPrev={data.timeseries_prev}
									currency={currency}
								/>
								<FbAdsDataTable
									rows={allRows}
									tab={tab}
									currency={currency}
									nextCursor={data.next_cursor ?? ""}
									onLoadMore={handleLoadMore}
									isLoadingMore={!!cursor && isLoading}
								/>
							</div>
							<div>
								<FbAdsAiInsights insights={insights} isLoading={isLoading} />
							</div>
						</div>
					)}
				</>
			) : data?.error ? (
				<Card>
					<CardContent className="py-8 text-center">
						<p className="text-sm text-[var(--muted-foreground)]">{data.error}</p>
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}

/* ── Device Breakdown (secondary query) ────────────────────────────── */

function DeviceBreakdownSection({ accountId, dateRange }: { accountId: string; dateRange: { start: string; end: string } }) {
	const { data } = useFbAdsInsights({
		tab: "devices",
		start: dateRange.start,
		end: dateRange.end,
		...(accountId ? { ad_account_id: accountId } : {}),
	});

	if (!data?.rows?.length) return null;
	const currency = data?.account?.currency || data?.totals?.currency || "USD";
	return <FbAdsDeviceBreakdown rows={data.rows} currency={currency} />;
}

/* ── Not Connected ─────────────────────────────────────────────────── */

function NotConnected() {
	return (
		<Card>
			<CardContent className="flex flex-col items-center gap-4 py-12">
				<BarChart3 size={48} className="text-[var(--muted-foreground)]" />
				<h2 className="text-lg font-semibold">Connect Facebook Ads</h2>
				<p className="text-sm text-[var(--muted-foreground)] text-center max-w-md">
					Connect your Meta Ads account to view campaign performance, manage ads, and track ROI.
				</p>
				<a href="/facebook-ads/login" target="_blank" rel="noopener noreferrer">
					<Button><ExternalLink size={16} className="mr-1.5" /> Connect Facebook Ads</Button>
				</a>
			</CardContent>
		</Card>
	);
}

function TokenExpired() {
	return (
		<Card>
			<CardContent className="flex flex-col items-center gap-4 py-12">
				<BarChart3 size={48} className="text-amber-500" />
				<h2 className="text-lg font-semibold">Reconnect Facebook Ads</h2>
				<p className="text-sm text-[var(--muted-foreground)] text-center max-w-md">
					Your Facebook Ads access token has expired. Please reconnect to continue viewing insights.
				</p>
				<a href="/facebook-ads/login" target="_blank" rel="noopener noreferrer">
					<Button><ExternalLink size={16} className="mr-1.5" /> Reconnect</Button>
				</a>
			</CardContent>
		</Card>
	);
}
