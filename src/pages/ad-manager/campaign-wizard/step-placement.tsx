import { Check } from "lucide-react";
import type { WizardState } from "./wizard-layout";

const PLACEMENTS: Record<string, { label: string; items: { id: string; label: string }[] }> = {
	meta: { label: "Meta Placements", items: [
		{ id: "feed", label: "Facebook Feed" }, { id: "stories", label: "Facebook Stories" },
		{ id: "reels", label: "Facebook Reels" }, { id: "ig_feed", label: "Instagram Feed" },
		{ id: "ig_stories", label: "Instagram Stories" }, { id: "ig_reels", label: "Instagram Reels" },
		{ id: "ig_explore", label: "Instagram Explore" }, { id: "messenger", label: "Messenger" },
		{ id: "audience_network", label: "Audience Network" },
	]},
	google: { label: "Google Placements", items: [
		{ id: "search", label: "Search Network" }, { id: "display", label: "Display Network" },
		{ id: "youtube", label: "YouTube" }, { id: "shopping", label: "Shopping" },
		{ id: "discovery", label: "Discovery" }, { id: "gmail", label: "Gmail" },
	]},
	tiktok: { label: "TikTok Placements", items: [
		{ id: "in_feed", label: "In-Feed Ads" }, { id: "topview", label: "TopView" },
		{ id: "branded_effect", label: "Branded Effect" },
	]},
	linkedin: { label: "LinkedIn Placements", items: [
		{ id: "feed", label: "LinkedIn Feed" }, { id: "message", label: "Message Ads" },
		{ id: "text", label: "Text Ads" }, { id: "dynamic", label: "Dynamic Ads" },
	]},
};

export function StepPlacement({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	const config = PLACEMENTS[state.platform] || PLACEMENTS.meta;
	const items = config!.items;
	const toggle = (id: string) => {
		const next = state.placements.includes(id) ? state.placements.filter((p) => p !== id) : [...state.placements, id];
		update({ placements: next });
	};
	const selectAll = () => update({ placements: items.map((i) => i.id) });
	const clearAll = () => update({ placements: [] });
	const allSelected = state.placements.length === items.length;

	return (
		<div>
			<h2 className="text-lg font-semibold mb-1">Placements</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-4">Choose where your ads will appear.</p>
			<div className="flex items-center gap-2 mb-4">
				<button onClick={allSelected ? clearAll : selectAll}
					className="text-xs text-[var(--sq-primary)] hover:underline font-medium">
					{allSelected ? "Deselect All" : "Select All"}
				</button>
				<span className="text-xs text-[var(--muted-foreground)]">{state.placements.length} selected</span>
			</div>
			<div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
				{items.map((item) => {
					const checked = state.placements.includes(item.id);
					return (
						<button key={item.id} onClick={() => toggle(item.id)}
							className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
								checked ? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5" : "border-[var(--border)] hover:bg-[var(--muted)]"
							}`}>
							<div className={`h-4 w-4 rounded border flex items-center justify-center ${
								checked ? "bg-[var(--sq-primary)] border-[var(--sq-primary)]" : "border-[var(--border)]"
							}`}>{checked && <Check size={10} className="text-white" />}</div>
							<span className="text-sm font-medium text-[var(--foreground)]">{item.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
