import { Card, CardContent } from "@/components/ui/card";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { Check } from "lucide-react";
import type { WizardState } from "./wizard-layout";

const PLATFORMS = [
	{ id: "meta", label: "Meta Ads", desc: "Facebook & Instagram advertising", icon: "facebook" },
	{ id: "google", label: "Google Ads", desc: "Search, Display, YouTube advertising", icon: "google" },
	{ id: "tiktok", label: "TikTok Ads", desc: "TikTok in-feed and brand advertising", icon: "tiktok" },
	{ id: "linkedin", label: "LinkedIn Ads", desc: "Professional & B2B advertising", icon: "linkedin" },
] as const;

export function StepPlatform({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	return (
		<div>
			<h2 className="text-lg font-semibold mb-1">Confirm Platform</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-6">
				Campaign options will be tailored for {state.platform ? PLATFORMS.find((p) => p.id === state.platform)?.label : "your selected platform"}.
			</p>
			<div className="grid grid-cols-2 gap-4">
				{PLATFORMS.map((p) => {
					const selected = state.platform === p.id;
					return (
						<Card key={p.id} className={`cursor-pointer transition-all ${selected ? "ring-2 ring-[var(--sq-primary)]" : "hover:shadow-md"}`}
							onClick={() => update({ platform: p.id })}>
							<CardContent className="flex flex-col items-center gap-3 p-6 text-center relative">
								{selected && <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[var(--sq-primary)] flex items-center justify-center"><Check size={12} className="text-white" /></div>}
								<PlatformIcon platform={p.icon} size={36} />
								<div>
									<p className="text-sm font-semibold text-[var(--foreground)]">{p.label}</p>
									<p className="text-xs text-[var(--muted-foreground)] mt-0.5">{p.desc}</p>
								</div>
								{selected && <span className="text-xs text-[var(--sq-primary)] font-medium">Selected</span>}
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
