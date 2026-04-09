import { useState } from "react";
import type { PreviewProps } from "./types";
import { PlatformIcon } from "../platform-icon";
import { FacebookPreview } from "./facebook-preview";
import { InstagramPreview } from "./instagram-preview";
import { LinkedinPreview } from "./linkedin-preview";
import { TwitterPreview } from "./twitter-preview";
import { TiktokPreview } from "./tiktok-preview";
import { YoutubePreview } from "./youtube-preview";
import { PinterestPreview } from "./pinterest-preview";
import { ThreadsPreview } from "./threads-preview";
import { BlueskyPreview } from "./bluesky-preview";
import { RedditPreview } from "./reddit-preview";
import { GoogleBusinessPreview } from "./google-business-preview";
import { TelegramPreview } from "./telegram-preview";
import { cn } from "@/lib/cn";

const PREVIEW_COMPONENTS: Record<string, React.FC<PreviewProps>> = {
	facebook: FacebookPreview,
	instagram: InstagramPreview,
	linkedin: LinkedinPreview,
	twitter: TwitterPreview,
	x: TwitterPreview,
	tiktok: TiktokPreview,
	youtube: YoutubePreview,
	pinterest: PinterestPreview,
	threads: ThreadsPreview,
	bluesky: BlueskyPreview,
	reddit: RedditPreview,
	google_business: GoogleBusinessPreview,
	telegram: TelegramPreview,
};

interface PreviewPanelProps extends PreviewProps {
	platforms: string[];
}

export function PreviewPanel({ platforms, ...previewProps }: PreviewPanelProps) {
	const [activeTab, setActiveTab] = useState(platforms[0] ?? "facebook");

	// Keep active tab valid when platforms change
	const currentTab = platforms.includes(activeTab) ? activeTab : platforms[0] ?? "facebook";
	const PreviewComponent = PREVIEW_COMPONENTS[currentTab];

	if (platforms.length === 0) {
		return (
			<div className="flex h-full items-center justify-center text-sm text-[var(--muted-foreground)]">
				Select accounts to see preview
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			{/* Platform tabs */}
			{platforms.length > 1 && (
				<div className="flex gap-1 border-b border-[var(--border)] pb-2 mb-3 overflow-x-auto">
					{platforms.map((p) => (
						<button
							key={p}
							type="button"
							onClick={() => setActiveTab(p)}
							className={cn(
								"flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
								currentTab === p
									? "bg-[var(--sq-primary)] text-white"
									: "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]",
							)}
						>
							<PlatformIcon platform={p} size={14} />
							<span className="capitalize">{p.replace("_", " ")}</span>
						</button>
					))}
				</div>
			)}

			{/* Preview */}
			<div className="flex-1 overflow-y-auto">
				{PreviewComponent ? (
					<PreviewComponent {...previewProps} />
				) : (
					<div className="rounded-lg border border-[var(--border)] p-6 text-center text-sm text-[var(--muted-foreground)]">
						Preview not available for {currentTab}
					</div>
				)}
			</div>
		</div>
	);
}
