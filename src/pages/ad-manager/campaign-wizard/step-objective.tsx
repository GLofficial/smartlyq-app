import { Eye, MousePointer, MessageSquare, Users, ShoppingCart, Smartphone, Search, Monitor, Video, Sparkles, Megaphone, Globe } from "lucide-react";
import type { WizardState } from "./wizard-types";
import { PLATFORM_LABELS } from "./wizard-types";
import type { LucideIcon } from "lucide-react";

interface Objective { id: string; label: string; desc: string; icon: LucideIcon; }

const META_OBJECTIVES: Objective[] = [
	{ id: "awareness", label: "Awareness", desc: "Reach people likely to remember your ad", icon: Eye },
	{ id: "traffic", label: "Traffic", desc: "Send people to your website or app", icon: MousePointer },
	{ id: "engagement", label: "Engagement", desc: "Get more messages, likes, and comments", icon: MessageSquare },
	{ id: "leads", label: "Leads", desc: "Collect leads with instant forms", icon: Users },
	{ id: "app_promotion", label: "App Promotion", desc: "Get more app installs and events", icon: Smartphone },
	{ id: "sales", label: "Sales", desc: "Drive purchases and conversions", icon: ShoppingCart },
];

const GOOGLE_OBJECTIVES: Objective[] = [
	{ id: "search", label: "Search", desc: "Text ads on Google Search results", icon: Search },
	{ id: "display", label: "Display", desc: "Visual ads across Google Display Network", icon: Monitor },
	{ id: "shopping", label: "Shopping", desc: "Product listings on Google Shopping", icon: ShoppingCart },
	{ id: "video", label: "Video", desc: "Video ads on YouTube and partners", icon: Video },
	{ id: "app", label: "App", desc: "Promote your app across Google properties", icon: Smartphone },
	{ id: "performance_max", label: "Performance Max", desc: "AI-optimized across all Google channels", icon: Sparkles },
	{ id: "demand_gen", label: "Demand Gen", desc: "Visually rich ads on YouTube, Discover, Gmail", icon: Megaphone },
];

const TIKTOK_OBJECTIVES: Objective[] = [
	{ id: "awareness", label: "Reach", desc: "Maximize ad impressions to your audience", icon: Eye },
	{ id: "traffic", label: "Traffic", desc: "Drive clicks to your website or app", icon: MousePointer },
	{ id: "video_views", label: "Video Views", desc: "Get more views on your video content", icon: Video },
	{ id: "conversions", label: "Conversions", desc: "Drive valuable actions on your website", icon: ShoppingCart },
	{ id: "app_promotion", label: "App Install", desc: "Get more app installs", icon: Smartphone },
];

const LINKEDIN_OBJECTIVES: Objective[] = [
	{ id: "awareness", label: "Brand Awareness", desc: "Increase brand recognition", icon: Eye },
	{ id: "website_visits", label: "Website Visits", desc: "Drive traffic to your website", icon: Globe },
	{ id: "engagement", label: "Engagement", desc: "Increase social engagement", icon: MessageSquare },
	{ id: "lead_gen", label: "Lead Generation", desc: "Collect leads with LinkedIn forms", icon: Users },
	{ id: "conversions", label: "Website Conversions", desc: "Drive actions on your website", icon: ShoppingCart },
];

function getObjectives(platform: string): Objective[] {
	switch (platform) {
		case "google": return GOOGLE_OBJECTIVES;
		case "tiktok": return TIKTOK_OBJECTIVES;
		case "linkedin": return LINKEDIN_OBJECTIVES;
		default: return META_OBJECTIVES;
	}
}

export function StepObjective({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	const platformName = PLATFORM_LABELS[state.platform] || "your";
	const objectives = getObjectives(state.platform);

	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
			<h2 className="text-lg font-semibold text-[var(--foreground)]">Campaign Objective</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-6">What's the goal of this {platformName} campaign?</p>
			<div className="grid grid-cols-2 gap-3">
				{objectives.map((o) => {
					const selected = state.objective === o.id;
					return (
						<div key={o.id} onClick={() => update({ objective: o.id })}
							className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
								selected ? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
							}`}>
							<o.icon size={18} className={selected ? "text-[var(--sq-primary)] mt-0.5" : "text-[var(--muted-foreground)] mt-0.5"} />
							<div>
								<p className="text-sm font-semibold text-[var(--foreground)]">{o.label}</p>
								<p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{o.desc}</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
