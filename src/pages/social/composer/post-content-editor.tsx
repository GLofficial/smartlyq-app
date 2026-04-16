import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Smile, Image, Film, Link2, Hash, Sparkles, ChevronDown, FileText, ImageIcon, Video } from "lucide-react";
import { cn } from "@/lib/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { PlatformBrandIcon, PLATFORM_BRANDS } from "../platform-brands";

// ---------------------------------------------------------------------------
// Unicode bold / italic character maps (social media formatting)
// ---------------------------------------------------------------------------
const BOLD_MAP: Record<string, string> = {};
const ITALIC_MAP: Record<string, string> = {};

const boldUpper = "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭";
const boldLower = "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇";
const boldDigits = "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵";
const italicUpper = "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡";
const italicLower = "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻";

const boldUpperArr = [...boldUpper];
const boldLowerArr = [...boldLower];
const italicUpperArr = [...italicUpper];
const italicLowerArr = [...italicLower];
const boldDigitsArr = [...boldDigits];

for (let i = 0; i < 26; i++) {
  BOLD_MAP[String.fromCharCode(65 + i)] = boldUpperArr[i]!;
  BOLD_MAP[String.fromCharCode(97 + i)] = boldLowerArr[i]!;
  ITALIC_MAP[String.fromCharCode(65 + i)] = italicUpperArr[i]!;
  ITALIC_MAP[String.fromCharCode(97 + i)] = italicLowerArr[i]!;
}
for (let i = 0; i < 10; i++) BOLD_MAP[String(i)] = boldDigitsArr[i]!;

function toUnicodeBold(text: string): string { return [...text].map((c) => BOLD_MAP[c] || c).join(""); }
function toUnicodeItalic(text: string): string { return [...text].map((c) => ITALIC_MAP[c] || c).join(""); }

// ---------------------------------------------------------------------------
// Platform character limits
// ---------------------------------------------------------------------------
export const PLATFORM_CHAR_LIMITS: Record<string, number> = {
  twitter: 280, instagram: 2200, facebook: 63206, facebook_page: 63206,
  linkedin: 3000, linkedin_page: 3000, tiktok: 2200, youtube: 5000,
  pinterest: 500, reddit: 40000, bluesky: 300, threads: 500,
  mastodon: 500, telegram: 4096, google: 1500, tumblr: 4096,
  wordpress: 50000, whatsapp: 4096,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface ContentEditorProps {
  content: string;
  onContentChange: (val: string) => void;
  platformContent: Record<string, string>;
  onPlatformContentChange: (pc: Record<string, string>) => void;
  customizeChannel: boolean;
  onCustomizeChannelChange: (val: boolean) => void;
  selectedPlatforms: string[];
  onOpenAiText?: () => void;
  onOpenAiImage?: () => void;
  onOpenAiVideo?: () => void;
  onOpenCanva?: () => void;
  onOpenHashtag?: () => void;
  onOpenLink?: () => void;
  onOpenImagePicker?: () => void;
  onOpenVideoPicker?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function PostContentEditor({
  content, onContentChange, platformContent, onPlatformContentChange,
  customizeChannel, onCustomizeChannelChange, selectedPlatforms,
  onOpenAiText, onOpenAiImage, onOpenAiVideo, onOpenCanva, onOpenHashtag, onOpenLink,
  onOpenImagePicker, onOpenVideoPicker,
}: ContentEditorProps) {
  const [showAiDropdown, setShowAiDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const mainRef = useRef<HTMLTextAreaElement>(null);
  const customRef = useRef<HTMLTextAreaElement>(null);

  const activeTextarea = useCallback(() => (customizeChannel ? customRef.current : mainRef.current), [customizeChannel]);

  const insertAtCursor = useCallback((text: string) => {
    const ta = activeTextarea();
    if (customizeChannel) {
      const pid = activeTab ?? selectedPlatforms[0] ?? "";
      const val = platformContent[pid] ?? content;
      const start = ta?.selectionStart ?? val.length;
      const newVal = val.slice(0, start) + text + val.slice(ta?.selectionEnd ?? start);
      onPlatformContentChange({ ...platformContent, [pid]: newVal });
      if (pid === selectedPlatforms[0]) onContentChange(newVal);
    } else {
      const start = ta?.selectionStart ?? content.length;
      const newVal = content.slice(0, start) + text + content.slice(ta?.selectionEnd ?? start);
      onContentChange(newVal);
    }
    requestAnimationFrame(() => ta?.focus());
  }, [activeTextarea, customizeChannel, activeTab, selectedPlatforms, platformContent, content, onPlatformContentChange, onContentChange]);

  const handleEmojiSelect = useCallback((emoji: { native: string }) => {
    insertAtCursor(emoji.native);
    setEmojiOpen(false);
  }, [insertAtCursor]);

  const applyFormatting = useCallback((formatter: (t: string) => string) => {
    const ta = activeTextarea();
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.slice(start, end);
    if (!selected) return;
    const formatted = formatter(selected);
    const newVal = ta.value.slice(0, start) + formatted + ta.value.slice(end);
    if (customizeChannel) {
      const pid = activeTab ?? selectedPlatforms[0] ?? "";
      onPlatformContentChange({ ...platformContent, [pid]: newVal });
      if (pid === selectedPlatforms[0]) onContentChange(newVal);
    } else {
      onContentChange(newVal);
    }
    requestAnimationFrame(() => { ta.selectionStart = start; ta.selectionEnd = start + formatted.length; ta.focus(); });
  }, [activeTextarea, customizeChannel, activeTab, selectedPlatforms, platformContent, onPlatformContentChange, onContentChange]);

  const activeCharLimit = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map((id) => PLATFORM_CHAR_LIMITS[id] ?? 2200))
    : 2200;

  const activePid = activeTab ?? selectedPlatforms[0] ?? "";
  const customizeValue = activePid ? (platformContent[activePid] ?? content) : content;
  const customizeLimit = activePid ? (PLATFORM_CHAR_LIMITS[activePid] ?? 2200) : 2200;

  // Toolbar (shared)
  const toolbar = (
    <div className="flex items-center gap-0.5 px-4 py-2">
      {/* AI dropdown */}
      <div className="relative">
        <Button size="sm" variant="ghost" className="h-8 gap-1 text-primary-foreground bg-primary hover:bg-primary/90 rounded-md px-3 text-xs" onClick={() => setShowAiDropdown((p) => !p)}>
          <Sparkles className="w-3.5 h-3.5" /> AI <ChevronDown className="w-3 h-3 ml-0.5" />
        </Button>
        {showAiDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowAiDropdown(false)} />
            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-20 min-w-[150px]">
              <button onClick={() => { setShowAiDropdown(false); onOpenAiText?.(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"><FileText className="w-4 h-4 text-primary" /> AI Text</button>
              <button onClick={() => { setShowAiDropdown(false); onOpenAiImage?.(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"><ImageIcon className="w-4 h-4 text-primary" /> AI Image</button>
              <button onClick={() => { setShowAiDropdown(false); onOpenAiVideo?.(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"><Video className="w-4 h-4 text-primary" /> AI Video</button>
            </div>
          </>
        )}
      </div>
      <div className="w-px h-5 bg-border mx-1" />
      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Bold" onClick={() => applyFormatting(toUnicodeBold)}><Bold className="w-4 h-4" /></Button>
      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Italic" onClick={() => applyFormatting(toUnicodeItalic)}><Italic className="w-4 h-4" /></Button>
      <div className="w-px h-5 bg-border mx-1" />
      <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
        <PopoverTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Emoji"><Smile className="w-4 h-4" /></Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none shadow-xl" align="start" sideOffset={8}>
          <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="auto" previewPosition="none" skinTonePosition="search" maxFrequentRows={2} />
        </PopoverContent>
      </Popover>
      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Add Image" onClick={onOpenImagePicker}><Image className="w-4 h-4" /></Button>
      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Add Video" onClick={onOpenVideoPicker}><Film className="w-4 h-4" /></Button>
      <Button size="sm" variant="ghost" className="h-8 rounded-md px-3 text-xs font-semibold text-primary-foreground bg-gradient-to-r from-[hsl(262,60%,55%)] to-[hsl(180,60%,45%)] hover:opacity-90 ml-0.5" onClick={onOpenCanva}>Canva</Button>
      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Hashtags" onClick={onOpenHashtag}><Hash className="w-4 h-4" /></Button>
      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Link" onClick={onOpenLink}><Link2 className="w-4 h-4" /></Button>
    </div>
  );

  return (
    <div className={cn("bg-card rounded-lg border border-border", selectedPlatforms.length === 0 && "opacity-50 pointer-events-none")}>
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-primary">Type content</h3>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <span>Customize channel</span>
          <div role="switch" aria-checked={customizeChannel} onClick={() => onCustomizeChannelChange(!customizeChannel)} className={cn("w-9 h-5 rounded-full relative transition-colors cursor-pointer", customizeChannel ? "bg-primary" : "bg-muted")}>
            <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform", customizeChannel ? "translate-x-4" : "translate-x-0.5")} />
          </div>
        </label>
      </div>

      {/* Customize-channel mode */}
      {customizeChannel && selectedPlatforms.length > 0 && (
        <>
          <div className="px-5 pb-2">
            <div className="flex flex-wrap gap-1.5">
              {selectedPlatforms.map((pid) => {
                const brand = PLATFORM_BRANDS[pid];
                if (!brand) return null;
                const isActive = activePid === pid;
                return (
                  <button key={pid} onClick={() => setActiveTab(pid)} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors", isActive ? `${brand.color} text-white` : "bg-muted/60 text-muted-foreground hover:bg-muted")}>
                    <PlatformBrandIcon platformId={pid} size={12} />{brand.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mx-5 mb-4 border border-border rounded-lg">
            <div className="px-4 pt-3 pb-1"><span className="text-xs text-muted-foreground">Type content</span></div>
            {toolbar}
            <div className="px-4 pb-3">
              <Textarea ref={customRef} value={customizeValue} onChange={(e) => { onPlatformContentChange({ ...platformContent, [activePid]: e.target.value }); if (activePid === selectedPlatforms[0]) onContentChange(e.target.value); }} placeholder={`Enter your ${PLATFORM_BRANDS[activePid]?.label ?? ""} content...`} className="min-h-[120px] border-none shadow-none resize-y p-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60" />
              <div className="text-xs text-muted-foreground mt-1">Char limit: {customizeValue.length} / {customizeLimit}</div>
            </div>
          </div>
        </>
      )}

      {/* Default (single) mode */}
      {!customizeChannel && (
        <>
          {toolbar}
          <div className="px-5 pb-4">
            <Textarea ref={mainRef} value={content} onChange={(e) => onContentChange(e.target.value)} placeholder="What's on your mind? Write your post here..." className="min-h-[120px] border-none shadow-none resize-y p-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60" />
            <div className="text-xs text-muted-foreground mt-1">Char limit: {content.length} / {activeCharLimit}</div>
          </div>
        </>
      )}
    </div>
  );
}
