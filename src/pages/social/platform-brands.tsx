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
} from "react-icons/si";
import { FaXTwitter, FaLinkedinIn, FaGoogle } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

export interface PlatformBrand {
  label: string;
  color: string;
  brandColor: string;
  Icon: IconType;
}

export const PLATFORM_BRANDS: Record<string, PlatformBrand> = {
  facebook:      { label: "Facebook",        color: "bg-[#1877F2]",  brandColor: "#1877F2", Icon: SiFacebook },
  facebook_page: { label: "Facebook Page",   color: "bg-[#1877F2]",  brandColor: "#1877F2", Icon: SiFacebook },
  instagram:     { label: "Instagram",        color: "bg-[#E4405F]",  brandColor: "#E4405F", Icon: SiInstagram },
  twitter:       { label: "X",               color: "bg-[#000000]",  brandColor: "#000000", Icon: FaXTwitter },
  linkedin:      { label: "LinkedIn",         color: "bg-[#0A66C2]",  brandColor: "#0A66C2", Icon: FaLinkedinIn },
  linkedin_page: { label: "LinkedIn Page",   color: "bg-[#0A66C2]",  brandColor: "#0A66C2", Icon: FaLinkedinIn },
  youtube:       { label: "YouTube",          color: "bg-[#FF0000]",  brandColor: "#FF0000", Icon: SiYoutube },
  tiktok:        { label: "TikTok",           color: "bg-[#000000]",  brandColor: "#000000", Icon: SiTiktok },
  pinterest:     { label: "Pinterest",        color: "bg-[#BD081C]",  brandColor: "#BD081C", Icon: SiPinterest },
  reddit:        { label: "Reddit",           color: "bg-[#FF4500]",  brandColor: "#FF4500", Icon: SiReddit },
  threads:       { label: "Threads",          color: "bg-[#000000]",  brandColor: "#000000", Icon: SiThreads },
  bluesky:       { label: "Bluesky",          color: "bg-[#0085FF]",  brandColor: "#0085FF", Icon: SiBluesky },
  mastodon:      { label: "Mastodon",         color: "bg-[#6364FF]",  brandColor: "#6364FF", Icon: SiMastodon },
  telegram:      { label: "Telegram",         color: "bg-[#26A5E4]",  brandColor: "#26A5E4", Icon: SiTelegram },
  google:        { label: "Google Business",  color: "bg-[#4285F4]",  brandColor: "#4285F4", Icon: FaGoogle },
  tumblr:        { label: "Tumblr",           color: "bg-[#36465D]",  brandColor: "#36465D", Icon: SiTumblr },
  wordpress:     { label: "WordPress",        color: "bg-[#21759B]",  brandColor: "#21759B", Icon: SiWordpress },
  whatsapp:      { label: "WhatsApp",         color: "bg-[#25D366]",  brandColor: "#25D366", Icon: SiWhatsapp },
};

interface PlatformBrandIconProps {
  platformId: string;
  size?: number;
  className?: string;
}

/** Renders a colored circle with the platform's brand icon centered inside. */
export function PlatformBrandIcon({ platformId, size = 20, className }: PlatformBrandIconProps) {
  const brand = PLATFORM_BRANDS[platformId];
  if (!brand) return null;

  const IconComp = brand.Icon;
  const circleSize = size + 8;

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white shrink-0",
        brand.color,
        className,
      )}
      style={{ width: circleSize, height: circleSize }}
    >
      <IconComp size={size * 0.6} />
    </div>
  );
}
