// @ts-nocheck
import { useState, useRef, useCallback, useMemo } from "react";
import { PlatformIcon } from "./PlatformIcons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold, Italic, Smile, Image, Film, Link2, Hash,
  Sparkles, Save, CalendarDays, Send, ListOrdered, Tag, Clock,
  ChevronDown, ChevronUp, X, Trash2, Info, Heart, Plus, MessageSquareText,
  FileText, ImageIcon, Video, Search, PlusCircle, AlertTriangle, Check, RefreshCw,
  GripVertical, Play, Loader2
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useAiModels } from "@/api/ai-generate";
import { useVideoModels } from "@/api/video-gen";
import { useBrands } from "@/api/brands";

// Unicode bold/italic character maps for social media formatting
const BOLD_MAP: Record<string, string> = {};
const ITALIC_MAP: Record<string, string> = {};
const BOLD_ITALIC_MAP: Record<string, string> = {};

// Build maps for A-Z, a-z, 0-9
const boldUpper = "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭";
const boldLower = "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇";
const boldDigits = "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵";
const italicUpper = "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡";
const italicLower = "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻";
const boldItalicUpper = "𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕";
const boldItalicLower = "𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯";

for (let i = 0; i < 26; i++) {
  const upper = String.fromCharCode(65 + i);
  const lower = String.fromCharCode(97 + i);
  BOLD_MAP[upper] = [...boldUpper][i];
  BOLD_MAP[lower] = [...boldLower][i];
  ITALIC_MAP[upper] = [...italicUpper][i];
  ITALIC_MAP[lower] = [...italicLower][i];
  BOLD_ITALIC_MAP[upper] = [...boldItalicUpper][i];
  BOLD_ITALIC_MAP[lower] = [...boldItalicLower][i];
}
for (let i = 0; i < 10; i++) {
  BOLD_MAP[String(i)] = [...boldDigits][i];
}

function toUnicodeBold(text: string): string {
  return [...text].map(c => BOLD_MAP[c] || c).join("");
}
function toUnicodeItalic(text: string): string {
  return [...text].map(c => ITALIC_MAP[c] || c).join("");
}

const PLATFORMS = [
  { id: "facebook", label: "Facebook", color: "bg-[hsl(var(--facebook))]", icon: "f", charLimit: 63206 },
  { id: "facebook-page", label: "Facebook Page", color: "bg-[hsl(var(--facebook))]", icon: "f", charLimit: 63206 },
  { id: "instagram", label: "Instagram", color: "bg-[hsl(var(--instagram))]", icon: "📷", charLimit: 2200 },
  { id: "twitter", label: "X", color: "bg-[hsl(var(--twitter))]", icon: "𝕏", charLimit: 280 },
  { id: "linkedin", label: "LinkedIn", color: "bg-[hsl(var(--linkedin))]", icon: "in", charLimit: 3000 },
  { id: "linkedin-page", label: "LinkedIn Page", color: "bg-[hsl(var(--linkedin))]", icon: "in", charLimit: 3000 },
  { id: "youtube", label: "YouTube", color: "bg-[hsl(var(--youtube))]", icon: "▶", charLimit: 5000 },
  { id: "tiktok", label: "TikTok", color: "bg-[hsl(var(--tiktok))]", icon: "♪", charLimit: 2200 },
  { id: "pinterest", label: "Pinterest", color: "bg-[hsl(var(--pinterest))]", icon: "P", charLimit: 500 },
  { id: "reddit", label: "Reddit", color: "bg-[hsl(var(--reddit))]", icon: "R", charLimit: 40000 },
  { id: "threads", label: "Threads", color: "bg-[hsl(var(--threads))]", icon: "@", charLimit: 500 },
  { id: "bluesky", label: "Bluesky", color: "bg-primary", icon: "🦋", charLimit: 300 },
  { id: "mastodon", label: "Mastodon", color: "bg-[hsl(265,55%,52%)]", icon: "M", charLimit: 500 },
  { id: "telegram", label: "Telegram", color: "bg-[hsl(200,80%,50%)]", icon: "✈", charLimit: 4096 },
  { id: "google", label: "Google Business", color: "bg-[hsl(217,89%,61%)]", icon: "G", charLimit: 1500 },
  { id: "tumblr", label: "Tumblr", color: "bg-[hsl(210,25%,25%)]", icon: "t", charLimit: 4096 },
  { id: "wordpress", label: "WordPress", color: "bg-[hsl(205,60%,40%)]", icon: "W", charLimit: 50000 },
  { id: "whatsapp", label: "WhatsApp", color: "bg-[hsl(142,70%,41%)]", icon: "💬", charLimit: 4096 },
] as const;

// Demo accounts for each platform (simulating connected accounts)
interface PlatformOptionConfig {
  label: string;
  icon: string;
  postTypes?: string[];
  hasAutoLike?: boolean;
  hasFirstComments?: boolean;
  hasAltText?: boolean;
  hasLocation?: boolean;
  hasPrivacy?: string[];
  hasTags?: boolean;
  hasSubreddit?: boolean;
  hasBoard?: boolean;
  hasPlaylist?: boolean;
  hasVisibility?: string[];
  hasTitle?: boolean;
  hasCategory?: boolean;
  hasDescription?: boolean;
  hasDestinationLink?: boolean;
  hasPinTitle?: boolean;
  hasStore?: boolean;
  hasWhoCanView?: string[];
  hasAllowUsersTo?: string[];
  hasDiscloseContent?: boolean;
  hasShareToStory?: boolean;
  firstCommentNote?: string;
  limits: string[];
}

const PLATFORM_OPTIONS: Record<string, PlatformOptionConfig> = {
  threads: {
    label: "Threads Options",
    icon: "@",
    limits: [
      "Text: up to 500 characters",
      "Images: up to 10 per post (JPEG/PNG)",
      "Videos: up to 5 min (MP4)",
      "Links auto-generate preview cards",
    ],
  },
  facebook: {
    label: "Facebook Options",
    icon: "f",
    postTypes: ["Post", "Reel"],
    hasAutoLike: true,
    hasFirstComments: true,
    firstCommentNote: "Add up to 5 comments posted right after publishing. Each first comment is a separate comment.",
    limits: [
      "Text: up to 63,206 characters",
      "Images: up to 10 per post (JPEG/PNG/GIF/WebP, max 10MB each)",
      "Videos: up to 240 min (MP4/MOV, max 4GB)",
      "Reels: 3-90 seconds, vertical (9:16 recommended)",
      "Links auto-generate preview cards",
    ],
  },
  "facebook-page": {
    label: "Facebook Page Options",
    icon: "f",
    postTypes: ["Post", "Reel"],
    hasAutoLike: true,
    hasFirstComments: true,
    firstCommentNote: "Add up to 5 comments posted right after publishing. Each first comment is a separate comment.",
    limits: [
      "Text: up to 63,206 characters",
      "Images: up to 10 per post (JPEG/PNG/GIF/WebP, max 10MB each)",
      "Videos: up to 240 min (MP4/MOV, max 4GB)",
      "Reels: 3-90 seconds, vertical (9:16 recommended)",
    ],
  },
  instagram: {
    label: "Instagram Options",
    icon: "📷",
    postTypes: ["Post", "Reel", "Story"],
    hasFirstComments: true,
    firstCommentNote: "Add a comment that will be automatically posted right after publishing. Use it for hashtags or mentions.",
    hasShareToStory: true,
    limits: [
      "Caption: up to 2,200 characters",
      "Images: up to 10 per carousel (JPEG/PNG, max 8MB, 1:1 or 4:5)",
      "Reels: 3-90 seconds (MP4/MOV, 9:16 recommended)",
      "Stories: 15 seconds per slide, 9:16 aspect ratio",
    ],
  },
  linkedin: {
    label: "LinkedIn Options",
    icon: "in",
    postTypes: ["Post", "Article", "Document"],
    hasAutoLike: true,
    hasFirstComments: true,
    firstCommentNote: "Add up to 5 comments posted right after publishing. Useful for adding context or links.",
    limits: [
      "Text: up to 3,000 characters",
      "Images: up to 20 per post (JPEG/PNG, max 10MB)",
      "Videos: 3 seconds to 10 min (MP4, max 5GB)",
      "Documents: PDF up to 300 pages",
    ],
  },
  "linkedin-page": {
    label: "LinkedIn Page Options",
    icon: "in",
    postTypes: ["Post", "Article", "Document"],
    hasAutoLike: true,
    hasFirstComments: true,
    firstCommentNote: "Add up to 5 comments posted right after publishing. Useful for adding context or links.",
    limits: [
      "Text: up to 3,000 characters",
      "Images: up to 20 per post (JPEG/PNG, max 10MB)",
      "Videos: 3 seconds to 10 min (MP4, max 5GB)",
      "Documents: PDF up to 300 pages",
    ],
  },
  pinterest: {
    label: "Pinterest Options",
    icon: "P",
    hasStore: true,
    hasPinTitle: true,
    hasDestinationLink: true,
    hasAltText: true,
    hasBoard: true,
    limits: [
      "Title: up to 100 characters",
      "Description: up to 500 characters",
      "Images: JPEG/PNG, max 20MB, 2:3 ratio recommended",
      "Videos: 4 seconds to 15 min (MP4/MOV)",
    ],
  },
  tiktok: {
    label: "TikTok Options",
    icon: "♪",
    postTypes: ["Video", "Photo"],
    hasWhoCanView: ["Everyone", "Friends", "Only Me"],
    hasAllowUsersTo: ["Comment", "Duet", "Stitch"],
    hasDiscloseContent: true,
    limits: [
      "Caption: up to 2,200 characters (video), 1,000 (carousel)",
      "Videos: 3 seconds to 10 min (MP4/WebM, max 4GB)",
      "Photos: up to 35 images (JPEG/PNG, max 20MB each)",
      "Music: match to sounds/effects in-app",
    ],
  },
  tumblr: {
    label: "Tumblr Options",
    icon: "t",
    hasTags: true,
    limits: [
      "Text: up to 4,096 characters per block",
      "Images: up to 10 per post (JPEG/PNG/GIF, max 20MB)",
      "Tags: up to 30 tags, 140 characters each",
      "GIFs: 1 image or 1 set of frames, max 10MB",
    ],
  },
  twitter: {
    label: "X (Twitter) Options",
    icon: "𝕏",
    limits: [
      "Text: up to 280 characters",
      "Images: up to 4 per post (JPEG/PNG/GIF, max 5MB)",
      "Videos: up to 2 min 20 sec (MP4, max 512MB)",
      "GIFs: 1 per post, max 15MB",
    ],
  },
  youtube: {
    label: "YouTube Options",
    icon: "▶",
    postTypes: ["Video", "Short"],
    hasTitle: true,
    hasVisibility: ["Public", "Unlisted", "Private"],
    hasCategory: true,
    hasTags: true,
    hasAutoLike: true,
    hasFirstComments: true,
    firstCommentNote: "Add up to 5 comments posted right after publishing. Useful for links, timestamps, or pinned comments.",
    limits: [
      "Title: up to 100 characters",
      "Description: up to 5,000 characters",
      "Videos: up to 12 hours (MP4/MOV, max 256GB)",
      "Shorts: up to 60 seconds, vertical (9:16)",
    ],
  },
  reddit: {
    label: "Reddit Options",
    icon: "R",
    postTypes: ["Post", "Link", "Image"],
    hasSubreddit: true,
    hasTags: true,
    limits: [
      "Title: up to 300 characters",
      "Text: up to 40,000 characters",
      "Images: up to 20 per post (JPEG/PNG, max 20MB)",
      "Videos: up to 15 min (MP4, max 1GB)",
    ],
  },
  bluesky: {
    label: "Bluesky Options",
    icon: "🦋",
    limits: [
      "Text: up to 300 characters",
      "Images: up to 4 per post (JPEG/PNG, max 1MB each)",
      "No video support currently",
      "Links auto-generate preview cards",
    ],
  },
  mastodon: {
    label: "Mastodon Options",
    icon: "M",
    hasVisibility: ["Public", "Unlisted", "Followers only", "Direct"],
    limits: [
      "Text: up to 500 characters (varies by instance)",
      "Images: up to 4 per post (JPEG/PNG/GIF, max 16MB)",
      "Videos: up to 40MB (MP4/WebM)",
      "Audio: up to 40MB (MP3/OGG/WAV)",
    ],
  },
  telegram: {
    label: "Telegram Options",
    icon: "✈",
    limits: [
      "Text: up to 4,096 characters",
      "Images: JPEG/PNG, max 10MB",
      "Videos: up to 2GB (MP4)",
      "Files: up to 2GB any format",
    ],
  },
  google: {
    label: "Google Business Options",
    icon: "G",
    postTypes: ["Update", "Offer", "Event"],
    limits: [
      "Text: up to 1,500 characters",
      "Images: JPEG/PNG, min 720x720, max 5MB",
      "Videos: up to 30 seconds (MP4)",
      "Call to action button supported",
    ],
  },
  wordpress: {
    label: "WordPress Options",
    icon: "W",
    postTypes: ["Post", "Page"],
    hasVisibility: ["Public", "Private", "Password Protected"],
    hasTags: true,
    hasCategory: true,
    limits: [
      "Text: virtually unlimited",
      "Images: depends on hosting (usually 2-50MB)",
      "Supports HTML, Markdown, and Gutenberg blocks",
      "Categories and tags supported",
    ],
  },
  whatsapp: {
    label: "WhatsApp Options",
    icon: "💬",
    limits: [
      "Text: up to 4,096 characters",
      "Images: JPEG/PNG, max 16MB",
      "Videos: up to 16MB (MP4)",
      "Documents: up to 100MB",
    ],
  },
};

interface RealAccount {
  id: number;
  platform: string;
  account_name?: string;
  name?: string;
  account_username?: string;
  profile_picture?: string;
  profile_pic?: string;
  token_status?: string;
}

interface PostComposerProps {
  selectedPlatforms: string[];
  onPlatformsChange: (platforms: string[]) => void;
  content: string;
  onContentChange: (content: string) => void;
  platformContent: Record<string, string>;
  onPlatformContentChange: (pc: Record<string, string>) => void;
  customizeChannel: boolean;
  onCustomizeChannelChange: (v: boolean) => void;
  onImageCountChange?: (count: number) => void;
  onPostTypeChange?: (postTypes: Record<string, string>) => void;
  initialScheduledDate?: string;
  initialScheduledTime?: string;
  /** Real accounts from API */
  realAccounts?: RealAccount[];
  /** Callbacks for real posting actions */
  onSaveDraft?: () => void;
  onPostNow?: () => void;
  onSchedulePost?: (date: string, time: string) => void;
  isSubmitting?: boolean;
  /** Selected account IDs (real) — synced with parent */
  selectedAccountIds?: number[];
  onSelectedAccountIdsChange?: (ids: number[]) => void;
  /** AI generation callbacks */
  onAiGenerateText?: (topic: string, tone: string, contentType: string, opts?: { model?: string; brand_voice?: boolean; brand_id?: number }) => Promise<string>;
  onAiGenerateImage?: (prompt: string, opts?: { model?: string; brand_voice?: boolean; brand_id?: number }) => Promise<string>;
  onAiGenerateVideo?: (prompt: string, config: Record<string, string>) => Promise<string>;
  /** Media upload callback — returns CDN URL */
  onMediaUpload?: (file: File) => Promise<{ url: string; name: string; type: "image" | "video" }>;
  /** Canva callback — opens Canva editor */
  onCanvaDesign?: (width: string, height: string) => void;
  /** Media library items for the picker grid */
  mediaLibraryImages?: { id: string; url: string; preview_url: string; name: string }[];
  mediaLibraryVideos?: { id: string; url: string; preview_url: string; name: string }[];
  onLoadMoreMedia?: () => void;
  /** Callback when uploaded media list changes — parent can track URLs for posting */
  onUploadedMediaChange?: (media: { id: string; type: "image" | "video"; name: string; url?: string }[]) => void;
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={cn(
        "w-9 h-5 rounded-full relative transition-colors cursor-pointer",
        enabled ? "bg-primary" : "bg-muted"
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform",
          enabled ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </div>
  );
}

export default function PostComposer({
  selectedPlatforms,
  onPlatformsChange,
  content,
  onContentChange,
  platformContent,
  onPlatformContentChange,
  customizeChannel,
  onCustomizeChannelChange,
  onImageCountChange,
  onPostTypeChange,
  initialScheduledDate,
  initialScheduledTime,
  realAccounts,
  onSaveDraft,
  onPostNow,
  onSchedulePost,
  isSubmitting,
  selectedAccountIds,
  onSelectedAccountIdsChange,
  onAiGenerateText,
  onAiGenerateImage,
  onAiGenerateVideo,
  onMediaUpload,
  onCanvaDesign,
  mediaLibraryImages,
  mediaLibraryVideos,
  onLoadMoreMedia,
  onUploadedMediaChange,
}: PostComposerProps) {
  // Map real accounts to the internal format used by the UI
  // When realAccounts is provided (even empty), never show demo data
  const realAccountsProvided = Array.isArray(realAccounts);
  const ACCOUNTS = useMemo(() => {
    if (!realAccountsProvided) return [];
    return realAccounts!.map(a => ({
      id: `real-${a.id}`,
      platformId: a.platform ?? "",
      name: a.account_name || a.name || "Account",
      avatar: (a.account_name || a.name || "?").charAt(0),
      profilePic: a.profile_picture || a.profile_pic || "",
      realId: a.id,
      tokenStatus: a.token_status,
    }));
  }, [realAccountsProvided, realAccounts]);

  const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({});
  const [uploadedMedia, setUploadedMediaRaw] = useState<{ id: string; type: "image" | "video"; name: string; url?: string }[]>([]);
  const setUploadedMedia = useCallback((updater) => {
    setUploadedMediaRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      onUploadedMediaChange?.(next);
      return next;
    });
  }, [onUploadedMediaChange]);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [platformPostType, setPlatformPostType] = useState<Record<string, string>>({});
  const [autoLike, setAutoLike] = useState<Record<string, boolean>>({});
  const [showAiDropdown, setShowAiDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [platformSettings, setPlatformSettings] = useState<Record<string, Record<string, string>>>({});
  const [activeCustomizeTab, setActiveCustomizeTab] = useState<string | null>(null);
  const [tiktokAllowOptions, setTiktokAllowOptions] = useState<Record<string, boolean>>({ Comment: true, Duet: true, Stitch: true });
  const [discloseContent, setDiscloseContent] = useState<Record<string, boolean>>({});
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [thumbnailPickerOpen, setThumbnailPickerOpen] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState<number | null>(null);
  const [selectedVideoIdx, setSelectedVideoIdx] = useState<number | null>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [selectedPickerItems, setSelectedPickerItems] = useState<string[]>([]);
  const [aiTextOpen, setAiTextOpen] = useState(false);
  const [aiImageOpen, setAiImageOpen] = useState(false);
  const [aiVideoOpen, setAiVideoOpen] = useState(false);
  const [aiTextConfig, setAiTextConfig] = useState({ contentType: "Social Media Post", tone: "Professional", platform: "All Platforms", brandVoice: false, brandId: 0, model: "", topic: "", generated: "", loading: false });
  const [aiImageConfig, setAiImageConfig] = useState({ prompt: "", brandVoice: false, brandId: 0, model: "", preview: "", previewUrl: "", loading: false });
  const [aiVideoConfig, setAiVideoConfig] = useState({ type: "Text to Video", length: "5", resolution: "720p", quality: "Auto", prompt: "", brandVoice: false, brandId: 0, model: "", generateAudio: false, status: "", loading: false });

  // Fetch real models & brands
  const { data: aiModelsData } = useAiModels();
  const { data: videoModelsData } = useVideoModels();
  const { data: brandsData } = useBrands();
  const textModels = aiModelsData?.text_models ?? [];
  const imageModels = aiModelsData?.image_models ?? [];
  const videoTextModels = videoModelsData?.text_models ?? [];
  const videoImageModels = videoModelsData?.image_models ?? [];
  const brands = brandsData?.brands ?? [];
  const [canvaOpen, setCanvaOpen] = useState(false);
  const [canvaWidth, setCanvaWidth] = useState("1080");
  const [canvaHeight, setCanvaHeight] = useState("1080");
  const [hashtagOpen, setHashtagOpen] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>(["", "", ""]);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [labelDropdownOpen, setLabelDropdownOpen] = useState(false);
  const [labelSearch, setLabelSearch] = useState("");
  const [availableLabels] = useState(["facebook", "instagram", "twitter", "linkedin", "marketing", "product"]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(!!initialScheduledDate);
  const [scheduleDate, setScheduleDate] = useState(() => {
    if (initialScheduledDate) {
      // Convert YYYY-MM-DD to DD/MM/YYYY
      const [y, m, d] = initialScheduledDate.split('-');
      return `${d}/${m}/${y}`;
    }
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  });
  const [scheduleTime, setScheduleTime] = useState(() => {
    if (initialScheduledTime) return initialScheduledTime;
    const now = new Date();
    let h = now.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${ampm}`;
  });

  const scheduleSummary = useMemo(() => {
    const parts = scheduleDate.split('/');
    if (parts.length !== 3) return '';
    const [d, m, y] = parts;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `Post will be published on ${days[date.getDay()]}, ${months[date.getMonth()]} ${Number(d)}, ${y} at ${scheduleTime}`;
  }, [scheduleDate, scheduleTime]);

  const mainTextareaRef = useRef<HTMLTextAreaElement>(null);
  const customizeTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Get the active textarea ref
  const getActiveTextarea = useCallback(() => {
    if (customizeChannel) return customizeTextareaRef.current;
    return mainTextareaRef.current;
  }, [customizeChannel]);

  // Insert text at cursor position in the active textarea
  const insertAtCursor = useCallback((text: string, setter: (val: string) => void, currentVal: string) => {
    const textarea = getActiveTextarea();
    if (!textarea) {
      setter(currentVal + text);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newVal = currentVal.slice(0, start) + text + currentVal.slice(end);
    setter(newVal);
    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    });
  }, [getActiveTextarea]);

  // Apply unicode formatting to selected text
  const applyFormatting = useCallback((formatter: (text: string) => string) => {
    const textarea = getActiveTextarea();
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end);
    if (!selected) return; // Nothing selected

    const formatted = formatter(selected);
    const newVal = textarea.value.slice(0, start) + formatted + textarea.value.slice(end);

    if (customizeChannel) {
      const activePid = activeCustomizeTab || rawPlatformIds[0];
      onPlatformContentChange({ ...platformContent, [activePid]: newVal });
      if (activePid === rawPlatformIds[0]) onContentChange(newVal);
    } else {
      onContentChange(newVal);
    }

    requestAnimationFrame(() => {
      textarea.selectionStart = start;
      textarea.selectionEnd = start + formatted.length;
      textarea.focus();
    });
  }, [getActiveTextarea, customizeChannel, activeCustomizeTab, platformContent, onPlatformContentChange, onContentChange]);

  const handleEmojiSelect = useCallback((emoji: { native: string }) => {
    if (customizeChannel) {
      const activePid = activeCustomizeTab || rawPlatformIds[0];
      const val = platformContent[activePid] ?? content;
      insertAtCursor(emoji.native, (newVal) => {
        onPlatformContentChange({ ...platformContent, [activePid]: newVal });
        if (activePid === rawPlatformIds[0]) onContentChange(newVal);
      }, val);
    } else {
      insertAtCursor(emoji.native, onContentChange, content);
    }
    setEmojiOpen(false);
  }, [customizeChannel, activeCustomizeTab, platformContent, content, insertAtCursor, onPlatformContentChange, onContentChange]);

  const derivePlatforms = (ids: string[]) => [...new Set(
    ids.map(id => {
      const a = ACCOUNTS.find(x => x.id === id);
      const pid = a?.platformId ?? "";
      return pid === "facebook-page" ? "facebook" : pid === "linkedin-page" ? "linkedin" : pid;
    }).filter(Boolean)
  )];

  const syncRealIds = (ids: string[]) => {
    if (realAccountsProvided && onSelectedAccountIdsChange) {
      const realIds = ids.map(id => ACCOUNTS.find(a => a.id === id)?.realId).filter(Boolean) as number[];
      onSelectedAccountIdsChange(realIds);
    }
  };

  const toggleAccount = (accId: string) => {
    const acc = ACCOUNTS.find(a => a.id === accId);
    if (!acc) return;
    const newSelected = selectedAccounts.includes(accId)
      ? selectedAccounts.filter(id => id !== accId)
      : [...selectedAccounts, accId];
    setSelectedAccounts(newSelected);
    onPlatformsChange(derivePlatforms(newSelected));
    syncRealIds(newSelected);
  };

  const selectAll = () => {
    const filtered = filteredAccounts.map(a => a.id);
    setSelectedAccounts(filtered);
    onPlatformsChange(derivePlatforms(filtered));
    syncRealIds(filtered);
  };

  const unselectAll = () => {
    setSelectedAccounts([]);
    onPlatformsChange([]);
    syncRealIds([]);
  };

  const filteredAccounts = ACCOUNTS.filter(acc =>
    (acc.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (acc.platformId ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOptions = (id: string) => {
    setExpandedOptions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Get unique raw platform IDs from selected accounts (including sub-types)
  const rawPlatformIds = [...new Set(selectedAccounts.map(id => ACCOUNTS.find(a => a.id === id)?.platformId).filter(Boolean))] as string[];


  const activeCharLimit = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map((id) => PLATFORMS.find((p) => p.id === id)?.charLimit ?? 2200))
    : 2200;

  const handleImageUpload = () => {
    const newMedia = [...uploadedMedia, { id: `img-${uploadedMedia.length + 1}`, type: "image" as const, name: `image-${uploadedMedia.length + 1}.jpg` }];
    setUploadedMedia(newMedia);
    onImageCountChange?.(newMedia.length);
  };

  const handleVideoUpload = () => {
    const newMedia = [...uploadedMedia, { id: `vid-${uploadedMedia.length + 1}`, type: "video" as const, name: `video-${uploadedMedia.length + 1}.mp4` }];
    setUploadedMedia(newMedia);
    onImageCountChange?.(newMedia.length);
  };

  const removeMedia = (idx: number) => {
    const newMedia = uploadedMedia.filter((_, i) => i !== idx);
    setUploadedMedia(newMedia);
    onImageCountChange?.(newMedia.length);
  };

  const clearMedia = () => {
    setUploadedMedia([]);
    onImageCountChange?.(0);
  };

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const items = [...uploadedMedia];
    const [moved] = items.splice(dragIdx, 1);
    items.splice(idx, 0, moved);
    setUploadedMedia(items);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  const hasVideos = uploadedMedia.some(m => m.type === "video");

  const getPlatformForAccount = (platformId: string) => PLATFORMS.find(p => p.id === platformId);


  return (
    <div className="flex-1 min-w-0 space-y-4">
      {/* Select Accounts - Publer style */}
      <div className="bg-card rounded-lg border border-border p-5">
        <p className="text-sm font-semibold text-primary mb-3">Select Accounts</p>

        {/* Selected accounts strip */}
        <button
          onClick={() => setShowAccountDropdown(!showAccountDropdown)}
          className="w-full flex items-center justify-between border-2 border-primary/30 rounded-lg px-4 py-2.5 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {selectedAccounts.length > 0 ? (
              <div className="flex flex-wrap gap-x-2 gap-y-2 py-1 pr-1">
                {selectedAccounts.map((accId) => {
                  const acc = ACCOUNTS.find(a => a.id === accId);
                  if (!acc) return null;
                  const platform = getPlatformForAccount(acc.platformId);
                  return (
                    <div key={accId} className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold overflow-hidden">
                        {acc.profilePic ? <img src={acc.profilePic} alt="" className="w-full h-full object-cover" /> : (acc.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className={cn("absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-primary-foreground border-2 border-card", platform?.color)}>
                        <PlatformIcon platformId={acc.platformId} size={10} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Select accounts...</span>
            )}
          </div>
          {showAccountDropdown ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
        </button>

        {showAccountDropdown && (
          <div className="mt-2 border border-border rounded-lg bg-card shadow-lg overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Connect new account */}
            <div className="px-4 py-3 border-b border-border">
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium">
                <PlusCircle className="w-5 h-5" />
                Connect a new Account
              </button>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">All Accounts</span>
              <button
                onClick={selectedAccounts.length === filteredAccounts.length ? unselectAll : selectAll}
                className="text-xs font-medium text-primary hover:underline"
              >
                {selectedAccounts.length === filteredAccounts.length ? "Unselect All" : "Select All"}
              </button>
            </div>

            {/* Warning banner — only show when accounts need reconnection */}
            {(() => {
              const expired = ACCOUNTS.filter(a => a.tokenStatus === 'expired' || a.tokenStatus === 'revoked' || a.tokenStatus === 'invalid');
              if (expired.length === 0) return null;
              return (
                <div className="mx-3 mt-3 mb-1 bg-warning/15 border border-warning/30 rounded-lg px-4 py-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                  <p className="text-sm">
                    <span className="font-semibold text-foreground">{expired.length} account{expired.length > 1 ? 's' : ''} need{expired.length === 1 ? 's' : ''} reconnecting.</span>{" "}
                    <span className="text-muted-foreground">Token expired or revoked.</span>{" "}
                    <button className="text-primary font-medium hover:underline" onClick={() => window.location.href = '/my/social-media/accounts'}>Reconnect now</button>
                  </p>
                </div>
              );
            })()}

            {/* Account list */}
            <div className="max-h-[320px] overflow-y-auto py-2">
              {filteredAccounts.map((acc) => {
                const isSelected = selectedAccounts.includes(acc.id);
                const platform = getPlatformForAccount(acc.platformId);
                return (
                  <button
                    key={acc.id}
                    onClick={() => toggleAccount(acc.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                  >
                    {/* Checkbox */}
                    <div className={cn(
                      "w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors",
                      isSelected ? "bg-primary" : "border-2 border-muted-foreground/30"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>

                    {/* Avatar with platform badge */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold overflow-hidden">
                        {acc.profilePic ? <img src={acc.profilePic} alt="" className="w-full h-full object-cover" /> : (acc.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className={cn("absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-primary-foreground border-2 border-card", platform?.color)}>
                        <PlatformIcon platformId={acc.platformId} size={10} />
                      </div>
                    </div>

                    {/* Name */}
                    <span className="text-sm text-foreground text-left">{acc.name}</span>
                  </button>
                );
              })}
              {filteredAccounts.length === 0 && (
                <p className="px-4 py-6 text-sm text-muted-foreground text-center">No accounts found</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content Editor */}
      <div className={cn("bg-card rounded-lg border border-border", selectedAccounts.length === 0 && "opacity-50 pointer-events-none")}>
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-primary">Type content</h3>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <span>Customize channel</span>
            <Toggle enabled={customizeChannel} onToggle={() => onCustomizeChannelChange(!customizeChannel)} />
          </label>
        </div>

        {/* Platform tabs when customize is ON */}
        {customizeChannel && selectedPlatforms.length > 0 && (
          <div className="px-5 pb-2">
            <div className="flex flex-wrap gap-1.5">
              {rawPlatformIds.map(pid => {
                const platform = PLATFORMS.find(p => p.id === pid);
                if (!platform) return null;
                const isActive = (activeCustomizeTab || rawPlatformIds[0]) === pid;
                return (
                  <button
                    key={pid}
                    onClick={() => setActiveCustomizeTab(pid)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                      isActive
                        ? `${platform.color} text-primary-foreground`
                        : "bg-muted/60 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <PlatformIcon platformId={pid} size={12} /> {platform.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Type content label inside content box */}
        {customizeChannel && selectedPlatforms.length > 0 && (
          <div className="mx-5 border border-border rounded-lg">
            <div className="px-4 pt-3 pb-1">
              <span className="text-xs text-muted-foreground">Type content</span>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-2">
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1 text-primary-foreground bg-primary hover:bg-primary/90 rounded-md px-3 text-xs"
                  onClick={() => setShowAiDropdown(!showAiDropdown)}
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI
                </Button>
                {showAiDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAiDropdown(false)} />
                    <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-20 min-w-[150px]">
                      <button onClick={() => { setShowAiDropdown(false); setAiTextOpen(true); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <FileText className="w-4 h-4 text-primary" /> AI Text
                      </button>
                      <button onClick={() => { setShowAiDropdown(false); setAiImageOpen(true); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <ImageIcon className="w-4 h-4 text-primary" /> AI Image
                      </button>
                      <button onClick={() => { setShowAiDropdown(false); setAiVideoOpen(true); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <Video className="w-4 h-4 text-primary" /> AI Video
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="w-px h-5 bg-border mx-1" />
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Bold (select text first)" onClick={() => applyFormatting(toUnicodeBold)}>
                <Bold className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Italic (select text first)" onClick={() => applyFormatting(toUnicodeItalic)}>
                <Italic className="w-4 h-4" />
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Emoji">
                    <Smile className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-xl" align="start" sideOffset={8}>
                  <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="auto" previewPosition="none" skinTonePosition="search" maxFrequentRows={2} />
                </PopoverContent>
              </Popover>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Add Image" onClick={() => { setSelectedPickerItems([]); setImagePickerOpen(true); }}>
                <Image className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Add Video" onClick={() => { setSelectedPickerItems([]); setVideoPickerOpen(true); }}>
                <Film className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 rounded-md px-3 text-xs font-semibold text-primary-foreground bg-gradient-to-r from-[hsl(262,60%,55%)] to-[hsl(180,60%,45%)] hover:opacity-90 ml-0.5" onClick={() => setCanvaOpen(true)}>
                © Canva
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Add Hashtags" onClick={() => setHashtagOpen(true)}>
                <Hash className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Add Link" onClick={() => setLinkOpen(true)}>
                <Link2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Textarea for active platform */}
            {(() => {
              const activePid = activeCustomizeTab || rawPlatformIds[0];
              const platform = PLATFORMS.find(p => p.id === activePid);
              const charLimit = platform?.charLimit ?? 2200;
              const val = platformContent[activePid] ?? content;
              return (
                <div className="px-4 pb-3">
                  <Textarea
                    ref={customizeTextareaRef}
                    value={val}
                    onChange={(e) => {
                      onPlatformContentChange({ ...platformContent, [activePid]: e.target.value });
                      if (activePid === rawPlatformIds[0]) onContentChange(e.target.value);
                    }}
                    placeholder={`Enter your ${platform?.label ?? ''} content...`}
                    className="min-h-[120px] border-none shadow-none resize-y p-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className={val.length > charLimit ? "text-destructive font-medium" : charLimit - val.length < 20 ? "text-destructive" : charLimit - val.length < 60 ? "text-warning" : ""}>Char limit: {val.length} / {charLimit}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Default (non-customize) mode */}
        {!customizeChannel && (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-4 py-2 border-t border-border">
              <div className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1 text-primary-foreground bg-primary hover:bg-primary/90 rounded-md px-3 text-xs"
                  onClick={() => setShowAiDropdown(!showAiDropdown)}
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI
                </Button>
                {showAiDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAiDropdown(false)} />
                    <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-20 min-w-[150px]">
                      <button onClick={() => { setShowAiDropdown(false); setAiTextOpen(true); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <FileText className="w-4 h-4 text-primary" /> AI Text
                      </button>
                      <button onClick={() => { setShowAiDropdown(false); setAiImageOpen(true); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <ImageIcon className="w-4 h-4 text-primary" /> AI Image
                      </button>
                      <button onClick={() => { setShowAiDropdown(false); setAiVideoOpen(true); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                        <Video className="w-4 h-4 text-primary" /> AI Video
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="w-px h-5 bg-border mx-1" />
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Bold (select text first)" onClick={() => applyFormatting(toUnicodeBold)}>
                <Bold className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Italic (select text first)" onClick={() => applyFormatting(toUnicodeItalic)}>
                <Italic className="w-4 h-4" />
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Emoji">
                    <Smile className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-xl" align="start" sideOffset={8}>
                  <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="auto" previewPosition="none" skinTonePosition="search" maxFrequentRows={2} />
                </PopoverContent>
              </Popover>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Add Image" onClick={() => { setSelectedPickerItems([]); setImagePickerOpen(true); }}>
                <Image className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Add Video" onClick={() => { setSelectedPickerItems([]); setVideoPickerOpen(true); }}>
                <Film className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 rounded-md px-3 text-xs font-semibold text-primary-foreground bg-gradient-to-r from-[hsl(262,60%,55%)] to-[hsl(180,60%,45%)] hover:opacity-90 ml-0.5" onClick={() => setCanvaOpen(true)}>
                © Canva
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Add Hashtags" onClick={() => setHashtagOpen(true)}>
                <Hash className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Add Link" onClick={() => setLinkOpen(true)}>
                <Link2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="px-5 pb-2">
              <Textarea
                ref={mainTextareaRef}
                value={content}
                onChange={(e) => onContentChange(e.target.value)}
                placeholder={
                  selectedPlatforms.length === 0
                    ? "Please select at least one account first..."
                    : "What's on your mind? Write your post here..."
                }
                className="min-h-[120px] border-none shadow-none resize-y p-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60"
                disabled={selectedPlatforms.length === 0}
              />
              <div className="text-xs text-muted-foreground pb-1">
                <span className={content.length > activeCharLimit ? "text-destructive font-medium" : activeCharLimit - content.length < 20 ? "text-destructive" : activeCharLimit - content.length < 60 ? "text-warning" : ""}>Char limit: {content.length} / {activeCharLimit}</span>
              </div>
            </div>
          </>
        )}

        {/* Bottom padding for customize mode */}
        {customizeChannel && <div className="pb-4" />}
      </div>


      {/* Uploaded Media Grid */}
      {uploadedMedia.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Media ({uploadedMedia.length})</h3>
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive" onClick={clearMedia}>
              <Trash2 className="w-3 h-3" /> Clear all
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {uploadedMedia.map((item, idx) => (
              <div
                key={item.id}
                className="relative aspect-square rounded-lg bg-muted overflow-hidden border-2 border-transparent group"
              >
                {item.url ? (
                  item.type === "video" ? (
                    <video src={item.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {item.type === "video" ? <Film className="w-6 h-6 text-muted-foreground/30" /> : <Image className="w-6 h-6 text-muted-foreground/30" />}
                  </div>
                )}
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-foreground/50 flex items-center justify-center">
                      <Play className="w-4 h-4 text-card ml-0.5" />
                    </div>
                  </div>
                )}
                <button onClick={() => removeMedia(idx)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-foreground/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3 text-card" />
                </button>
                <span className="absolute bottom-1 left-1 right-1 text-[9px] text-card truncate bg-foreground/40 px-1 rounded">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Thumbnail Picker (shown when video is uploaded) */}
      {hasVideos && (
        <div className="bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">Video Thumbnail</h3>
            </div>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setThumbnailPickerOpen(true)}>
              <Play className="w-3 h-3" /> Pick thumbnail
            </Button>
          </div>
          <div className="px-5 pb-4">
            <p className="text-xs text-muted-foreground mb-3">
              {selectedThumbnail !== null ? `Frame ${selectedThumbnail + 1} selected` : "Auto-generated"}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedThumbnail(i); setSelectedVideoIdx(0); }}
                  className={cn(
                    "shrink-0 w-16 h-10 rounded bg-muted flex items-center justify-center text-[9px] text-muted-foreground border-2 transition-colors",
                    selectedThumbnail === i ? "border-primary" : "border-transparent hover:border-primary/30"
                  )}
                >
                  0:{String((i + 1) * 4).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Picker Dialog */}
      <Dialog open={thumbnailPickerOpen} onOpenChange={setThumbnailPickerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thumbnail picker</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-[250px_1fr] gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Custom thumbnail</h4>
                <p className="text-xs text-muted-foreground mb-3">Upload your own thumbnail or select one from the video with the "Choose frame from video" button.</p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full text-xs">Upload your own</Button>
                  <Button variant="outline" size="sm" className="w-full text-xs">Select from Library</Button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Choose frame from video</h4>
                <p className="text-xs text-muted-foreground mb-3">Scroll through the video and then click the button to capture the selection.</p>
                <Button className="w-full text-xs">📷 Capture current frame</Button>
              </div>
            </div>
            <div>
              {/* Video preview placeholder */}
              <div className="bg-foreground rounded-lg flex items-center justify-center text-card/30" style={{ aspectRatio: "16/9" }}>
                <div className="text-center">
                  <Play className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <span className="text-xs">Video preview</span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-foreground mb-2">Custom thumbnail</p>
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedThumbnail(i); }}
                      className={cn(
                        "w-16 h-10 rounded bg-muted flex items-center justify-center text-[9px] text-muted-foreground border-2 transition-colors",
                        selectedThumbnail === i ? "border-primary" : "border-transparent hover:border-primary/30"
                      )}
                    >
                      0/{String((i + 1) * 4).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setThumbnailPickerOpen(false)}>Cancel</Button>
            <Button onClick={() => setThumbnailPickerOpen(false)}>Save and update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Platform-Specific Options */}
      {rawPlatformIds.length > 0 && (
        <div className="space-y-3">
          {rawPlatformIds.map((platformId) => {
            const opts = PLATFORM_OPTIONS[platformId];
            if (!opts) return null;
            const platform = PLATFORMS.find((p) => p.id === platformId);
            const isExpanded = expandedOptions[platformId] ?? false;
            const currentPostType = platformPostType[platformId] || (opts.postTypes?.[0] ?? "Post");
            const settings = platformSettings[platformId] || {};

            return (
              <div key={platformId} className="bg-card rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => toggleOptions(platformId)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-primary-foreground", platform?.color)}>
                      <PlatformIcon platformId={platformId} size={13} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{opts.label}</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 space-y-4 border-t border-border pt-4">
                    {/* Post Type */}
                    {opts.postTypes && opts.postTypes.length > 1 && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-foreground font-medium">Post this as</span>
                        <div className="flex items-center gap-3">
                          {opts.postTypes.map((type) => (
                            <label key={type} className="flex items-center gap-1.5 cursor-pointer" onClick={() => { const next = { ...platformPostType, [platformId]: type }; setPlatformPostType(next); onPostTypeChange?.(next); }}>
                              <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", currentPostType === type ? "border-primary" : "border-muted-foreground/40")}>
                                {currentPostType === type && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                              <span className="text-sm text-foreground">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Auto-like */}
                    {opts.hasAutoLike && (
                      <div className="flex items-start gap-3">
                        <Toggle enabled={autoLike[platformId] ?? false} onToggle={() => setAutoLike((prev) => ({ ...prev, [platformId]: !prev[platformId] }))} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Heart className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Auto-like this post</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Automatically like your post right after publishing.</p>
                        </div>
                      </div>
                    )}

                    {/* First Comments */}
                    {opts.hasFirstComments && (
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <MessageSquareText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">First Comments</span>
                          </div>
                          <button className="w-6 h-6 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/10 transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{opts.firstCommentNote || "Add up to 5 comments posted right after publishing."}</p>
                      </div>
                    )}

                    {/* YouTube Title */}
                    {opts.hasTitle && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-1.5">Title (required)</span>
                        <input
                          type="text"
                          value={settings.title || ""}
                          onChange={(e) => setPlatformSettings(prev => ({
                            ...prev,
                            [platformId]: { ...prev[platformId], title: e.target.value }
                          }))}
                          placeholder="Enter video title..."
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    )}

                    {/* Privacy / Visibility */}
                    {(opts.hasPrivacy || opts.hasVisibility) && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-2">
                          {opts.hasPrivacy ? "Privacy" : "Visibility"}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(opts.hasPrivacy || opts.hasVisibility || []).map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setPlatformSettings(prev => ({
                                ...prev,
                                [platformId]: { ...prev[platformId], visibility: opt }
                              }))}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                                (settings.visibility || (opts.hasPrivacy?.[0] ?? opts.hasVisibility?.[0])) === opt
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground hover:border-primary/40"
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category (YouTube/WordPress) */}
                    {opts.hasCategory && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-1.5">Category</span>
                        <select
                          value={settings.category || ""}
                          onChange={(e) => setPlatformSettings(prev => ({
                            ...prev,
                            [platformId]: { ...prev[platformId], category: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select category...</option>
                          <option>Entertainment</option>
                          <option>Education</option>
                          <option>Science & Technology</option>
                          <option>Music</option>
                          <option>Gaming</option>
                          <option>News & Politics</option>
                          <option>Howto & Style</option>
                          <option>People & Blogs</option>
                        </select>
                      </div>
                    )}

                    {/* Store (Pinterest) */}
                    {opts.hasStore && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-1.5">Store</span>
                        <select
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option>Select store...</option>
                        </select>
                      </div>
                    )}

                    {/* Pin Title (Pinterest) */}
                    {opts.hasPinTitle && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-1.5">Pin Title</span>
                        <input
                          type="text"
                          value={settings.pinTitle || ""}
                          onChange={(e) => setPlatformSettings(prev => ({
                            ...prev,
                            [platformId]: { ...prev[platformId], pinTitle: e.target.value }
                          }))}
                          placeholder="Pin Title recommended, max 100 char."
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Chars: {(settings.pinTitle || "").length} for example</p>
                      </div>
                    )}

                    {/* Destination Link (Pinterest) */}
                    {opts.hasDestinationLink && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-1.5">Destination Link <span className="text-muted-foreground font-normal">(recommended)</span></span>
                        <input
                          type="url"
                          value={settings.destinationLink || ""}
                          onChange={(e) => setPlatformSettings(prev => ({
                            ...prev,
                            [platformId]: { ...prev[platformId], destinationLink: e.target.value }
                          }))}
                          placeholder="e.g. https://example.com/product"
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Link users to a URL when they click on your Pin.</p>
                      </div>
                    )}

                    {/* Alt Text */}
                    {opts.hasAltText && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-1.5">Alt Text <span className="text-muted-foreground font-normal">recommended, max 500 chars</span></span>
                        <Textarea
                          value={settings.altText || ""}
                          onChange={(e) => setPlatformSettings(prev => ({
                            ...prev,
                            [platformId]: { ...prev[platformId], altText: e.target.value }
                          }))}
                          placeholder="Describe your image for accessibility..."
                          className="min-h-[80px] text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">{(settings.altText || "").length} / 500</p>
                      </div>
                    )}

                    {/* Pinterest description note */}
                    {opts.hasDestinationLink && (
                      <div className="bg-muted/40 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Pro Tip:</span> Pin description is important for discoverability. 
                          Include relevant keywords and compelling copy to help increase click-through rate. A good practice is to 
                          include a call to action, like "Shop now" or "Learn more".
                        </p>
                      </div>
                    )}

                    {/* Board (Pinterest) */}
                    {opts.hasBoard && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-1.5">Board</span>
                        <select className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                          <option>Select a board...</option>
                          <option>Inspiration</option>
                          <option>Design</option>
                          <option>Marketing</option>
                        </select>
                      </div>
                    )}

                    {/* Preview checkboxes (Pinterest) */}
                    {opts.hasBoard && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-2">Preview destinations</span>
                        <div className="space-y-2">
                          {["Facebook", "Instagram"].map((dest) => (
                            <label key={dest} className="flex items-center gap-2 cursor-pointer">
                              <div className="w-4 h-4 rounded border border-border flex items-center justify-center bg-background">
                                <Check className="w-3 h-3 text-primary opacity-0" />
                              </div>
                              <span className="text-sm text-foreground">{dest}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Who can view (TikTok) */}
                    {opts.hasWhoCanView && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-2">Who can view this video</span>
                        <p className="text-xs text-muted-foreground mb-2">This applies to your post on TikTok</p>
                        <div className="flex flex-wrap gap-2">
                          {opts.hasWhoCanView.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setPlatformSettings(prev => ({
                                ...prev,
                                [platformId]: { ...prev[platformId], whoCanView: opt }
                              }))}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                                (settings.whoCanView || opts.hasWhoCanView[0]) === opt
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground hover:border-primary/40"
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Allow users to (TikTok) */}
                    {opts.hasAllowUsersTo && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-2">Allow users to</span>
                        <div className="flex flex-wrap gap-2">
                          {opts.hasAllowUsersTo.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setTiktokAllowOptions(prev => ({ ...prev, [opt]: !prev[opt] }))}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                                tiktokAllowOptions[opt]
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground hover:border-primary/40"
                              )}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Disclose content (TikTok) */}
                    {opts.hasDiscloseContent && (
                      <div className="flex items-start gap-3">
                        <Toggle
                          enabled={discloseContent[platformId] ?? false}
                          onToggle={() => setDiscloseContent(prev => ({ ...prev, [platformId]: !prev[platformId] }))}
                        />
                        <div>
                          <span className="text-sm font-medium text-foreground">Disclose video content</span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            By turning this option on, you confirm the video promotes goods or services in exchange for 
                            something of value. Your video could promote yourself, a third party, or both.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Share to Story (Instagram) */}
                    {opts.hasShareToStory && (
                      <div className="flex items-start gap-3">
                        <Toggle
                          enabled={platformSettings[platformId]?.shareToStory === "true"}
                          onToggle={() => setPlatformSettings(prev => ({
                            ...prev,
                            [platformId]: { ...prev[platformId], shareToStory: prev[platformId]?.shareToStory === "true" ? "false" : "true" }
                          }))}
                        />
                        <div>
                          <span className="text-sm font-medium text-foreground">Share to Story</span>
                          <p className="text-xs text-muted-foreground mt-0.5">Also share this post to your Instagram Story.</p>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {opts.hasLocation && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-1.5">Location</span>
                        <input
                          type="text"
                          placeholder="Add a location..."
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    )}

                    {/* Tags */}
                    {opts.hasTags && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-1.5">
                          Tags
                          {platformId === "tumblr" && <span className="text-muted-foreground font-normal ml-1">(Add up to 30 tags. Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> or <kbd className="px-1 py-0.5 bg-muted rounded text-xs">,</kbd> to add a tag)</span>}
                        </span>
                        <input
                          type="text"
                          value={settings.tags || ""}
                          onChange={(e) => setPlatformSettings(prev => ({
                            ...prev,
                            [platformId]: { ...prev[platformId], tags: e.target.value }
                          }))}
                          placeholder={platformId === "tumblr" ? "Type a tag and press Enter..." : "Add tags separated by commas..."}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {(settings.tags || "").split(",").filter(Boolean).length} / {platformId === "tumblr" ? 30 : 500} tags
                        </p>
                      </div>
                    )}

                    {/* Subreddit */}
                    {opts.hasSubreddit && (
                      <div>
                        <span className="text-sm font-medium text-foreground block mb-1.5">Subreddit</span>
                        <input
                          type="text"
                          placeholder="r/subreddit"
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    )}

                    {/* Posting Limits */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{platform?.label} posting limits:</span>
                      </div>
                      <ul className="space-y-1">
                        {opts.limits.map((limit, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="mt-0.5">•</span> {limit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* UTM & Labels */}
      <div className="bg-card rounded-lg border border-border">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Link2 className="w-4 h-4 text-muted-foreground" />
            URL Tracking (UTM)
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setExpandedOptions(prev => ({ ...prev, utm: !prev.utm }))}>
            {expandedOptions.utm ? <ChevronUp className="w-4 h-4" /> : "Configure"}
          </Button>
        </div>
        {expandedOptions.utm && (
          <div className="px-5 pb-4 border-t border-border pt-4">
            <div className="border border-border rounded-lg p-4 space-y-4">
              <p className="text-xs text-muted-foreground">UTM parameters will be appended to any URLs in your post content.</p>
              
              {/* Platform pills */}
              <div className="flex flex-wrap gap-1.5">
                {selectedPlatforms.map(pid => {
                  const p = PLATFORMS.find(pl => pl.id === pid || pl.id === pid + "-page");
                  if (!p) return null;
                  return (
                    <span key={pid} className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border text-xs text-foreground">
                      <span className={cn("w-3.5 h-3.5 rounded-full flex items-center justify-center text-primary-foreground", p.color)}><PlatformIcon platformId={pid} size={8} /></span>
                      {p.label}
                    </span>
                  );
                })}
                {selectedPlatforms.length > 0 && (
                  <button className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              {/* UTM Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Source</label>
                  <input type="text" placeholder="e.g. facebook" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Medium</label>
                  <input type="text" placeholder="e.g. social" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Campaign</label>
                <input type="text" placeholder="e.g. spring_sale" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Term (optional)</label>
                  <input type="text" placeholder="e.g. keyword" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Content (optional)</label>
                  <input type="text" placeholder="e.g. banner_ad" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>

              {/* Shorten URLs toggle */}
              <div className="flex items-start gap-3">
                <Toggle enabled={false} onToggle={() => {}} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Shorten URLs in post</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Automatically replace URLs with short trackable links.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="bg-card rounded-lg border border-border">
        <div className="px-5 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Labels
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:bg-muted hover:text-foreground">⚙ Manage</Button>
          </div>

          {/* Selected labels */}
          {selectedLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedLabels.map(label => (
                <span key={label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  {label}
                  <button onClick={() => setSelectedLabels(prev => prev.filter(l => l !== label))} className="ml-0.5 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add Label with dropdown */}
          <div className="relative inline-block">
            <button
              onClick={() => setLabelDropdownOpen(!labelDropdownOpen)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-dashed border-primary/40 text-primary text-xs font-medium hover:border-primary/60 hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Label
            </button>
            {labelDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLabelDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-2 z-20 min-w-[220px]">
                  <div className="px-3 pb-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={labelSearch}
                      onChange={(e) => setLabelSearch(e.target.value)}
                      placeholder="Search or create..."
                      className="flex-1 px-3 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      onClick={() => {
                        if (labelSearch.trim() && !availableLabels.includes(labelSearch.trim().toLowerCase())) {
                          setSelectedLabels(prev => [...prev, labelSearch.trim().toLowerCase()]);
                          setLabelSearch("");
                        }
                      }}
                      className="w-8 h-8 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/10 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-[160px] overflow-y-auto">
                    {availableLabels
                      .filter(l => l.includes(labelSearch.toLowerCase()) && !selectedLabels.includes(l))
                      .map(label => (
                        <button
                          key={label}
                          onClick={() => {
                            setSelectedLabels(prev => [...prev, label]);
                            setLabelDropdownOpen(false);
                            setLabelSearch("");
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <span className="w-3 h-3 rounded-full bg-muted-foreground" />
                          {label}
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Button variant="accent" className="flex-1 min-w-[100px] sm:min-w-[140px] text-xs sm:text-sm" disabled={isSubmitting || selectedAccounts.length === 0} onClick={onSaveDraft}><Save className="w-4 h-4" /> Save Draft</Button>
        <Button variant="success" className="flex-1 min-w-[100px] sm:min-w-[140px] text-xs sm:text-sm" disabled={isSubmitting || selectedAccounts.length === 0} onClick={() => setScheduleOpen(true)}><CalendarDays className="w-4 h-4" /> Schedule Post</Button>
        <Button className="flex-1 min-w-[100px] sm:min-w-[140px] text-xs sm:text-sm" disabled={isSubmitting || selectedAccounts.length === 0 || !content.trim()} onClick={onPostNow}><Send className="w-4 h-4" /> Post Now</Button>
        <Button variant="outline" className="min-w-[80px] sm:min-w-[120px] text-xs sm:text-sm" disabled={isSubmitting || selectedAccounts.length === 0}><ListOrdered className="w-4 h-4" /> Queue</Button>
      </div>

      {/* Image Picker Dialog */}
      <Dialog open={imagePickerOpen} onOpenChange={setImagePickerOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Images</DialogTitle>
            <p className="text-sm text-muted-foreground">You can select up to 10 images</p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Drop zone with real file input */}
            <label className="w-full border-2 border-dashed border-primary/40 rounded-xl p-8 text-center text-muted-foreground hover:border-primary/60 hover:bg-primary/5 transition-colors cursor-pointer block">
              <Image className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-foreground">Drop or Select image file</p>
              <p className="text-xs mt-1">Drop image files here or click browse</p>
              <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                const files = e.target.files;
                if (!files) return;
                for (const file of Array.from(files)) {
                  if (onMediaUpload) {
                    try {
                      const result = await onMediaUpload(file);
                      setUploadedMedia(prev => {
                        const next = [...prev, { id: `img-${Date.now()}`, type: "image" as const, name: result.name, url: result.url }];
                        onImageCountChange?.(next.length);
                        return next;
                      });
                    } catch { /* toast handled in parent */ }
                  } else {
                    setUploadedMedia(prev => {
                      const next = [...prev, { id: `img-${Date.now()}`, type: "image" as const, name: file.name }];
                      onImageCountChange?.(next.length);
                      return next;
                    });
                  }
                }
                setImagePickerOpen(false);
                e.target.value = "";
              }} />
            </label>

            {/* Media Library Grid */}
            {mediaLibraryImages && mediaLibraryImages.length > 0 && (
              <>
                <div className="grid grid-cols-5 gap-2">
                  {mediaLibraryImages.map((item) => {
                    const isSelected = selectedPickerItems.includes(String(item.id));
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedPickerItems(prev => prev.includes(String(item.id)) ? prev.filter(x => x !== String(item.id)) : prev.length < 10 ? [...prev, String(item.id)] : prev)}
                        className={cn("relative aspect-square rounded-lg bg-muted overflow-hidden border-2 transition-all hover:opacity-80", isSelected ? "border-primary ring-1 ring-primary" : "border-transparent")}
                      >
                        <img src={item.preview_url || item.url} alt={item.name} className="w-full h-full object-cover" />
                        <div className={cn("absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", isSelected ? "bg-primary border-primary" : "border-muted-foreground/40 bg-card/80")}>
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {onLoadMoreMedia && <button className="text-sm text-primary font-medium mx-auto block hover:underline" onClick={onLoadMoreMedia}>Load More</button>}
              </>
            )}
          </div>
          <DialogFooter className="border-t border-border pt-4">
            <Button variant="outline" className="text-destructive border-destructive/30" onClick={() => { setImagePickerOpen(false); setSelectedPickerItems([]); }}>Cancel</Button>
            <Button
              disabled={selectedPickerItems.length === 0}
              onClick={() => {
                selectedPickerItems.forEach(itemId => {
                  const item = mediaLibraryImages?.find(m => String(m.id) === itemId);
                  if (item) {
                    setUploadedMedia(prev => [...prev, { id: `lib-${item.id}`, type: "image", name: item.name, url: item.url }]);
                  }
                });
                onImageCountChange?.(uploadedMedia.length + selectedPickerItems.length);
                setImagePickerOpen(false);
                setSelectedPickerItems([]);
              }}
            >
              Add to Post {selectedPickerItems.length > 0 && `(${selectedPickerItems.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Picker Dialog */}
      <Dialog open={videoPickerOpen} onOpenChange={setVideoPickerOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Videos</DialogTitle>
            <p className="text-sm text-muted-foreground">You can select up to 10 videos</p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4">
            <label className="w-full border-2 border-dashed border-primary/40 rounded-xl p-8 text-center text-muted-foreground hover:border-primary/60 hover:bg-primary/5 transition-colors cursor-pointer block">
              <Film className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-foreground">Drop or Select video file</p>
              <p className="text-xs mt-1">Drop video files here or click browse</p>
              <input type="file" accept="video/*" multiple className="hidden" onChange={async (e) => {
                const files = e.target.files;
                if (!files) return;
                for (const file of Array.from(files)) {
                  if (onMediaUpload) {
                    try {
                      const result = await onMediaUpload(file);
                      setUploadedMedia(prev => {
                        const next = [...prev, { id: `vid-${Date.now()}`, type: "video" as const, name: result.name, url: result.url }];
                        onImageCountChange?.(next.length);
                        return next;
                      });
                    } catch { /* toast handled in parent */ }
                  } else {
                    setUploadedMedia(prev => {
                      const next = [...prev, { id: `vid-${Date.now()}`, type: "video" as const, name: file.name }];
                      onImageCountChange?.(next.length);
                      return next;
                    });
                  }
                }
                setVideoPickerOpen(false);
                e.target.value = "";
              }} />
            </label>

            {/* Media Library Videos */}
            {mediaLibraryVideos && mediaLibraryVideos.length > 0 && (
              <>
                <div className="grid grid-cols-5 gap-2">
                  {mediaLibraryVideos.map((item) => {
                    const isSelected = selectedPickerItems.includes(String(item.id));
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedPickerItems(prev => prev.includes(String(item.id)) ? prev.filter(x => x !== String(item.id)) : prev.length < 10 ? [...prev, String(item.id)] : prev)}
                        className={cn("relative aspect-square rounded-lg bg-muted overflow-hidden border-2 transition-all hover:opacity-80", isSelected ? "border-primary ring-1 ring-primary" : "border-transparent")}
                      >
                        {item.preview_url ? <img src={item.preview_url} alt={item.name} className="w-full h-full object-cover" /> : <Film className="w-6 h-6 text-muted-foreground/30 m-auto" />}
                        <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-foreground/50 flex items-center justify-center"><Play className="w-4 h-4 text-card ml-0.5" /></div></div>
                        <div className={cn("absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", isSelected ? "bg-primary border-primary" : "border-muted-foreground/40 bg-card/80")}>
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {onLoadMoreMedia && <button className="text-sm text-primary font-medium mx-auto block hover:underline" onClick={onLoadMoreMedia}>Load More</button>}
              </>
            )}
          </div>
          <DialogFooter className="border-t border-border pt-4">
            <Button variant="outline" className="text-destructive border-destructive/30" onClick={() => { setVideoPickerOpen(false); setSelectedPickerItems([]); }}>Cancel</Button>
            <Button
              disabled={selectedPickerItems.length === 0}
              onClick={() => {
                selectedPickerItems.forEach(itemId => {
                  const item = mediaLibraryVideos?.find(m => String(m.id) === itemId);
                  if (item) {
                    setUploadedMedia(prev => [...prev, { id: `lib-${item.id}`, type: "video", name: item.name, url: item.url }]);
                  }
                });
                onImageCountChange?.(uploadedMedia.length + selectedPickerItems.length);
                setVideoPickerOpen(false);
                setSelectedPickerItems([]);
              }}
            >
              Add to Post {selectedPickerItems.length > 0 && `(${selectedPickerItems.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Content Generation Dialog */}
      <Dialog open={aiTextOpen} onOpenChange={setAiTextOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Content Generation</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Model</label>
              {textModels.length > 0 ? (
                <select
                  value={aiTextConfig.model || textModels[0]?.model || ""}
                  onChange={(e) => setAiTextConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {textModels.map(m => (
                    <option key={m.id} value={m.model}>{m.name} ({m.provider})</option>
                  ))}
                </select>
              ) : (
                <div className="border border-border rounded-lg px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">✦</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">SmartlyQ AI</p>
                    <p className="text-xs text-muted-foreground">No text models available on your plan</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Content Type</label>
              <select
                value={aiTextConfig.contentType}
                onChange={(e) => setAiTextConfig(prev => ({ ...prev, contentType: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Social Media Post</option>
                <option>Blog Post</option>
                <option>Ad Copy</option>
                <option>Product Description</option>
                <option>Email Newsletter</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Topic/Context</label>
              <Textarea
                value={aiTextConfig.topic}
                onChange={(e) => setAiTextConfig(prev => ({ ...prev, topic: e.target.value }))}
                placeholder="Describe what you want to post about..."
                className="min-h-[100px] text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Tone</label>
              <select
                value={aiTextConfig.tone}
                onChange={(e) => setAiTextConfig(prev => ({ ...prev, tone: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Professional</option>
                <option>Casual</option>
                <option>Humorous</option>
                <option>Inspirational</option>
                <option>Formal</option>
                <option>Persuasive</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Platform</label>
              <select
                value={aiTextConfig.platform}
                onChange={(e) => setAiTextConfig(prev => ({ ...prev, platform: e.target.value }))}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>All Platforms</option>
                {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>

            {/* Brand Voice */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Brand Voice</span>
                <div className="flex items-center gap-2">
                  <Toggle enabled={aiTextConfig.brandVoice} onToggle={() => setAiTextConfig(prev => ({ ...prev, brandVoice: !prev.brandVoice, brandId: prev.brandVoice ? 0 : prev.brandId }))} />
                  <span className="text-sm text-foreground">Use Brand Voice</span>
                </div>
              </div>
              {aiTextConfig.brandVoice && brands.length > 0 && (
                <select
                  value={aiTextConfig.brandId}
                  onChange={(e) => setAiTextConfig(prev => ({ ...prev, brandId: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={0}>Choose brand...</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
              {aiTextConfig.brandVoice && brands.length === 0 && (
                <p className="text-xs text-muted-foreground">No brands configured. Go to Brands to create one.</p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Generated Content</label>
              <div className="bg-muted/40 rounded-lg px-4 py-3 min-h-[60px]">
                {aiTextConfig.loading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Generating...</div>
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {aiTextConfig.generated || 'Click "Generate Content" to create AI-powered content...'}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-border pt-4 flex gap-2">
            <Button variant="outline" onClick={() => setAiTextOpen(false)}>Cancel</Button>
            <Button
              className="bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500"
              disabled={aiTextConfig.loading || !aiTextConfig.topic.trim()}
              onClick={async () => {
                if (onAiGenerateText) {
                  try {
                    setAiTextConfig(prev => ({ ...prev, loading: true, generated: "" }));
                    const selectedModel = aiTextConfig.model || textModels[0]?.model || "";
                    const result = await onAiGenerateText(aiTextConfig.topic, aiTextConfig.tone, aiTextConfig.contentType, {
                      model: selectedModel || undefined,
                      brand_voice: aiTextConfig.brandVoice && aiTextConfig.brandId > 0 ? true : undefined,
                      brand_id: aiTextConfig.brandId > 0 ? aiTextConfig.brandId : undefined,
                    });
                    setAiTextConfig(prev => ({ ...prev, generated: result, loading: false }));
                  } catch { setAiTextConfig(prev => ({ ...prev, generated: "Generation failed. Please try again.", loading: false })); }
                } else {
                  setAiTextConfig(prev => ({ ...prev, generated: "AI text generation not connected yet." }));
                }
              }}
            >
              <Sparkles className="w-4 h-4" /> Generate Content
            </Button>
            <Button
              variant="secondary"
              className="bg-primary/20 text-primary hover:bg-primary/30"
              disabled={!aiTextConfig.generated || aiTextConfig.loading}
              onClick={() => {
                if (aiTextConfig.generated) {
                  onContentChange(content + aiTextConfig.generated);
                  setAiTextOpen(false);
                  setAiTextConfig(prev => ({ ...prev, generated: "", topic: "", loading: false }));
                }
              }}
            >
              Use This Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Image Generation Dialog */}
      <Dialog open={aiImageOpen} onOpenChange={setAiImageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Image Generation</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Model</label>
              {imageModels.length > 0 ? (
                <select
                  value={aiImageConfig.model || imageModels[0]?.model || ""}
                  onChange={(e) => setAiImageConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {imageModels.map(m => (
                    <option key={m.id} value={m.model}>{m.name} ({m.provider})</option>
                  ))}
                </select>
              ) : (
                <div className="border border-border rounded-lg px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">◆</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">SmartlyQ AI — Image</p>
                    <p className="text-xs text-muted-foreground">No image models available on your plan</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Prompt</label>
              <Textarea
                value={aiImageConfig.prompt}
                onChange={(e) => setAiImageConfig(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Describe the image you want..."
                className="min-h-[100px] text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Tip: you can paste your offer/product + what should be visible.</p>
            </div>

            {/* Brand Voice */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Brand Voice</span>
                <div className="flex items-center gap-2">
                  <Toggle enabled={aiImageConfig.brandVoice} onToggle={() => setAiImageConfig(prev => ({ ...prev, brandVoice: !prev.brandVoice, brandId: prev.brandVoice ? 0 : prev.brandId }))} />
                  <span className="text-sm text-foreground">Use Brand Voice</span>
                </div>
              </div>
              {aiImageConfig.brandVoice && brands.length > 0 && (
                <select
                  value={aiImageConfig.brandId}
                  onChange={(e) => setAiImageConfig(prev => ({ ...prev, brandId: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={0}>Choose brand...</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
              {aiImageConfig.brandVoice && brands.length === 0 && (
                <p className="text-xs text-muted-foreground">No brands configured. Go to Brands to create one.</p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Preview</label>
              <div className="bg-muted/40 rounded-lg px-4 py-3 min-h-[60px]">
                {aiImageConfig.loading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Generating image...</div>
                ) : aiImageConfig.previewUrl ? (
                  <img src={aiImageConfig.previewUrl} alt="AI Generated" className="w-full rounded-lg" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {aiImageConfig.preview || 'Click "Generate Image" to create an image.'}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-border pt-4 flex gap-2">
            <Button variant="outline" onClick={() => setAiImageOpen(false)}>Cancel</Button>
            <Button
              className="bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500"
              disabled={aiImageConfig.loading || !aiImageConfig.prompt.trim()}
              onClick={async () => {
                if (onAiGenerateImage) {
                  try {
                    setAiImageConfig(prev => ({ ...prev, loading: true, preview: "", previewUrl: "" }));
                    const selectedModel = aiImageConfig.model || imageModels[0]?.model || "";
                    const url = await onAiGenerateImage(aiImageConfig.prompt, {
                      model: selectedModel || undefined,
                      brand_voice: aiImageConfig.brandVoice && aiImageConfig.brandId > 0 ? true : undefined,
                      brand_id: aiImageConfig.brandId > 0 ? aiImageConfig.brandId : undefined,
                    });
                    setAiImageConfig(prev => ({ ...prev, previewUrl: url, preview: url, loading: false }));
                  } catch { setAiImageConfig(prev => ({ ...prev, preview: "Generation failed.", loading: false })); }
                } else {
                  setAiImageConfig(prev => ({ ...prev, preview: "AI image generation not connected yet." }));
                }
              }}
            >
              <Sparkles className="w-4 h-4" /> Generate Image
            </Button>
            <Button
              variant="secondary"
              className="bg-primary/20 text-primary hover:bg-primary/30"
              disabled={!aiImageConfig.previewUrl || aiImageConfig.loading}
              onClick={() => {
                if (aiImageConfig.previewUrl) {
                  const newMedia = [...uploadedMedia, { id: `ai-img-${Date.now()}`, type: "image" as const, name: "AI Generated Image", url: aiImageConfig.previewUrl }];
                  setUploadedMedia(newMedia);
                  onImageCountChange?.(newMedia.length);
                }
                setAiImageOpen(false);
                setAiImageConfig(prev => ({ ...prev, preview: "", previewUrl: "", prompt: "", loading: false }));
              }}
            >
              Use This Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Video Generation Dialog */}
      <Dialog open={aiVideoOpen} onOpenChange={setAiVideoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Video Generation</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-[1fr_1.5fr] gap-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Type</label>
                <select
                  value={aiVideoConfig.type}
                  onChange={(e) => setAiVideoConfig(prev => ({ ...prev, type: e.target.value, model: "" }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Text to Video</option>
                  <option>Image to Video</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Model</label>
                {(() => {
                  const availableVideoModels = aiVideoConfig.type === "Image to Video" ? videoImageModels : videoTextModels;
                  return availableVideoModels.length > 0 ? (
                    <select
                      value={aiVideoConfig.model || availableVideoModels[0]?.model || ""}
                      onChange={(e) => setAiVideoConfig(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {availableVideoModels.map(m => (
                        <option key={m.model} value={m.model}>{m.model}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="border border-border rounded-lg px-3 py-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-[8px] font-bold">▶</div>
                      <div>
                        <p className="text-xs font-medium text-foreground">No models available</p>
                        <p className="text-[10px] text-muted-foreground">Contact admin</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Length (sec)</label>
                <select
                  value={aiVideoConfig.length}
                  onChange={(e) => setAiVideoConfig(prev => ({ ...prev, length: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>5</option>
                  <option>10</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Resolution</label>
                <select
                  value={aiVideoConfig.resolution}
                  onChange={(e) => setAiVideoConfig(prev => ({ ...prev, resolution: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>480p</option>
                  <option>720p</option>
                  <option>1080p</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Quality</label>
                <select
                  value={aiVideoConfig.quality}
                  onChange={(e) => setAiVideoConfig(prev => ({ ...prev, quality: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Auto</option>
                  <option>Standard</option>
                  <option>High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Prompt</label>
              <Textarea
                value={aiVideoConfig.prompt}
                onChange={(e) => setAiVideoConfig(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Describe the video you want..."
                className="min-h-[100px] text-sm"
              />
            </div>

            {/* Brand Voice */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Brand Voice</span>
                <div className="flex items-center gap-2">
                  <Toggle enabled={aiVideoConfig.brandVoice} onToggle={() => setAiVideoConfig(prev => ({ ...prev, brandVoice: !prev.brandVoice, brandId: prev.brandVoice ? 0 : prev.brandId }))} />
                  <span className="text-sm text-foreground">Use Brand Voice</span>
                </div>
              </div>
              {aiVideoConfig.brandVoice && brands.length > 0 && (
                <select
                  value={aiVideoConfig.brandId}
                  onChange={(e) => setAiVideoConfig(prev => ({ ...prev, brandId: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={0}>Choose brand...</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
              {aiVideoConfig.brandVoice && brands.length === 0 && (
                <p className="text-xs text-muted-foreground">No brands configured. Go to Brands to create one.</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Toggle enabled={aiVideoConfig.generateAudio} onToggle={() => setAiVideoConfig(prev => ({ ...prev, generateAudio: !prev.generateAudio }))} />
              <span className="text-sm text-foreground">Generate audio (if supported)</span>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Status</label>
              <div className="bg-muted/40 rounded-lg px-4 py-3 min-h-[50px]">
                {aiVideoConfig.loading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Generating video...</div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {aiVideoConfig.status || 'Click "Generate Video" to start. You can close this modal and come back later.'}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-border pt-4 flex gap-2">
            <Button variant="outline" onClick={() => setAiVideoOpen(false)}>Cancel</Button>
            <Button
              className="bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500"
              disabled={aiVideoConfig.loading || !aiVideoConfig.prompt.trim()}
              onClick={async () => {
                if (onAiGenerateVideo) {
                  try {
                    const availableVideoModels = aiVideoConfig.type === "Image to Video" ? videoImageModels : videoTextModels;
                    const selectedModel = aiVideoConfig.model || availableVideoModels[0]?.model || "";
                    setAiVideoConfig(prev => ({ ...prev, loading: true, status: "" }));
                    const result = await onAiGenerateVideo(aiVideoConfig.prompt, { type: aiVideoConfig.type, model: selectedModel, length: aiVideoConfig.length, resolution: aiVideoConfig.resolution, quality: aiVideoConfig.quality });
                    setAiVideoConfig(prev => ({ ...prev, status: result, loading: false }));
                  } catch { setAiVideoConfig(prev => ({ ...prev, status: "Generation failed.", loading: false })); }
                } else {
                  setAiVideoConfig(prev => ({ ...prev, status: "AI video generation not connected yet." }));
                }
              }}
            >
              <Film className="w-4 h-4" /> Generate Video
            </Button>
            <Button
              variant="secondary"
              className="bg-primary/20 text-primary hover:bg-primary/30"
              disabled={!aiVideoConfig.status || aiVideoConfig.loading}
              onClick={() => {
                handleVideoUpload();
                setAiVideoOpen(false);
                setAiVideoConfig(prev => ({ ...prev, status: "", prompt: "", loading: false }));
              }}
            >
              Use This Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Design with Canva Dialog */}
      <Dialog open={canvaOpen} onOpenChange={setCanvaOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[hsl(262,60%,55%)] to-[hsl(180,60%,45%)] flex items-center justify-center text-white text-xs font-bold">©</div>
              Design with Canva
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">Choose a design size to open the Canva editor. When you're done, the image will be added to your post.</p>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Popular Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Instagram Post", size: "1080x1080" },
                  { label: "Instagram Story", size: "1080x1920" },
                  { label: "Facebook Post", size: "1200x630" },
                  { label: "Facebook Cover", size: "820x312" },
                  { label: "X / Twitter Post", size: "1200x675" },
                  { label: "LinkedIn Post", size: "1200x627" },
                  { label: "YouTube Thumbnail", size: "1280x720" },
                  { label: "TikTok Video", size: "1080x1920" },
                  { label: "Pinterest Pin", size: "1000x1500" },
                ].map(({ label, size }) => {
                  const [w, h] = size.split("x");
                  return (
                    <button
                      key={label}
                      onClick={() => { setCanvaWidth(w); setCanvaHeight(h); }}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm transition-colors",
                        canvaWidth === w && canvaHeight === h
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border text-foreground hover:border-primary/40 hover:bg-muted/30"
                      )}
                    >
                      {label} ({size})
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Custom Size</h4>
              <div className="flex items-end gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Width (px)</label>
                  <input
                    type="number"
                    value={canvaWidth}
                    onChange={(e) => setCanvaWidth(e.target.value)}
                    className="w-24 px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Height (px)</label>
                  <input
                    type="number"
                    value={canvaHeight}
                    onChange={(e) => setCanvaHeight(e.target.value)}
                    className="w-24 px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button className="bg-[hsl(230,60%,50%)] hover:bg-[hsl(230,60%,45%)] text-white" onClick={() => {
                  if (onCanvaDesign) { onCanvaDesign(canvaWidth, canvaHeight); setCanvaOpen(false); }
                }}>
                  Open Canva
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button className="text-sm text-destructive hover:underline" onClick={() => { if (confirm("Disconnect Canva? You can reconnect later from Social Accounts.")) { fetch("/my/canva", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "disconnect" }) }).then(() => { setCanvaOpen(false); }); } }}>Disconnect Canva</button>
              <Button variant="outline" onClick={() => setCanvaOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Hashtags Dialog */}
      <Dialog open={hashtagOpen} onOpenChange={setHashtagOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Hashtags</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter your tags below. We'll handle the # and spacing.</p>
            <div className="space-y-3">
              {hashtags.map((tag, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xl text-muted-foreground font-light">#</span>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => {
                      const newTags = [...hashtags];
                      newTags[idx] = e.target.value;
                      setHashtags(newTags);
                    }}
                    placeholder="e.g. mindfulness"
                    className="flex-1 px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    onClick={() => {
                      if (hashtags.length > 1) {
                        setHashtags(hashtags.filter((_, i) => i !== idx));
                      } else {
                        const newTags = [...hashtags];
                        newTags[idx] = "";
                        setHashtags(newTags);
                      }
                    }}
                    className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setHashtags([...hashtags, ""])}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-dashed border-primary/40 text-primary text-sm font-medium hover:border-primary/60 hover:bg-primary/5 transition-colors"
            >
              + Add Hashtag
            </button>
          </div>
          <DialogFooter className="border-t border-border pt-4">
            <Button variant="outline" onClick={() => setHashtagOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                const validTags = hashtags.filter(t => t.trim());
                if (validTags.length > 0) {
                  const hashtagText = "\n\n" + validTags.map(t => `#${t.trim().replace(/\s+/g, "")}`).join(" ");
                  onContentChange(content + hashtagText);
                }
                setHashtagOpen(false);
              }}
            >
              Add to Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Link Dialog */}
      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Paste or type a URL to insert into your post.</p>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <DialogFooter className="border-t border-border pt-4">
            <Button variant="outline" onClick={() => { setLinkOpen(false); setLinkUrl(""); }}>Cancel</Button>
            <Button
              disabled={!linkUrl.trim()}
              onClick={() => {
                if (linkUrl.trim()) {
                  onContentChange(content + (content ? " " : "") + linkUrl.trim());
                  setLinkOpen(false);
                  setLinkUrl("");
                }
              }}
            >
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select date</label>
              <div className="relative">
                <input
                  type="text"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="DD/MM/YYYY"
                />
                <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select time</label>
              <div className="relative">
                <input
                  type="text"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="HH:MM AM/PM"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm font-medium text-[hsl(var(--destructive))]">
              {scheduleSummary}
            </p>

            {/* Suggested times */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <Sparkles className="w-4 h-4" />
                  Suggested times
                </div>
                <button className="text-sm font-medium text-primary hover:underline">Refresh</button>
              </div>
              <p className="text-xs text-muted-foreground">Could not load suggestions.</p>
            </div>
          </div>

          <Button
            className="w-full mt-2"
            disabled={isSubmitting}
            onClick={() => {
              if (onSchedulePost) {
                // Convert DD/MM/YYYY to YYYY-MM-DD
                const parts = scheduleDate.split('/');
                if (parts.length === 3) {
                  const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                  onSchedulePost(isoDate, scheduleTime);
                }
              }
              setScheduleOpen(false);
            }}
          >
            Post
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
