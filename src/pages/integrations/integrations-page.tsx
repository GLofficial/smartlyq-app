import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, RefreshCw, ArrowRight, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useIntegrations } from "@/api/general";
import { INTEGRATION_BRANDS } from "./integration-logos";
import { apiClient } from "@/lib/api-client";
import { useWorkspacePath } from "@/hooks/use-workspace-path";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import { useAutomationWebhooks, useSaveAutomationWebhook } from "@/api/account";

// All integrations use SPA OAuth (except WooCommerce = form, Stripe = billing page)
const OAUTH_INTEGRATIONS = new Set([
	"google_analytics", "google_search_console", "google_ads",
	"facebook_ads", "tiktok_ads", "linkedin_ads", "slack",
	"shopify", "canva", "ghl",
]);

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
	const integrations: Integration[] = data?.integrations ?? [];

	const wp = useWorkspacePath();
	const [wooDialogOpen, setWooDialogOpen] = useState(false);
	const [shopifyDialogOpen, setShopifyDialogOpen] = useState(false);

	const startOAuthFlow = async (key: string, extraParams = "") => {
		try {
			const res = await apiClient.get<{ redirect_url: string }>(`/api/spa/integrations/oauth/start?integration=${key}${extraParams}`);
			if (res.redirect_url) {
				window.location.href = res.redirect_url;
			} else {
				toast.error("Failed to start OAuth flow.");
			}
		} catch (err) {
			toast.error((err as { error?: string })?.error ?? "Integration not configured.");
		}
	};

	const handleIntegrationConnect = (key: string) => {
		if (key === "woocommerce") { setWooDialogOpen(true); return; }
		if (key === "shopify") { setShopifyDialogOpen(true); return; }
		if (key === "stripe") { window.location.href = wp("settings?tab=billing"); return; }
		if (OAUTH_INTEGRATIONS.has(key)) { startOAuthFlow(key); }
	};

	const handleIntegrationDisconnect = async (key: string, name: string) => {
		if (!confirm(`Disconnect ${name}?`)) return;
		try {
			await apiClient.post("/api/spa/integrations/disconnect", { integration: key });
			toast.success("Disconnected.");
			queryClient.invalidateQueries({ queryKey: ["integrations"] });
		} catch {
			toast.error("Failed to disconnect.");
		}
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
													<Button size="sm" variant="ghost" className="h-7 text-xs text-red-500" onClick={() => handleIntegrationDisconnect(integ.key, integ.name)}>
														Disconnect
													</Button>
												</>
											) : (
												<>
													<span className="text-xs text-[var(--muted-foreground)]">Not connected</span>
													<Button size="sm" className="h-7 text-xs text-white" style={{ backgroundColor: brand?.color ?? "var(--sq-primary)" }} onClick={() => handleIntegrationConnect(integ.key)}>
															Connect
														</Button>
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

			{/* Automations */}
			<div className="space-y-3">
				<h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Automations</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{/* Facebook Lead Sync */}
					<Card className="transition-shadow hover:shadow-md">
						<CardContent className="p-0">
							<div className="h-1" style={{ backgroundColor: "#1877F2" }} />
							<div className="flex items-start gap-4 p-5">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1877F2]/10">
									<Users size={22} className="text-[#1877F2]" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-semibold">Facebook Lead Ads → CRM</p>
									<p className="mt-0.5 text-xs leading-relaxed text-[var(--muted-foreground)]">
										Every new lead submitted through your Facebook Lead Ad forms lands directly in your CRM contacts.
									</p>
								</div>
							</div>
							<div className="flex items-center justify-end border-t border-[var(--border)] px-5 py-3">
								<Link to={wp("integrations/lead-sync")}>
									<Button size="sm" variant="outline" className="gap-1.5">
										Manage <ArrowRight size={14} />
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
					{/* Zapier + Pabbly webhook cards */}
					<WebhookCard service="zapier" />
					<WebhookCard service="pabbly" />
				</div>
			</div>

			{/* Connect Dialogs */}
			<WooCommerceDialog open={wooDialogOpen} onClose={() => setWooDialogOpen(false)} />
			<ShopifyDialog open={shopifyDialogOpen} onClose={() => setShopifyDialogOpen(false)} onConnect={(shop) => startOAuthFlow("shopify", `&shop=${encodeURIComponent(shop)}`)} />
		</div>
	);
}

function WebhookCard({ service }: { service: "zapier" | "pabbly" }) {
	const { data, isLoading } = useAutomationWebhooks();
	const save = useSaveAutomationWebhook();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [url, setUrl] = useState("");

	const brand = INTEGRATION_BRANDS[service] ?? { logo: "", color: "#666", description: "" };
	const isConnected = service === "zapier" ? (data?.has_zapier ?? false) : (data?.has_pabbly ?? false);
	const maskedUrl = service === "zapier" ? (data?.zapier_webhook ?? "") : (data?.pabbly_webhook ?? "");
	const label = service === "zapier" ? "Zapier" : "Pabbly Connect";
	const fieldKey = service === "zapier" ? "zapier_webhook" : "pabbly_webhook";

	const handleOpen = () => { setUrl(""); setDialogOpen(true); };

	const handleSave = async () => {
		if (url.trim() && !url.trim().startsWith("http")) { toast.error("Enter a valid URL."); return; }
		try {
			await save.mutateAsync({ [fieldKey]: url.trim() });
			toast.success(url.trim() ? `${label} webhook saved.` : `${label} webhook removed.`);
			setDialogOpen(false);
		} catch (e) {
			toast.error((e as { error?: string })?.error ?? "Failed to save.");
		}
	};

	return (
		<>
			<Card className="transition-shadow hover:shadow-md">
				<CardContent className="p-0">
					<div className="h-1" style={{ backgroundColor: brand.color }} />
					<div className="flex items-start gap-4 p-5">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${brand.color}15` }}>
							{brand.logo
								? <img src={brand.logo} alt={label} className="h-7 w-7 object-contain" />
								: <Zap size={22} style={{ color: brand.color }} />
							}
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-semibold">{label}</p>
							<p className="mt-0.5 text-xs leading-relaxed text-[var(--muted-foreground)]">{brand.description}</p>
						</div>
					</div>
					<div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3">
						{isLoading ? (
							<span className="text-xs text-[var(--muted-foreground)]">Loading...</span>
						) : isConnected ? (
							<span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
								<CheckCircle size={14} /> Connected
							</span>
						) : (
							<span className="text-xs text-[var(--muted-foreground)]">Not configured</span>
						)}
						<Button size="sm" className="h-7 text-xs text-white" style={{ backgroundColor: brand.color }} onClick={handleOpen}>
							{isConnected ? "Update" : "Configure"}
						</Button>
					</div>
				</CardContent>
			</Card>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader><DialogTitle>{isConnected ? `Update ${label} Webhook` : `Configure ${label} Webhook`}</DialogTitle></DialogHeader>
					<div className="space-y-3">
						{isConnected && <p className="text-xs text-[var(--muted-foreground)]">Current: <span className="font-mono">{maskedUrl}</span></p>}
						<Input
							placeholder={`https://hooks.${service}.com/...`}
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSave()}
						/>
						{isConnected && <p className="text-xs text-[var(--muted-foreground)]">Leave empty to remove the webhook.</p>}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
						<Button onClick={handleSave} disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

function ShopifyDialog({ open, onClose, onConnect }: { open: boolean; onClose: () => void; onConnect: (shop: string) => void }) {
	const [shop, setShop] = useState("");

	const handleConnect = () => {
		const s = shop.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
		if (!s || !s.includes(".")) { toast.error("Enter a valid Shopify store URL."); return; }
		onConnect(s);
		onClose();
		setShop("");
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader><DialogTitle>Connect Shopify Store</DialogTitle></DialogHeader>
				<div className="space-y-3">
					<p className="text-sm text-[var(--muted-foreground)]">Enter your Shopify store URL</p>
					<Input placeholder="https://your-store.myshopify.com" value={shop} onChange={(e) => setShop(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleConnect()} />
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>Cancel</Button>
					<Button onClick={handleConnect}>Connect</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function WooCommerceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	const [storeUrl, setStoreUrl] = useState("");
	const [consumerKey, setConsumerKey] = useState("");
	const [consumerSecret, setConsumerSecret] = useState("");
	const [connecting, setConnecting] = useState(false);

	const handleConnect = async () => {
		if (!storeUrl.trim() || !consumerKey.trim() || !consumerSecret.trim()) {
			toast.error("All fields are required.");
			return;
		}
		setConnecting(true);
		try {
			const res = await apiClient.post<{ message: string }>("/api/spa/integrations/woocommerce/connect", {
				store_url: storeUrl.trim(), consumer_key: consumerKey.trim(), consumer_secret: consumerSecret.trim(),
			});
			toast.success(res.message);
			queryClient.invalidateQueries({ queryKey: ["integrations"] });
			onClose();
			setStoreUrl(""); setConsumerKey(""); setConsumerSecret("");
		} catch (err) {
			toast.error((err as { error?: string })?.error ?? "Connection failed.");
		} finally {
			setConnecting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Connect WooCommerce Store</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					<p className="text-sm text-[var(--muted-foreground)]">Enter your WooCommerce REST API credentials. You can generate them in WooCommerce → Settings → Advanced → REST API.</p>
					<Input placeholder="Store URL (e.g. https://mystore.com)" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} />
					<Input placeholder="Consumer Key (ck_...)" value={consumerKey} onChange={(e) => setConsumerKey(e.target.value)} />
					<Input placeholder="Consumer Secret (cs_...)" type="password" value={consumerSecret} onChange={(e) => setConsumerSecret(e.target.value)} />
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>Cancel</Button>
					<Button onClick={handleConnect} disabled={connecting}>{connecting ? "Connecting..." : "Connect Store"}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
