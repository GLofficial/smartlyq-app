import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ChevronDown, Film } from "lucide-react";
import { cn } from "@/lib/cn";

/* eslint-disable @typescript-eslint/no-explicit-any */

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} className={cn("w-9 h-5 rounded-full relative transition-colors cursor-pointer", enabled ? "bg-primary" : "bg-muted")}>
      <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform", enabled ? "translate-x-4" : "translate-x-0.5")} />
    </div>
  );
}

// ---- AI Text Modal ----
interface AiTextModalProps { open: boolean; onClose: () => void; onUse: (text: string) => void }
export function AiTextModal({ open, onClose, onUse }: AiTextModalProps) {
  const [config, setConfig] = useState({ contentType: "Social Media Post", tone: "Professional", platform: "All Platforms", brandVoice: false, topic: "", generated: "" });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>AI Content Generation</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Model</label>
            <div className="border border-border rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">✦</div>
                <div><p className="text-sm font-medium text-foreground">SmartlyQ AI</p><p className="text-xs text-muted-foreground">Uses your plan's allowed text models.</p></div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Content Type</label>
            <select value={config.contentType} onChange={(e) => setConfig((p) => ({ ...p, contentType: e.target.value }))} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Social Media Post</option><option>Blog Post</option><option>Ad Copy</option><option>Product Description</option><option>Email Newsletter</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Topic/Context</label>
            <Textarea value={config.topic} onChange={(e) => setConfig((p) => ({ ...p, topic: e.target.value }))} placeholder="Describe what you want to post about..." className="min-h-[100px] text-sm" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Tone</label>
            <select value={config.tone} onChange={(e) => setConfig((p) => ({ ...p, tone: e.target.value }))} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Professional</option><option>Casual</option><option>Humorous</option><option>Inspirational</option><option>Formal</option><option>Persuasive</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Brand Voice</span>
            <div className="flex items-center gap-2">
              <Toggle enabled={config.brandVoice} onToggle={() => setConfig((p) => ({ ...p, brandVoice: !p.brandVoice }))} />
              <span className="text-sm text-foreground">Use Brand Voice</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Generated Content</label>
            <div className="bg-muted/40 rounded-lg px-4 py-3 min-h-[60px]">
              <p className="text-sm text-muted-foreground">{config.generated || 'Click "Generate Content" to create AI-powered content...'}</p>
            </div>
          </div>
        </div>
        <DialogFooter className="border-t border-border pt-4 flex gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500" onClick={() => setConfig((p) => ({ ...p, generated: "AI-generated content will appear here once connected." }))}>
            <Sparkles className="w-4 h-4" /> Generate Content
          </Button>
          <Button variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30" disabled={!config.generated} onClick={() => { onUse(config.generated); onClose(); setConfig((p) => ({ ...p, generated: "", topic: "" })); }}>
            Use This Content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- AI Image Modal ----
interface AiImageModalProps { open: boolean; onClose: () => void; onUse: () => void }
export function AiImageModal({ open, onClose, onUse }: AiImageModalProps) {
  const [config, setConfig] = useState({ prompt: "", brandVoice: false, preview: "" });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>AI Image Generation</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Model</label>
            <div className="border border-border rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">◆</div>
                <div><p className="text-sm font-medium text-foreground">SmartlyQ AI — Image</p><p className="text-xs text-muted-foreground">Generated images are saved into your Media Library.</p></div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Prompt</label>
            <Textarea value={config.prompt} onChange={(e) => setConfig((p) => ({ ...p, prompt: e.target.value }))} placeholder="Describe the image you want..." className="min-h-[100px] text-sm" />
            <p className="text-xs text-muted-foreground mt-1.5">Tip: you can paste your offer/product + what should be visible.</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Brand Voice</span>
            <div className="flex items-center gap-2">
              <Toggle enabled={config.brandVoice} onToggle={() => setConfig((p) => ({ ...p, brandVoice: !p.brandVoice }))} />
              <span className="text-sm text-foreground">Use Brand Voice</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Preview</label>
            <div className="bg-muted/40 rounded-lg px-4 py-3 min-h-[60px]"><p className="text-sm text-muted-foreground">{config.preview || 'Click "Generate Image" to create an image.'}</p></div>
          </div>
        </div>
        <DialogFooter className="border-t border-border pt-4 flex gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500" onClick={() => setConfig((p) => ({ ...p, preview: "AI-generated image will appear here once connected." }))}>
            <Sparkles className="w-4 h-4" /> Generate Image
          </Button>
          <Button variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30" disabled={!config.preview} onClick={() => { onUse(); onClose(); setConfig((p) => ({ ...p, preview: "", prompt: "" })); }}>
            Use This Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- AI Video Modal ----
interface AiVideoModalProps { open: boolean; onClose: () => void; onUse: () => void }
export function AiVideoModal({ open, onClose, onUse }: AiVideoModalProps) {
  const [config, setConfig] = useState({ type: "Text to Video", length: "5", resolution: "720p", quality: "Auto", prompt: "", brandVoice: false, generateAudio: false, status: "" });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>AI Video Generation</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div className="grid grid-cols-[1fr_1.5fr] gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Type</label>
              <select value={config.type} onChange={(e) => setConfig((p) => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option>Text to Video</option><option>Image to Video</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Model</label>
              <div className="border border-border rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-[8px] font-bold">▶</div>
                  <div><p className="text-xs font-medium text-foreground">SmartlyQ AI — Video</p><p className="text-[10px] text-muted-foreground">Generated videos saved to Media Library.</p></div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Length (sec)</label>
              <select value={config.length} onChange={(e) => setConfig((p) => ({ ...p, length: e.target.value }))} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"><option>5</option><option>10</option></select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Resolution</label>
              <select value={config.resolution} onChange={(e) => setConfig((p) => ({ ...p, resolution: e.target.value }))} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"><option>480p</option><option>720p</option><option>1080p</option></select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Quality</label>
              <select value={config.quality} onChange={(e) => setConfig((p) => ({ ...p, quality: e.target.value }))} className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"><option>Auto</option><option>Standard</option><option>High</option></select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Prompt</label>
            <Textarea value={config.prompt} onChange={(e) => setConfig((p) => ({ ...p, prompt: e.target.value }))} placeholder="Describe the video you want..." className="min-h-[100px] text-sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Brand Voice</span>
            <div className="flex items-center gap-2">
              <Toggle enabled={config.brandVoice} onToggle={() => setConfig((p) => ({ ...p, brandVoice: !p.brandVoice }))} />
              <span className="text-sm text-foreground">Use Brand Voice</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Toggle enabled={config.generateAudio} onToggle={() => setConfig((p) => ({ ...p, generateAudio: !p.generateAudio }))} />
            <span className="text-sm text-foreground">Generate audio (if supported)</span>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Status</label>
            <div className="bg-muted/40 rounded-lg px-4 py-3 min-h-[50px]"><p className="text-sm text-muted-foreground">{config.status || 'Click "Generate Video" to start.'}</p></div>
          </div>
        </div>
        <DialogFooter className="border-t border-border pt-4 flex gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-gradient-to-r from-amber-400 to-orange-400 text-white hover:from-amber-500 hover:to-orange-500" onClick={() => setConfig((p) => ({ ...p, status: "AI video generation will be available once connected." }))}>
            <Film className="w-4 h-4" /> Generate Video
          </Button>
          <Button variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30" disabled={!config.status} onClick={() => { onUse(); onClose(); setConfig((p) => ({ ...p, status: "", prompt: "" })); }}>
            Use This Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Canva Modal ----
interface CanvaModalProps { open: boolean; onClose: () => void }
export function CanvaModal({ open, onClose }: CanvaModalProps) {
  const [canvaWidth, setCanvaWidth] = useState("1080");
  const [canvaHeight, setCanvaHeight] = useState("1080");
  const sizes = [
    { label: "Instagram Post", size: "1080x1080" }, { label: "Instagram Story", size: "1080x1920" },
    { label: "Facebook Post", size: "1200x630" }, { label: "Facebook Cover", size: "820x312" },
    { label: "X / Twitter Post", size: "1200x675" }, { label: "LinkedIn Post", size: "1200x627" },
    { label: "YouTube Thumbnail", size: "1280x720" }, { label: "TikTok Video", size: "1080x1920" },
    { label: "Pinterest Pin", size: "1000x1500" },
  ];
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[hsl(262,60%,55%)] to-[hsl(180,60%,45%)] flex items-center justify-center text-white text-xs font-bold">C</div>
            Design with Canva
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">Choose a design size to open the Canva editor.</p>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Popular Sizes</h4>
            <div className="flex flex-wrap gap-2">
              {sizes.map(({ label, size }) => {
                const [w, h] = size.split("x") as [string, string];
                return (
                  <button key={label} onClick={() => { setCanvaWidth(w); setCanvaHeight(h); }} className={cn("px-4 py-2 rounded-lg border text-sm transition-colors", canvaWidth === w && canvaHeight === h ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-foreground hover:border-primary/40 hover:bg-muted/30")}>
                    {label} ({size})
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Custom Size</h4>
            <div className="flex items-end gap-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">Width (px)</label><input type="number" value={canvaWidth} onChange={(e) => setCanvaWidth(e.target.value)} className="w-24 px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Height (px)</label><input type="number" value={canvaHeight} onChange={(e) => setCanvaHeight(e.target.value)} className="w-24 px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" /></div>
              <Button className="bg-[hsl(230,60%,50%)] hover:bg-[hsl(230,60%,45%)] text-white">Open Canva</Button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <button className="text-sm text-primary hover:underline">Disconnect Canva</button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Hashtag Modal ----
interface HashtagModalProps { open: boolean; onClose: () => void; onAdd: (text: string) => void }
export function HashtagModal({ open, onClose, onAdd }: HashtagModalProps) {
  const [hashtags, setHashtags] = useState<string[]>(["", "", ""]);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add Hashtags</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Enter your tags below. We'll handle the # and spacing.</p>
          <div className="space-y-3">
            {hashtags.map((tag, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xl text-muted-foreground font-light">#</span>
                <input type="text" value={tag} onChange={(e) => { const n = [...hashtags]; n[idx] = e.target.value; setHashtags(n); }} placeholder="e.g. mindfulness" className="flex-1 px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                <button onClick={() => hashtags.length > 1 ? setHashtags(hashtags.filter((_, i) => i !== idx)) : setHashtags([""])} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-colors">−</button>
              </div>
            ))}
          </div>
          <button onClick={() => setHashtags([...hashtags, ""])} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-dashed border-primary/40 text-primary text-sm font-medium hover:border-primary/60 hover:bg-primary/5 transition-colors">+ Add Hashtag</button>
        </div>
        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { const valid = hashtags.filter((t) => t.trim()); if (valid.length > 0) onAdd("\n\n" + valid.map((t) => `#${t.trim().replace(/\s+/g, "")}`).join(" ")); onClose(); }}>Add to Post</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Link Modal ----
interface LinkModalProps { open: boolean; onClose: () => void; onAdd: (url: string) => void }
export function LinkModal({ open, onClose, onAdd }: LinkModalProps) {
  const [url, setUrl] = useState("");
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add Link</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Paste or type a URL to insert into your post.</p>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <DialogFooter className="border-t border-border pt-4">
          <Button variant="outline" onClick={() => { onClose(); setUrl(""); }}>Cancel</Button>
          <Button disabled={!url.trim()} onClick={() => { onAdd(url.trim()); onClose(); setUrl(""); }}>Insert Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
