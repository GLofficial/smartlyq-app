export type FbAdsTab =
	| "overview" | "campaigns" | "adsets" | "ads" | "creatives"
	| "geo" | "regions" | "placements" | "hours" | "devices" | "demographics";

export const FB_ADS_TABS: { key: FbAdsTab; label: string }[] = [
	{ key: "overview", label: "Overview" },
	{ key: "campaigns", label: "Campaigns" },
	{ key: "adsets", label: "Ad Sets" },
	{ key: "ads", label: "Ads" },
	{ key: "creatives", label: "Creatives" },
	{ key: "geo", label: "Geo" },
	{ key: "regions", label: "Regions" },
	{ key: "placements", label: "Placements" },
	{ key: "hours", label: "Hours" },
	{ key: "devices", label: "Devices" },
	{ key: "demographics", label: "Demographics" },
];

export interface FbAdsAccount {
	id: string;
	account_id: string;
	name: string;
	currency: string;
	timezone: string;
}

export interface FbAdsTotals {
	spend: number;
	impressions: number;
	clicks: number;
	ctr: number;
	cpc: number;
	cpm: number;
	conversions: number;
	conversion_rate: number;
	cpa: number;
	revenue: number;
	roas: number;
	aov: number;
	reach: number;
	frequency: number;
	link_clicks: number;
	active_ads: number;
	currency?: string;
}

export interface FbAdsTimeseriesPoint {
	date: string;
	spend: number;
	impressions: number;
	clicks: number;
	conversions: number;
	revenue: number;
}

export interface FbAdsRow {
	key: string;
	meta: string;
	entity_level: string;
	entity_id: string;
	ad_id: string;
	spend: number;
	reach: number;
	frequency: number;
	impressions: number;
	clicks: number;
	link_clicks: number;
	conversions: number;
	revenue: number;
	roas: number;
	creative_thumb?: string;
	creative_format?: string;
	effective_status?: string;
	triage_decision?: string;
	triage_suggested?: string;
	triage_reason?: string;
}

export interface FbAdsVerdict {
	type: string;
	severity: "success" | "warning" | "danger";
	title: string;
	message: string;
}

export interface FbAdsResponse {
	ok: number;
	source: string;
	account: FbAdsAccount;
	range: { start: string; end: string };
	compare_range: { start: string; end: string } | null;
	tab: FbAdsTab;
	conversion_type: string;
	filters: Record<string, string>;
	filter_options: Record<string, unknown[]>;
	accounts: FbAdsAccount[];
	totals: FbAdsTotals;
	totals_prev: FbAdsTotals | null;
	timeseries: FbAdsTimeseriesPoint[];
	timeseries_prev: FbAdsTimeseriesPoint[] | null;
	rows: FbAdsRow[];
	next_cursor: string;
	verdicts: {
		insights?: FbAdsVerdict[];
		recommendations?: { campaigns?: { entity_id: string; suggested: string; reason: string }[] };
	};
	badges: Record<string, string>;
	error?: string;
}

export interface FbAdsQueryParams {
	tab: FbAdsTab;
	start: string;
	end: string;
	ad_account_id?: string;
	need_accounts?: string;
	compare?: string;
	after?: string;
	rowLimit?: string;
	conversion_type?: string;
	refresh?: string;
}
