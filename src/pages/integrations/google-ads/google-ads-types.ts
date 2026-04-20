export type GoogleAdsTab =
	| "overview" | "campaigns" | "adgroups" | "ads"
	| "devices" | "geo" | "regions" | "networks" | "hours"
	| "demographics" | "competitors";

export const GOOGLE_ADS_TABS: { key: GoogleAdsTab; label: string }[] = [
	{ key: "overview", label: "Overview" },
	{ key: "campaigns", label: "Campaigns" },
	{ key: "adgroups", label: "Ad Groups" },
	{ key: "ads", label: "Ads" },
	{ key: "devices", label: "Devices" },
	{ key: "geo", label: "Countries" },
	{ key: "regions", label: "Regions" },
	{ key: "networks", label: "Networks" },
	{ key: "hours", label: "Hours" },
	{ key: "demographics", label: "Demographics" },
	{ key: "competitors", label: "Competitors" },
];

export interface GoogleAdsAccount {
	id: string;
	customer_id?: string;
	name: string;
	currency: string;
	timezone: string;
}

export interface GoogleAdsTotals {
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
	currency?: string;
}

export interface GoogleAdsTimeseriesPoint {
	date: string;
	spend: number;
	impressions: number;
	clicks: number;
	conversions: number;
	revenue: number;
}

export interface GoogleAdsRow {
	key: string;
	entity_level?: string;
	entity_id?: string;
	spend: number;
	impressions: number;
	clicks: number;
	conversions: number;
	revenue: number;
	roas: number;

	// Ads tab extras
	ad_id?: string;
	ad_type?: string;
	ad_status?: string;
	campaign_name?: string;
	adgroup_name?: string;
	final_url?: string;
	headlines?: string[];
	descriptions?: string[];

	// Demographics extras
	age_range?: string;
	gender?: string;
	dimension?: string;

	// Competitors extras
	channel_type?: string;
	impression_share?: number;
	top_impression_share?: number;
	abs_top_impression_share?: number;
	competitor_share?: number;
	rank_lost_share?: number;
	budget_lost_share?: number;
	rank_lost_top_share?: number;
	budget_lost_top_share?: number;
	rank_lost_abs_top_share?: number;
	budget_lost_abs_top_share?: number;

	effective_status?: string;
	triage_decision?: string;
	triage_suggested?: string;
	triage_reason?: string;
}

export interface GoogleAdsKeyword {
	keyword: string;
	match_type: string;
	quality_score: number | null;
	spend: number;
	impressions: number;
	clicks: number;
	conversions: number;
	revenue: number;
}

export interface GoogleAdsAdGroup {
	key: string;
	entity_id: string;
	status: string;
	campaign_name: string;
	spend: number;
	impressions: number;
	clicks: number;
	conversions: number;
	revenue: number;
}

export interface GoogleAdsVerdict {
	type: string;
	severity: "success" | "warning" | "danger";
	title: string;
	message: string;
}

export interface GoogleAdsResponse {
	ok: number;
	source: string;
	account: { id: string; name: string; currency: string; timezone: string };
	range: { start: string; end: string };
	compare_range: { start: string; end: string } | null;
	tab: GoogleAdsTab;
	conversion_type: string;
	filters: Record<string, string>;
	filter_options: Record<string, unknown[]>;
	customers: string[];
	totals: GoogleAdsTotals;
	totals_prev: GoogleAdsTotals | null;
	timeseries: GoogleAdsTimeseriesPoint[];
	timeseries_prev: GoogleAdsTimeseriesPoint[] | null;
	rows: GoogleAdsRow[];
	keywords?: GoogleAdsKeyword[];
	adgroups_overview?: GoogleAdsAdGroup[];
	verdicts: {
		insights?: GoogleAdsVerdict[];
		recommendations?: { campaigns?: { entity_id: string; suggested: string; reason: string }[] };
	};
	badges: Record<string, string | number>;
	error?: string;
	customers_error?: string | null;
}

export interface GoogleAdsQueryParams {
	tab: GoogleAdsTab;
	start: string;
	end: string;
	customer_id?: string;
	need_customers?: string;
	compare?: string;
	conversion_type?: string;
	refresh?: string;
	campaign?: string;
	adgroup?: string;
	ad?: string;
	device?: string;
	country?: string;
}
