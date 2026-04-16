import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Heart, MessageSquareText, Plus, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { PlatformBrandIcon, PLATFORM_BRANDS } from "../platform-brands";

// ---------------------------------------------------------------------------
// Per-platform option config
// ---------------------------------------------------------------------------
interface OptCfg {
  postTypes?: string[];
  hasAutoLike?: boolean;
  hasFirstComments?: boolean;
  firstCommentNote?: string;
  hasShareToStory?: boolean;
  hasWhoCanView?: string[];
  hasAllowUsersTo?: string[];
  hasDiscloseContent?: boolean;
  hasTitle?: boolean;
  hasCategory?: boolean;
  hasTags?: boolean;
  hasVisibility?: string[];
  hasPinTitle?: boolean;
  hasDestinationLink?: boolean;
  hasAltText?: boolean;
  hasBoard?: boolean;
  limits: string[];
}

const FB_OPTS: OptCfg = {
  postTypes: ["Post", "Reel"], hasAutoLike: true, hasFirstComments: true,
  firstCommentNote: "Add up to 5 comments posted right after publishing.",
  limits: ["Text: 63,206 chars", "Images: 10/post, 10 MB", "Videos: 240 min, 4 GB", "Reels: 3-90 s, 9:16"],
};
const LI_OPTS: OptCfg = {
  postTypes: ["Post", "Article", "Document"], hasAutoLike: true, hasFirstComments: true,
  firstCommentNote: "Add up to 5 comments posted right after publishing.",
  limits: ["Text: 3,000 chars", "Images: 20/post, 10 MB", "Videos: 3 s-10 min, 5 GB", "Documents: PDF, 300 pages"],
};

const OPTIONS: Record<string, OptCfg> = {
  facebook: FB_OPTS, facebook_page: FB_OPTS,
  instagram: {
    postTypes: ["Post", "Reel", "Story"], hasFirstComments: true,
    firstCommentNote: "Automatically posted right after publishing. Use for hashtags/mentions.",
    hasShareToStory: true,
    limits: ["Caption: 2,200 chars", "Images: 10/carousel, 1:1 or 4:5", "Reels: 3-90 s, 9:16", "Stories: 15 s/slide"],
  },
  linkedin: LI_OPTS, linkedin_page: LI_OPTS,
  tiktok: {
    postTypes: ["Video", "Photo"], hasWhoCanView: ["Everyone", "Friends", "Only Me"],
    hasAllowUsersTo: ["Comment", "Duet", "Stitch"], hasDiscloseContent: true,
    limits: ["Caption: 2,200 chars", "Videos: 3 s-10 min, 4 GB", "Photos: 35 images, 20 MB each"],
  },
  youtube: {
    postTypes: ["Video", "Short"], hasTitle: true, hasCategory: true, hasTags: true,
    hasVisibility: ["Public", "Unlisted", "Private"], hasAutoLike: true, hasFirstComments: true,
    firstCommentNote: "Add up to 5 comments posted right after publishing.",
    limits: ["Title: 100 chars", "Description: 5,000 chars", "Videos: 12 h, 256 GB", "Shorts: 60 s, 9:16"],
  },
  pinterest: {
    hasPinTitle: true, hasDestinationLink: true, hasAltText: true, hasBoard: true,
    limits: ["Title: 100 chars", "Description: 500 chars", "Images: 20 MB, 2:3", "Videos: 4 s-15 min"],
  },
  twitter: { limits: ["Text: 280 chars", "Images: 4/post, 5 MB", "Videos: 2 min 20 s, 512 MB", "GIFs: 1/post, 15 MB"] },
  bluesky: { limits: ["Text: 300 chars", "Images: 4/post, 1 MB each", "No video support", "Links auto-preview"] },
  threads: { limits: ["Text: 500 chars", "Images: 10/post", "Videos: 5 min"] },
  reddit: {
    postTypes: ["Post", "Link", "Image"], hasTags: true,
    limits: ["Title: 300 chars", "Text: 40,000 chars", "Images: 20/post", "Videos: 15 min, 1 GB"],
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface PlatformOptionsProps {
  selectedPlatforms: string[];
  platformSettings: Record<string, Record<string, any>>;
  onSettingsChange: (platform: string, key: string, value: any) => void;
  platformPostType: Record<string, string>;
  onPostTypeChange: (platform: string, type: string) => void;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function PostPlatformOptions({
  selectedPlatforms, platformSettings, onSettingsChange, platformPostType, onPostTypeChange,
}: PlatformOptionsProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (pid: string) => setExpanded((p) => ({ ...p, [pid]: !p[pid] }));

  return (
    <div className="space-y-3">
      {selectedPlatforms.map((pid) => {
        const opts = OPTIONS[pid];
        if (!opts) return null;
        const brand = PLATFORM_BRANDS[pid];
        if (!brand) return null;
        const isOpen = expanded[pid] ?? false;
        const s = platformSettings[pid] ?? {};
        const postType = platformPostType[pid] || opts.postTypes?.[0] || "Post";

        return (
          <div key={pid} className="bg-card rounded-lg border border-border overflow-hidden">
            <button onClick={() => toggle(pid)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <PlatformBrandIcon platformId={pid} size={14} />
                <span className="text-sm font-medium text-foreground">{brand.label} Options</span>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {isOpen && (
              <div className="px-5 pb-4 space-y-4 border-t border-border pt-4">
                {opts.postTypes && opts.postTypes.length > 1 && (
                  <PostTypeRadios types={opts.postTypes} current={postType} onChange={(t) => onPostTypeChange(pid, t)} />
                )}
                {opts.hasAutoLike && (
                  <ToggleRow icon={<Heart className="w-4 h-4 text-muted-foreground" />} label="Auto-like this post" desc="Automatically like your post right after publishing." checked={s.autoLike === true} onCheck={(v) => onSettingsChange(pid, "autoLike", v)} />
                )}
                {opts.hasFirstComments && (
                  <FirstComments note={opts.firstCommentNote ?? ""} comments={s.firstComments ?? [""]} onChange={(c) => onSettingsChange(pid, "firstComments", c)} />
                )}
                {opts.hasShareToStory && (
                  <ToggleRow label="Share to Story" desc="Automatically share this post to your Instagram Story." checked={s.shareToStory === true} onCheck={(v) => onSettingsChange(pid, "shareToStory", v)} />
                )}
                {opts.hasWhoCanView && (
                  <Pills label="Who can view this video" options={opts.hasWhoCanView} value={s.whoCanView ?? opts.hasWhoCanView[0]} onChange={(v) => onSettingsChange(pid, "whoCanView", v)} />
                )}
                {opts.hasAllowUsersTo && (
                  <MultiPills label="Allow users to" options={opts.hasAllowUsersTo} selected={s.allowUsersTo ?? Object.fromEntries(opts.hasAllowUsersTo.map((o) => [o, true]))} onChange={(v) => onSettingsChange(pid, "allowUsersTo", v)} />
                )}
                {opts.hasDiscloseContent && (
                  <ToggleRow label="Disclose video content" desc="Confirm the video promotes goods or services in exchange for something of value." checked={s.discloseContent === true} onCheck={(v) => onSettingsChange(pid, "discloseContent", v)} />
                )}
                {opts.hasTitle && (
                  <Field label="Title (required)">
                    <Input value={s.title ?? ""} onChange={(e) => onSettingsChange(pid, "title", e.target.value)} placeholder="Enter video title..." />
                  </Field>
                )}
                {opts.hasCategory && (
                  <Field label="Category">
                    <Select value={s.category ?? ""} onValueChange={(v) => onSettingsChange(pid, "category", v)}>
                      <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                      <SelectContent>
                        {["Entertainment", "Education", "Science & Technology", "Music", "Gaming", "News & Politics", "Howto & Style", "People & Blogs"].map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
                {opts.hasTags && (
                  <Field label="Tags">
                    <Input value={s.tags ?? ""} onChange={(e) => onSettingsChange(pid, "tags", e.target.value)} placeholder="Enter tags separated by commas..." />
                  </Field>
                )}
                {opts.hasVisibility && (
                  <Pills label="Visibility" options={opts.hasVisibility} value={s.visibility ?? opts.hasVisibility[0]} onChange={(v) => onSettingsChange(pid, "visibility", v)} />
                )}
                {opts.hasPinTitle && (
                  <Field label="Pin Title">
                    <Input value={s.pinTitle ?? ""} onChange={(e) => onSettingsChange(pid, "pinTitle", e.target.value)} placeholder="Max 100 chars" />
                    <p className="text-xs text-muted-foreground mt-1">{(s.pinTitle ?? "").length} / 100</p>
                  </Field>
                )}
                {opts.hasDestinationLink && (
                  <Field label="Destination Link (recommended)">
                    <Input type="url" value={s.destinationLink ?? ""} onChange={(e) => onSettingsChange(pid, "destinationLink", e.target.value)} placeholder="https://example.com/product" />
                    <p className="text-xs text-muted-foreground mt-1">Link users to a URL when they click on your Pin.</p>
                  </Field>
                )}
                {opts.hasAltText && (
                  <Field label="Alt Text (max 500 chars)">
                    <Textarea value={s.altText ?? ""} onChange={(e) => onSettingsChange(pid, "altText", e.target.value)} placeholder="Describe your image for accessibility..." className="min-h-[80px]" />
                    <p className="text-xs text-muted-foreground mt-1">{(s.altText ?? "").length} / 500</p>
                  </Field>
                )}
                {opts.hasBoard && (
                  <Field label="Board">
                    <Select value={s.board ?? ""} onValueChange={(v) => onSettingsChange(pid, "board", v)}>
                      <SelectTrigger><SelectValue placeholder="Select a board..." /></SelectTrigger>
                      <SelectContent>
                        {["Inspiration", "Design", "Marketing"].map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
                <LimitsBox limits={opts.limits} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function PostTypeRadios({ types, current, onChange }: { types: string[]; current: string; onChange: (t: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground font-medium">Post this as</span>
      {types.map((t) => (
        <label key={t} className="flex items-center gap-1.5 cursor-pointer" onClick={() => onChange(t)}>
          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", current === t ? "border-primary" : "border-muted-foreground/40")}>
            {current === t && <div className="w-2 h-2 rounded-full bg-primary" />}
          </div>
          <span className="text-sm text-foreground">{t}</span>
        </label>
      ))}
    </div>
  );
}

function ToggleRow({ icon, label, desc, checked, onCheck }: { icon?: React.ReactNode; label: string; desc: string; checked: boolean; onCheck: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-3">
      <div role="switch" aria-checked={checked} onClick={() => onCheck(!checked)} className={cn("w-9 h-5 rounded-full relative transition-colors cursor-pointer shrink-0 mt-0.5", checked ? "bg-primary" : "bg-muted")}>
        <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform", checked ? "translate-x-4" : "translate-x-0.5")} />
      </div>
      <div>
        <div className="flex items-center gap-1.5">{icon}<span className="text-sm font-medium text-foreground">{label}</span></div>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function FirstComments({ note, comments, onChange }: { note: string; comments: string[]; onChange: (c: string[]) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MessageSquareText className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">First Comments</span>
        </div>
        {comments.length < 5 && (
          <button onClick={() => onChange([...comments, ""])} className="w-6 h-6 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/10 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1 mb-2">{note}</p>
      <div className="space-y-2">
        {comments.map((c, i) => (
          <Input key={i} value={c} onChange={(e) => { const n = [...comments]; n[i] = e.target.value; onChange(n); }} placeholder={`Comment ${i + 1}...`} />
        ))}
      </div>
    </div>
  );
}

function Pills({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span className="text-sm font-medium text-foreground block mb-2">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", value === o ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40")}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function MultiPills({ label, options, selected, onChange }: { label: string; options: string[]; selected: Record<string, boolean>; onChange: (v: Record<string, boolean>) => void }) {
  return (
    <div>
      <span className="text-sm font-medium text-foreground block mb-2">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} onClick={() => onChange({ ...selected, [o]: !selected[o] })} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", selected[o] ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40")}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><span className="text-sm font-medium text-foreground block mb-1.5">{label}</span>{children}</div>;
}

function LimitsBox({ limits }: { limits: string[] }) {
  return (
    <div className="bg-muted/40 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Info className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground">Platform limits</span>
      </div>
      <ul className="space-y-0.5">
        {limits.map((l) => <li key={l} className="text-xs text-muted-foreground">{l}</li>)}
      </ul>
    </div>
  );
}
