import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocialHub } from "@/api/social";
import { useCreatePost, type CreatePostData } from "@/api/social-posts";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { toast } from "sonner";
import { PostComposer } from "./composer/post-composer";
import type { MediaItem } from "./composer/post-media-manager";
import { PlatformIcon } from "./platform-icon";
import { Monitor, Smartphone } from "lucide-react";

// Existing preview components
import { FacebookPreview } from "./previews/facebook-preview";
import { InstagramPreview } from "./previews/instagram-preview";
import { TwitterPreview } from "./previews/twitter-preview";
import { LinkedinPreview } from "./previews/linkedin-preview";
import { TiktokPreview } from "./previews/tiktok-preview";
import { YoutubePreview } from "./previews/youtube-preview";
import { PinterestPreview } from "./previews/pinterest-preview";
import { ThreadsPreview } from "./previews/threads-preview";
import { BlueskyPreview } from "./previews/bluesky-preview";
import { RedditPreview } from "./previews/reddit-preview";
import { GoogleBusinessPreview as GooglePreview } from "./previews/google-business-preview";
import { TelegramPreview } from "./previews/telegram-preview";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface LocationState { prefillDate?: string; editPost?: { content: string; platforms: string[] } }

const PREVIEW_MAP: Record<string, React.FC<any>> = {
	facebook: FacebookPreview, instagram: InstagramPreview, twitter: TwitterPreview,
	linkedin: LinkedinPreview, tiktok: TiktokPreview, youtube: YoutubePreview,
	pinterest: PinterestPreview, threads: ThreadsPreview, bluesky: BlueskyPreview,
	reddit: RedditPreview, google: GooglePreview, telegram: TelegramPreview,
};

export function CreatePostPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const { data: hubData } = useSocialHub();
	const createPost = useCreatePost();

	const state = (location.state as LocationState) ?? {};
	const accounts = Array.isArray(hubData?.accounts) ? hubData.accounts : [];

	const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
	const [content, setContent] = useState(state.editPost?.content ?? "");
	const [platformContent, setPlatformContent] = useState<Record<string, string>>({});
	const [customizeChannel, setCustomizeChannel] = useState(false);
	const [media, setMedia] = useState<MediaItem[]>([]);
	const [activePreview, setActivePreview] = useState("");
	const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");

	const selectedPlatforms = [...new Set(
		accounts.filter((a) => selectedAccountIds.includes(a.id)).map((a) => a.platform)
	)];

	// Auto-set first preview tab
	if (activePreview === "" && selectedPlatforms.length > 0) setActivePreview(selectedPlatforms[0]!);
	if (activePreview !== "" && !selectedPlatforms.includes(activePreview) && selectedPlatforms.length > 0) setActivePreview(selectedPlatforms[0]!);

	const handleSubmit = useCallback((action: CreatePostData["action"], scheduledTime?: string) => {
		const mediaUrls = media.filter((m) => m.url).map((m) => m.url);
		createPost.mutate({
			title: "", content, platforms: selectedPlatforms,
			selected_accounts: selectedAccountIds, action,
			scheduled_time: scheduledTime ?? null, media_urls: mediaUrls,
		}, {
			onSuccess: () => {
				toast.success(action === "save_draft" ? "Draft saved" : action === "scheduled" ? "Post scheduled" : "Post queued for publishing");
				navigate(wsHash ? `/w/${wsHash}/social-media/posts` : "/social-media/posts");
			},
			onError: (err) => toast.error((err as Error).message || "Failed"),
		});
	}, [content, selectedPlatforms, selectedAccountIds, media, createPost, navigate, wsHash]);

	const PreviewComponent = PREVIEW_MAP[activePreview];
	const previewContent = customizeChannel ? (platformContent[activePreview] || content) : content;

	return (
		<div className="flex gap-6 h-[calc(100vh-80px)]">
			{/* Left: Composer */}
			<div className="flex-1 overflow-y-auto pr-2">
				<h1 className="text-xl font-bold text-[var(--foreground)] mb-4">Create Post</h1>
				<PostComposer
					accounts={accounts as any}
					selectedAccountIds={selectedAccountIds}
					onAccountsChange={setSelectedAccountIds}
					content={content} onContentChange={setContent}
					platformContent={platformContent} onPlatformContentChange={setPlatformContent}
					customizeChannel={customizeChannel} onCustomizeChannelChange={setCustomizeChannel}
					media={media} onMediaChange={setMedia}
					onSaveDraft={() => handleSubmit("save_draft")}
					onSchedule={(date, time) => handleSubmit("scheduled", `${date}T${time}:00`)}
					onPostNow={() => handleSubmit("post_now")}
					isSubmitting={createPost.isPending}
				/>
			</div>

			{/* Right: Preview */}
			<div className="w-[380px] shrink-0 border-l border-[var(--border)] pl-6 overflow-y-auto">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-sm font-semibold text-[var(--foreground)]">Post Preview</h2>
					<div className="flex items-center gap-0.5 rounded-lg border border-[var(--border)] overflow-hidden">
						<button onClick={() => setDeviceMode("desktop")}
							className={`p-1.5 transition-colors ${deviceMode === "desktop" ? "bg-[var(--sq-primary)] text-white" : "text-[var(--muted-foreground)]"}`}>
							<Monitor size={14} />
						</button>
						<button onClick={() => setDeviceMode("mobile")}
							className={`p-1.5 transition-colors ${deviceMode === "mobile" ? "bg-[var(--sq-primary)] text-white" : "text-[var(--muted-foreground)]"}`}>
							<Smartphone size={14} />
						</button>
					</div>
				</div>

				{selectedPlatforms.length > 0 && (
					<div className="flex gap-1 mb-4 overflow-x-auto pb-1">
						{selectedPlatforms.map((p) => (
							<button key={p} onClick={() => setActivePreview(p)}
								className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${activePreview === p ? "bg-[var(--sq-primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
								<PlatformIcon platform={p} size={14} />
								<span className="capitalize">{p}</span>
							</button>
						))}
					</div>
				)}

				{PreviewComponent ? (
					<div className={deviceMode === "mobile" ? "max-w-[320px] mx-auto" : ""}>
						<PreviewComponent content={previewContent} imageCount={media.length} />
					</div>
				) : (
					<div className="flex items-center justify-center h-64 text-sm text-[var(--muted-foreground)]">
						Select accounts to see preview
					</div>
				)}
			</div>
		</div>
	);
}
