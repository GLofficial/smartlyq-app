import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { WizardState } from "./wizard-types";

interface Account { id: number; platform: string; name: string; account_id: string; status: string; currency: string; }

const PLATFORM_TABS = [
	{ id: "all", label: "All Accounts", icon: null },
	{ id: "meta", label: "Meta Ads", pIcon: "facebook" },
	{ id: "google", label: "Google Ads", pIcon: "google" },
	{ id: "tiktok", label: "TikTok Ads", pIcon: "tiktok" },
	{ id: "linkedin", label: "LinkedIn Ads", pIcon: "linkedin" },
] as const;

const PLATFORM_LABELS: Record<string, string> = { meta: "Meta Ads", google: "Google Ads", tiktok: "TikTok Ads", linkedin: "LinkedIn Ads" };
const PLATFORM_MAP: Record<string, string> = { meta: "facebook", google: "google", tiktok: "tiktok", linkedin: "linkedin" };

export function StepAccount({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	const [tab, setTab] = useState("all");
	const [showConnect, setShowConnect] = useState(false);
	const { data, isLoading } = useQuery({
		queryKey: ["ad-manager", "wizard-accounts"],
		queryFn: () => apiClient.get<{ accounts: Account[] }>("/api/spa/ad-manager/campaigns/new"),
	});

	const accounts = (data?.accounts ?? []).filter(
		(a) => tab === "all" || a.platform === tab
	);

	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
			<h2 className="text-lg font-semibold text-[var(--foreground)]">Select Ad Account</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-4">Choose which ad account to use for this campaign, or connect a new one.</p>

			{/* Platform filter tabs */}
			<div className="flex items-center gap-1 mb-5 bg-[var(--muted)]/50 rounded-lg p-1">
				{PLATFORM_TABS.map((t) => (
					<button key={t.id} onClick={() => setTab(t.id)}
						className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
							tab === t.id ? "bg-[var(--sq-primary)] text-white shadow-sm" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
						}`}>
						{t.id !== "all" && <PlatformIcon platform={(t as { pIcon: string }).pIcon} size={14} />}
						{t.label}
					</button>
				))}
			</div>

			{isLoading ? (
				<div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
			) : (
				<div className="space-y-3">
					{accounts.map((a) => {
						const selected = state.integration_id === a.id && state.platform === a.platform;
						return (
							<div key={`${a.platform}-${a.id}`}
								onClick={() => update({ integration_id: a.id, platform: a.platform as WizardState["platform"], account_name: a.name })}
								className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all ${
									selected ? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5 ring-1 ring-[var(--sq-primary)]" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
								}`}>
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)]">
									<PlatformIcon platform={PLATFORM_MAP[a.platform] ?? a.platform} size={20} />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<p className="text-sm font-semibold text-[var(--foreground)]">{a.name || a.account_id}</p>
										{a.status === "connected" && (
											<span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">Connected</span>
										)}
									</div>
									<p className="text-xs text-[var(--muted-foreground)]">ID: {a.account_id} &middot; {PLATFORM_LABELS[a.platform] ?? a.platform}</p>
								</div>
							</div>
						);
					})}

					{/* Connect New Account */}
					<div onClick={() => setShowConnect(true)}
						className="flex items-center gap-4 rounded-lg border border-dashed border-[var(--border)] p-4 cursor-pointer hover:border-[var(--muted-foreground)] transition-colors">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)]">
							<Plus size={18} className="text-[var(--muted-foreground)]" />
						</div>
						<div>
							<p className="text-sm font-semibold text-[var(--foreground)]">Connect New Account</p>
							<p className="text-xs text-[var(--muted-foreground)]">Link your Meta, Google, TikTok or LinkedIn Ads account</p>
						</div>
					</div>
				</div>
			)}

			{/* Connect Account Modal */}
			<Dialog open={showConnect} onOpenChange={setShowConnect}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Connect Ad Account</DialogTitle>
						<DialogDescription>Select a platform to connect your ad account.</DialogDescription>
					</DialogHeader>
					<div className="space-y-3 py-3">
						{[
							{ id: "meta", label: "Meta Ads", desc: "Facebook & Instagram advertising", icon: "facebook", path: "integrations/facebook-ads/start" },
							{ id: "google", label: "Google Ads", desc: "Search, display, and video ads", icon: "google", path: "integrations/google-ads/start" },
							{ id: "tiktok", label: "TikTok Ads", desc: "In-feed and branded content ads", icon: "tiktok", path: "integrations/tiktok-ads/start" },
							{ id: "linkedin", label: "LinkedIn Ads", desc: "B2B advertising campaigns", icon: "linkedin", path: "integrations/linkedin-ads/start" },
						].map((p) => (
							<a key={p.id} href={`/my/${p.path}`} target="_blank" rel="noopener noreferrer"
								className="flex items-center gap-4 rounded-lg border border-[var(--border)] p-4 hover:border-[var(--sq-primary)] transition-colors">
								<PlatformIcon platform={p.icon} size={24} />
								<div>
									<p className="text-sm font-semibold text-[var(--foreground)]">{p.label}</p>
									<p className="text-xs text-[var(--muted-foreground)]">{p.desc}</p>
								</div>
							</a>
						))}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
