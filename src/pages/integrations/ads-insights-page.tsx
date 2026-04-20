import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink } from "lucide-react";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { FbAdsInsightsPage } from "./facebook-ads/fb-ads-insights-page";
import { GoogleAdsInsightsPage } from "./google-ads/google-ads-insights-page";

const PLATFORM_NAMES: Record<string, string> = {
	facebook: "Facebook Ads",
	google: "Google Ads",
	tiktok: "TikTok Ads",
	linkedin: "LinkedIn Ads",
};

function detectPlatform(pathname: string): string {
	// Routes are hardcoded (integrations/google/ads, integrations/facebook/ads, etc.)
	// so useParams() returns {}. Parse the pathname instead.
	const m = pathname.match(/\/integrations\/(facebook|google|tiktok|linkedin)(?:-ads)?\/ads/);
	return m?.[1] ?? "facebook";
}

export function AdsInsightsPage() {
	const { pathname } = useLocation();
	const platform = detectPlatform(pathname);

	if (platform === "facebook") return <FbAdsInsightsPage />;
	if (platform === "google") return <GoogleAdsInsightsPage />;

	const title = PLATFORM_NAMES[platform] ?? `${platform} Ads`;
	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<PlatformIcon platform={platform} size={24} />
				<h1 className="text-2xl font-bold">{title}</h1>
			</div>
			<Card>
				<CardContent className="flex flex-col items-center gap-4 py-12">
					<BarChart3 size={48} className="text-[var(--muted-foreground)]" />
					<h2 className="text-lg font-semibold">Connect {title}</h2>
					<p className="text-sm text-[var(--muted-foreground)] text-center max-w-md">
						Connect your {title} account to view campaign performance and track ROI.
					</p>
					<a href={`/${platform}-ads/login`} target="_blank" rel="noopener noreferrer">
						<Button><ExternalLink size={16} className="mr-1.5" /> Connect {title}</Button>
					</a>
				</CardContent>
			</Card>
		</div>
	);
}
