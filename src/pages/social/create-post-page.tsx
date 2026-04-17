import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocialHub, usePostingLimits } from "@/api/social";
import { useMediaList } from "@/api/media-library";
import { useCreatePost, type CreatePostData } from "@/api/social-posts";
import { useAiRewrite, useAiImage } from "@/api/ai-generate";
import { useGenerateVideo } from "@/api/video-gen";
import { apiClient } from "@/lib/api-client";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { toast } from "sonner";
import { AlertTriangle, Info } from "lucide-react";
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
  const { data: limits } = usePostingLimits();
  const createPost = useCreatePost();
  const { data: imageLib } = useMediaList(0, "image", "", 1);
  const { data: videoLib } = useMediaList(0, "video", "", 1);
  const aiRewrite = useAiRewrite();
  const aiImage = useAiImage();
  const aiVideo = useGenerateVideo();

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
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: "image" | "video" }[]>([]);

  useEffect(() => {
    if (state) window.history.replaceState({}, document.title);
  }, [state]);

  // Validate before posting
  const validatePost = useCallback((action: string, scheduledTime?: string): boolean => {
    if (selectedAccountIds.length === 0) {
      toast.error("Please select at least one account");
      return false;
    }
    if (!content.trim() && action !== "save_draft") {
      toast.error("Please write some content");
      return false;
    }
    // Schedule in past check
    if (action === "scheduled" && scheduledTime) {
      const schedDate = new Date(scheduledTime);
      if (schedDate <= new Date()) {
        toast.error("Cannot schedule in the past. Please select a future date and time.");
        return false;
      }
    }
    // Global daily cap
    if (limits && action !== "save_draft") {
      if (limits.global_used_today >= limits.global_daily_cap) {
        toast.error(`Daily posting limit reached (${limits.global_daily_cap} posts/day). Try again tomorrow.`);
        return false;
      }
      // Per-platform limit check
      for (const platform of selectedPlatforms) {
        const used = limits.platform_usage[platform] ?? 0;
        const limit = limits.platform_limits[platform];
        if (limit && used >= limit) {
          toast.error(`Daily limit reached for ${platform} (${limit} posts/day).`);
          return false;
        }
      }
    }
    // Plan gate
    if (limits && !limits.has_social_media) {
      toast.error("Social media posting is not available on your current plan. Please upgrade.");
      return false;
    }
    return true;
  }, [selectedAccountIds, content, selectedPlatforms, limits]);

  const handleSubmit = useCallback(
    (action: CreatePostData["action"], scheduledTime?: string) => {
      if (!validatePost(action, scheduledTime)) return;
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
    [content, selectedPlatforms, selectedAccountIds, createPost, navigate, wsHash, validatePost],
  );

  const handleAiText = useCallback(async (topic: string, tone: string, contentType: string, opts?: { model?: string; brand_voice?: boolean; brand_id?: number }) => {
    const result = await aiRewrite.mutateAsync({
      content: topic, tone, content_type: contentType,
      model: opts?.model, brand_voice: opts?.brand_voice, brand_id: opts?.brand_id,
    });
    return result.rewritten;
  }, [aiRewrite]);

  const handleAiImage = useCallback(async (prompt: string, opts?: { model?: string; brand_voice?: boolean; brand_id?: number }) => {
    const result = await aiImage.mutateAsync({
      prompt, model: opts?.model, brand_voice: opts?.brand_voice, brand_id: opts?.brand_id,
    });
    return result.image_url;
  }, [aiImage]);

  const handleAiVideo = useCallback(async (prompt: string, config: Record<string, string>) => {
    const result = await aiVideo.mutateAsync({ prompt, type: config.type, model: config.model });
    return `Video generation started (ID: ${result.video_id}). Check Media Library when complete.`;
  }, [aiVideo]);

  const handleMediaUpload = useCallback(async (file: File) => {
    // File size validation
    if (limits) {
      const isVideo = file.type.startsWith("video/");
      const maxMb = isVideo ? limits.upload_limits.max_video_mb : limits.upload_limits.max_image_mb;
      const fileMb = file.size / (1024 * 1024);
      if (fileMb > maxMb) {
        toast.error(`File too large. Maximum ${maxMb}MB for ${isVideo ? "videos" : "images"}.`);
        throw new Error("File too large");
      }
    }
    // Use the SPA media upload endpoint (JWT-authenticated)
    const formData = new FormData();
    formData.append("file", file);
    const result = await apiClient.upload<{ message: string; id: number; url: string; type: string }>("/api/spa/media/upload", formData);
    toast.success("Media uploaded");
    return { url: result.url, name: file.name, type: (result.type === "video" ? "video" : "image") as "image" | "video" };
  }, [limits]);

  const handleCanvaDesign = useCallback((width: string, height: string) => {
    window.open(`/my/canva/connect?width=${width}&height=${height}`, "_blank", "width=1200,height=800");
  }, []);

  if (hubLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Plan gate — full block
  if (limits && !limits.has_social_media) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto" />
          <p className="text-lg font-semibold text-foreground">Social Media Not Available</p>
          <p className="text-sm text-muted-foreground">To access this feature, please upgrade your current plan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Posting limits warning banner */}
        {limits && limits.global_used_today >= limits.global_daily_cap * 0.8 && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${limits.global_used_today >= limits.global_daily_cap ? "bg-destructive/10 border-destructive/30" : "bg-warning/10 border-warning/30"}`}>
            <AlertTriangle className={`w-5 h-5 shrink-0 ${limits.global_used_today >= limits.global_daily_cap ? "text-destructive" : "text-warning"}`} />
            <p className="text-sm">
              <span className="font-semibold text-foreground">
                {limits.global_used_today >= limits.global_daily_cap
                  ? "Daily posting limit reached."
                  : `Approaching daily limit: ${limits.global_used_today}/${limits.global_daily_cap} posts today.`}
              </span>
              {limits.global_used_today >= limits.global_daily_cap && (
                <span className="text-muted-foreground ml-1">You can still save drafts. Try again tomorrow.</span>
              )}
            </p>
          </div>
        )}

        {/* Per-platform usage info */}
        {limits && selectedPlatforms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedPlatforms.map(p => {
              const used = limits.platform_usage[p] ?? 0;
              const limit = limits.platform_limits[p];
              if (!limit) return null;
              const pct = used / limit;
              return (
                <div key={p} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${pct >= 1 ? "bg-destructive/10 border-destructive/30 text-destructive" : pct >= 0.7 ? "bg-warning/10 border-warning/30 text-warning" : "bg-muted border-border text-muted-foreground"}`}>
                  <Info className="w-3 h-3" />
                  <span className="capitalize">{p}</span>: {used}/{limit} today
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
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
            onSchedulePost={(date, time) => {
              // Normalize time to 24-hour "HH:MM" (accept "02:05 PM", "14:05", "2:05pm", etc.)
              const raw = (time || "").trim();
              const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
              let h24: number;
              let min: number;
              if (ampmMatch) {
                const h = parseInt(ampmMatch[1]!, 10);
                min = parseInt(ampmMatch[2]!, 10);
                const isPm = ampmMatch[3]!.toLowerCase() === "pm";
                h24 = h % 12 + (isPm ? 12 : 0);
              } else {
                const m24 = raw.match(/^(\d{1,2}):(\d{2})$/);
                if (!m24) { toast.error("Invalid time format. Use HH:MM AM/PM or 24-hour HH:MM."); return; }
                h24 = parseInt(m24[1]!, 10);
                min = parseInt(m24[2]!, 10);
              }
              if (isNaN(h24) || isNaN(min) || h24 > 23 || min > 59) { toast.error("Invalid time."); return; }
              const hh = String(h24).padStart(2, "0");
              const mm = String(min).padStart(2, "0");
              handleSubmit("scheduled", `${date}T${hh}:${mm}:00`);
            }}
            isSubmitting={createPost.isPending}
            onAiGenerateText={handleAiText}
            onAiGenerateImage={handleAiImage}
            onAiGenerateVideo={handleAiVideo}
            onMediaUpload={handleMediaUpload}
            onCanvaDesign={handleCanvaDesign}
            mediaLibraryImages={imageLib?.files?.map(f => ({ id: f.id, url: f.url, preview_url: f.preview_url, name: f.name })) ?? []}
            mediaLibraryVideos={videoLib?.files?.map(f => ({ id: f.id, url: f.url, preview_url: f.preview_url, name: f.name })) ?? []}
            onUploadedMediaChange={(media) => {
              setMediaUrls(media.filter(m => m.url).map(m => m.url!));
              setPreviewMedia(media.filter(m => m.url).map(m => ({ url: m.url!, type: m.type })));
            }}
          />
          <PostPreview
            selectedPlatforms={selectedPlatforms}
            content={content}
            platformContent={platformContent}
            customizeChannel={customizeChannel}
            imageCount={imageCount}
            platformPostType={platformPostType}
            mediaUrls={previewMedia}
            accounts={accounts}
            selectedAccountIds={selectedAccountIds}
          />
        </div>
      </div>
    </div>
  );
}
