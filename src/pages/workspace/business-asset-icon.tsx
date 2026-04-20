import { PlatformIcon } from "@/pages/social/platform-icon";
import { SiWoocommerce, SiSlack, SiGoogleanalytics, SiGooglesearchconsole } from "react-icons/si";
import { Globe } from "lucide-react";

/**
 * Icon for a Business Group asset_type (facebook_ads, google_ads, ga4, gsc,
 * woocommerce, slack, social_facebook, social_instagram, ...).
 * Reuses existing PlatformIcon for social/brand platforms; falls back to
 * react-icons/si for the rest (already bundled, no dummy assets).
 */
export function BizAssetIcon({ type, size = 14 }: { type: string; size?: number }) {
	const t = (type || "").toLowerCase();

	if (t.startsWith("social_")) {
		return <PlatformIcon platform={t.replace("social_", "")} size={size} />;
	}

	switch (t) {
		case "facebook_ads": return <PlatformIcon platform="facebook" size={size} />;
		case "google_ads": return <PlatformIcon platform="google" size={size} />;
		case "tiktok_ads": return <PlatformIcon platform="tiktok" size={size} />;
		case "linkedin_ads": return <PlatformIcon platform="linkedin" size={size} />;
		case "ga4": return <SiGoogleanalytics size={size} color="#F9AB00" />;
		case "gsc": return <SiGooglesearchconsole size={size} color="#4285F4" />;
		case "woocommerce": return <SiWoocommerce size={size} color="#7F54B3" />;
		case "slack": return <SiSlack size={size} color="#611F69" />;
		default: return <Globe size={size} className="text-gray-500" />;
	}
}

export const ASSET_TYPE_LABEL: Record<string, string> = {
	facebook_ads: "Facebook Ads",
	google_ads: "Google Ads",
	tiktok_ads: "TikTok Ads",
	linkedin_ads: "LinkedIn Ads",
	ga4: "Google Analytics 4",
	gsc: "Search Console",
	woocommerce: "WooCommerce",
	slack: "Slack",
	social_facebook: "Facebook",
	social_instagram: "Instagram",
	social_tiktok: "TikTok",
	social_twitter: "X",
	social_linkedin: "LinkedIn",
	social_youtube: "YouTube",
};

export const INTEGRATION_TYPES: string[] = [
	"facebook_ads", "google_ads", "tiktok_ads", "linkedin_ads",
	"ga4", "gsc", "woocommerce", "slack",
];

export const SOCIAL_TYPES: string[] = [
	"social_facebook", "social_instagram", "social_tiktok",
	"social_twitter", "social_linkedin", "social_youtube",
];
