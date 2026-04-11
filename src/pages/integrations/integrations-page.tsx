import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, RefreshCw, Unplug, RotateCw } from "lucide-react";
import { useIntegrations } from "@/api/general";
import { useStartOAuth, useDisconnectAccount, useSyncAccount } from "@/api/social-accounts";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { INTEGRATION_BRANDS } from "./integration-logos";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";

const CONNECT_URLS: Record<string, string> = {
	google_analytics: "/my/integrations/google/start",
	google_search_console: "/my/integrations/google/start",
	google_ads: "/my/integrations/google-ads/start",
	facebook_ads: "/my/integrations/facebook-ads/start",
	tiktok_ads: "/my/integrations/tiktok-ads/start",
	linkedin_ads: "/my/integrations/linkedin-ads/start",
	slack: "/my/integrations/slack/start",
	woocommerce: "/my/integrations/woocommerce/stores",
	shopify: "/shopify/auth",
	canva: "/my/canva/connect",
	ghl: "/my/integrations",
	stripe: "/my/billing",
};

const CATEGORY_LABELS: Record<string, string> = {
	analytics: "Analytics & Tracking",
	advertising: "Advertising Platforms",
	communication: "Communication",
	ecommerce: "E-Commerce",
	crm: "CRM & Sales",
	design: "Design Tools",
	payments: "Payments & Billing",
};

interface Integration {
	key: string;
	name: string;
	category: string;
	connected: boolean;
}

export function IntegrationsPage() {
	const { data, isLoading } = useIntegrations();
	const connected = data?.connected ?? [];
	const platforms = data?.platforms ?? {};
	const integrations: Integration[] = data?.integrations ?? [];

	const oauthMut = useStartOAuth();
	const disconnectMut = useDisconnectAccount();
	const syncMut = useSyncAccount();
	const connectedPlatforms = new Set(connected.map((c: { platform: string }) => c.platform));

	const handleConnect = (platform: string) => {
		oauthMut.mutate(platform, { onError: (e) => toast.error((e as { error?: string })?.error ?? "OAuth failed") });
	};

	const handleDisconnect = (accountId: number, name: string) => {
		if (!confirm(`Disconnect ${name}?`)) return;
		disconnectMut.mutate(accountId, { onSuccess: () => { toast.success("Disconnected."); queryClient.invalidateQueries({ queryKey: ["integrations"] }); } });
	};

	const handleSync = (accountId: number) => {
		syncMut.mutate(accountId, { onSuccess: () => { toast.success("Synced."); queryClient.invalidateQueries({ queryKey: ["integrations"] }); } });
	};

	const byCategory = integrations.reduce<Record<string, Integration[]>>((acc, i) => {
		(acc[i.category] ??= []).push(i);
		return acc;
	}, {});

	if (isLoading) {
		return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;
	}

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Integrations</h1>
					<p className="text-sm text-[var(--muted-foreground)]">Connect your favorite tools and services to SmartlyQ</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["integrations"] })}>
					<RefreshCw size={14} /> Refresh
				</Button>
			</div>

			{/* Third-party integrations by category */}
			{Object.entries(byCategory).map(([category, items]) => (
				<div key={category} className="space-y-3">
					<h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
						{CATEGORY_LABELS[category] ?? category}
					</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{items.map((integ) => {
							const brand = INTEGRATION_BRANDS[integ.key];
							return (
								<Card key={integ.key} className="group overflow-hidden transition-shadow hover:shadow-md">
									<CardContent className="p-0">
										{/* Color accent bar */}
										<div className="h-1" style={{ backgroundColor: brand?.color ?? "var(--sq-primary)" }} />
										<div className="flex items-start gap-4 p-5">
											{/* Brand logo */}
											<div
												className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl p-2"
												style={{ backgroundColor: `${brand?.color ?? "#666"}15` }}
											>
												{brand?.logo ? (
													<img src={brand.logo} alt={integ.name} className="h-7 w-7 object-contain" />
												) : (
													<span className="text-lg font-bold" style={{ color: brand?.color }}>{integ.name.charAt(0)}</span>
												)}
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-semibold">{integ.name}</p>
												<p className="mt-0.5 text-xs leading-relaxed text-[var(--muted-foreground)]">
													{brand?.description ?? "Connect to sync data"}
												</p>
											</div>
										</div>
										<div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3">
											{integ.connected ? (
												<>
													<span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
														<CheckCircle size={14} /> Connected
													</span>
													<a href={CONNECT_URLS[integ.key] ?? "#"} target="_blank" rel="noopener noreferrer">
														<Button size="sm" variant="ghost" className="h-7 text-xs text-[var(--muted-foreground)]">Manage</Button>
													</a>
												</>
											) : (
												<>
													<span className="text-xs text-[var(--muted-foreground)]">Not connected</span>
													<a href={CONNECT_URLS[integ.key] ?? "#"} target="_blank" rel="noopener noreferrer">
														<Button size="sm" className="h-7 text-xs" style={{ backgroundColor: brand?.color ?? "var(--sq-primary)" }}>
															Connect
														</Button>
													</a>
												</>
											)}
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			))}

			{/* Social Media Accounts */}
			<div className="space-y-3">
				<h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
					Social Media Accounts ({connected.length})
				</h2>

				{connected.length > 0 && (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{connected.map((acc: { id: number; platform: string; account_name: string; profile_picture: string; token_status: string }) => (
							<Card key={acc.id} className="transition-shadow hover:shadow-sm">
								<CardContent className="flex items-center gap-3 p-4">
									{acc.profile_picture ? (
										<img src={acc.profile_picture} alt="" className="h-10 w-10 rounded-full ring-2 ring-[var(--border)]" />
									) : (
										<PlatformIcon platform={acc.platform} size={24} />
									)}
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium">{acc.account_name}</p>
										<p className="text-xs capitalize text-[var(--muted-foreground)]">{acc.platform}</p>
									</div>
									<div className="flex items-center gap-1">
										{acc.token_status === "active" ? <CheckCircle size={14} className="text-green-500" /> : <span className="h-2 w-2 rounded-full bg-red-500" />}
										<Button variant="ghost" size="icon" className="h-7 w-7" title="Sync" onClick={() => handleSync(acc.id)}><RotateCw size={12} /></Button>
										<Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" title="Disconnect" onClick={() => handleDisconnect(acc.id, acc.account_name)}><Unplug size={12} /></Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Connect new platforms */}
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{Object.entries(platforms)
						.filter(([key]) => !connectedPlatforms.has(key))
						.map(([key, info]: [string, { name: string }]) => (
						<Card key={key} className="border-dashed">
							<CardContent className="flex items-center gap-3 p-4">
								<PlatformIcon platform={key} size={24} />
								<div className="flex-1"><p className="text-sm font-medium text-[var(--muted-foreground)]">{info.name}</p></div>
								<Button size="sm" variant="outline" onClick={() => handleConnect(key)}>Connect</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
