import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { Check } from "lucide-react";
import type { WizardState } from "./wizard-layout";

interface Account { id: number; platform: string; name: string; account_id: string; status: string; currency: string; }

export function StepAccount({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	const { data, isLoading } = useQuery({
		queryKey: ["ad-manager", "wizard-accounts"],
		queryFn: () => apiClient.get<{ accounts: Account[] }>("/api/spa/ad-manager/campaigns/new"),
	});

	const accounts = data?.accounts ?? [];
	const platformMap: Record<string, string> = { meta: "facebook", google: "google", tiktok: "tiktok", linkedin: "linkedin" };

	return (
		<div>
			<h2 className="text-lg font-semibold mb-1">Select Ad Account</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-6">Choose which ad account to use for this campaign, or connect a new one.</p>

			{isLoading ? (
				<div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
			) : accounts.length === 0 ? (
				<Card><CardContent className="py-12 text-center">
					<p className="text-[var(--muted-foreground)]">No ad accounts connected. Go to Settings to connect one.</p>
				</CardContent></Card>
			) : (
				<div className="space-y-3">
					{accounts.map((a) => {
						const selected = state.integration_id === a.id && state.platform === a.platform;
						return (
							<Card key={`${a.platform}-${a.id}`} className={`cursor-pointer transition-all ${selected ? "ring-2 ring-[var(--sq-primary)]" : "hover:shadow-md"}`}
								onClick={() => update({ integration_id: a.id, platform: a.platform, account_name: a.name })}>
								<CardContent className="flex items-center gap-4 p-5">
									<PlatformIcon platform={platformMap[a.platform] ?? a.platform} size={28} />
									<div className="flex-1">
										<p className="text-sm font-semibold text-[var(--foreground)]">{a.name || a.account_id}</p>
										<p className="text-xs text-[var(--muted-foreground)]">ID: {a.account_id} &middot; {a.platform} Ads</p>
									</div>
									{a.status === "connected" && <span className="text-[11px] text-emerald-600 font-medium">Connected</span>}
									{selected && <div className="h-6 w-6 rounded-full bg-[var(--sq-primary)] flex items-center justify-center"><Check size={14} className="text-white" /></div>}
								</CardContent>
							</Card>
						);
					})}
					<Card className="cursor-pointer hover:shadow-md border-dashed">
						<CardContent className="flex items-center justify-center gap-2 p-5 text-[var(--muted-foreground)]">
							<span className="text-2xl">+</span>
							<span className="text-sm">Connect New Account</span>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
