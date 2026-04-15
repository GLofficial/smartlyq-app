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
import { FbAdsAiInsights, FbAdsTopInsights } from "./fb-ads-ai-insights";
import { FbAdsPreviewModal } from "./fb-ads-preview-modal";
import { FbAdsCreativeInsights } from "./fb-ads-creative-insights";
import { DemographicsChart, PlacementChart, HourOfDayChart, ConversionFunnelChart } from "./fb-ads-tab-charts";
import type { FbAdsTab, FbAdsAccount, FbAdsRow, FbAdsQueryParams } from "./fb-ads-types";

function defaultDateRange() {
	const end = new Date();
	const start = new Date();
	start.setDate(end.getDate() - 27);
	return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10), label: "Last 28 Days" };
}

export function FbAdsInsightsPage() {
	const [tab, setTab] = useState<FbAdsTab>("overview");
	const [dateRange, setDateRange] = useState(defaultDateRange);
	const [accountId, setAccountId] = useState("");
	const [cursor, setCursor] = useState("");
	const [accumulated, setAccumulated] = useState<FbAdsRow[]>([]);
	const [conversionType, setConversionType] = useState("purchases");
	const [compare, setCompare] = useState(false);
	const [previewAdId, setPreviewAdId] = useState<string | null>(null);

	const params: FbAdsQueryParams = {
		tab, start: dateRange.start, end: dateRange.end,
		...(accountId ? { ad_account_id: accountId } : {}),
		need_accounts: "1",
		...(cursor ? { after: cursor } : {}),
		conversion_type: conversionType,
		...(compare ? { compare: "1" } : {}),
	};

	const { data, isLoading, error, refetch } = useFbAdsInsights(params);
	const actionMutation = useFbAdsAction();
	const fetchError = error ? (error as unknown as Record<string, string>)?.error || (error as unknown as Record<string, string>)?.message || "Failed to load data" : null;

	useEffect(() => { if (data?.account?.id && !accountId) setAccountId(data.account.id); }, [data?.account?.id, accountId]);
	useEffect(() => { setAccumulated([]); setCursor(""); }, [tab, dateRange.start, dateRange.end, accountId, conversionType, compare]);
	useEffect(() => { if (data?.rows && cursor) setAccumulated((prev) => [...prev, ...data.rows]); }, [data?.rows, cursor]);

	const allRows = cursor && accumulated.length > 0 ? accumulated : (data?.rows ?? []);
	const currency = data?.account?.currency || data?.totals?.currency || "USD";

	const handleAccountChange = useCallback((acc: FbAdsAccount) => {
		setAccountId(acc.id || acc.account_id);
		actionMutation.mutate({ action: "fb_ads_set_account", ad_account_id: acc.id || acc.account_id, ad_account_name: acc.name, currency: acc.currency, timezone: acc.timezone });
	}, [actionMutation]);

	const handleTriageChange = useCallback((entityId: string, level: string, decision: string) => {
		actionMutation.mutate({ action: "fb_ads_triage_set", entity_id: entityId, entity_level: level, decision });
	}, [actionMutation]);

	const handleRowClick = useCallback((row: FbAdsRow) => {
		if (row.ad_id && (tab === "ads" || tab === "creatives")) setPreviewAdId(row.ad_id);
	}, [tab]);

	const handleExport = useCallback((fmt: string) => {
		if (fmt === "ai") { /* TODO: AI report modal */ return; }
		window.open(fbAdsExportUrl(params, fmt), "_blank");
	}, [params]);

	if (data && !isLoading && data.error === "Facebook Ads is not connected") return <NotConnected />;
	if (data && !isLoading && data.error?.includes("token missing")) return <TokenExpired />;

	const insights = data?.verdicts?.insights ?? [];
	const displayError = data?.error || fetchError;
	const attribution = data?.badges?.facebook_attribution;

	return (
		<div className="space-y-5">
			<FbAdsHeader
				tab={tab} onTabChange={setTab} dateRange={dateRange} onDateRangeChange={setDateRange}
				accounts={data?.accounts ?? []} selectedAccountId={accountId} onAccountChange={handleAccountChange}
				onRefresh={() => refetch()} onExport={handleExport} isLoading={isLoading} currency={currency}
				conversionType={conversionType} onConversionTypeChange={setConversionType}
				compare={compare} onCompareChange={setCompare} attribution={attribution}
			/>

			{isLoading && !data ? (
				<div className="flex h-48 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : displayError && !data?.totals ? (
				<Card>
					<CardContent className="py-8 text-center">
						<p className="text-sm text-red-500 font-medium mb-2">Error loading data</p>
						<p className="text-sm text-[var(--muted-foreground)]">{displayError}</p>
						<Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Try Again</Button>
					</CardContent>
				</Card>
			) : data?.totals ? (
				<>
					<FbAdsKpiCards totals={data.totals} totalsPrev={data.totals_prev} currency={currency} />

					{tab === "overview" && (
						<OverviewLayout data={data} allRows={allRows} currency={currency} insights={insights}
							isLoading={isLoading} accountId={accountId} dateRange={dateRange}
							onTriageChange={handleTriageChange} onRowClick={handleRowClick} />
					)}
					{tab === "demographics" && (
						<TabWithChart chart={<DemographicsChart rows={allRows} currency={currency} />}
							table={<FbAdsDataTable rows={allRows} tab={tab} currency={currency} nextCursor={data.next_cursor ?? ""} onLoadMore={() => setCursor(data.next_cursor ?? "")} isLoadingMore={!!cursor && isLoading} />}
							insights={insights} isLoading={isLoading} />
					)}
					{tab === "placements" && (
						<TabWithChart chart={<PlacementChart rows={allRows} currency={currency} />}
							table={<FbAdsDataTable rows={allRows} tab={tab} currency={currency} nextCursor={data.next_cursor ?? ""} onLoadMore={() => setCursor(data.next_cursor ?? "")} isLoadingMore={!!cursor && isLoading} />}
							insights={insights} isLoading={isLoading} />
					)}
					{tab === "hours" && (
						<TabWithChart chart={<HourOfDayChart rows={allRows} currency={currency} />}
							table={<FbAdsDataTable rows={allRows} tab={tab} currency={currency} nextCursor={data.next_cursor ?? ""} onLoadMore={() => setCursor(data.next_cursor ?? "")} isLoadingMore={!!cursor && isLoading} />}
							insights={insights} isLoading={isLoading} />
					)}
					{tab === "creatives" && (
						<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
							<div className="space-y-5">
								<FbAdsCreativeInsights rows={allRows} currency={currency} />
								<FbAdsDataTable rows={allRows} tab={tab} currency={currency}
									nextCursor={data.next_cursor ?? ""} onLoadMore={() => setCursor(data.next_cursor ?? "")}
									isLoadingMore={!!cursor && isLoading} onRowClick={handleRowClick} />
							</div>
							<FbAdsAiInsights insights={insights} isLoading={isLoading} />
						</div>
					)}
					{!["overview", "demographics", "placements", "hours", "creatives"].includes(tab) && (
						<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
							<div className="space-y-5">
								<FbAdsPerformanceChart timeseries={data.timeseries} timeseriesPrev={data.timeseries_prev} currency={currency} />
								<FbAdsDataTable rows={allRows} tab={tab} currency={currency}
									nextCursor={data.next_cursor ?? ""} onLoadMore={() => setCursor(data.next_cursor ?? "")}
									isLoadingMore={!!cursor && isLoading} onRowClick={handleRowClick}
									onTriageChange={tab === "campaigns" ? handleTriageChange : undefined} />
							</div>
							<FbAdsAiInsights insights={insights} isLoading={isLoading} />
						</div>
					)}
				</>
			) : data?.error ? (
				<Card><CardContent className="py-8 text-center"><p className="text-sm text-[var(--muted-foreground)]">{data.error}</p></CardContent></Card>
			) : null}

			<FbAdsPreviewModal adId={previewAdId} onClose={() => setPreviewAdId(null)} />
		</div>
	);
}

/* ── Overview Layout ───────────────────────────────────────────────── */

function OverviewLayout({ data, allRows, currency, insights, isLoading, accountId, dateRange, onTriageChange, onRowClick }: {
	data: NonNullable<ReturnType<typeof useFbAdsInsights>["data"]>;
	allRows: FbAdsRow[]; currency: string; insights: FbAdsVerdict[]; isLoading: boolean;
	accountId: string; dateRange: { start: string; end: string };
	onTriageChange: (id: string, level: string, decision: string) => void;
	onRowClick: (row: FbAdsRow) => void;
}) {
	return (
		<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
			<div className="space-y-5">
				<FbAdsPerformanceChart timeseries={data.timeseries} timeseriesPrev={data.timeseries_prev} currency={currency} />
				{data.totals && (
					<ConversionFunnelChart totals={{
						impressions: data.totals.impressions, clicks: data.totals.clicks,
						link_clicks: data.totals.link_clicks, conversions: data.totals.conversions,
						add_to_cart: (data.totals as unknown as Record<string, number>).add_to_cart,
						initiate_checkout: (data.totals as unknown as Record<string, number>).initiate_checkout,
					}} />
				)}
				<TopInsightsSection accountId={accountId} dateRange={dateRange} />
				<DeviceBreakdownSection accountId={accountId} dateRange={dateRange} />
				{allRows.length > 0 && (
					<FbAdsDataTable rows={allRows} tab="campaigns" currency={currency}
						nextCursor="" onLoadMore={() => {}} isLoadingMore={false}
						onTriageChange={onTriageChange} onRowClick={onRowClick} />
				)}
			</div>
			<FbAdsAiInsights insights={insights} isLoading={isLoading} totals={data.totals} />
		</div>
	);
}

import type { FbAdsVerdict } from "./fb-ads-types";

/* ── Tab with Chart Layout ─────────────────────────────────────────── */

function TabWithChart({ chart, table, insights, isLoading }: { chart: React.ReactNode; table: React.ReactNode; insights: FbAdsVerdict[]; isLoading: boolean }) {
	return (
		<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
			<div className="space-y-5">{chart}{table}</div>
			<FbAdsAiInsights insights={insights} isLoading={isLoading} />
		</div>
	);
}

/* ── Secondary Queries ─────────────────────────────────────────────── */

function DeviceBreakdownSection({ accountId, dateRange }: { accountId: string; dateRange: { start: string; end: string } }) {
	const { data } = useFbAdsInsights({ tab: "devices", start: dateRange.start, end: dateRange.end, ...(accountId ? { ad_account_id: accountId } : {}) });
	if (!data?.rows?.length) return null;
	return <FbAdsDeviceBreakdown rows={data.rows} currency={data?.account?.currency || data?.totals?.currency || "USD"} />;
}

function TopInsightsSection({ accountId, dateRange }: { accountId: string; dateRange: { start: string; end: string } }) {
	const { data: demoData } = useFbAdsInsights({ tab: "demographics", start: dateRange.start, end: dateRange.end, ...(accountId ? { ad_account_id: accountId } : {}) });
	const { data: hoursData } = useFbAdsInsights({ tab: "hours", start: dateRange.start, end: dateRange.end, ...(accountId ? { ad_account_id: accountId } : {}) });
	const { data: regionsData } = useFbAdsInsights({ tab: "regions", start: dateRange.start, end: dateRange.end, ...(accountId ? { ad_account_id: accountId } : {}) });
	return <FbAdsTopInsights demographicsRows={demoData?.rows} hoursRows={hoursData?.rows} regionsRows={regionsData?.rows} />;
}

/* ── Not Connected / Token Expired ─────────────────────────────────── */

function NotConnected() {
	return (
		<Card><CardContent className="flex flex-col items-center gap-4 py-12">
			<BarChart3 size={48} className="text-[var(--muted-foreground)]" />
			<h2 className="text-lg font-semibold">Connect Facebook Ads</h2>
			<p className="text-sm text-[var(--muted-foreground)] text-center max-w-md">Connect your Meta Ads account to view campaign performance, manage ads, and track ROI.</p>
			<a href="/facebook-ads/login" target="_blank" rel="noopener noreferrer"><Button><ExternalLink size={16} className="mr-1.5" /> Connect Facebook Ads</Button></a>
		</CardContent></Card>
	);
}

function TokenExpired() {
	return (
		<Card><CardContent className="flex flex-col items-center gap-4 py-12">
			<BarChart3 size={48} className="text-amber-500" />
			<h2 className="text-lg font-semibold">Reconnect Facebook Ads</h2>
			<p className="text-sm text-[var(--muted-foreground)] text-center max-w-md">Your Facebook Ads access token has expired. Please reconnect to continue viewing insights.</p>
			<a href="/facebook-ads/login" target="_blank" rel="noopener noreferrer"><Button><ExternalLink size={16} className="mr-1.5" /> Reconnect</Button></a>
		</CardContent></Card>
	);
}
