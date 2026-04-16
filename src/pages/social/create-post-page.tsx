import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocialHub } from "@/api/social";
import { useCreatePost, type CreatePostData } from "@/api/social-posts";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { toast } from "sonner";
import { PostComposer } from "./composer/post-composer";
import type { MediaItem } from "./composer/post-media-manager";
import { PreviewPanel } from "./previews/preview-panel";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface LocationState {
  prefillDate?: string;
  prefillTime?: string;
  editPost?: { content: string; platforms: string[]; date?: string; time?: string };
}

export function CreatePostPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
  const { data: hubData, isLoading: hubLoading } = useSocialHub();
  const createPost = useCreatePost();

  const state = (location.state as LocationState) ?? {};
  const accounts = Array.isArray(hubData?.accounts) ? hubData.accounts : [];

  // Clear location state after consuming
  useEffect(() => {
    if (location.state) window.history.replaceState({}, document.title);
  }, [location.state]);

  // Loading
  if (hubLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // State
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);
  const [content, setContent] = useState(state.editPost?.content ?? "");
  const [platformContent, setPlatformContent] = useState<Record<string, string>>({});
  const [customizeChannel, setCustomizeChannel] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [imageCount, setImageCount] = useState(0);
  const [platformPostType, setPlatformPostType] = useState<Record<string, string>>({});

  const selectedPlatforms = [...new Set(
    accounts.filter((a: any) => selectedAccountIds.includes(a.id)).map((a: any) => a.platform),
  )];

  const handleSubmit = useCallback(
    (action: CreatePostData["action"], scheduledTime?: string) => {
      const mediaUrls = media.filter((m) => m.url).map((m) => m.url);
      createPost.mutate(
        {
          title: "",
          content,
          platforms: selectedPlatforms,
          selected_accounts: selectedAccountIds,
          action,
          scheduled_time: scheduledTime ?? null,
          media_urls: mediaUrls,
        },
        {
          onSuccess: () => {
            toast.success(
              action === "save_draft" ? "Draft saved" : action === "scheduled" ? "Post scheduled" : "Post queued for publishing",
            );
            navigate(wsHash ? `/w/${wsHash}/social-media/posts` : "/social-media/posts");
          },
          onError: (err) => toast.error((err as Error).message || "Failed"),
        },
      );
    },
    [content, selectedPlatforms, selectedAccountIds, media, createPost, navigate, wsHash],
  );

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 max-w-6xl mx-auto">
        <PostComposer
          accounts={accounts as any}
          selectedAccountIds={selectedAccountIds}
          onAccountsChange={setSelectedAccountIds}
          content={content}
          onContentChange={setContent}
          platformContent={platformContent}
          onPlatformContentChange={setPlatformContent}
          customizeChannel={customizeChannel}
          onCustomizeChannelChange={setCustomizeChannel}
          media={media}
          onMediaChange={setMedia}
          onSaveDraft={() => handleSubmit("save_draft")}
          onSchedule={(date, time) => handleSubmit("scheduled", `${date}T${time}:00`)}
          onPostNow={() => handleSubmit("post_now")}
          isSubmitting={createPost.isPending}
          onImageCountChange={setImageCount}
          onPostTypeChange={setPlatformPostType}
        />
        <PreviewPanel
          selectedPlatforms={selectedPlatforms}
          content={content}
          platformContent={platformContent}
          customizeChannel={customizeChannel}
          imageCount={imageCount}
          platformPostType={platformPostType}
        />
      </div>
    </div>
  );
}
