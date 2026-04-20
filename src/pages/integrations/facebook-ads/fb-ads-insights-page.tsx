import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink, Settings, Clock } from "lucide-react";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { useFbAdsInsights, useFbAdsAction, fbAdsExportUrl } from "@/api/facebook-ads-insights";
import { FbAdsHeader } from "./fb-ads-header";
import { FbAdsKpiCards } from "./fb-ads-kpi-cards";
import { FbAdsPerformanceChart } from "./fb-ads-performance-chart";
import { FbAdsDataTable } from "./fb-ads-data-table";
import { FbAdsDeviceBreakdown } from "./fb-ads-device-breakdown";
import { FbAdsAiInsights } from "./fb-ads-ai-insights";
import { FbAdsPreviewModal } from "./fb-ads-preview-modal";
import { FbAdsCreativeInsights } from "./fb-ads-creative-insights";
import { FbAdsFiltersBar } from "./fb-ads-filters";
import { FbAdsVerdictsModal } from "./fb-ads-verdicts-modal";
import { DemographicsChart, PlacementChart, HourOfDayChart, ConversionFunnelChart } from "./fb-ads-tab-charts";
import type { FbAdsTab, FbAdsAccount, FbAdsRow, FbAdsQueryParams, FbAdsFilters } from "./fb-ads-types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
	const [cachedAccounts, setCachedAccounts] = useState<FbAdsAccount[]>([]);
	const [filters, setFilters] = useState<FbAdsFilters>({ campaign: "", adset: "", device: "", country: "" });
	const [verdictsOpen, setVerdictsOpen] = useState(false);
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const navigate = useNavigate();
	const setPage1 = useCallback(() => { setAccumulated([]); setCursor(""); }, []);

	const [accountsLoaded, setAccountsLoaded] = useState(false);

	const params: FbAdsQueryParams = {
		tab, start: dateRange.start, end: dateRange.end,
		...(accountId ? { ad_account_id: accountId } : {}),
		// Only request accounts list on first load — saves 1 FB API call per subsequent request.
		// listAdAccounts is also cached 10min server-side to prevent redundant calls.
		...(!accountsLoaded ? { need_accounts: "1" } : {}),
		...(cursor ? { after: cursor } : {}),
		conversion_type: conversionType,
		...(compare ? { compare: "1" } : {}),
		...(filters.campaign ? { campaign: filters.campaign } : {}),
		...(filters.adset ? { adset: filters.adset } : {}),
		...(filters.device ? { device: filters.device } : {}),
		...(filters.country ? { country: filters.country } : {}),
	};

	const { data, isLoading, error, refetch } = useFbAdsInsights(params);
	const actionMutation = useFbAdsAction();
	const fetchError = error ? (error as unknown as Record<string, string>)?.error || (error as unknown as Record<string, string>)?.message || "Failed to load data" : null;

	useEffect(() => {
		if (data?.account?.id && !accountId) setAccountId(data.account.id);
		if (data?.accounts && data.accounts.length > 0) {
			if (!accountsLoaded) setAccountsLoaded(true);
			setCachedAccounts(data.accounts);
		}
	}, [data?.account?.id, data?.accounts, accountId, accountsLoaded]);
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
		if (fmt === "ai") {
			// Navigate to AI Captain with context about this ad account
			const aiPath = wsHash ? `/w/${wsHash}/captain` : "/captain";
			navigate(aiPath + "?prompt=" + encodeURIComponent("Generate a full performance report for my Facebook Ads. Include: executive summary, top/bottom campaigns by ROAS, budget recommendations, audience insights, and creative performance."));
			return;
		}
		window.open(fbAdsExportUrl(params, fmt), "_blank");
	}, [params, wsHash, navigate]);

	const handleAiChipClick = useCallback((question: string) => {
		const aiPath = wsHash ? `/w/${wsHash}/captain` : "/captain";
		navigate(aiPath + "?prompt=" + encodeURIComponent(question));
	}, [wsHash, navigate]);

	const handleQuickAction = useCallback((action: string) => {
		switch (action) {
			case "Scale Winners": handleAiChipClick("Which Facebook Ad campaigns should I scale and why? Show me the top performers by ROAS."); break;
			case "Pause Losers": handleAiChipClick("Which Facebook Ad campaigns should I pause? Show me the worst performers with negative ROAS."); break;
			case "Optimize Budget": handleAiChipClick("How should I reallocate my Facebook Ads budget across campaigns for maximum ROAS?"); break;
			case "Export Report": handleExport("pdf"); break;
			default: toast.info(action);
		}
	}, [handleAiChipClick, handleExport]);

	if (data && !isLoading && data.error === "Facebook Ads is not connected") return <NotConnected />;
	if (data && !isLoading && data.error?.includes("token missing")) return <TokenExpired />;
	const availableAccounts = cachedAccounts.length > 0 ? cachedAccounts : (data?.accounts ?? []);
	const needsAccountSelection = data && !isLoading && data.error?.includes("Select an ad account") && availableAccounts.length > 0;

	const insights = data?.verdicts?.insights ?? [];
	const displayError = data?.error || fetchError;
	const attribution = data?.badges?.facebook_attribution;
	const aiHandlers: AiHandlers = { onAiChipClick: handleAiChipClick, onQuickAction: handleQuickAction, onShowVerdicts: () => setVerdictsOpen(true) };

	return (
		<div className="space-y-5">
			<FbAdsHeader
				tab={tab} onTabChange={setTab} dateRange={dateRange} onDateRangeChange={setDateRange}
				accounts={cachedAccounts.length > 0 ? cachedAccounts : (data?.accounts ?? [])} selectedAccountId={accountId} onAccountChange={handleAccountChange}
				onRefresh={() => refetch()} onExport={handleExport} isLoading={isLoading} currency={currency}
				conversionType={conversionType} onConversionTypeChange={setConversionType}
				compare={compare} onCompareChange={setCompare} attribution={attribution}
			/>

			{/* Filters bar */}
			<FbAdsFiltersBar filters={filters} onChange={(f) => { setFilters(f); setPage1(); }} rows={allRows} />

			{needsAccountSelection ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12">
						<Settings size={48} className="text-[var(--muted-foreground)]" />
						<h2 className="text-lg font-semibold">Select an Ad Account</h2>
						<p className="text-sm text-[var(--muted-foreground)] text-center max-w-md">
							Choose a Facebook Ad account to view reporting and insights.
						</p>
						<div className="flex flex-col gap-2 w-full max-w-sm">
							{(cachedAccounts.length > 0 ? cachedAccounts : (data?.accounts ?? [])).map((acc) => (
								<button key={acc.id || acc.account_id} onClick={() => handleAccountChange(acc)}
									className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-4 py-3 text-left hover:bg-[var(--muted)] transition-colors">
									<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
										<PlatformIcon platform="facebook" size={16} />
									</div>
									<div>
										<p className="text-sm font-medium">{acc.name}</p>
										<p className="text-xs text-[var(--muted-foreground)]">{acc.account_id} · {acc.currency}</p>
									</div>
								</button>
							))}
						</div>
					</CardContent>
				</Card>
			) : isLoading && !data ? (
				<div className="flex h-48 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : displayError && !data?.totals ? (
				<Card>
					<CardContent className="py-8 text-center">
						{displayError.toLowerCase().includes("rate limit") || displayError.toLowerCase().includes("too many") ? (
							<>
								<div className="flex justify-center mb-3">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
										<Clock size={24} className="text-amber-600" />
									</div>
								</div>
								<p className="text-sm text-amber-600 font-medium mb-2">Rate Limited</p>
								<p className="text-sm text-[var(--muted-foreground)]">Facebook is temporarily limiting API requests for this ad account. Data will auto-refresh when available.</p>
								<p className="text-xs text-[var(--muted-foreground)] mt-2">This usually resolves within 5-10 minutes.</p>
							</>
						) : (
							<>
								<p className="text-sm text-red-500 font-medium mb-2">Error loading data</p>
								<p className="text-sm text-[var(--muted-foreground)]">{displayError}</p>
								<Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Try Again</Button>
							</>
						)}
					</CardContent>
				</Card>
			) : data?.totals ? (
				<>
					<FbAdsKpiCards totals={data.totals} totalsPrev={data.totals_prev} currency={currency} />

					{tab === "overview" && (
						<OverviewLayout data={data} allRows={allRows} currency={currency} insights={insights}
							isLoading={isLoading} accountId={accountId} dateRange={dateRange}
							onTriageChange={handleTriageChange} onRowClick={handleRowClick} aiHandlers={aiHandlers} />
					)}
					{tab === "demographics" && (
						<TabWithChart chart={<DemographicsChart rows={allRows} currency={currency} />}
							table={<FbAdsDataTable rows={allRows} tab={tab} currency={currency} nextCursor={data.next_cursor ?? ""} onLoadMore={() => setCursor(data.next_cursor ?? "")} isLoadingMore={!!cursor && isLoading} />}
							insights={insights} isLoading={isLoading} aiHandlers={aiHandlers} />
					)}
					{tab === "placements" && (
						<TabWithChart chart={<PlacementChart rows={allRows} currency={currency} />}
							table={<FbAdsDataTable rows={allRows} tab={tab} currency={currency} nextCursor={data.next_cursor ?? ""} onLoadMore={() => setCursor(data.next_cursor ?? "")} isLoadingMore={!!cursor && isLoading} />}
							insights={insights} isLoading={isLoading} aiHandlers={aiHandlers} />
					)}
					{tab === "hours" && (
						<TabWithChart chart={<HourOfDayChart rows={allRows} currency={currency} />}
							table={<FbAdsDataTable rows={allRows} tab={tab} currency={currency} nextCursor={data.next_cursor ?? ""} onLoadMore={() => setCursor(data.next_cursor ?? "")} isLoadingMore={!!cursor && isLoading} />}
							insights={insights} isLoading={isLoading} aiHandlers={aiHandlers} />
					)}
					{tab === "creatives" && (
						<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
							<div className="space-y-5">
								<FbAdsCreativeInsights rows={allRows} currency={currency} />
								<FbAdsDataTable rows={allRows} tab={tab} currency={currency}
									nextCursor={data.next_cursor ?? ""} onLoadMore={() => setCursor(data.next_cursor ?? "")}
									isLoadingMore={!!cursor && isLoading} onRowClick={handleRowClick} />
							</div>
							<FbAdsAiInsights insights={insights} isLoading={isLoading} onAiChipClick={handleAiChipClick} onQuickAction={handleQuickAction} onShowVerdicts={() => setVerdictsOpen(true)} />
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
							<FbAdsAiInsights insights={insights} isLoading={isLoading} onAiChipClick={handleAiChipClick} onQuickAction={handleQuickAction} onShowVerdicts={() => setVerdictsOpen(true)} />
						</div>
					)}
				</>
			) : data?.error ? (
				<Card><CardContent className="py-8 text-center"><p className="text-sm text-[var(--muted-foreground)]">{data.error}</p></CardContent></Card>
			) : null}

			<FbAdsPreviewModal adId={previewAdId} onClose={() => setPreviewAdId(null)} accountId={accountId} />
			<FbAdsVerdictsModal
				open={verdictsOpen} onClose={() => setVerdictsOpen(false)}
				recommendations={data?.verdicts?.recommendations?.campaigns ?? []}
				rows={allRows} onTriageChange={handleTriageChange}
			/>
		</div>
	);
}

/* ── Overview Layout ───────────────────────────────────────────────── */

function OverviewLayout({ data, allRows, currency, insights, isLoading, accountId, dateRange, onTriageChange, onRowClick, aiHandlers }: {
	data: NonNullable<ReturnType<typeof useFbAdsInsights>["data"]>;
	allRows: FbAdsRow[]; currency: string; insights: FbAdsVerdict[]; isLoading: boolean;
	accountId: string; dateRange: { start: string; end: string };
	onTriageChange: (id: string, level: string, decision: string) => void;
	onRowClick: (row: FbAdsRow) => void;
	aiHandlers: AiHandlers;
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
				<LazyDeviceBreakdown accountId={accountId} dateRange={dateRange} />
				{allRows.length > 0 && (
					<FbAdsDataTable rows={allRows} tab="campaigns" currency={currency}
						nextCursor="" onLoadMore={() => {}} isLoadingMore={false}
						onTriageChange={onTriageChange} onRowClick={onRowClick} />
				)}
			</div>
			<FbAdsAiInsights insights={insights} isLoading={isLoading} totals={data.totals} onAiChipClick={aiHandlers.onAiChipClick} onQuickAction={aiHandlers.onQuickAction} onShowVerdicts={aiHandlers.onShowVerdicts} />
		</div>
	);
}

import type { FbAdsVerdict } from "./fb-ads-types";

interface AiHandlers { onAiChipClick: (q: string) => void; onQuickAction: (a: string) => void; onShowVerdicts: () => void }

/* ── Tab with Chart Layout ─────────────────────────────────────────── */

function TabWithChart({ chart, table, insights, isLoading, aiHandlers }: { chart: React.ReactNode; table: React.ReactNode; insights: FbAdsVerdict[]; isLoading: boolean; aiHandlers: AiHandlers }) {
	return (
		<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
			<div className="space-y-5">{chart}{table}</div>
			<FbAdsAiInsights insights={insights} isLoading={isLoading} onAiChipClick={aiHandlers.onAiChipClick} onQuickAction={aiHandlers.onQuickAction} onShowVerdicts={aiHandlers.onShowVerdicts} />
		</div>
	);
}

/* ── Lazy Device Breakdown (deferred to avoid competing with main call) */

function LazyDeviceBreakdown({ accountId, dateRange }: { accountId: string; dateRange: { start: string; end: string } }) {
	const [enabled, setEnabled] = useState(false);
	useEffect(() => { const t = setTimeout(() => setEnabled(true), 1500); return () => clearTimeout(t); }, [accountId, dateRange.start, dateRange.end]);
	const { data } = useFbAdsInsights({ tab: "devices", start: dateRange.start, end: dateRange.end, ...(accountId ? { ad_account_id: accountId } : {}) }, enabled);
	if (!data?.rows?.length) return null;
	return <FbAdsDeviceBreakdown rows={data.rows} currency={data?.account?.currency || data?.totals?.currency || "USD"} />;
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
