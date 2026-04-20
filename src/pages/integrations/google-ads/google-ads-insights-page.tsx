import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink, Settings } from "lucide-react";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { useGoogleAdsInsights, useGoogleAdsAction, googleAdsExportUrl } from "@/api/google-ads-insights";
import { GoogleAdsHeader } from "./google-ads-header";
import { GoogleAdsKpiCards } from "./google-ads-kpi-cards";
import { GoogleAdsPerformanceChart } from "./google-ads-performance-chart";
import { GoogleAdsDataTable } from "./google-ads-data-table";
import { GoogleAdsAiInsights } from "./google-ads-ai-insights";
import { GoogleAdsVerdictsModal } from "./google-ads-verdicts-modal";
import { DevicesChart, GeoChart, HourOfDayChart, NetworkChart, DemographicsChart, CompetitorsChart } from "./google-ads-tab-charts";
import { GoogleAdsCreativeGallery } from "./google-ads-creative-gallery";
import type { GoogleAdsTab, GoogleAdsQueryParams, GoogleAdsVerdict } from "./google-ads-types";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function defaultDateRange() {
	const end = new Date();
	const start = new Date();
	start.setDate(end.getDate() - 27);
	return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10), label: "Last 28 Days" };
}

export function GoogleAdsInsightsPage() {
	const [tab, setTab] = useState<GoogleAdsTab>("overview");
	const [dateRange, setDateRange] = useState(defaultDateRange);
	const [customerId, setCustomerId] = useState("");
	const [conversionType, setConversionType] = useState("purchases");
	const [compare, setCompare] = useState(false);
	const [verdictsOpen, setVerdictsOpen] = useState(false);
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const navigate = useNavigate();

	const params: GoogleAdsQueryParams = {
		tab, start: dateRange.start, end: dateRange.end,
		...(customerId ? { customer_id: customerId } : {}),
		conversion_type: conversionType,
		...(compare ? { compare: "1" } : {}),
	};

	const { data, isLoading, error, refetch } = useGoogleAdsInsights(params);
	const actionMutation = useGoogleAdsAction();
	const fetchError = error ? (error as unknown as Record<string, string>)?.error || (error as unknown as Record<string, string>)?.message || "Failed to load data" : null;

	useEffect(() => {
		if (data?.account?.id && !customerId) setCustomerId(data.account.id);
	}, [data?.account?.id, customerId]);

	const rows = data?.rows ?? [];
	const currency = data?.account?.currency || data?.totals?.currency || "USD";

	const handleCustomerChange = useCallback((id: string) => {
		setCustomerId(id);
		actionMutation.mutate({ action: "gads_set_customer", customer_id: id });
	}, [actionMutation]);

	const handleTriageChange = useCallback((entityId: string, level: string, decision: string) => {
		actionMutation.mutate({ action: "gads_triage_set", entity_id: entityId, entity_level: level, decision });
	}, [actionMutation]);

	const handleExport = useCallback((fmt: string) => {
		if (fmt === "ai") {
			const aiPath = wsHash ? `/w/${wsHash}/ai-captain` : "/ai-captain";
			navigate(aiPath + "?prompt=" + encodeURIComponent("Generate a full performance report for my Google Ads. Include: executive summary, top/bottom campaigns by ROAS, budget recommendations, keyword performance, and device/geo insights."));
			return;
		}
		window.open(googleAdsExportUrl(params, fmt), "_blank");
	}, [params, wsHash, navigate]);

	const handleAiChipClick = useCallback((question: string) => {
		const aiPath = wsHash ? `/w/${wsHash}/ai-captain` : "/ai-captain";
		navigate(aiPath + "?prompt=" + encodeURIComponent(question));
	}, [wsHash, navigate]);

	const handleQuickAction = useCallback((action: string) => {
		switch (action) {
			case "Scale Winners": handleAiChipClick("Which Google Ads campaigns should I scale and why? Show me the top performers by ROAS."); break;
			case "Pause Losers": handleAiChipClick("Which Google Ads campaigns should I pause? Show me the worst performers with negative ROAS."); break;
			case "Optimize Budget": handleAiChipClick("How should I reallocate my Google Ads budget across campaigns for maximum ROAS?"); break;
			case "Export Report": handleExport("xls"); break;
			default: toast.info(action);
		}
	}, [handleAiChipClick, handleExport]);

	if (data && !isLoading && data.error === "Google Ads is not connected") return <NotConnected />;
	if (data && !isLoading && data.error?.includes("token missing")) return <TokenExpired />;

	const availableCustomers = data?.customers ?? [];
	const needsCustomerSelection = data && !isLoading && data.error?.includes("Select a Google Ads account") && availableCustomers.length > 0;

	const insights = data?.verdicts?.insights ?? [];
	const displayError = data?.error || fetchError;
	const aiHandlers: AiHandlers = { onAiChipClick: handleAiChipClick, onQuickAction: handleQuickAction, onShowVerdicts: () => setVerdictsOpen(true) };

	return (
		<div className="space-y-5">
			<GoogleAdsHeader
				tab={tab} onTabChange={setTab} dateRange={dateRange} onDateRangeChange={setDateRange}
				customers={availableCustomers} selectedCustomerId={customerId} onCustomerChange={handleCustomerChange}
				accountName={data?.account?.name}
				onRefresh={() => refetch()} onExport={handleExport} isLoading={isLoading} currency={currency}
				conversionType={conversionType} onConversionTypeChange={setConversionType}
				compare={compare} onCompareChange={setCompare}
			/>

			{needsCustomerSelection ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12">
						<Settings size={48} className="text-[var(--muted-foreground)]" />
						<h2 className="text-lg font-semibold">Select a Google Ads Account</h2>
						<p className="text-sm text-[var(--muted-foreground)] text-center max-w-md">
							Choose a Google Ads customer to view reporting and insights.
						</p>
						<div className="flex flex-col gap-2 w-full max-w-sm">
							{availableCustomers.map((c) => (
								<button key={c} onClick={() => handleCustomerChange(c)}
									className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-4 py-3 text-left hover:bg-[var(--muted)] transition-colors">
									<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
										<PlatformIcon platform="google" size={16} />
									</div>
									<div>
										<p className="text-sm font-medium">{fmtCustomerId(c)}</p>
										<p className="text-xs text-[var(--muted-foreground)]">Customer ID</p>
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
						<p className="text-sm text-red-500 font-medium mb-2">Error loading data</p>
						<p className="text-sm text-[var(--muted-foreground)]">{displayError}</p>
						<Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Try Again</Button>
					</CardContent>
				</Card>
			) : data?.totals ? (
				<>
					<GoogleAdsKpiCards totals={data.totals} totalsPrev={data.totals_prev} currency={currency} />

					{tab === "overview" && (
						<OverviewLayout data={data} currency={currency} insights={insights}
							isLoading={isLoading} onTriageChange={handleTriageChange} aiHandlers={aiHandlers} />
					)}
					{tab === "demographics" && (
						<TabWithChart chart={<DemographicsChart rows={rows} currency={currency} />}
							table={<GoogleAdsDataTable rows={rows} tab={tab} currency={currency} />}
							insights={insights} isLoading={isLoading} aiHandlers={aiHandlers} />
					)}
					{tab === "devices" && (
						<TabWithChart chart={<DevicesChart rows={rows} currency={currency} />}
							table={<GoogleAdsDataTable rows={rows} tab={tab} currency={currency} />}
							insights={insights} isLoading={isLoading} aiHandlers={aiHandlers} />
					)}
					{tab === "geo" && (
						<TabWithChart chart={<GeoChart rows={rows} currency={currency} />}
							table={<GoogleAdsDataTable rows={rows} tab={tab} currency={currency} />}
							insights={insights} isLoading={isLoading} aiHandlers={aiHandlers} />
					)}
					{tab === "hours" && (
						<TabWithChart chart={<HourOfDayChart rows={rows} currency={currency} />}
							table={<GoogleAdsDataTable rows={rows} tab={tab} currency={currency} />}
							insights={insights} isLoading={isLoading} aiHandlers={aiHandlers} />
					)}
					{tab === "networks" && (
						<TabWithChart chart={<NetworkChart rows={rows} currency={currency} />}
							table={<GoogleAdsDataTable rows={rows} tab={tab} currency={currency} />}
							insights={insights} isLoading={isLoading} aiHandlers={aiHandlers} />
					)}
					{tab === "competitors" && (
						<TabWithChart chart={<CompetitorsChart rows={rows} />}
							table={<GoogleAdsDataTable rows={rows} tab={tab} currency={currency} />}
							insights={insights} isLoading={isLoading} aiHandlers={aiHandlers} />
					)}
					{tab === "creatives" && (
						<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
							<div className="space-y-5">
								<GoogleAdsCreativeGallery rows={rows} currency={currency} />
							</div>
							<GoogleAdsAiInsights insights={insights} isLoading={isLoading} onAiChipClick={handleAiChipClick} onQuickAction={handleQuickAction} onShowVerdicts={() => setVerdictsOpen(true)} />
						</div>
					)}
					{!["overview", "demographics", "devices", "geo", "hours", "networks", "competitors", "creatives"].includes(tab) && (
						<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
							<div className="space-y-5">
								<GoogleAdsPerformanceChart timeseries={data.timeseries} timeseriesPrev={data.timeseries_prev} currency={currency} />
								<GoogleAdsDataTable rows={rows} tab={tab} currency={currency}
									onTriageChange={tab === "campaigns" ? handleTriageChange : undefined} />
							</div>
							<GoogleAdsAiInsights insights={insights} isLoading={isLoading} onAiChipClick={handleAiChipClick} onQuickAction={handleQuickAction} onShowVerdicts={() => setVerdictsOpen(true)} />
						</div>
					)}
				</>
			) : data?.error ? (
				<Card><CardContent className="py-8 text-center"><p className="text-sm text-[var(--muted-foreground)]">{data.error}</p></CardContent></Card>
			) : null}

			<GoogleAdsVerdictsModal
				open={verdictsOpen} onClose={() => setVerdictsOpen(false)}
				recommendations={data?.verdicts?.recommendations?.campaigns ?? []}
				rows={rows} onTriageChange={handleTriageChange}
			/>
		</div>
	);
}

interface AiHandlers { onAiChipClick: (q: string) => void; onQuickAction: (a: string) => void; onShowVerdicts: () => void }

function fmtCustomerId(id: string): string {
	if (id.length === 10 && /^\d+$/.test(id)) return `${id.slice(0,3)}-${id.slice(3,6)}-${id.slice(6)}`;
	return id;
}

/* ── Overview Layout ───────────────────────────────────────────────── */

function OverviewLayout({ data, currency, insights, isLoading, onTriageChange, aiHandlers }: {
	data: NonNullable<ReturnType<typeof useGoogleAdsInsights>["data"]>;
	currency: string; insights: GoogleAdsVerdict[]; isLoading: boolean;
	onTriageChange: (id: string, level: string, decision: string) => void;
	aiHandlers: AiHandlers;
}) {
	return (
		<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
			<div className="space-y-5">
				<GoogleAdsPerformanceChart timeseries={data.timeseries} timeseriesPrev={data.timeseries_prev} currency={currency} />
				{data.rows.length > 0 && (
					<GoogleAdsDataTable rows={data.rows} tab="campaigns" currency={currency} onTriageChange={onTriageChange} />
				)}
				{data.adgroups_overview && data.adgroups_overview.length > 0 && (
					<OverviewSection title="Top Ad Groups">
						<OverviewAdGroups rows={data.adgroups_overview} currency={currency} />
					</OverviewSection>
				)}
				{data.keywords && data.keywords.length > 0 && (
					<OverviewSection title="Top Keywords">
						<OverviewKeywords rows={data.keywords} currency={currency} />
					</OverviewSection>
				)}
			</div>
			<GoogleAdsAiInsights insights={insights} isLoading={isLoading} onAiChipClick={aiHandlers.onAiChipClick} onQuickAction={aiHandlers.onQuickAction} onShowVerdicts={aiHandlers.onShowVerdicts} />
		</div>
	);
}

function OverviewSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
			<div className="px-5 py-3 border-b border-[var(--border)]">
				<h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
			</div>
			{children}
		</div>
	);
}

function fmtMoney(n: number, c: string): string {
	if (!c) c = "USD";
	try { return new Intl.NumberFormat(undefined, { style: "currency", currency: c, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); }
	catch { return n.toFixed(2); }
}
function fmtNum(n: number): string { return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }

function OverviewAdGroups({ rows, currency }: { rows: NonNullable<ReturnType<typeof useGoogleAdsInsights>["data"]>["adgroups_overview"]; currency: string }) {
	if (!rows?.length) return null;
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead className="bg-[var(--muted)]/30">
					<tr className="border-b border-[var(--border)]">
						<th className="px-4 py-2.5 text-left text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">Ad Group</th>
						<th className="px-4 py-2.5 text-left text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">Campaign</th>
						<th className="px-4 py-2.5 text-right text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">Spend</th>
						<th className="px-4 py-2.5 text-right text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">Clicks</th>
						<th className="px-4 py-2.5 text-right text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">Conv.</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((r, i) => (
						<tr key={`${r.entity_id}-${i}`} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/20">
							<td className="px-4 py-2.5"><p className="font-medium text-sm">{r.key || "—"}</p></td>
							<td className="px-4 py-2.5 text-xs text-[var(--muted-foreground)]">{r.campaign_name}</td>
							<td className="px-4 py-2.5 text-right font-mono text-xs">{fmtMoney(r.spend, currency)}</td>
							<td className="px-4 py-2.5 text-right font-mono text-xs">{fmtNum(r.clicks)}</td>
							<td className="px-4 py-2.5 text-right font-mono text-xs">{fmtNum(r.conversions)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function OverviewKeywords({ rows, currency }: { rows: NonNullable<ReturnType<typeof useGoogleAdsInsights>["data"]>["keywords"]; currency: string }) {
	if (!rows?.length) return null;
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead className="bg-[var(--muted)]/30">
					<tr className="border-b border-[var(--border)]">
						<th className="px-4 py-2.5 text-left text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">Keyword</th>
						<th className="px-4 py-2.5 text-left text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">Match</th>
						<th className="px-4 py-2.5 text-right text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">QS</th>
						<th className="px-4 py-2.5 text-right text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">Spend</th>
						<th className="px-4 py-2.5 text-right text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">Clicks</th>
						<th className="px-4 py-2.5 text-right text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase">Conv.</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((r, i) => (
						<tr key={`${r.keyword}-${i}`} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/20">
							<td className="px-4 py-2.5"><p className="font-medium text-sm">{r.keyword || "—"}</p></td>
							<td className="px-4 py-2.5 text-xs text-[var(--muted-foreground)]">{(r.match_type || "").toLowerCase()}</td>
							<td className="px-4 py-2.5 text-right font-mono text-xs">{r.quality_score ?? "—"}</td>
							<td className="px-4 py-2.5 text-right font-mono text-xs">{fmtMoney(r.spend, currency)}</td>
							<td className="px-4 py-2.5 text-right font-mono text-xs">{fmtNum(r.clicks)}</td>
							<td className="px-4 py-2.5 text-right font-mono text-xs">{fmtNum(r.conversions)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

/* ── Tab with Chart Layout ─────────────────────────────────────────── */

function TabWithChart({ chart, table, insights, isLoading, aiHandlers }: { chart: React.ReactNode; table: React.ReactNode; insights: GoogleAdsVerdict[]; isLoading: boolean; aiHandlers: AiHandlers }) {
	return (
		<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
			<div className="space-y-5">{chart}{table}</div>
			<GoogleAdsAiInsights insights={insights} isLoading={isLoading} onAiChipClick={aiHandlers.onAiChipClick} onQuickAction={aiHandlers.onQuickAction} onShowVerdicts={aiHandlers.onShowVerdicts} />
		</div>
	);
}

/* ── Not Connected / Token Expired ─────────────────────────────────── */

function NotConnected() {
	return (
		<Card><CardContent className="flex flex-col items-center gap-4 py-12">
			<BarChart3 size={48} className="text-[var(--muted-foreground)]" />
			<h2 className="text-lg font-semibold">Connect Google Ads</h2>
			<p className="text-sm text-[var(--muted-foreground)] text-center max-w-md">Connect your Google Ads account to view campaign performance, manage ads, and track ROI.</p>
			<a href="/google-ads/login" target="_blank" rel="noopener noreferrer"><Button><ExternalLink size={16} className="mr-1.5" /> Connect Google Ads</Button></a>
		</CardContent></Card>
	);
}

function TokenExpired() {
	return (
		<Card><CardContent className="flex flex-col items-center gap-4 py-12">
			<BarChart3 size={48} className="text-amber-500" />
			<h2 className="text-lg font-semibold">Reconnect Google Ads</h2>
			<p className="text-sm text-[var(--muted-foreground)] text-center max-w-md">Your Google Ads access has expired. Please reconnect to continue viewing insights.</p>
			<a href="/google-ads/login" target="_blank" rel="noopener noreferrer"><Button><ExternalLink size={16} className="mr-1.5" /> Reconnect</Button></a>
		</CardContent></Card>
	);
}
