import { PlatformIcon } from "@/pages/social/platform-icon";
import { Check } from "lucide-react";
import type { WizardState } from "./wizard-types";
import { PLATFORM_LABELS } from "./wizard-types";

const PLATFORMS = [
	{ id: "meta", label: "Meta Ads", desc: "Facebook & Instagram advertising", icon: "facebook" },
	{ id: "google", label: "Google Ads", desc: "Search, Display, YouTube advertising", icon: "google" },
	{ id: "tiktok", label: "TikTok Ads", desc: "TikTok in-feed & brand advertising", icon: "tiktok" },
	{ id: "linkedin", label: "LinkedIn Ads", desc: "Professional & B2B advertising", icon: "linkedin" },
] as const;

export function StepPlatform({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	const platformName = PLATFORM_LABELS[state.platform] || "your selected platform";
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
			<h2 className="text-lg font-semibold text-[var(--foreground)]">Confirm Platform</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-6">Campaign options will be tailored for {platformName} ({platformName === "Meta Ads" ? "Facebook & Instagram" : ""}).</p>
			<div className="grid grid-cols-2 gap-4">
				{PLATFORMS.map((p) => {
					const selected = state.platform === p.id;
					return (
						<div key={p.id} onClick={() => update({ platform: p.id as WizardState["platform"] })}
							className={`flex flex-col items-center gap-3 rounded-xl border p-6 text-center cursor-pointer transition-all ${
								selected ? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
							}`}>
							<PlatformIcon platform={p.icon} size={36} />
							<div>
								<p className="text-sm font-semibold text-[var(--foreground)]">{p.label}</p>
								<p className="text-xs text-[var(--muted-foreground)] mt-0.5">{p.desc}</p>
							</div>
							{selected && <span className="flex items-center gap-1 text-xs text-[var(--sq-primary)] font-medium"><Check size={12} /> Selected</span>}
						</div>
					);
				})}
			</div>
		</div>
	);
}
