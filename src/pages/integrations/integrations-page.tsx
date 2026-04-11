import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw, Unplug, RotateCw, Plug } from "lucide-react";
import { useIntegrations } from "@/api/general";
import { useStartOAuth, useDisconnectAccount, useSyncAccount } from "@/api/social-accounts";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
const CONNECT_URLS: Record<string, string> = {
	google_analytics: "/my/integrations/google/start",
	google_ads: "/my/integrations/google-ads/start",
	facebook_ads: "/my/integrations/facebook-ads/start",
	tiktok_ads: "/my/integrations/tiktok-ads/start",
	linkedin_ads: "/my/integrations/linkedin-ads/start",
	slack: "/my/integrations/slack/start",
	woocommerce: "/my/integrations/woocommerce/stores",
	shopify: "/my/integrations/shopify/start",
	canva: "/my/canva/connect",
	ghl: "/my/integrations",
	stripe: "/my/billing",
};

const CATEGORY_LABELS: Record<string, string> = {
	analytics: "Analytics",
	advertising: "Advertising",
	communication: "Communication",
	ecommerce: "E-Commerce",
	crm: "CRM",
	design: "Design",
	payments: "Payments",
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
		oauthMut.mutate(platform, {
			onError: (e) => toast.error((e as { error?: string })?.error ?? "OAuth failed"),
		});
	};

	const handleDisconnect = (accountId: number, name: string) => {
		if (!confirm(`Disconnect ${name}?`)) return;
		disconnectMut.mutate(accountId, {
			onSuccess: () => { toast.success("Disconnected."); queryClient.invalidateQueries({ queryKey: ["integrations"] }); },
		});
	};

	const handleSync = (accountId: number) => {
		syncMut.mutate(accountId, {
			onSuccess: () => { toast.success("Synced."); queryClient.invalidateQueries({ queryKey: ["integrations"] }); },
		});
	};

	// Group integrations by category
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
					<p className="text-sm text-[var(--muted-foreground)]">Connect your tools and services</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["integrations"] })}>
					<RefreshCw size={14} /> Refresh
				</Button>
			</div>

			{/* Third-party integrations by category */}
			{Object.entries(byCategory).map(([category, items]) => (
				<div key={category} className="space-y-3">
					<h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
						{CATEGORY_LABELS[category] ?? category}
					</h2>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{items.map((integ) => (
							<Card key={integ.key}>
								<CardContent className="flex items-center gap-4 p-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
										<Plug size={18} className="text-[var(--muted-foreground)]" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium">{integ.name}</p>
										{integ.connected ? (
											<span className="text-xs text-green-600">Connected</span>
										) : (
											<span className="text-xs text-[var(--muted-foreground)]">Not connected</span>
										)}
									</div>
									{integ.connected ? (
										<CheckCircle size={18} className="shrink-0 text-green-500" />
									) : (
										<a href={CONNECT_URLS[integ.key] ?? "#"}>
											<Button size="sm" variant="outline">Connect</Button>
										</a>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			))}

			{/* Social Media Accounts */}
			<div className="space-y-3">
				<h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
					Social Media Accounts ({connected.length})
				</h2>

				{connected.length > 0 && (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{connected.map((acc: { id: number; platform: string; account_name: string; profile_picture: string; token_status: string }) => (
							<Card key={acc.id}>
								<CardContent className="flex items-center gap-3 p-4">
									{acc.profile_picture ? (
										<img src={acc.profile_picture} alt="" className="h-10 w-10 rounded-full" />
									) : (
										<PlatformIcon platform={acc.platform} size={24} />
									)}
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium">{acc.account_name}</p>
										<p className="text-xs capitalize text-[var(--muted-foreground)]">{acc.platform}</p>
									</div>
									<div className="flex items-center gap-1">
										{acc.token_status === "active" ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
										<Button variant="ghost" size="icon" className="h-7 w-7" title="Sync" onClick={() => handleSync(acc.id)}><RotateCw size={12} /></Button>
										<Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" title="Disconnect" onClick={() => handleDisconnect(acc.id, acc.account_name)}><Unplug size={12} /></Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Available social platforms */}
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{Object.entries(platforms).map(([key, info]: [string, { name: string }]) => (
						<Card key={key} className={connectedPlatforms.has(key) ? "opacity-60" : ""}>
							<CardContent className="flex items-center gap-3 p-4">
								<PlatformIcon platform={key} size={24} />
								<div className="flex-1"><p className="text-sm font-medium">{info.name}</p></div>
								{connectedPlatforms.has(key) ? (
									<span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Connected</span>
								) : (
									<Button size="sm" variant="outline" onClick={() => handleConnect(key)}>Connect</Button>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
