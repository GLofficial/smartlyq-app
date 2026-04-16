import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type Device = "desktop" | "mobile";

// Platform-specific image dimensions (aspect ratios for preview rendering)
export const PLATFORM_DIMENSIONS: Record<string, {
  desktop: { imageAspect: string; imageLabel: string; maxWidth?: number };
  mobile: { imageAspect: string; imageLabel: string; maxWidth?: number };
}> = {
  facebook: { desktop: { imageAspect: "1200/630", imageLabel: "1200 × 630px (1.91:1)" }, mobile: { imageAspect: "1080/1350", imageLabel: "1080 × 1350px (4:5)" } },
  instagram: { desktop: { imageAspect: "1/1", imageLabel: "1080 × 1080px (1:1)" }, mobile: { imageAspect: "4/5", imageLabel: "1080 × 1350px (4:5)" } },
  twitter: { desktop: { imageAspect: "16/9", imageLabel: "1200 × 675px (16:9)" }, mobile: { imageAspect: "16/9", imageLabel: "1200 × 675px (16:9)" } },
  linkedin: { desktop: { imageAspect: "1200/627", imageLabel: "1200 × 627px (1.91:1)" }, mobile: { imageAspect: "1080/1350", imageLabel: "1080 × 1350px (4:5)" } },
  youtube: { desktop: { imageAspect: "16/9", imageLabel: "1280 × 720px (16:9)" }, mobile: { imageAspect: "16/9", imageLabel: "1280 × 720px (16:9)" } },
  tiktok: { desktop: { imageAspect: "9/16", imageLabel: "1080 × 1920px (9:16)", maxWidth: 240 }, mobile: { imageAspect: "9/16", imageLabel: "1080 × 1920px (9:16)" } },
  pinterest: { desktop: { imageAspect: "2/3", imageLabel: "1000 × 1500px (2:3)", maxWidth: 240 }, mobile: { imageAspect: "2/3", imageLabel: "1000 × 1500px (2:3)", maxWidth: 240 } },
  reddit: { desktop: { imageAspect: "16/9", imageLabel: "1920 × 1080px (16:9)" }, mobile: { imageAspect: "4/3", imageLabel: "1080 × 810px (4:3)" } },
  threads: { desktop: { imageAspect: "1/1", imageLabel: "1080 × 1080px (1:1)" }, mobile: { imageAspect: "9/16", imageLabel: "1080 × 1920px (9:16)" } },
  bluesky: { desktop: { imageAspect: "1/1", imageLabel: "1000 × 1000px (1:1)" }, mobile: { imageAspect: "1/1", imageLabel: "1000 × 1000px (1:1)" } },
  mastodon: { desktop: { imageAspect: "16/9", imageLabel: "1280 × 720px (16:9)" }, mobile: { imageAspect: "1/1", imageLabel: "1080 × 1080px (1:1)" } },
  telegram: { desktop: { imageAspect: "16/9", imageLabel: "1280 × 720px (16:9)" }, mobile: { imageAspect: "4/3", imageLabel: "1080 × 810px (4:3)" } },
  google: { desktop: { imageAspect: "1200/900", imageLabel: "1200 × 900px (4:3)" }, mobile: { imageAspect: "1/1", imageLabel: "720 × 720px (1:1)" } },
  tumblr: { desktop: { imageAspect: "540/405", imageLabel: "540px wide (4:3)" }, mobile: { imageAspect: "1/1", imageLabel: "1080 × 1080px (1:1)" } },
  wordpress: { desktop: { imageAspect: "16/9", imageLabel: "1200 × 630px (16:9)" }, mobile: { imageAspect: "16/9", imageLabel: "1200 × 630px (16:9)" } },
  whatsapp: { desktop: { imageAspect: "16/9", imageLabel: "1280 × 720px (16:9)" }, mobile: { imageAspect: "4/3", imageLabel: "1080 × 810px (4:3)" } },
};

function SingleImagePlaceholder({ aspect, label }: { aspect: string; label: string }) {
  return (
    <div className="bg-muted flex flex-col items-center justify-center text-muted-foreground gap-1" style={{ aspectRatio: aspect }}>
      <span className="text-xs">Image preview</span>
      <span className="text-[10px] opacity-60">{label}</span>
    </div>
  );
}

function MultiImageGrid({ platform, imageCount, spec }: { platform: string; device: Device; imageCount: number; spec: { imageAspect: string; imageLabel: string } }) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const capped = Math.min(imageCount, 10);

  // Instagram & Threads: swipeable carousel with dots
  if (platform === "instagram" || platform === "threads") {
    return (
      <div className="relative">
        <SingleImagePlaceholder aspect={spec.imageAspect} label={`Image ${carouselIndex + 1} of ${capped}`} />
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
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {Array.from({ length: capped }).map((_, i) => (
            <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-colors", i === carouselIndex ? "bg-primary" : "bg-card/50")} />
          ))}
        </div>
        <div className="absolute top-2 right-2 bg-foreground/70 text-card text-[10px] px-2 py-0.5 rounded-full">{carouselIndex + 1}/{capped}</div>
      </div>
    );
  }

  // Facebook & LinkedIn: grid layout
  if (platform === "facebook" || platform === "linkedin") {
    if (capped === 2) {
      return (<div className="grid grid-cols-2 gap-0.5">{[0, 1].map(i => (<div key={i} className="bg-muted flex items-center justify-center text-muted-foreground" style={{ aspectRatio: "1/1" }}><span className="text-[10px]">Image {i + 1}</span></div>))}</div>);
    }
    if (capped === 3) {
      return (
        <div className="grid grid-cols-2 gap-0.5">
          <div className="row-span-2 bg-muted flex items-center justify-center text-muted-foreground" style={{ aspectRatio: "1/2" }}><span className="text-[10px]">Image 1</span></div>
          {[1, 2].map(i => (<div key={i} className="bg-muted flex items-center justify-center text-muted-foreground" style={{ aspectRatio: "1/1" }}><span className="text-[10px]">Image {i + 1}</span></div>))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-0.5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="relative bg-muted flex items-center justify-center text-muted-foreground" style={{ aspectRatio: "1/1" }}>
            <span className="text-[10px]">Image {i + 1}</span>
            {i === 3 && capped > 4 && (<div className="absolute inset-0 bg-foreground/50 flex items-center justify-center"><span className="text-card text-lg font-bold">+{capped - 4}</span></div>)}
          </div>
        ))}
      </div>
    );
  }

  // Twitter/X: grid (max 4)
  if (platform === "twitter") {
    const count = Math.min(capped, 4);
    if (count === 2) {
      return (<div className="rounded-xl overflow-hidden grid grid-cols-2 gap-0.5">{[0, 1].map(i => (<div key={i} className="bg-muted flex items-center justify-center text-muted-foreground" style={{ aspectRatio: "4/5" }}><span className="text-[10px]">Image {i + 1}</span></div>))}</div>);
    }
    if (count >= 4) {
      return (<div className="rounded-xl overflow-hidden grid grid-cols-2 grid-rows-2 gap-0.5" style={{ aspectRatio: "16/9" }}>{[0, 1, 2, 3].map(i => (<div key={i} className="bg-muted flex items-center justify-center text-muted-foreground"><span className="text-[10px]">Image {i + 1}</span></div>))}</div>);
    }
  }

  // Reddit: gallery with counter
  if (platform === "reddit") {
    return (
      <div className="relative">
        <SingleImagePlaceholder aspect={spec.imageAspect} label={`Image ${carouselIndex + 1} of ${capped}`} />
        {carouselIndex > 0 && (<button onClick={() => setCarouselIndex(i => i - 1)} className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card/80 shadow flex items-center justify-center"><ChevronLeft className="w-3.5 h-3.5 text-foreground" /></button>)}
        {carouselIndex < capped - 1 && (<button onClick={() => setCarouselIndex(i => i + 1)} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card/80 shadow flex items-center justify-center"><ChevronRight className="w-3.5 h-3.5 text-foreground" /></button>)}
        <div className="absolute top-2 right-2 bg-foreground/70 text-card text-[10px] px-2 py-0.5 rounded-full">{carouselIndex + 1}/{capped}</div>
      </div>
    );
  }

  // Telegram, WhatsApp: media group grid
  if (platform === "telegram" || platform === "whatsapp") {
    if (capped === 2) {
      return (<div className="grid grid-cols-2 gap-0.5">{[0, 1].map(i => (<div key={i} className="bg-muted flex items-center justify-center text-muted-foreground" style={{ aspectRatio: "1/1" }}><span className="text-[10px]">Image {i + 1}</span></div>))}</div>);
    }
    return (
      <div className="grid grid-cols-2 gap-0.5">
        <div className="col-span-2 bg-muted flex items-center justify-center text-muted-foreground" style={{ aspectRatio: "16/9" }}><span className="text-[10px]">Image 1</span></div>
        {Array.from({ length: Math.min(capped - 1, 3) }).map((_, i) => (
          <div key={i} className="relative bg-muted flex items-center justify-center text-muted-foreground" style={{ aspectRatio: "1/1" }}>
            <span className="text-[10px]">Image {i + 2}</span>
            {i === 2 && capped > 4 && (<div className="absolute inset-0 bg-foreground/50 flex items-center justify-center"><span className="text-card text-lg font-bold">+{capped - 4}</span></div>)}
          </div>
        ))}
      </div>
    );
  }

  // Default: generic with counter
  return (
    <div className="relative">
      <SingleImagePlaceholder aspect={spec.imageAspect} label={`Image 1 of ${capped}`} />
      <div className="absolute top-2 right-2 bg-foreground/70 text-card text-[10px] px-2 py-0.5 rounded-full">1/{capped} images</div>
    </div>
  );
}

export function ImagePlaceholder({ platform, device, imageCount = 1 }: { platform: string; device: Device; imageCount?: number }) {
  const dims = PLATFORM_DIMENSIONS[platform];
  const spec = dims ? dims[device] : { imageAspect: "16/9", imageLabel: "1200 × 630px" };
  if (imageCount <= 1) return <SingleImagePlaceholder aspect={spec.imageAspect} label={spec.imageLabel} />;
  return <MultiImageGrid platform={platform} device={device} imageCount={imageCount} spec={spec} />;
}
