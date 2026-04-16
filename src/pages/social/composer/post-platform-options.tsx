import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Heart, MessageSquareText, Plus, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { PlatformBrandIcon, PLATFORM_BRANDS } from "../platform-brands";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface PlatformOptionConfig {
  label: string;
  postTypes?: string[];
  hasAutoLike?: boolean;
  hasFirstComments?: boolean;
  hasShareToStory?: boolean;
  hasTitle?: boolean;
  hasVisibility?: string[];
  hasPrivacy?: string[];
  hasCategory?: boolean;
  hasTags?: boolean;
  hasSubreddit?: boolean;
  hasBoard?: boolean;
  hasPinTitle?: boolean;
  hasDestinationLink?: boolean;
  hasAltText?: boolean;
  hasStore?: boolean;
  hasWhoCanView?: string[];
  hasAllowUsersTo?: string[];
  hasDiscloseContent?: boolean;
  firstCommentNote?: string;
  limits: string[];
}

const PLATFORM_OPTIONS: Record<string, PlatformOptionConfig> = {
  threads: { label: "Threads Options", limits: ["Text: up to 500 characters", "Images: up to 10 per post (JPEG/PNG)", "Videos: up to 5 min (MP4)", "Links auto-generate preview cards"] },
  facebook: { label: "Facebook Options", postTypes: ["Post", "Reel"], hasAutoLike: true, hasFirstComments: true, firstCommentNote: "Add up to 5 comments posted right after publishing.", limits: ["Text: up to 63,206 characters", "Images: up to 10 per post (max 10MB each)", "Videos: up to 240 min (MP4/MOV, max 4GB)", "Reels: 3-90 seconds, vertical (9:16)"] },
  facebook_page: { label: "Facebook Page Options", postTypes: ["Post", "Reel"], hasAutoLike: true, hasFirstComments: true, firstCommentNote: "Add up to 5 comments posted right after publishing.", limits: ["Text: up to 63,206 characters", "Images: up to 10 per post (max 10MB each)", "Videos: up to 240 min (MP4/MOV, max 4GB)", "Reels: 3-90 seconds, vertical (9:16)"] },
  instagram: { label: "Instagram Options", postTypes: ["Post", "Reel", "Story"], hasFirstComments: true, hasShareToStory: true, firstCommentNote: "Add a comment that will be automatically posted right after publishing.", limits: ["Caption: up to 2,200 characters", "Images: up to 10 per carousel (1:1 or 4:5)", "Reels: 3-90 seconds (9:16)", "Stories: 15 seconds per slide, 9:16"] },
  linkedin: { label: "LinkedIn Options", postTypes: ["Post", "Article", "Document"], hasAutoLike: true, hasFirstComments: true, firstCommentNote: "Add up to 5 comments posted right after publishing.", limits: ["Text: up to 3,000 characters", "Images: up to 20 per post (max 10MB)", "Videos: 3s to 10 min (max 5GB)", "Documents: PDF up to 300 pages"] },
  linkedin_page: { label: "LinkedIn Page Options", postTypes: ["Post", "Article", "Document"], hasAutoLike: true, hasFirstComments: true, limits: ["Text: up to 3,000 characters", "Images: up to 20 (max 10MB)", "Videos: 3s to 10 min (max 5GB)", "Documents: PDF up to 300 pages"] },
  pinterest: { label: "Pinterest Options", hasStore: true, hasPinTitle: true, hasDestinationLink: true, hasAltText: true, hasBoard: true, limits: ["Title: up to 100 characters", "Description: up to 500 characters", "Images: JPEG/PNG, max 20MB, 2:3 ratio", "Videos: 4s to 15 min (MP4/MOV)"] },
  tiktok: { label: "TikTok Options", postTypes: ["Video", "Photo"], hasWhoCanView: ["Everyone", "Friends", "Only Me"], hasAllowUsersTo: ["Comment", "Duet", "Stitch"], hasDiscloseContent: true, limits: ["Caption: up to 2,200 characters", "Videos: 3s to 10 min (max 4GB)", "Photos: up to 35 images (max 20MB each)"] },
  twitter: { label: "X (Twitter) Options", limits: ["Text: up to 280 characters", "Images: up to 4 per post (max 5MB)", "Videos: up to 2 min 20 sec (max 512MB)", "GIFs: 1 per post, max 15MB"] },
  youtube: { label: "YouTube Options", postTypes: ["Video", "Short"], hasTitle: true, hasVisibility: ["Public", "Unlisted", "Private"], hasCategory: true, hasTags: true, hasAutoLike: true, hasFirstComments: true, limits: ["Title: up to 100 characters", "Description: up to 5,000 characters", "Videos: up to 12 hours (max 256GB)", "Shorts: up to 60 seconds, vertical (9:16)"] },
  reddit: { label: "Reddit Options", postTypes: ["Post", "Link", "Image"], hasSubreddit: true, hasTags: true, limits: ["Title: up to 300 characters", "Text: up to 40,000 characters", "Images: up to 20 (max 20MB)", "Videos: up to 15 min (max 1GB)"] },
  bluesky: { label: "Bluesky Options", limits: ["Text: up to 300 characters", "Images: up to 4 (max 1MB each)", "No video support currently", "Links auto-generate preview cards"] },
  mastodon: { label: "Mastodon Options", hasVisibility: ["Public", "Unlisted", "Followers only", "Direct"], limits: ["Text: up to 500 characters", "Images: up to 4 (max 16MB)", "Videos: up to 40MB (MP4/WebM)"] },
  telegram: { label: "Telegram Options", limits: ["Text: up to 4,096 characters", "Images: JPEG/PNG, max 10MB", "Videos: up to 2GB (MP4)", "Files: up to 2GB any format"] },
  google: { label: "Google Business Options", postTypes: ["Update", "Offer", "Event"], limits: ["Text: up to 1,500 characters", "Images: min 720x720, max 5MB", "Videos: up to 30 seconds (MP4)"] },
  tumblr: { label: "Tumblr Options", hasTags: true, limits: ["Text: up to 4,096 characters", "Images: up to 10 (max 20MB)", "Tags: up to 30 tags"] },
  wordpress: { label: "WordPress Options", postTypes: ["Post", "Page"], hasVisibility: ["Public", "Private", "Password Protected"], hasTags: true, hasCategory: true, limits: ["Text: virtually unlimited", "Supports HTML, Markdown, Gutenberg blocks", "Categories and tags supported"] },
  whatsapp: { label: "WhatsApp Options", limits: ["Text: up to 4,096 characters", "Images: max 16MB", "Videos: up to 16MB (MP4)", "Documents: up to 100MB"] },
};

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} className={cn("w-9 h-5 rounded-full relative transition-colors cursor-pointer", enabled ? "bg-primary" : "bg-muted")}>
      <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform", enabled ? "translate-x-4" : "translate-x-0.5")} />
    </div>
  );
}

interface PlatformOptionsProps {
  selectedPlatforms: string[];
  platformSettings: Record<string, Record<string, any>>;
  onSettingsChange: (platform: string, key: string, value: any) => void;
  platformPostType: Record<string, string>;
  onPostTypeChange: (platform: string, type: string) => void;
}

export function PostPlatformOptions({ selectedPlatforms, platformSettings, onSettingsChange, platformPostType, onPostTypeChange }: PlatformOptionsProps) {
  const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({});
  const [autoLike, setAutoLike] = useState<Record<string, boolean>>({});
  const [tiktokAllow, setTiktokAllow] = useState<Record<string, boolean>>({ Comment: true, Duet: true, Stitch: true });
  const [discloseContent, setDiscloseContent] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-3">
      {selectedPlatforms.map((platformId) => {
        const opts = PLATFORM_OPTIONS[platformId];
        if (!opts) return null;
        const brand = PLATFORM_BRANDS[platformId];
        const isExpanded = expandedOptions[platformId] ?? false;
        const currentPostType = platformPostType[platformId] || (opts.postTypes?.[0] ?? "Post");
        const settings = platformSettings[platformId] || {};

        return (
          <div key={platformId} className="bg-card rounded-lg border border-border overflow-hidden">
            <button onClick={() => setExpandedOptions((prev) => ({ ...prev, [platformId]: !prev[platformId] }))} className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2.5">
                <PlatformBrandIcon platformId={platformId} size={13} />
                <span className="text-sm font-medium text-foreground">{opts.label}</span>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {isExpanded && (
              <div className="px-5 pb-4 space-y-4 border-t border-border pt-4">
                {opts.postTypes && opts.postTypes.length > 1 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground font-medium">Post this as</span>
                    <div className="flex items-center gap-3">
                      {opts.postTypes.map((type) => (
                        <label key={type} className="flex items-center gap-1.5 cursor-pointer" onClick={() => onPostTypeChange(platformId, type)}>
                          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", currentPostType === type ? "border-primary" : "border-muted-foreground/40")}>
                            {currentPostType === type && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                          <span className="text-sm text-foreground">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {opts.hasAutoLike && (
                  <div className="flex items-start gap-3">
                    <Toggle enabled={autoLike[platformId] ?? false} onToggle={() => setAutoLike((p) => ({ ...p, [platformId]: !p[platformId] }))} />
                    <div>
                      <div className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Auto-like this post</span></div>
                      <p className="text-xs text-muted-foreground mt-0.5">Automatically like your post right after publishing.</p>
                    </div>
                  </div>
                )}

                {opts.hasFirstComments && (
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5"><MessageSquareText className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">First Comments</span></div>
                      <button className="w-6 h-6 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/10"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{opts.firstCommentNote || "Add up to 5 comments posted right after publishing."}</p>
                  </div>
                )}

                {opts.hasTitle && (
                  <div>
                    <span className="text-sm font-medium text-foreground block mb-1.5">Title (required)</span>
                    <input type="text" value={settings.title || ""} onChange={(e) => onSettingsChange(platformId, "title", e.target.value)} placeholder="Enter video title..." className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                )}

                {(opts.hasPrivacy || opts.hasVisibility) && (
                  <div>
                    <span className="text-sm font-medium text-foreground block mb-2">{opts.hasPrivacy ? "Privacy" : "Visibility"}</span>
                    <div className="flex flex-wrap gap-2">
                      {(opts.hasPrivacy || opts.hasVisibility || []).map((opt) => (
                        <button key={opt} onClick={() => onSettingsChange(platformId, "visibility", opt)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", (settings.visibility || (opts.hasPrivacy?.[0] ?? opts.hasVisibility?.[0])) === opt ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40")}>{opt}</button>
                      ))}
                    </div>
                  </div>
                )}

                {opts.hasCategory && (
                  <div>
                    <span className="text-sm font-medium text-foreground block mb-1.5">Category</span>
                    <select value={settings.category || ""} onChange={(e) => onSettingsChange(platformId, "category", e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select category...</option>
                      <option>Entertainment</option><option>Education</option><option>Science & Technology</option><option>Music</option><option>Gaming</option>
                    </select>
                  </div>
                )}

                {opts.hasWhoCanView && (
                  <div>
                    <span className="text-sm font-medium text-foreground block mb-2">Who can view this video</span>
                    <div className="flex flex-wrap gap-2">
                      {opts.hasWhoCanView.map((opt) => (
                        <button key={opt} onClick={() => onSettingsChange(platformId, "whoCanView", opt)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", (settings.whoCanView || opts.hasWhoCanView![0]) === opt ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40")}>{opt}</button>
                      ))}
                    </div>
                  </div>
                )}

                {opts.hasAllowUsersTo && (
                  <div>
                    <span className="text-sm font-medium text-foreground block mb-2">Allow users to</span>
                    <div className="flex flex-wrap gap-2">
                      {opts.hasAllowUsersTo.map((opt) => (
                        <button key={opt} onClick={() => setTiktokAllow((p) => ({ ...p, [opt]: !p[opt] }))} className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors", tiktokAllow[opt] ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40")}>{opt}</button>
                      ))}
                    </div>
                  </div>
                )}

                {opts.hasDiscloseContent && (
                  <div className="flex items-start gap-3">
                    <Toggle enabled={discloseContent[platformId] ?? false} onToggle={() => setDiscloseContent((p) => ({ ...p, [platformId]: !p[platformId] }))} />
                    <div>
                      <span className="text-sm font-medium text-foreground">Disclose video content</span>
                      <p className="text-xs text-muted-foreground mt-0.5">By turning this option on, you confirm the video promotes goods or services in exchange for something of value.</p>
                    </div>
                  </div>
                )}

                {opts.hasShareToStory && (
                  <div className="flex items-start gap-3">
                    <Toggle enabled={settings.shareToStory === "true"} onToggle={() => onSettingsChange(platformId, "shareToStory", settings.shareToStory === "true" ? "false" : "true")} />
                    <div>
                      <span className="text-sm font-medium text-foreground">Share to Story</span>
                      <p className="text-xs text-muted-foreground mt-0.5">Also share this post to your Instagram Story.</p>
                    </div>
                  </div>
                )}

                {opts.hasTags && (
                  <div>
                    <span className="text-sm font-medium text-foreground block mb-1.5">Tags</span>
                    <input type="text" value={settings.tags || ""} onChange={(e) => onSettingsChange(platformId, "tags", e.target.value)} placeholder="Add tags separated by commas..." className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                )}

                {opts.hasSubreddit && (
                  <div>
                    <span className="text-sm font-medium text-foreground block mb-1.5">Subreddit</span>
                    <input type="text" placeholder="r/subreddit" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                )}

                {opts.hasPinTitle && (
                  <div>
                    <span className="text-sm font-medium text-foreground block mb-1.5">Pin Title</span>
                    <input type="text" value={settings.pinTitle || ""} onChange={(e) => onSettingsChange(platformId, "pinTitle", e.target.value)} placeholder="Pin Title recommended, max 100 char." className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                )}

                {opts.hasDestinationLink && (
                  <div>
                    <span className="text-sm font-medium text-foreground block mb-1.5">Destination Link <span className="text-muted-foreground font-normal">(recommended)</span></span>
                    <input type="url" value={settings.destinationLink || ""} onChange={(e) => onSettingsChange(platformId, "destinationLink", e.target.value)} placeholder="e.g. https://example.com/product" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                )}

                {opts.hasAltText && (
                  <div>
                    <span className="text-sm font-medium text-foreground block mb-1.5">Alt Text <span className="text-muted-foreground font-normal">recommended, max 500 chars</span></span>
                    <Textarea value={settings.altText || ""} onChange={(e) => onSettingsChange(platformId, "altText", e.target.value)} placeholder="Describe your image for accessibility..." className="min-h-[80px] text-sm" />
                  </div>
                )}

                {opts.hasBoard && (
                  <div>
                    <span className="text-sm font-medium text-foreground block mb-1.5">Board</span>
                    <select className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option>Select a board...</option><option>Inspiration</option><option>Design</option><option>Marketing</option>
                    </select>
                  </div>
                )}

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{brand?.label ?? platformId} posting limits:</span>
                  </div>
                  <ul className="space-y-1">
                    {opts.limits.map((limit, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5"><span className="mt-0.5">•</span> {limit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
