import { useState, useMemo } from "react";
import { Monitor, Smartphone, MoreHorizontal, ThumbsUp, ThumbsDown, MessageCircle, Share2, Heart, Bookmark, Send, Repeat2, ArrowUp, ArrowDown, Eye, Music, MapPin, ChevronLeft, ChevronRight, FileText, Play } from "lucide-react";
import { PLATFORM_BRANDS, PlatformIcon } from "./PlatformIcons";
import { cn } from "@/lib/cn";

interface PostPreviewProps {
  selectedPlatforms: string[];
  content: string;
  platformContent?: Record<string, string>;
  customizeChannel?: boolean;
  imageCount?: number;
  platformPostType?: Record<string, string>;
  mediaUrls?: { url: string; type: "image" | "video" }[];
  accountInfo?: { name: string; avatar: string; username?: string };
  /** All connected accounts — preview picks the first matching one for the active platform */
  accounts?: { id: number; platform: string; account_name: string; account_username: string; profile_picture: string }[];
  selectedAccountIds?: number[];
}

type Device = "desktop" | "mobile";
type PreviewMode = "feed" | "story";

// Which platforms support Stories/Reels/Shorts
const STORY_PLATFORMS: Record<string, { label: string; sublabel: string }> = {
  instagram: { label: "Instagram", sublabel: "Reel" },
  facebook: { label: "Facebook", sublabel: "Reel / Story" },
  tiktok: { label: "TikTok", sublabel: "Video" },
  youtube: { label: "YouTube", sublabel: "Short" },
  snapchat: { label: "Snapchat", sublabel: "Story" },
};

// Platform-specific image dimensions (aspect ratios for preview rendering)
// Based on 2026 social media specs from Buffer & official platform guidelines
const PLATFORM_DIMENSIONS: Record<string, {
  desktop: { imageAspect: string; imageLabel: string; maxWidth?: number };
  mobile: { imageAspect: string; imageLabel: string; maxWidth?: number };
}> = {
  facebook: {
    desktop: { imageAspect: "1200/630", imageLabel: "1200 × 630px (1.91:1)" },
    mobile: { imageAspect: "1080/1350", imageLabel: "1080 × 1350px (4:5)" },
  },
  instagram: {
    desktop: { imageAspect: "1/1", imageLabel: "1080 × 1080px (1:1)" },
    mobile: { imageAspect: "4/5", imageLabel: "1080 × 1350px (4:5)" },
  },
  twitter: {
    desktop: { imageAspect: "16/9", imageLabel: "1200 × 675px (16:9)" },
    mobile: { imageAspect: "16/9", imageLabel: "1200 × 675px (16:9)" },
  },
  linkedin: {
    desktop: { imageAspect: "1200/627", imageLabel: "1200 × 627px (1.91:1)" },
    mobile: { imageAspect: "1080/1350", imageLabel: "1080 × 1350px (4:5)" },
  },
  youtube: {
    desktop: { imageAspect: "16/9", imageLabel: "1280 × 720px (16:9)" },
    mobile: { imageAspect: "16/9", imageLabel: "1280 × 720px (16:9)" },
  },
  tiktok: {
    desktop: { imageAspect: "9/16", imageLabel: "1080 × 1920px (9:16)", maxWidth: 240 },
    mobile: { imageAspect: "9/16", imageLabel: "1080 × 1920px (9:16)" },
  },
  pinterest: {
    desktop: { imageAspect: "2/3", imageLabel: "1000 × 1500px (2:3)", maxWidth: 240 },
    mobile: { imageAspect: "2/3", imageLabel: "1000 × 1500px (2:3)", maxWidth: 240 },
  },
  reddit: {
    desktop: { imageAspect: "16/9", imageLabel: "1920 × 1080px (16:9)" },
    mobile: { imageAspect: "4/3", imageLabel: "1080 × 810px (4:3)" },
  },
  threads: {
    desktop: { imageAspect: "1/1", imageLabel: "1080 × 1080px (1:1)" },
    mobile: { imageAspect: "9/16", imageLabel: "1080 × 1920px (9:16)" },
  },
  bluesky: {
    desktop: { imageAspect: "1/1", imageLabel: "1000 × 1000px (1:1)" },
    mobile: { imageAspect: "1/1", imageLabel: "1000 × 1000px (1:1)" },
  },
  mastodon: {
    desktop: { imageAspect: "16/9", imageLabel: "1280 × 720px (16:9)" },
    mobile: { imageAspect: "1/1", imageLabel: "1080 × 1080px (1:1)" },
  },
  telegram: {
    desktop: { imageAspect: "16/9", imageLabel: "1280 × 720px (16:9)" },
    mobile: { imageAspect: "4/3", imageLabel: "1080 × 810px (4:3)" },
  },
  google: {
    desktop: { imageAspect: "1200/900", imageLabel: "1200 × 900px (4:3)" },
    mobile: { imageAspect: "1/1", imageLabel: "720 × 720px (1:1)" },
  },
  tumblr: {
    desktop: { imageAspect: "540/405", imageLabel: "540px wide (4:3)" },
    mobile: { imageAspect: "1/1", imageLabel: "1080 × 1080px (1:1)" },
  },
  wordpress: {
    desktop: { imageAspect: "16/9", imageLabel: "1200 × 630px (16:9)" },
    mobile: { imageAspect: "16/9", imageLabel: "1200 × 630px (16:9)" },
  },
  whatsapp: {
    desktop: { imageAspect: "16/9", imageLabel: "1280 × 720px (16:9)" },
    mobile: { imageAspect: "4/3", imageLabel: "1080 × 810px (4:3)" },
  },
};

// Use PLATFORM_BRANDS from PlatformIcons.tsx instead of inline PLATFORM_META

// Character limit for "See more" truncation (approx 4 lines at preview width)
const SEE_MORE_CHAR_LIMIT = 200;

function TruncatedText({ text, className, placeholder }: { text: string; className?: string; placeholder?: string }) {
  const [expanded, setExpanded] = useState(false);
  const display = text || placeholder || "";
  if (!display) return null;

  const needsTruncation = display.length > SEE_MORE_CHAR_LIMIT && !expanded;
  const shown = needsTruncation ? display.slice(0, SEE_MORE_CHAR_LIMIT).trimEnd() + "..." : display;

  return (
    <p className={cn("text-sm text-foreground whitespace-pre-wrap", className)}>
      {shown}
      {needsTruncation && (
        <button onClick={() => setExpanded(true)} className="text-primary hover:underline ml-0.5 font-medium text-sm">
          See more
        </button>
      )}
    </p>
  );
}

function AccountAvatar({ avatar, name, size = 10 }: { avatar?: string; name?: string; size?: number }) {
  const sizeClass = size === 10 ? "w-10 h-10" : size === 8 ? "w-8 h-8" : "w-6 h-6";
  const textSize = size === 10 ? "text-sm" : size === 8 ? "text-xs" : "text-[9px]";
  if (avatar) {
    return <img src={avatar} alt="" className={cn(sizeClass, "rounded-full object-cover")} />;
  }
  const initial = (name || "?").charAt(0).toUpperCase();
  return (
    <div className={cn(sizeClass, "rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary", textSize)}>
      {initial}
    </div>
  );
}

function InstagramCaption({ username, text }: { username: string; text: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > SEE_MORE_CHAR_LIMIT && !expanded;
  const shown = needsTruncation ? text.slice(0, SEE_MORE_CHAR_LIMIT).trimEnd() + "..." : text;
  return (
    <p className="text-sm">
      <span className="font-semibold text-foreground">{username}</span>{" "}
      <span className="text-foreground whitespace-pre-wrap">{shown}</span>
      {needsTruncation && (
        <button onClick={() => setExpanded(true)} className="text-muted-foreground hover:text-foreground ml-0.5 text-sm">
          more
        </button>
      )}
    </p>
  );
}

function SingleImagePlaceholder({ aspect, label, mediaUrl, mediaType, forceCrop }: { aspect: string; label: string; mediaUrl?: string; mediaType?: "image" | "video"; forceCrop?: boolean }) {
  const videoRef = useState<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  if (mediaUrl && mediaType === "video") {
    return (
      <div
        className="relative cursor-pointer bg-foreground"
        style={forceCrop ? { aspectRatio: aspect } : undefined}
        onClick={() => {
          const vid = videoRef[0];
          if (vid) {
            if (vid.paused) { vid.play(); setPlaying(true); }
            else { vid.pause(); setPlaying(false); }
          }
        }}
      >
        <video
          ref={(el) => { videoRef[0] = el; }}
          src={mediaUrl}
          className={cn(forceCrop ? "absolute inset-0 w-full h-full object-cover" : "w-full h-auto block max-h-[600px] object-contain mx-auto")}
          muted
          playsInline
          loop
        />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>
    );
  }
  if (mediaUrl) {
    if (forceCrop) {
      return (
        <div className="bg-foreground overflow-hidden" style={{ aspectRatio: aspect }}>
          <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
        </div>
      );
    }
    return <img src={mediaUrl} alt="Preview" className="w-full h-auto block max-h-[600px] object-contain mx-auto bg-foreground" />;
  }
  return (
    <div className="bg-muted flex flex-col items-center justify-center text-muted-foreground gap-1" style={{ aspectRatio: aspect }}>
      <span className="text-xs">Image preview</span>
      <span className="text-[10px] opacity-60">{label}</span>
    </div>
  );
}

/** Platforms that force a crop on feed images (match real platform behavior). */
const FORCE_CROP_PLATFORMS = new Set(["instagram", "twitter", "youtube"]);

function ImagePlaceholder({ platform, device, imageCount = 1, mediaUrls }: { platform: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[] }) {
  const dims = PLATFORM_DIMENSIONS[platform];
  const spec = dims ? dims[device] : { imageAspect: "16/9", imageLabel: "1200 × 630px" };
  const firstMedia = mediaUrls?.[0];
  const forceCrop = FORCE_CROP_PLATFORMS.has(platform);

  if (imageCount <= 1) {
    return <SingleImagePlaceholder aspect={spec.imageAspect} label={spec.imageLabel} mediaUrl={firstMedia?.url} mediaType={firstMedia?.type} forceCrop={forceCrop} />;
  }

  // Platform-specific multi-image layouts
  return <MultiImageGrid platform={platform} device={device} imageCount={imageCount} spec={spec} mediaUrls={mediaUrls} />;
}

// Grid cell: renders actual image/video if provided, else a labeled placeholder
function GridCell({ mediaUrl, mediaType, label, aspect, className }: { mediaUrl?: string; mediaType?: "image" | "video"; label: string; aspect?: string; className?: string }) {
  const style = aspect ? { aspectRatio: aspect } : undefined;
  if (mediaUrl) {
    if (mediaType === "video") {
      return <video src={mediaUrl} className={cn("w-full h-full object-cover", className)} style={style} muted playsInline />;
    }
    return <img src={mediaUrl} alt="" className={cn("w-full h-full object-cover", className)} style={style} />;
  }
  return (
    <div className={cn("bg-muted flex items-center justify-center text-muted-foreground", className)} style={style}>
      <span className="text-[10px]">{label}</span>
    </div>
  );
}

// Platform-specific multi-image carousel/grid layouts
function MultiImageGrid({ platform, imageCount, spec, mediaUrls }: { platform: string; device: Device; imageCount: number; spec: { imageAspect: string; imageLabel: string }; mediaUrls?: { url: string; type: "image" | "video" }[] }) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const capped = Math.min(imageCount, 10);
  const mediaAt = (i: number) => mediaUrls?.[i];
  const forceCrop = FORCE_CROP_PLATFORMS.has(platform);

  // Instagram & Threads: swipeable carousel with dots
  if (platform === "instagram" || platform === "threads") {
    const currentMedia = mediaAt(carouselIndex);
    return (
      <div className="relative">
        <SingleImagePlaceholder aspect={spec.imageAspect} label={`Image ${carouselIndex + 1} of ${capped}`} mediaUrl={currentMedia?.url} mediaType={currentMedia?.type} forceCrop={forceCrop} />
        {carouselIndex > 0 && (
          <button onClick={() => setCarouselIndex(i => i - 1)} className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card/80 shadow flex items-center justify-center">
            <ChevronLeft className="w-3.5 h-3.5 text-foreground" />
          </button>
        )}
        {carouselIndex < capped - 1 && (
          <button onClick={() => setCarouselIndex(i => i + 1)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card/80 shadow flex items-center justify-center">
            <ChevronRight className="w-3.5 h-3.5 text-foreground" />
          </button>
        )}
        {/* Carousel dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {Array.from({ length: capped }).map((_, i) => (
            <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-colors", i === carouselIndex ? "bg-primary" : "bg-card/50")} />
          ))}
        </div>
        {/* Counter badge */}
        <div className="absolute top-2 right-2 bg-foreground/70 text-card text-[10px] px-2 py-0.5 rounded-full">{carouselIndex + 1}/{capped}</div>
      </div>
    );
  }

  // Facebook & LinkedIn: grid layout
  if (platform === "facebook" || platform === "linkedin") {
    if (capped === 2) {
      return (
        <div className="grid grid-cols-2 gap-0.5">
          {[0, 1].map(i => {
            const m = mediaAt(i);
            return <GridCell key={i} mediaUrl={m?.url} mediaType={m?.type} label={`Image ${i + 1}`} aspect="1/1" />;
          })}
        </div>
      );
    }
    if (capped === 3) {
      const m0 = mediaAt(0);
      return (
        <div className="grid grid-cols-2 gap-0.5">
          <GridCell mediaUrl={m0?.url} mediaType={m0?.type} label="Image 1" aspect="1/2" className="row-span-2" />
          {[1, 2].map(i => {
            const m = mediaAt(i);
            return <GridCell key={i} mediaUrl={m?.url} mediaType={m?.type} label={`Image ${i + 1}`} aspect="1/1" />;
          })}
        </div>
      );
    }
    // 4+ images: 2x2 grid with +N overlay
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {[0, 1, 2, 3].map(i => {
          const m = mediaAt(i);
          return (
            <div key={i} className="relative" style={{ aspectRatio: "1/1" }}>
              <GridCell mediaUrl={m?.url} mediaType={m?.type} label={`Image ${i + 1}`} aspect="1/1" />
              {i === 3 && capped > 4 && (
                <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                  <span className="text-card text-lg font-bold">+{capped - 4}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Twitter/X: specific grid layouts (max 4)
  if (platform === "twitter") {
    const count = Math.min(capped, 4);
    if (count === 2) {
      return (
        <div className="rounded-xl overflow-hidden grid grid-cols-2 gap-0.5">
          {[0, 1].map(i => {
            const m = mediaAt(i);
            return <GridCell key={i} mediaUrl={m?.url} mediaType={m?.type} label={`Image ${i + 1}`} aspect="4/5" />;
          })}
        </div>
      );
    }
    if (count === 3) {
      const m0 = mediaAt(0), m1 = mediaAt(1), m2 = mediaAt(2);
      return (
        <div className="rounded-xl overflow-hidden grid grid-cols-2 gap-0.5" style={{ aspectRatio: "16/9" }}>
          <GridCell mediaUrl={m0?.url} mediaType={m0?.type} label="Image 1" className="row-span-2" />
          <GridCell mediaUrl={m1?.url} mediaType={m1?.type} label="Image 2" />
          <GridCell mediaUrl={m2?.url} mediaType={m2?.type} label="Image 3" />
        </div>
      );
    }
    if (count >= 4) {
      return (
        <div className="rounded-xl overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5" style={{ aspectRatio: "16/9" }}>
          {[0, 1, 2, 3].map(i => {
            const m = mediaAt(i);
            return <GridCell key={i} mediaUrl={m?.url} mediaType={m?.type} label={`Image ${i + 1}`} />;
          })}
        </div>
      );
    }
  }

  // Bluesky & Mastodon: grid (max 4)
  if (platform === "bluesky" || platform === "mastodon") {
    const count = Math.min(capped, 4);
    if (count === 2) {
      return (
        <div className="rounded-lg overflow-hidden grid grid-cols-2 gap-0.5">
          {[0, 1].map(i => {
            const m = mediaAt(i);
            return <GridCell key={i} mediaUrl={m?.url} mediaType={m?.type} label={`Image ${i + 1}`} aspect="1/1" />;
          })}
        </div>
      );
    }
    return (
      <div className="rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5" style={{ aspectRatio: "16/9" }}>
        {Array.from({ length: count }).map((_, i) => {
          const m = mediaAt(i);
          return <GridCell key={i} mediaUrl={m?.url} mediaType={m?.type} label={`Image ${i + 1}`} className={count === 3 && i === 0 ? "row-span-2" : undefined} />;
        })}
      </div>
    );
  }

  // Reddit: gallery with counter
  if (platform === "reddit") {
    const currentMedia = mediaAt(carouselIndex);
    return (
      <div className="relative">
        <SingleImagePlaceholder aspect={spec.imageAspect} label={`Image ${carouselIndex + 1} of ${capped}`} mediaUrl={currentMedia?.url} mediaType={currentMedia?.type} forceCrop={forceCrop} />
        {carouselIndex > 0 && (
          <button onClick={() => setCarouselIndex(i => i - 1)} className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card/80 shadow flex items-center justify-center">
            <ChevronLeft className="w-3.5 h-3.5 text-foreground" />
          </button>
        )}
        {carouselIndex < capped - 1 && (
          <button onClick={() => setCarouselIndex(i => i + 1)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card/80 shadow flex items-center justify-center">
            <ChevronRight className="w-3.5 h-3.5 text-foreground" />
          </button>
        )}
        <div className="absolute top-2 right-2 bg-foreground/70 text-card text-[10px] px-2 py-0.5 rounded-full">{carouselIndex + 1}/{capped}</div>
      </div>
    );
  }

  // Telegram, WhatsApp: media group grid
  if (platform === "telegram" || platform === "whatsapp") {
    if (capped === 2) {
      return (
        <div className="grid grid-cols-2 gap-0.5">
          {[0, 1].map(i => {
            const m = mediaAt(i);
            return <GridCell key={i} mediaUrl={m?.url} mediaType={m?.type} label={`Image ${i + 1}`} aspect="1/1" />;
          })}
        </div>
      );
    }
    const m0 = mediaAt(0);
    return (
      <div className="grid grid-cols-2 gap-0.5">
        <GridCell mediaUrl={m0?.url} mediaType={m0?.type} label="Image 1" aspect="16/9" className="col-span-2" />
        {Array.from({ length: Math.min(capped - 1, 3) }).map((_, i) => {
          const m = mediaAt(i + 1);
          return (
            <div key={i} className="relative" style={{ aspectRatio: "1/1" }}>
              <GridCell mediaUrl={m?.url} mediaType={m?.type} label={`Image ${i + 2}`} aspect="1/1" />
              {i === 2 && capped > 4 && (
                <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                  <span className="text-card text-lg font-bold">+{capped - 4}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Default: generic carousel for Pinterest, Google, Tumblr, WordPress, YouTube, TikTok
  const currentMedia = mediaAt(carouselIndex);
  return (
    <div className="relative">
      <SingleImagePlaceholder aspect={spec.imageAspect} label={`Image ${carouselIndex + 1} of ${capped}`} mediaUrl={currentMedia?.url} mediaType={currentMedia?.type} forceCrop={forceCrop} />
      {carouselIndex > 0 && (
        <button onClick={() => setCarouselIndex(i => i - 1)} className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card/80 shadow flex items-center justify-center">
          <ChevronLeft className="w-3.5 h-3.5 text-foreground" />
        </button>
      )}
      {carouselIndex < capped - 1 && (
        <button onClick={() => setCarouselIndex(i => i + 1)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card/80 shadow flex items-center justify-center">
          <ChevronRight className="w-3.5 h-3.5 text-foreground" />
        </button>
      )}
      <div className="absolute top-2 right-2 bg-foreground/70 text-card text-[10px] px-2 py-0.5 rounded-full">
        {carouselIndex + 1}/{capped} images
      </div>
    </div>
  );
}

function FacebookPreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-2">
        <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name} size={10} />
        <div>
          <p className="text-sm font-semibold text-foreground">{accountInfo?.name || "Your Page"}</p>
          <p className="text-xs text-muted-foreground">Just now</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-muted-foreground ml-auto" />
      </div>
      <div className="px-3 pb-3">
        <TruncatedText text={content} placeholder="Your post preview will appear here..." />
      </div>
      <ImagePlaceholder platform="facebook" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
      <div className="px-3 py-1.5 flex items-center text-xs text-muted-foreground">
        <span>❤️😊 0 others</span>
        <span className="ml-auto">0 comments · 0 shares</span>
      </div>
      <div className="border-t border-border flex">
        {[{ icon: ThumbsUp, label: "Like" }, { icon: MessageCircle, label: "Comment" }, { icon: Share2, label: "Share" }].map((a) => (
          <button key={a.label} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
            <a.icon className="w-4 h-4" /> {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InstagramPreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  const displayName = accountInfo?.username || accountInfo?.name || "your_page";
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-2">
        <AccountAvatar avatar={accountInfo?.avatar} name={displayName} size={8} />
        <p className="text-sm font-semibold text-foreground">{displayName}</p>
        <MoreHorizontal className="w-5 h-5 text-muted-foreground ml-auto" />
      </div>
      <ImagePlaceholder platform="instagram" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
      <div className="p-3 flex items-center gap-3">
        <Heart className="w-6 h-6 text-foreground" />
        <MessageCircle className="w-6 h-6 text-foreground" />
        <Send className="w-6 h-6 text-foreground" />
        <Bookmark className="w-6 h-6 text-foreground ml-auto" />
      </div>
      <div className="px-3 pb-3">
        <InstagramCaption username={displayName} text={content || "Your caption here..."} />
        <p className="text-xs text-muted-foreground mt-1">JUST NOW</p>
      </div>
    </div>
  );
}

function TwitterPreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className="flex gap-2">
        <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name} size={10} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-foreground">{accountInfo?.name || "Your Name"}</span>
            <span className="text-sm text-muted-foreground">@{accountInfo?.username || "handle"} · now</span>
          </div>
          <div className="mt-1">
            <TruncatedText text={content} placeholder="Your post preview will appear here..." />
          </div>
          <div className="rounded-xl mt-2 overflow-hidden">
            <ImagePlaceholder platform="twitter" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
          </div>
          <div className="flex items-center gap-8 mt-3 text-muted-foreground">
            {[MessageCircle, Repeat2, Heart, Share2].map((Icon, i) => (
              <button key={i} className="flex items-center gap-1 text-xs hover:text-primary transition-colors"><Icon className="w-4 h-4" /> 0</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-2">
        <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name} size={10} />
        <div>
          <p className="text-sm font-semibold text-foreground">{accountInfo?.name || "Your Name"}</p>
          <p className="text-xs text-muted-foreground">Just now</p>
        </div>
      </div>
      <div className="px-3 pb-3">
        <TruncatedText text={content} placeholder="Your post preview will appear here..." />
      </div>
      <ImagePlaceholder platform="linkedin" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
      <div className="border-t border-border flex">
        {[{ icon: ThumbsUp, l: "Like" }, { icon: MessageCircle, l: "Comment" }, { icon: Repeat2, l: "Repost" }, { icon: Send, l: "Send" }].map((a) => (
          <button key={a.l} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
            <a.icon className="w-4 h-4" /> {a.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function LinkedInDocumentPreview({ content, device }: { content: string; device: Device }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-muted" />
        <div>
          <p className="text-sm font-semibold text-foreground">Your Name</p>
          <p className="text-xs text-muted-foreground">Your headline · Just now</p>
        </div>
      </div>
      <p className="px-3 pb-3 text-sm text-foreground whitespace-pre-wrap">{content || "Your post preview will appear here..."}</p>
      
      {/* Document Carousel */}
      <div className="relative bg-muted">
        <div className="flex items-center justify-center" style={{ aspectRatio: device === "desktop" ? "4/3" : "3/4" }}>
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileText className="w-10 h-10" />
            <span className="text-sm font-medium text-foreground">Document Title</span>
            <span className="text-[10px]">Slide {currentSlide + 1} of {totalSlides}</span>
          </div>
        </div>

        {/* Navigation arrows */}
        {currentSlide > 0 && (
          <button
            onClick={() => setCurrentSlide(i => i - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card shadow-md flex items-center justify-center hover:bg-card/90 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
        )}
        {currentSlide < totalSlides - 1 && (
          <button
            onClick={() => setCurrentSlide(i => i + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card shadow-md flex items-center justify-center hover:bg-card/90 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        )}

        {/* Slide counter bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-[hsl(var(--linkedin))] px-3 py-2 flex items-center justify-between">
          <span className="text-primary-foreground text-[11px] font-medium">{currentSlide + 1} of {totalSlides}</span>
          {/* Progress dots */}
          <div className="flex gap-1">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  i === currentSlide ? "bg-primary-foreground" : "bg-primary-foreground/40"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border flex">
        {[{ icon: ThumbsUp, l: "Like" }, { icon: MessageCircle, l: "Comment" }, { icon: Repeat2, l: "Repost" }, { icon: Send, l: "Send" }].map((a) => (
          <button key={a.l} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
            <a.icon className="w-4 h-4" /> {a.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function YouTubePreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="relative">
        <ImagePlaceholder platform="youtube" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
        <div className="absolute bottom-2 right-2 bg-foreground/80 text-card text-[10px] px-1 rounded">0:00</div>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-foreground line-clamp-2">{content || "Video title here..."}</p>
        <div className="flex items-center gap-2 mt-1">
          <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name} size={6} />
          <p className="text-xs text-muted-foreground">{accountInfo?.name || "Your Channel"} · 0 views · Just now</p>
        </div>
      </div>
    </div>
  );
}

function TikTokPreview({ content, device, accountInfo }: { content: string; device: Device; imageCount?: number; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="flex justify-center">
      <div className="relative rounded-[2rem] overflow-hidden border-[6px] border-foreground mx-auto" style={{ aspectRatio: "9/16", maxHeight: device === "mobile" ? 520 : 420, width: device === "mobile" ? 300 : 240 }}>
        <div className="absolute inset-0 bg-foreground">
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-card/20 flex items-center justify-center backdrop-blur-sm">
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-card/80 ml-1" />
            </div>
          </div>

          {/* Right side actions */}
          <div className="absolute right-2 bottom-28 flex flex-col items-center gap-4">
            {[
              { icon: Heart, label: "0" },
              { icon: MessageCircle, label: "0" },
              { icon: Share2, label: "Share" },
              { icon: Bookmark, label: "Save" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-card/15 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-card" />
                </div>
                <span className="text-card text-[9px] mt-0.5">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-14 p-3">
            <div className="flex items-center gap-1.5">
              <span className="text-card text-xs font-bold">@{accountInfo?.username || accountInfo?.name || "yourhandle"}</span>
            </div>
            <p className="text-card/90 text-[10px] mt-1 line-clamp-2">{content || "Your caption here..."}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Music className="w-3 h-3 text-card/60" />
              <span className="text-card/60 text-[9px]">Original Audio...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PinterestPreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden mx-auto" style={{ maxWidth: 240 }}>
      <ImagePlaceholder platform="pinterest" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
      <div className="p-3">
        <p className="text-sm font-semibold text-foreground line-clamp-2">{content || "Pin title..."}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name} size={6} />
          <span className="text-xs text-muted-foreground">{accountInfo?.name || "Your Board"}</span>
        </div>
      </div>
    </div>
  );
}

function RedditPreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex">
        <div className="flex flex-col items-center gap-1 px-2 py-3 bg-muted/50">
          <ArrowUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-bold text-foreground">0</span>
          <ArrowDown className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="p-3 flex-1">
          <p className="text-xs text-muted-foreground">r/subreddit · Posted by u/{accountInfo?.username || accountInfo?.name || "you"} · just now</p>
          <p className="text-sm font-semibold text-foreground mt-1">{content || "Post title here..."}</p>
          <div className="rounded mt-2 overflow-hidden">
            <ImagePlaceholder platform="reddit" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 0 Comments</span>
            <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> Share</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreadsPreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name} size={8} />
          <div className="w-0.5 flex-1 bg-border mt-2" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-foreground">{accountInfo?.username || accountInfo?.name || "your_page"}</span>
            <span className="text-xs text-muted-foreground">· now</span>
          </div>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{content || "Your post preview..."}</p>
          <div className="rounded-lg mt-2 overflow-hidden">
            <ImagePlaceholder platform="threads" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
          </div>
          <div className="flex items-center gap-4 mt-3 text-muted-foreground">
            {[Heart, MessageCircle, Repeat2, Send].map((Icon, i) => (
              <Icon key={i} className="w-4 h-4 hover:text-foreground cursor-pointer transition-colors" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BlueskyPreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className="flex gap-2">
        <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name} size={10} />
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-foreground">{accountInfo?.name || "Your Name"}</span>
            <span className="text-sm text-muted-foreground">@{accountInfo?.username || "you.bsky.social"} · now</span>
          </div>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{content || "Your post preview..."}</p>
          <div className="rounded-lg mt-2 overflow-hidden">
            <ImagePlaceholder platform="bluesky" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
          </div>
          <div className="flex items-center gap-6 mt-3 text-muted-foreground">
            {[MessageCircle, Repeat2, Heart].map((Icon, i) => (
              <button key={i} className="flex items-center gap-1 text-xs hover:text-primary transition-colors"><Icon className="w-4 h-4" /> 0</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MastodonPreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className="flex gap-2">
        <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name} size={10} />
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-foreground">{accountInfo?.name || "Your Name"}</span>
            <span className="text-sm text-muted-foreground">@{accountInfo?.username || "you@mastodon.social"} · now</span>
          </div>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{content || "Your post preview..."}</p>
          <div className="rounded-lg mt-2 overflow-hidden">
            <ImagePlaceholder platform="mastodon" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
          </div>
          <div className="flex items-center gap-6 mt-3 text-muted-foreground">
            {[MessageCircle, Repeat2, Heart, Bookmark].map((Icon, i) => (
              <Icon key={i} className="w-4 h-4 hover:text-foreground cursor-pointer transition-colors" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TelegramPreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-2 border-b border-border">
        <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name} size={8} />
        <p className="text-sm font-semibold text-foreground">{accountInfo?.name || "Your Channel"}</p>
      </div>
      <div className="p-3">
        <p className="text-sm text-foreground whitespace-pre-wrap">{content || "Your message preview..."}</p>
        <div className="rounded mt-2 overflow-hidden">
          <ImagePlaceholder platform="telegram" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">0 views</span>
          </div>
          <span className="text-[10px] text-muted-foreground">12:00</span>
        </div>
      </div>
    </div>
  );
}

function GooglePreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-2">
        <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name} size={10} />
        <div>
          <p className="text-sm font-semibold text-foreground">{accountInfo?.name || "Your Business"}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Location · Just now</p>
        </div>
      </div>
      <p className="px-3 pb-3 text-sm text-foreground whitespace-pre-wrap">{content || "Your update preview..."}</p>
      <ImagePlaceholder platform="google" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
      <div className="p-3">
        <button className="w-full py-2 border border-primary text-primary text-sm font-medium rounded hover:bg-primary/5 transition-colors">Learn more</button>
      </div>
    </div>
  );
}

function TumblrPreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-2">
        <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name} size={8} />
        <p className="text-sm font-semibold text-foreground">{accountInfo?.name || "yourblog"}</p>
      </div>
      <ImagePlaceholder platform="tumblr" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
      <div className="p-3">
        <p className="text-sm text-foreground whitespace-pre-wrap">{content || "Your post preview..."}</p>
        <div className="flex items-center gap-4 mt-3 text-muted-foreground">
          <Heart className="w-4 h-4 hover:text-foreground cursor-pointer" />
          <Repeat2 className="w-4 h-4 hover:text-foreground cursor-pointer" />
          <span className="text-xs ml-auto">0 notes</span>
        </div>
      </div>
    </div>
  );
}

function WordPressPreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name} size={8} />
        <div>
          <p className="text-sm font-semibold text-foreground">{accountInfo?.name || "Your Blog"}</p>
          <p className="text-xs text-muted-foreground">Draft</p>
        </div>
      </div>
      <ImagePlaceholder platform="wordpress" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
      <div className="p-3">
        <p className="text-sm text-foreground whitespace-pre-wrap">{content || "Your blog post content..."}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">Category</span>
          <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">Tags</span>
        </div>
      </div>
    </div>
  );
}

function WhatsAppPreview({ content, device, imageCount = 1, mediaUrls, accountInfo }: { content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  return (
    <div className="bg-[hsl(140,20%,90%)] rounded-lg overflow-hidden">
      <div className="p-3 bg-[hsl(142,70%,35%)] flex items-center gap-2">
        <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name} size={8} />
        <p className="text-sm font-semibold text-primary-foreground">{accountInfo?.name || "Your Group"}</p>
      </div>
      <div className="p-3 min-h-[120px]">
        <div className="inline-block bg-card rounded-lg p-2.5 shadow-sm max-w-[85%]">
          <div className="rounded overflow-hidden mb-2">
            <ImagePlaceholder platform="whatsapp" device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{content || "Your message preview..."}</p>
          <span className="text-[10px] text-muted-foreground float-right mt-1 ml-2">12:00 ✓✓</span>
        </div>
      </div>
    </div>
  );
}

// Story/Reel preview components (9:16 vertical)
function InstagramReelsPreview({ content, mediaUrls, accountInfo }: { content: string; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  const firstMedia = mediaUrls?.[0];
  const displayName = accountInfo?.username || accountInfo?.name || "your_page";
  return (
    <div className="flex justify-center">
      <div className="relative rounded-[2rem] overflow-hidden border-[6px] border-foreground mx-auto" style={{ aspectRatio: "9/16", maxHeight: 560, width: 300 }}>
        <div className="absolute inset-0 bg-foreground">
          {/* Media or video placeholder */}
          {firstMedia ? (
            firstMedia.type === "video" ? (
              <video src={firstMedia.url} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <img src={firstMedia.url} alt="Reel" className="absolute inset-0 w-full h-full object-cover" />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-card/20 flex items-center justify-center backdrop-blur-sm">
                <Play className="w-7 h-7 text-card/80 ml-1" fill="currentColor" />
              </div>
            </div>
          )}

          {/* Instagram Reels header */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="text-card text-sm font-bold">Reels</span>
            <div className="w-8 h-8 rounded-full bg-card/15 flex items-center justify-center">
              <svg className="w-5 h-5 text-card" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
            </div>
          </div>

          {/* Right side actions - Instagram Reels style */}
          <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5">
            <div className="flex flex-col items-center">
              <Heart className="w-7 h-7 text-card" />
              <span className="text-card text-[10px] mt-1">0</span>
            </div>
            <div className="flex flex-col items-center">
              <MessageCircle className="w-7 h-7 text-card" />
              <span className="text-card text-[10px] mt-1">0</span>
            </div>
            <div className="flex flex-col items-center">
              <Send className="w-7 h-7 text-card" />
            </div>
            <div className="flex flex-col items-center">
              <MoreHorizontal className="w-7 h-7 text-card" />
            </div>
            {/* Audio disc */}
            <div className="w-8 h-8 rounded-md bg-card/20 border border-card/40 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-card/30 to-card/10" />
            </div>
          </div>

          {/* Bottom content - Instagram Reels style */}
          <div className="absolute bottom-0 left-0 right-16 p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[hsl(45,100%,60%)] via-[hsl(var(--instagram))] to-[hsl(280,70%,55%)] p-0.5">
                {accountInfo?.avatar ? (
                  <img src={accountInfo.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-foreground" />
                )}
              </div>
              <span className="text-card text-xs font-bold">{displayName}</span>
              <button className="border border-card text-card text-[10px] font-semibold px-3 py-1 rounded-lg">Follow</button>
            </div>
            <p className="text-card/90 text-xs mt-2 line-clamp-2">{content || "Your reel caption here..."}</p>
            <div className="flex items-center gap-2 mt-2">
              <Music className="w-3.5 h-3.5 text-card/70" />
              <span className="text-card/70 text-[10px]">{displayName} · Original audio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FacebookStoryPreview({ content, mediaUrls }: { content: string; mediaUrls?: { url: string; type: "image" | "video" }[] }) {
  const firstMedia = mediaUrls?.[0];
  return (
    <div className="relative rounded-2xl overflow-hidden bg-foreground mx-auto" style={{ aspectRatio: "9/16", maxHeight: 520, maxWidth: 280 }}>
      {firstMedia ? (
        firstMedia.type === "video" ? (
          <video src={firstMedia.url} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
        ) : (
          <img src={firstMedia.url} alt="Story" className="absolute inset-0 w-full h-full object-cover" />
        )
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-card/30 gap-1">
          <span className="text-xs">Story / Reel preview</span>
          <span className="text-[10px]">1080 × 1920px (9:16)</span>
        </div>
      )}
      {/* Progress bars */}
      <div className="absolute top-2 left-3 right-3 flex gap-1">
        <div className="flex-1 h-0.5 bg-card/40 rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-card rounded-full" />
        </div>
        <div className="flex-1 h-0.5 bg-card/20 rounded-full" />
      </div>
      {/* Header */}
      <div className="absolute top-5 left-3 right-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[hsl(var(--facebook))] flex items-center justify-center text-card text-xs font-bold">f</div>
        <span className="text-card text-xs font-semibold">George Liontos</span>
        <span className="text-card/60 text-[10px]">2h</span>
        <MoreHorizontal className="w-4 h-4 text-card/60 ml-auto" />
      </div>
      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent">
        <p className="text-card text-xs line-clamp-2">{content || "Your story here..."}</p>
        <div className="flex items-center gap-3 mt-3 justify-center">
          <button className="bg-card/20 rounded-full px-4 py-1.5 text-card text-[10px]">💬 Reply</button>
          <button className="bg-card/20 rounded-full px-4 py-1.5 text-card text-[10px]">🔗 Share</button>
        </div>
      </div>
    </div>
  );
}

function TikTokStoryPreview({ content, mediaUrls }: { content: string; mediaUrls?: { url: string; type: "image" | "video" }[] }) {
  const firstMedia = mediaUrls?.[0];
  return (
    <div className="flex justify-center">
      <div className="relative rounded-[2rem] overflow-hidden border-[6px] border-foreground mx-auto" style={{ aspectRatio: "9/16", maxHeight: 560, width: 300 }}>
        <div className="absolute inset-0 bg-foreground">
          {/* Media or video area placeholder */}
          {firstMedia ? (
            firstMedia.type === "video" ? (
              <video src={firstMedia.url} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <img src={firstMedia.url} alt="TikTok" className="absolute inset-0 w-full h-full object-cover" />
            )
          ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Play button */}
            <div className="w-14 h-14 rounded-full bg-card/20 flex items-center justify-center backdrop-blur-sm">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-card/80 ml-1" />
            </div>
          </div>
          )}

          {/* Right side actions */}
          <div className="absolute right-3 bottom-36 flex flex-col items-center gap-5">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-card/15 flex items-center justify-center">
                <Heart className="w-6 h-6 text-card" />
              </div>
              <span className="text-card text-[10px] mt-1">0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-card/15 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-card" />
              </div>
              <span className="text-card text-[10px] mt-1">0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-card/15 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-card" />
              </div>
              <span className="text-card text-[10px] mt-1">Share</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-card/15 flex items-center justify-center">
                <Bookmark className="w-6 h-6 text-card" />
              </div>
              <span className="text-card text-[10px] mt-1">Save</span>
            </div>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-16 p-4">
            <div className="flex items-center gap-2">
              <span className="text-card text-sm font-bold">@georgeliontos</span>
              <span className="bg-[hsl(var(--instagram))] text-card text-[9px] font-bold px-1.5 py-0.5 rounded text-center">VERIFIED</span>
            </div>
            <p className="text-card/90 text-xs mt-1.5 line-clamp-2">{content || "Your TikTok caption here..."}</p>
            <div className="flex items-center gap-2 mt-2">
              <Music className="w-3.5 h-3.5 text-card/70" />
              <span className="text-card/70 text-[10px]">Original Audio...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function YouTubeShortPreview({ content, mediaUrls, accountInfo }: { content: string; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  const firstMedia = mediaUrls?.[0];
  const rawHandle = accountInfo?.username || accountInfo?.name || "yourchannel";
  const handle = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;
  return (
    <div className="flex justify-center">
      <div className="relative rounded-[2rem] overflow-hidden border-[6px] border-foreground mx-auto" style={{ aspectRatio: "9/16", maxHeight: 560, width: 300 }}>
        <div className="absolute inset-0 bg-foreground">
          {/* Media or placeholder */}
          {firstMedia ? (
            firstMedia.type === "video" ? (
              <video src={firstMedia.url} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <img src={firstMedia.url} alt="Short" className="absolute inset-0 w-full h-full object-cover" />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-card/20 flex items-center justify-center backdrop-blur-sm">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-card/80 ml-1" />
              </div>
            </div>
          )}

          {/* Right side actions — compact spacing, sits clear of top edge */}
          <div className="absolute right-2 bottom-24 flex flex-col items-center gap-2.5">
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-card/15 flex items-center justify-center">
                <ThumbsUp className="w-4 h-4 text-card" />
              </div>
              <span className="text-card text-[9px] mt-0.5">0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-card/15 flex items-center justify-center">
                <ThumbsDown className="w-4 h-4 text-card" />
              </div>
              <span className="text-card text-[9px] mt-0.5">Dislike</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-card/15 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-card" />
              </div>
              <span className="text-card text-[9px] mt-0.5">0</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-card/15 flex items-center justify-center">
                <Share2 className="w-4 h-4 text-card" />
              </div>
              <span className="text-card text-[9px] mt-0.5">Share</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-card/15 flex items-center justify-center">
                <Repeat2 className="w-4 h-4 text-card" />
              </div>
              <span className="text-card text-[9px] mt-0.5">Remix</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-card/20 border-2 border-card overflow-hidden" />
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-14 p-3 bg-gradient-to-t from-foreground/60 to-transparent pt-10">
            <div className="flex items-center gap-2 min-w-0">
              {accountInfo?.avatar ? (
                <img src={accountInfo.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 border border-card/40" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-card/20 border border-card/40 shrink-0" />
              )}
              <span className="text-card text-xs font-semibold truncate">{handle}</span>
              <button className="bg-card text-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">Subscribe</button>
            </div>
            <p className="text-card/90 text-xs mt-2 line-clamp-2">{content || "Your Short title here..."}</p>
            <div className="flex items-center gap-2 mt-2">
              <Music className="w-3.5 h-3.5 text-card/70" />
              <span className="text-card/70 text-[10px]">Original audio</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-card/20">
            <div className="h-full w-1/4 bg-card rounded-r-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SnapchatStoryPreview({ content, mediaUrls }: { content: string; mediaUrls?: { url: string; type: "image" | "video" }[] }) {
  const firstMedia = mediaUrls?.[0];
  return (
    <div className="flex justify-center">
      <div className="relative rounded-[2rem] overflow-hidden border-[6px] border-foreground mx-auto" style={{ aspectRatio: "9/16", maxHeight: 560, width: 300 }}>
        <div className="absolute inset-0 bg-foreground">
          {firstMedia ? (
            firstMedia.type === "video" ? (
              <video src={firstMedia.url} className="absolute inset-0 w-full h-full object-cover" autoPlay loop muted playsInline />
            ) : (
              <img src={firstMedia.url} alt="Snap" className="absolute inset-0 w-full h-full object-cover" />
            )
          ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-card/20 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-7 h-7 text-card/80 ml-1" fill="currentColor" />
            </div>
          </div>
          )}

          {/* Snapchat header */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[hsl(54,100%,50%)] flex items-center justify-center">
                <PlatformIcon platformId="snapchat" size={18} className="text-foreground" />
              </div>
              <div>
                <span className="text-card text-xs font-bold">yourname</span>
                <p className="text-card/60 text-[9px]">2h ago</p>
              </div>
            </div>
            <MoreHorizontal className="w-5 h-5 text-card/60" />
          </div>

          {/* Progress bars */}
          <div className="absolute top-16 left-3 right-3 flex gap-1">
            <div className="flex-1 h-0.5 bg-card/40 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-card rounded-full" />
            </div>
            <div className="flex-1 h-0.5 bg-card/20 rounded-full" />
            <div className="flex-1 h-0.5 bg-card/20 rounded-full" />
          </div>

          {/* Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-foreground/80 to-transparent pt-12">
            <p className="text-card/90 text-xs line-clamp-2 mb-3">{content || "Your snap here..."}</p>
            <div className="flex items-center justify-center gap-4">
              <button className="bg-card/20 backdrop-blur-sm rounded-full px-5 py-2 text-card text-[10px] font-medium flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" /> Chat
              </button>
              <button className="bg-card/20 backdrop-blur-sm rounded-full px-5 py-2 text-card text-[10px] font-medium flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const STORY_PREVIEW_MAP: Record<string, React.FC<{ content: string; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }>> = {
  instagram: InstagramReelsPreview,
  facebook: FacebookStoryPreview,
  tiktok: TikTokStoryPreview,
  youtube: YouTubeShortPreview,
  snapchat: SnapchatStoryPreview,
};

const PREVIEW_MAP: Record<string, React.FC<{ content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }>> = {
  facebook: FacebookPreview,
  instagram: InstagramPreview,
  twitter: TwitterPreview,
  linkedin: LinkedInPreview,
  youtube: YouTubePreview,
  tiktok: TikTokPreview,
  pinterest: PinterestPreview,
  reddit: RedditPreview,
  threads: ThreadsPreview,
  bluesky: BlueskyPreview,
  mastodon: MastodonPreview,
  telegram: TelegramPreview,
  google: GooglePreview,
  tumblr: TumblrPreview,
  wordpress: WordPressPreview,
  whatsapp: WhatsAppPreview,
};

export default function PostPreview({ selectedPlatforms, content, platformContent, customizeChannel, imageCount = 1, platformPostType = {}, mediaUrls, accountInfo, accounts, selectedAccountIds }: PostPreviewProps) {
  const [device, setDevice] = useState<Device>("desktop");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("feed");
  const platforms = selectedPlatforms.length > 0 ? selectedPlatforms : ["facebook"];
  const [activePreview, setActivePreview] = useState<string | null>(null);

  const currentPreview = activePreview && platforms.includes(activePreview) ? activePreview : (platforms[0] ?? "facebook");

  // Derive account info for the currently active platform preview
  const currentAccountInfo = useMemo(() => {
    // If accounts + selectedAccountIds provided, match by platform
    if (accounts && accounts.length > 0 && selectedAccountIds && selectedAccountIds.length > 0) {
      const platformVariants = [currentPreview, `${currentPreview}-page`, `${currentPreview}_page`];
      const match = accounts.find(a =>
        selectedAccountIds.includes(a.id) && platformVariants.includes(a.platform)
      );
      if (match) {
        return {
          name: match.account_name || match.account_username || "",
          avatar: match.profile_picture || "",
          username: match.account_username || "",
        };
      }
    }
    // Fallback to the single accountInfo prop
    return accountInfo;
  }, [accounts, selectedAccountIds, currentPreview, accountInfo]);
  const supportsStory = currentPreview in STORY_PLATFORMS;
  const storyInfo = STORY_PLATFORMS[currentPreview];

  // Reset to feed if switching to a platform that doesn't support stories
  const effectiveMode = supportsStory ? previewMode : "feed";


  const getDisplayContent = (platformId: string) => {
    if (customizeChannel && platformContent?.[platformId]) return platformContent[platformId];
    return content;
  };

  const displayContent = getDisplayContent(currentPreview);
  const dims = PLATFORM_DIMENSIONS[currentPreview];
  const currentSpec = effectiveMode === "story"
    ? { imageLabel: "1080 × 1920px (9:16)" }
    : dims ? dims[device] : null;

  return (
    <div className="w-full xl:w-[380px] shrink-0">
      <div className="xl:sticky xl:top-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Post Preview</h3>
          <div className="flex items-center gap-2">
            {/* Feed / Story toggle */}
            {supportsStory && (
              <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5 text-[11px] font-medium">
                <button
                  onClick={() => setPreviewMode("feed")}
                  className={cn("px-2.5 py-1 rounded transition-colors", effectiveMode === "feed" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  Feed
                </button>
                <button
                  onClick={() => setPreviewMode("story")}
                  className={cn("px-2.5 py-1 rounded transition-colors", effectiveMode === "story" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {storyInfo?.sublabel || "Story"}
                </button>
              </div>
            )}
            {/* Device toggle (only for feed mode) */}
            {effectiveMode === "feed" && (
              <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
                <button onClick={() => setDevice("desktop")} className={cn("p-1.5 rounded", device === "desktop" ? "bg-card shadow-sm" : "text-muted-foreground")}>
                  <Monitor className="w-4 h-4" />
                </button>
                <button onClick={() => setDevice("mobile")} className={cn("p-1.5 rounded", device === "mobile" ? "bg-card shadow-sm" : "text-muted-foreground")}>
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Platform tabs */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {platforms.map((p) => {
            const brand = PLATFORM_BRANDS[p];
            if (!brand) return null;
            const isActive = p === currentPreview;
            return (
              <button
                key={p}
                onClick={() => setActivePreview(p)}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  isActive
                    ? `${brand.color} text-primary-foreground ring-2 ring-offset-2 ring-primary`
                    : `${brand.color} text-primary-foreground opacity-50 hover:opacity-80`
                )}
                title={brand.label}
              >
                <PlatformIcon platformId={p} size={16} />
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
        <div className={cn(
          "overflow-y-auto xl:max-h-[calc(100vh-240px)] pr-1",
          effectiveMode === "feed" && device === "mobile" && "max-w-[320px] mx-auto"
        )}>
          {effectiveMode === "story" && supportsStory
            ? (() => { const StoryComp = STORY_PREVIEW_MAP[currentPreview]; return StoryComp ? <StoryComp content={displayContent} mediaUrls={mediaUrls} accountInfo={currentAccountInfo} /> : null; })()
            : (() => {
                // Check for LinkedIn Document post type
                const postType = platformPostType[currentPreview] || platformPostType[currentPreview.replace("_page", "")] || "";
                if ((currentPreview === "linkedin" || currentPreview === "linkedin_page") && postType.toLowerCase() === "document") {
                  return <LinkedInDocumentPreview content={displayContent} device={device} />;
                }
                const FeedComp = PREVIEW_MAP[currentPreview];
                return FeedComp ? <FeedComp content={displayContent} device={device} imageCount={imageCount} mediaUrls={mediaUrls} accountInfo={currentAccountInfo} /> : <GenericPreview platform={currentPreview} content={displayContent} device={device} imageCount={imageCount} mediaUrls={mediaUrls} accountInfo={currentAccountInfo} />;
              })()
          }
        </div>
      </div>
    </div>
  );
}

function GenericPreview({ platform, content, device, imageCount = 1, mediaUrls, accountInfo }: { platform: string; content: string; device: Device; imageCount?: number; mediaUrls?: { url: string; type: "image" | "video" }[]; accountInfo?: { name: string; avatar: string; username?: string } }) {
  const brand = PLATFORM_BRANDS[platform];
  if (!brand) return null;
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 flex items-center gap-2">
        <AccountAvatar avatar={accountInfo?.avatar} name={accountInfo?.name || brand.label} size={8} />
        <div>
          <p className="text-sm font-semibold text-foreground">{accountInfo?.name || brand.label}</p>
          <p className="text-xs text-muted-foreground">Just now</p>
        </div>
      </div>
      <div className="px-4 pb-3">
        <TruncatedText text={content} placeholder="Your post preview will appear here..." />
      </div>
      <ImagePlaceholder platform={platform} device={device} imageCount={imageCount} mediaUrls={mediaUrls} />
    </div>
  );
}
