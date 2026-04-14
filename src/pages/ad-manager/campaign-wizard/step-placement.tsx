import { Check, LayoutGrid } from "lucide-react";
import type { WizardState } from "./wizard-types";

const META_PLACEMENTS = [
	{ id: "fb_feed", label: "Facebook Feed", formats: "Video, Image" },
	{ id: "ig_feed", label: "Instagram Feed", formats: "Video, Image" },
	{ id: "fb_stories", label: "Stories", formats: "Video, Image" },
	{ id: "fb_reels", label: "Reels", formats: "Video, Image" },
	{ id: "ig_explore", label: "Explore", formats: "Video, Image" },
	{ id: "audience_network", label: "Audience Network", formats: "Video, Image" },
	{ id: "messenger", label: "Messenger", formats: "Image" },
	{ id: "ig_shop", label: "Instagram Shop", formats: "Image" },
	{ id: "marketplace", label: "Marketplace", formats: "Image" },
	{ id: "right_column", label: "Right Column", formats: "Image" },
	{ id: "search", label: "Search Results", formats: "Image" },
	{ id: "video_feeds", label: "Video Feeds", formats: "Video" },
];
const GOOGLE_PLACEMENTS = [
	{ id: "search", label: "Search Network", formats: "Text" },
	{ id: "display", label: "Display Network", formats: "Image, Video" },
	{ id: "youtube", label: "YouTube", formats: "Video" },
	{ id: "shopping", label: "Shopping", formats: "Product" },
	{ id: "discovery", label: "Discovery", formats: "Image" },
];
const TIKTOK_PLACEMENTS = [
	{ id: "in_feed", label: "In-Feed Ads", formats: "Video" },
	{ id: "topview", label: "TopView", formats: "Video" },
];
const LINKEDIN_PLACEMENTS = [
	{ id: "feed", label: "LinkedIn Feed", formats: "Image, Video" },
	{ id: "message", label: "Message Ads", formats: "Text" },
	{ id: "text", label: "Text Ads", formats: "Text" },
];

const SIZES_TABLE = [
	{ placement: "Facebook Feed", size: "1080×1080, 1200×628", ratio: "1:1, 1.91:1" },
	{ placement: "Instagram Feed", size: "1080×1080, 1080×1350", ratio: "1:1, 4:5" },
	{ placement: "Stories", size: "1080×1920", ratio: "9:16" },
	{ placement: "Reels", size: "1080×1920", ratio: "9:16" },
	{ placement: "Explore", size: "1080×1080", ratio: "1:1" },
	{ placement: "Audience Network", size: "1200×628", ratio: "1.91:1" },
	{ placement: "Messenger", size: "1080×1080", ratio: "1:1" },
	{ placement: "Instagram Shop", size: "1080×1080", ratio: "1:1" },
	{ placement: "Marketplace", size: "1080×1080", ratio: "1:1" },
	{ placement: "Right Column", size: "254×133", ratio: "1.91:1" },
	{ placement: "Search Results", size: "1200×628", ratio: "1.91:1" },
	{ placement: "Video Feeds", size: "1080×1080, 1200×628", ratio: "1:1, 1.91:1" },
];

function getPlacementsForPlatform(platform: string) {
	switch (platform) {
		case "meta": return META_PLACEMENTS;
		case "google": return GOOGLE_PLACEMENTS;
		case "tiktok": return TIKTOK_PLACEMENTS;
		case "linkedin": return LINKEDIN_PLACEMENTS;
		default: return META_PLACEMENTS;
	}
}

export function StepPlacement({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	const items = getPlacementsForPlatform(state.platform);
	const allSelected = state.placements.length === items.length;

	const toggle = (id: string) => {
		const next = state.placements.includes(id) ? state.placements.filter((p) => p !== id) : [...state.placements, id];
		update({ placements: next });
	};
	const selectAll = () => update({ placements: allSelected ? [] : items.map((i) => i.id) });

	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
			<h2 className="text-lg font-semibold text-[var(--foreground)]">Ad Placements</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-4">Choose where your ads will appear on {state.platform || "the platform"}.</p>

			<div className="flex items-center gap-3 mb-4">
				<button onClick={selectAll} className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
					allSelected ? "bg-[var(--sq-primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
				}`}>{allSelected ? "Deselect All" : "Select All Automatic"}</button>
				{!allSelected && <button onClick={() => update({ placements: [] })} className="text-xs text-[var(--muted-foreground)] hover:underline">Clear All</button>}
			</div>

			<div className="grid grid-cols-2 gap-3 mb-6">
				{items.map((item) => {
					const checked = state.placements.includes(item.id);
					return (
						<div key={item.id} onClick={() => toggle(item.id)}
							className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
								checked ? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5" : "border-[var(--border)] hover:border-[var(--muted-foreground)]"
							}`}>
							<div className={`h-5 w-5 rounded border flex items-center justify-center ${
								checked ? "bg-[var(--sq-primary)] border-[var(--sq-primary)]" : "border-[var(--border)]"
							}`}>{checked && <Check size={12} className="text-white" />}</div>
							<div className="flex-1">
								<p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
								<p className="text-[10px] text-[var(--muted-foreground)]">{item.formats}</p>
							</div>
						</div>
					);
				})}
			</div>

			{/* Creative Sizes Reference */}
			{state.platform === "meta" && (
				<div className="border-t border-[var(--border)] pt-4">
					<div className="flex items-center gap-2 mb-3">
						<LayoutGrid size={14} className="text-[var(--muted-foreground)]" />
						<p className="text-sm font-semibold text-[var(--foreground)]">Creative Sizes Reference</p>
					</div>
					<table className="w-full text-xs">
						<thead>
							<tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
								<th className="py-2 pr-4 font-medium">Placement</th>
								<th className="py-2 pr-4 font-medium">Recommended Size</th>
								<th className="py-2 font-medium">Aspect Ratio</th>
							</tr>
						</thead>
						<tbody>
							{SIZES_TABLE.map((row) => (
								<tr key={row.placement} className="border-b border-[var(--border)] last:border-0">
									<td className="py-1.5 pr-4 text-[var(--foreground)]">{row.placement}</td>
									<td className="py-1.5 pr-4 font-mono text-[var(--muted-foreground)]">{row.size}</td>
									<td className="py-1.5 text-[var(--muted-foreground)]">{row.ratio}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
