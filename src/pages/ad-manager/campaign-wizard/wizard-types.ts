export interface WizardState {
	// Step 1 — Account
	integration_id: number;
	account_name: string;
	// Step 2 — Platform
	platform: "meta" | "google" | "tiktok" | "linkedin" | "";
	// Step 3 — Objective
	objective: string;
	// Step 4 — Audience
	locations: string[];
	languages: string[];
	interests: string[];
	gender: "all" | "male" | "female";
	age_min: number;
	age_max: number;
	excluded_audiences: string;
	advantage_audience: boolean;
	detailed_targeting_expansion: boolean;
	devices: string[];
	// Step 5 — Budget
	name: string;
	budget_type: "daily" | "lifetime";
	budget: number;
	start_date: string;
	end_date: string;
	ad_scheduling: boolean;
	bid_strategy: string;
	bid_cap_amount: number;
	roas_target: number;
	// Step 6 — Placements
	placements: string[];
	// Step 7 — Creative
	creative_format: string;
	dynamic_creative: boolean;
	primary_text: string;
	headlines: string[];
	descriptions: string[];
	cta: string;
	destination_url: string;
	image_url: string;
	video_url: string;
	// Step 8 — Tracking
	conversion_event: string;
	pixel_tracking: boolean;
	utm_source: string;
	utm_medium: string;
	utm_campaign: string;
	// Step 9 — Review
	sandbox_mode: boolean;
}

export const DEFAULT_STATE: WizardState = {
	integration_id: 0, account_name: "", platform: "", objective: "",
	locations: [], languages: [], interests: [], gender: "all",
	age_min: 18, age_max: 65, excluded_audiences: "",
	advantage_audience: false, detailed_targeting_expansion: false,
	devices: ["desktop", "mobile", "tablet"],
	name: "", budget_type: "daily", budget: 50, start_date: "", end_date: "",
	ad_scheduling: false, bid_strategy: "highest_volume", bid_cap_amount: 0, roas_target: 0,
	placements: [],
	creative_format: "image", dynamic_creative: false,
	primary_text: "", headlines: [""], descriptions: [""],
	cta: "SHOP_NOW", destination_url: "", image_url: "", video_url: "",
	conversion_event: "purchase", pixel_tracking: true,
	utm_source: "", utm_medium: "", utm_campaign: "",
	sandbox_mode: false,
};

export const PLATFORM_LABELS: Record<string, string> = {
	meta: "Meta Ads", google: "Google Ads", tiktok: "TikTok Ads", linkedin: "LinkedIn Ads",
};

export const PLATFORM_ICONS: Record<string, string> = {
	meta: "facebook", google: "google", tiktok: "tiktok", linkedin: "linkedin",
};
