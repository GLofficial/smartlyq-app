import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/cn";
import { PlatformBrandIcon, PLATFORM_BRANDS } from "../platform-brands";

// Existing preview components (feed mode)
import { FacebookPreview } from "./facebook-preview";
import { InstagramPreview } from "./instagram-preview";
import { TwitterPreview } from "./twitter-preview";
import { LinkedinPreview } from "./linkedin-preview";
import { TiktokPreview } from "./tiktok-preview";
import { YoutubePreview } from "./youtube-preview";
import { PinterestPreview } from "./pinterest-preview";
import { ThreadsPreview } from "./threads-preview";
import { BlueskyPreview } from "./bluesky-preview";
import { RedditPreview } from "./reddit-preview";
import { GoogleBusinessPreview } from "./google-business-preview";
import { TelegramPreview } from "./telegram-preview";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Device = "desktop" | "mobile";

const FEED_PREVIEW_MAP: Record<string, React.FC<any>> = {
  facebook: FacebookPreview, facebook_page: FacebookPreview,
  instagram: InstagramPreview, twitter: TwitterPreview,
  linkedin: LinkedinPreview, linkedin_page: LinkedinPreview,
  tiktok: TiktokPreview, youtube: YoutubePreview,
  pinterest: PinterestPreview, reddit: RedditPreview,
  threads: ThreadsPreview, bluesky: BlueskyPreview,
  google: GoogleBusinessPreview, google_business: GoogleBusinessPreview,
  telegram: TelegramPreview,
};

// Which platforms support Stories/Reels/Shorts
const STORY_PLATFORMS: Record<string, { label: string; sublabel: string }> = {
  instagram: { label: "Instagram", sublabel: "Reel" },
  facebook: { label: "Facebook", sublabel: "Reel / Story" },
  tiktok: { label: "TikTok", sublabel: "Video" },
  youtube: { label: "YouTube", sublabel: "Short" },
};

// Platform-specific image dimensions
const PLATFORM_DIMENSIONS: Record<string, { desktop: { imageLabel: string }; mobile: { imageLabel: string } }> = {
  facebook: { desktop: { imageLabel: "1200 × 630px (1.91:1)" }, mobile: { imageLabel: "1080 × 1350px (4:5)" } },
  instagram: { desktop: { imageLabel: "1080 × 1080px (1:1)" }, mobile: { imageLabel: "1080 × 1350px (4:5)" } },
  twitter: { desktop: { imageLabel: "1200 × 675px (16:9)" }, mobile: { imageLabel: "1200 × 675px (16:9)" } },
  linkedin: { desktop: { imageLabel: "1200 × 627px (1.91:1)" }, mobile: { imageLabel: "1080 × 1350px (4:5)" } },
  youtube: { desktop: { imageLabel: "1280 × 720px (16:9)" }, mobile: { imageLabel: "1280 × 720px (16:9)" } },
  tiktok: { desktop: { imageLabel: "1080 × 1920px (9:16)" }, mobile: { imageLabel: "1080 × 1920px (9:16)" } },
  pinterest: { desktop: { imageLabel: "1000 × 1500px (2:3)" }, mobile: { imageLabel: "1000 × 1500px (2:3)" } },
  reddit: { desktop: { imageLabel: "1920 × 1080px (16:9)" }, mobile: { imageLabel: "1080 × 810px (4:3)" } },
  threads: { desktop: { imageLabel: "1080 × 1080px (1:1)" }, mobile: { imageLabel: "1080 × 1920px (9:16)" } },
  bluesky: { desktop: { imageLabel: "1000 × 1000px (1:1)" }, mobile: { imageLabel: "1000 × 1000px (1:1)" } },
  telegram: { desktop: { imageLabel: "1280 × 720px (16:9)" }, mobile: { imageLabel: "1080 × 810px (4:3)" } },
  google: { desktop: { imageLabel: "1200 × 900px (4:3)" }, mobile: { imageLabel: "720 × 720px (1:1)" } },
};

interface PreviewPanelProps {
  selectedPlatforms: string[];
  content: string;
  platformContent?: Record<string, string>;
  customizeChannel?: boolean;
  imageCount?: number;
  platformPostType?: Record<string, string>;
}

export function PreviewPanel({
  selectedPlatforms, content, platformContent, customizeChannel,
}: PreviewPanelProps) {
  const [device, setDevice] = useState<Device>("desktop");
  const [previewMode, setPreviewMode] = useState<"feed" | "story">("feed");
  const [activePreview, setActivePreview] = useState<string | null>(null);

  const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : [];
  const currentPreview = activePreview && platforms.includes(activePreview) ? activePreview : platforms[0] ?? "";
  const supportsStory = currentPreview in STORY_PLATFORMS;
  const storyInfo = STORY_PLATFORMS[currentPreview];
  const effectiveMode = supportsStory ? previewMode : "feed";

  const getDisplayContent = (platformId: string) => {
    if (customizeChannel && platformContent?.[platformId]) return platformContent[platformId];
    return content;
  };

  const displayContent = currentPreview ? getDisplayContent(currentPreview) : content;
  const dims = PLATFORM_DIMENSIONS[currentPreview];
  const currentSpec = effectiveMode === "story"
    ? { imageLabel: "1080 × 1920px (9:16)" }
    : dims ? dims[device] : null;

  if (platforms.length === 0) {
    return (
      <div className="w-full xl:w-[380px] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Post Preview</h3>
        </div>
        <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
          Select accounts to see preview
        </div>
      </div>
    );
  }

  const FeedComp = FEED_PREVIEW_MAP[currentPreview];

  return (
    <div className="w-full xl:w-[380px] shrink-0">
      <div className="xl:sticky xl:top-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Post Preview</h3>
          <div className="flex items-center gap-2">
            {/* Feed / Story toggle */}
            {supportsStory && (
              <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5 text-[11px] font-medium">
                <button onClick={() => setPreviewMode("feed")} className={cn("px-2.5 py-1 rounded transition-colors", effectiveMode === "feed" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>Feed</button>
                <button onClick={() => setPreviewMode("story")} className={cn("px-2.5 py-1 rounded transition-colors", effectiveMode === "story" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>{storyInfo?.sublabel || "Story"}</button>
              </div>
            )}
            {/* Device toggle */}
            {effectiveMode === "feed" && (
              <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                <button onClick={() => setDevice("desktop")} className={cn("p-1.5 rounded", device === "desktop" ? "bg-card shadow-sm" : "text-muted-foreground")}><Monitor className="w-4 h-4" /></button>
                <button onClick={() => setDevice("mobile")} className={cn("p-1.5 rounded", device === "mobile" ? "bg-card shadow-sm" : "text-muted-foreground")}><Smartphone className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>

        {/* Platform tabs (circle icons) */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {platforms.map((p) => {
            const brand = PLATFORM_BRANDS[p];
            if (!brand) return null;
            const isActive = p === currentPreview;
            return (
              <button key={p} onClick={() => setActivePreview(p)} className={cn("w-9 h-9 rounded-full flex items-center justify-center transition-all", isActive ? `${brand.color} text-primary-foreground ring-2 ring-offset-2 ring-primary` : `${brand.color} text-primary-foreground opacity-50 hover:opacity-80`)} title={brand.label}>
                <PlatformBrandIcon platformId={p} size={16} />
              </button>
            );
          })}
        </div>

        {/* Dimension info badge */}
        {currentSpec && (
          <div className="mb-3 flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/50 rounded-md px-3 py-1.5">
            <span className="font-medium text-foreground">{PLATFORM_BRANDS[currentPreview]?.label}</span>
            <span>·</span>
            <span>{effectiveMode === "story" ? (storyInfo?.sublabel || "Story") : device === "desktop" ? "Desktop" : "Mobile"}</span>
            <span>·</span>
            <span>{currentSpec.imageLabel}</span>
          </div>
        )}

        {/* Preview card */}
        <div className={cn("overflow-y-auto xl:max-h-[calc(100vh-240px)] pr-1", effectiveMode === "feed" && device === "mobile" && "max-w-[320px] mx-auto")}>
          {FeedComp ? (
            <FeedComp content={displayContent} media={[]} account={null} />
          ) : (
            <div className="bg-card rounded-lg border border-border p-4 text-center">
              <p className="text-sm text-muted-foreground">Preview not available for {currentPreview}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
