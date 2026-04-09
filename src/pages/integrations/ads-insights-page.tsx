import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { useAdsInsights } from "@/api/integration-insights";
import { PlatformIcon } from "@/pages/social/platform-icon";

const PLATFORM_NAMES: Record<string, string> = {
	facebook: "Facebook Ads",
	google: "Google Ads",
	tiktok: "TikTok Ads",
	linkedin: "LinkedIn Ads",
};

export function AdsInsightsPage() {
	const { platform = "facebook" } = useParams<{ platform: string }>();
	const { data, isLoading } = useAdsInsights(platform);
	const title = PLATFORM_NAMES[platform] ?? `${platform} Ads`;

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<PlatformIcon platform={platform} size={24} />
				<h1 className="text-2xl font-bold">{title}</h1>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !data?.connected ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12">
						<BarChart3 size={48} className="text-[var(--muted-foreground)]" />
						<h2 className="text-lg font-semibold">Connect {title}</h2>
						<p className="text-sm text-[var(--muted-foreground)] text-center max-w-md">
							Connect your {title} account to view campaign performance, manage ads, and track ROI.
						</p>
						<a href={`/${platform === "google" ? "google-ads" : platform === "linkedin" ? "linkedin-ads" : platform === "tiktok" ? "tiktok-ads" : "facebook-ads"}/login`} target="_blank" rel="noopener noreferrer">
							<Button><ExternalLink size={16} /> Connect {title}</Button>
						</a>
					</CardContent>
				</Card>
			) : (
				<>
					<Card>
						<CardHeader><CardTitle className="text-lg">Connected Accounts ({data.accounts.length})</CardTitle></CardHeader>
						<CardContent>
							<div className="space-y-2">
								{data.accounts.map((a) => (
									<div key={a.id} className="flex items-center gap-3 rounded border border-[var(--border)] p-3">
										<PlatformIcon platform={platform} size={18} />
										<div className="min-w-0 flex-1">
											<p className="font-medium text-sm">{a.name}</p>
											<p className="text-xs text-[var(--muted-foreground)]">ID: {a.account_id}</p>
										</div>
										{a.status === "active" ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader><CardTitle className="text-lg">Insights</CardTitle></CardHeader>
						<CardContent>
							<p className="text-sm text-[var(--muted-foreground)]">
								Detailed ad insights and analytics will be displayed here once campaign data is available.
							</p>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
