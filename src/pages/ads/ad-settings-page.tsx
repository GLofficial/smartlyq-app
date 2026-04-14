import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Plug, X } from "lucide-react";
import { useAdSettings } from "@/api/ad-manager/settings";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { useSettingsAction } from "@/api/ad-manager/mutations";

const TABS = [
	{ id: "notifications", label: "Notifications", icon: Bell },
	{ id: "integrations", label: "Integrations", icon: Plug },
] as const;

export function AdSettingsPage() {
	const { data, isLoading } = useAdSettings();
	const [activeTab, setActiveTab] = useState("integrations");
	const disconnect = useSettingsAction();

	return (
		<div className="space-y-6 max-w-[1200px]">
			<div>
				<h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
				<p className="text-sm text-[var(--muted-foreground)]">Manage your ad manager preferences and integrations</p>
			</div>

			<div className="flex gap-6">
				{/* Tab Nav */}
				<div className="w-56 space-y-1">
					{TABS.map((t) => (
						<button key={t.id} onClick={() => setActiveTab(t.id)}
							className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
								activeTab === t.id
									? "bg-[var(--sq-primary)] text-white"
									: "text-[var(--foreground)] hover:bg-[var(--muted)]"
							}`}>
							<t.icon size={16} />
							{t.label}
						</button>
					))}
				</div>

				{/* Content */}
				<div className="flex-1">
					{activeTab === "integrations" && (
						<Card>
							<div className="px-6 py-4 border-b border-[var(--border)]">
								<h2 className="text-lg font-semibold">Connected Platforms</h2>
							</div>
							<CardContent className="p-0">
								{isLoading ? (
									<div className="flex h-32 items-center justify-center">
										<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
									</div>
								) : (data?.accounts ?? []).length === 0 ? (
									<div className="flex flex-col items-center gap-3 py-12">
										<Plug size={32} className="text-[var(--muted-foreground)]" />
										<p className="text-sm text-[var(--muted-foreground)]">No ad accounts connected yet.</p>
									</div>
								) : (
									<div className="divide-y divide-[var(--border)]">
										{data?.accounts.map((a) => (
											<div key={`${a.platform}-${a.id}`} className="flex items-center gap-4 px-6 py-5">
												<PlatformIcon platform={platformMap(a.platform)} size={32} />
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold text-[var(--foreground)]">{platformLabel(a.platform)}</p>
													<p className="text-xs text-[var(--muted-foreground)]">{a.account_name || a.account_id}</p>
												</div>
												<span className={`rounded-full px-3 py-1 text-xs font-medium ${
													a.status === "connected" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-600"
												}`}>
													{a.status === "connected" ? "Connected" : a.status}
												</span>
												<Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50"
													disabled={disconnect.isPending}
													onClick={() => { if (confirm(`Disconnect ${platformLabel(a.platform)}?`)) disconnect.mutate({ action: "disconnect-platform", platform: a.platform }); }}>
													<X size={13} className="mr-1" /> Disconnect
												</Button>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{activeTab === "notifications" && (
						<Card>
							<div className="px-6 py-4 border-b border-[var(--border)]">
								<h2 className="text-lg font-semibold">Notification Preferences</h2>
							</div>
							<CardContent className="py-6 space-y-4">
								<ToggleRow label="Campaign status changes" description="Get notified when a campaign is approved, rejected, or paused" defaultOn />
								<ToggleRow label="Budget alerts" description="Alert when campaign spend reaches 80% of budget" defaultOn />
								<ToggleRow label="Performance drops" description="Notify when CTR or ROAS drops significantly" />
								<ToggleRow label="Weekly summary" description="Receive a weekly email digest of ad performance" />
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}

function ToggleRow({ label, description, defaultOn }: { label: string; description: string; defaultOn?: boolean }) {
	const [on, setOn] = useState(!!defaultOn);
	return (
		<div className="flex items-center justify-between py-2">
			<div>
				<p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
				<p className="text-xs text-[var(--muted-foreground)]">{description}</p>
			</div>
			<button onClick={() => setOn(!on)}
				className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-[var(--sq-primary)]" : "bg-gray-300"}`}>
				<span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
			</button>
		</div>
	);
}

function platformMap(p: string): string {
	const map: Record<string, string> = { meta: "facebook", google: "google", tiktok: "tiktok", linkedin: "linkedin" };
	return map[p] ?? p;
}

function platformLabel(p: string): string {
	const map: Record<string, string> = { meta: "Meta (Facebook)", google: "Google Ads", tiktok: "TikTok Ads", linkedin: "LinkedIn Ads" };
	return map[p] ?? p;
}
