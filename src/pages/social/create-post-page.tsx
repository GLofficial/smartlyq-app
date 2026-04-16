import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocialHub } from "@/api/social";
import { useCreatePost, type CreatePostData } from "@/api/social-posts";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { toast } from "sonner";
import PostComposer from "./PostComposer";
import PostPreview from "./PostPreview";

interface LocationState {
  prefillDate?: string;
  prefillTime?: string;
  editPost?: {
    content: string;
    platforms: string[];
    date?: string;
    time?: string;
  };
}

export function CreatePostPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
  const { data: hubData, isLoading: hubLoading } = useSocialHub();
  const createPost = useCreatePost();

  const state = location.state as LocationState | null;
  const accounts = Array.isArray(hubData?.accounts) ? hubData.accounts : [];

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    state?.editPost?.platforms || [],
  );
  const [content, setContent] = useState(state?.editPost?.content || "");
  const [platformContent, setPlatformContent] = useState<Record<string, string>>({});
  const [customizeChannel, setCustomizeChannel] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [platformPostType, setPlatformPostType] = useState<Record<string, string>>({});
  const [selectedAccountIds, setSelectedAccountIds] = useState<number[]>([]);

  useEffect(() => {
    if (state) window.history.replaceState({}, document.title);
  }, [state]);

  const handleSubmit = useCallback(
    (action: CreatePostData["action"], scheduledTime?: string) => {
      if (selectedAccountIds.length === 0) {
        toast.error("Please select at least one account");
        return;
      }
      createPost.mutate(
        {
          title: "",
          content,
          platforms: selectedPlatforms,
          selected_accounts: selectedAccountIds,
          action,
          scheduled_time: scheduledTime ?? null,
          media_urls: [],
        },
        {
          onSuccess: () => {
            toast.success(
              action === "save_draft" ? "Draft saved" :
              action === "scheduled" ? "Post scheduled" :
              "Post queued for publishing",
            );
            navigate(wsHash ? `/w/${wsHash}/social-media/posts` : "/social-media/posts");
          },
          onError: (err) => toast.error((err as Error).message || "Failed"),
        },
      );
    },
    [content, selectedPlatforms, selectedAccountIds, createPost, navigate, wsHash],
  );

  if (hubLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 max-w-6xl mx-auto">
        <PostComposer
          selectedPlatforms={selectedPlatforms}
          onPlatformsChange={setSelectedPlatforms}
          content={content}
          onContentChange={setContent}
          platformContent={platformContent}
          onPlatformContentChange={setPlatformContent}
          customizeChannel={customizeChannel}
          onCustomizeChannelChange={setCustomizeChannel}
          onImageCountChange={setImageCount}
          onPostTypeChange={setPlatformPostType}
          initialScheduledDate={state?.prefillDate || state?.editPost?.date}
          initialScheduledTime={state?.prefillTime || state?.editPost?.time}
          realAccounts={accounts}
          selectedAccountIds={selectedAccountIds}
          onSelectedAccountIdsChange={setSelectedAccountIds}
          onSaveDraft={() => handleSubmit("save_draft")}
          onPostNow={() => handleSubmit("post_now")}
          onSchedulePost={(date, time) => handleSubmit("scheduled", `${date}T${time}:00`)}
          isSubmitting={createPost.isPending}
        />
        <PostPreview
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
