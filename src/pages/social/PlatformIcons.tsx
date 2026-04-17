import {
  SiFacebook,
  SiInstagram,
  SiTiktok,
  SiYoutube,
  SiPinterest,
  SiReddit,
  SiBluesky,
  SiThreads,
  SiMastodon,
  SiTelegram,
  SiWordpress,
  SiWhatsapp,
  SiTumblr,
  SiSnapchat,
} from "react-icons/si";
import { FaXTwitter, FaLinkedinIn, FaGoogle } from "react-icons/fa6";
import type { IconType } from "react-icons";

export interface PlatformBrand {
  label: string;
  color: string;
  brandColor: string;
  Icon: IconType;
}

export const PLATFORM_BRANDS: Record<string, PlatformBrand> = {
  facebook: { label: "Facebook", color: "bg-[hsl(var(--facebook))]", brandColor: "#1877F2", Icon: SiFacebook },
  facebook_page: { label: "Facebook Page", color: "bg-[hsl(var(--facebook))]", brandColor: "#1877F2", Icon: SiFacebook },
  instagram: { label: "Instagram", color: "bg-[hsl(var(--instagram))]", brandColor: "#E4405F", Icon: SiInstagram },
  twitter: { label: "X", color: "bg-[hsl(var(--twitter))]", brandColor: "#000000", Icon: FaXTwitter },
  linkedin: { label: "LinkedIn", color: "bg-[hsl(var(--linkedin))]", brandColor: "#0A66C2", Icon: FaLinkedinIn },
  linkedin_page: { label: "LinkedIn Page", color: "bg-[hsl(var(--linkedin))]", brandColor: "#0A66C2", Icon: FaLinkedinIn },
  youtube: { label: "YouTube", color: "bg-[hsl(var(--youtube))]", brandColor: "#FF0000", Icon: SiYoutube },
  tiktok: { label: "TikTok", color: "bg-[hsl(var(--tiktok))]", brandColor: "#000000", Icon: SiTiktok },
  pinterest: { label: "Pinterest", color: "bg-[hsl(var(--pinterest))]", brandColor: "#BD081C", Icon: SiPinterest },
  reddit: { label: "Reddit", color: "bg-[hsl(var(--reddit))]", brandColor: "#FF4500", Icon: SiReddit },
  threads: { label: "Threads", color: "bg-[hsl(var(--threads))]", brandColor: "#000000", Icon: SiThreads },
  bluesky: { label: "Bluesky", color: "bg-primary", brandColor: "#0085FF", Icon: SiBluesky },
  mastodon: { label: "Mastodon", color: "bg-[hsl(265,55%,52%)]", brandColor: "#6364FF", Icon: SiMastodon },
  telegram: { label: "Telegram", color: "bg-[hsl(200,80%,50%)]", brandColor: "#26A5E4", Icon: SiTelegram },
  google: { label: "Google Business", color: "bg-[hsl(217,89%,61%)]", brandColor: "#4285F4", Icon: FaGoogle },
  tumblr: { label: "Tumblr", color: "bg-[hsl(210,25%,25%)]", brandColor: "#36465D", Icon: SiTumblr },
  wordpress: { label: "WordPress", color: "bg-[hsl(205,60%,40%)]", brandColor: "#21759B", Icon: SiWordpress },
  whatsapp: { label: "WhatsApp", color: "bg-[hsl(142,70%,41%)]", brandColor: "#25D366", Icon: SiWhatsapp },
  snapchat: { label: "Snapchat", color: "bg-[hsl(54,100%,50%)]", brandColor: "#FFFC00", Icon: SiSnapchat },
};

export function PlatformIcon({ platformId, size = 16, className }: { platformId: string; size?: number; className?: string }) {
  const brand = PLATFORM_BRANDS[platformId];
  if (!brand) return null;
  const IconComp = brand.Icon;
  return <IconComp size={size} className={className} style={{ display: "block" }} />;
}

// Per-brand optical adjustments (fractional translate of icon relative to its own size)
// Values are in "icon-pixels"; tuned so glyphs like Facebook's "f", LinkedIn "in", Pinterest "P" sit visually centered.
const ICON_NUDGE: Record<string, { x?: number; y?: number }> = {
  facebook: { x: 0.5 },
  facebook_page: { x: 0.5 },
  linkedin: { x: 0.5 },
  linkedin_page: { x: 0.5 },
  pinterest: { x: 0.5 },
  tumblr: { x: 0.5 },
  twitter: { y: 0.5 },
};

/** Colored circle badge with platform icon inside — use for small badges on calendar cards, account strips, etc. */
export function PlatformBadge({ platformId, size = 18 }: { platformId: string; size?: number }) {
  const brand = PLATFORM_BRANDS[platformId];
  if (!brand) return null;
  const IconComp = brand.Icon;
  const iconSize = Math.max(Math.round(size * 0.6), 8);
  const nudge = ICON_NUDGE[platformId];
  const transform = nudge ? `translate(${nudge.x ?? 0}px, ${nudge.y ?? 0}px)` : undefined;
  return (
    <span
      className="inline-grid place-items-center rounded-full shrink-0 leading-none text-white"
      style={{ width: size, height: size, backgroundColor: brand.brandColor }}
    >
      <IconComp size={iconSize} style={{ display: "block", transform }} />
    </span>
  );
}
