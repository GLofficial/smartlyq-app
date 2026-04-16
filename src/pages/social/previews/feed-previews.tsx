import { MoreHorizontal, ThumbsUp, MessageCircle, Share2, Heart, Bookmark, Send, Repeat2, ArrowUp, ArrowDown, Eye, Music, MapPin } from "lucide-react";
import { ImagePlaceholder, type Device } from "./image-layouts";
import { PlatformBrandIcon } from "../platform-brands";

export interface FeedPreviewProps { content: string; device: Device; imageCount?: number }

export function FacebookPreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-muted" />
        <div><p className="text-sm font-semibold text-foreground">George Liontos</p><p className="text-xs text-muted-foreground">Just now · 🌐</p></div>
        <MoreHorizontal className="w-5 h-5 text-muted-foreground ml-auto" />
      </div>
      <p className="px-3 pb-3 text-sm text-foreground whitespace-pre-wrap">{content || "Your post preview will appear here..."}</p>
      <ImagePlaceholder platform="facebook" device={device} imageCount={imageCount} />
      <div className="px-3 py-1.5 flex items-center text-xs text-muted-foreground"><span>❤️😊 0 others</span><span className="ml-auto">0 comments · 0 shares</span></div>
      <div className="border-t border-border flex">
        {[{ icon: ThumbsUp, label: "Like" }, { icon: MessageCircle, label: "Comment" }, { icon: Share2, label: "Share" }].map((a) => (
          <button key={a.label} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:bg-muted transition-colors"><a.icon className="w-4 h-4" /> {a.label}</button>
        ))}
      </div>
    </div>
  );
}

export function InstagramPreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[hsl(45,100%,60%)] via-[hsl(340,80%,55%)] to-[hsl(280,70%,55%)]" />
        <p className="text-sm font-semibold text-foreground">your_page</p>
        <MoreHorizontal className="w-5 h-5 text-muted-foreground ml-auto" />
      </div>
      <ImagePlaceholder platform="instagram" device={device} imageCount={imageCount} />
      <div className="p-3 flex items-center gap-3">
        <Heart className="w-6 h-6 text-foreground" /><MessageCircle className="w-6 h-6 text-foreground" /><Send className="w-6 h-6 text-foreground" /><Bookmark className="w-6 h-6 text-foreground ml-auto" />
      </div>
      <div className="px-3 pb-3">
        <p className="text-sm"><span className="font-semibold text-foreground">your_page</span>{" "}<span className="text-foreground">{content || "Your caption here..."}</span></p>
        <p className="text-xs text-muted-foreground mt-1">JUST NOW</p>
      </div>
    </div>
  );
}

export function TwitterPreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className="flex gap-2">
        <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1"><span className="text-sm font-bold text-foreground">Your Name</span><span className="text-sm text-muted-foreground">@handle · now</span></div>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{content || "Your post preview will appear here..."}</p>
          <div className="rounded-xl mt-2 overflow-hidden"><ImagePlaceholder platform="twitter" device={device} imageCount={imageCount} /></div>
          <div className="flex items-center gap-8 mt-3 text-muted-foreground">
            {[MessageCircle, Repeat2, Heart, Share2].map((Icon, i) => (<button key={i} className="flex items-center gap-1 text-xs hover:text-primary transition-colors"><Icon className="w-4 h-4" /> 0</button>))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LinkedInPreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-2"><div className="w-10 h-10 rounded-full bg-muted" /><div><p className="text-sm font-semibold text-foreground">Your Name</p><p className="text-xs text-muted-foreground">Your headline · Just now</p></div></div>
      <p className="px-3 pb-3 text-sm text-foreground whitespace-pre-wrap">{content || "Your post preview will appear here..."}</p>
      <ImagePlaceholder platform="linkedin" device={device} imageCount={imageCount} />
      <div className="border-t border-border flex">
        {[{ icon: ThumbsUp, l: "Like" }, { icon: MessageCircle, l: "Comment" }, { icon: Repeat2, l: "Repost" }, { icon: Send, l: "Send" }].map((a) => (
          <button key={a.l} className="flex-1 flex items-center justify-center gap-1 py-2.5 text-xs text-muted-foreground hover:bg-muted transition-colors"><a.icon className="w-4 h-4" /> {a.l}</button>
        ))}
      </div>
    </div>
  );
}

export function YouTubePreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="relative"><ImagePlaceholder platform="youtube" device={device} imageCount={imageCount} /><div className="absolute bottom-2 right-2 bg-foreground/80 text-card text-[10px] px-1 rounded">0:00</div></div>
      <div className="p-3"><p className="text-sm font-semibold text-foreground line-clamp-2">{content || "Video title here..."}</p><p className="text-xs text-muted-foreground mt-1">Your Channel · 0 views · Just now</p></div>
    </div>
  );
}

export function TikTokPreview({ content, device }: FeedPreviewProps) {
  return (
    <div className="flex justify-center">
      <div className="relative rounded-[2rem] overflow-hidden border-[6px] border-foreground mx-auto" style={{ aspectRatio: "9/16", maxHeight: device === "mobile" ? 520 : 420, width: device === "mobile" ? 300 : 240 }}>
        <div className="absolute inset-0 bg-foreground">
          <div className="absolute inset-0 flex items-center justify-center"><div className="w-12 h-12 rounded-full bg-card/20 flex items-center justify-center backdrop-blur-sm"><div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-card/80 ml-1" /></div></div>
          <div className="absolute right-2 bottom-28 flex flex-col items-center gap-4">
            {[{ icon: Heart, label: "0" }, { icon: MessageCircle, label: "0" }, { icon: Share2, label: "Share" }, { icon: Bookmark, label: "Save" }].map((item, i) => (
              <div key={i} className="flex flex-col items-center"><div className="w-8 h-8 rounded-full bg-card/15 flex items-center justify-center"><item.icon className="w-5 h-5 text-card" /></div><span className="text-card text-[9px] mt-0.5">{item.label}</span></div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-14 p-3">
            <div className="flex items-center gap-1.5"><span className="text-card text-xs font-bold">@yourhandle</span></div>
            <p className="text-card/90 text-[10px] mt-1 line-clamp-2">{content || "Your caption here..."}</p>
            <div className="flex items-center gap-1.5 mt-1.5"><Music className="w-3 h-3 text-card/60" /><span className="text-card/60 text-[9px]">Original Audio...</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PinterestPreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden mx-auto" style={{ maxWidth: 240 }}>
      <ImagePlaceholder platform="pinterest" device={device} imageCount={imageCount} />
      <div className="p-3"><p className="text-sm font-semibold text-foreground line-clamp-2">{content || "Pin title..."}</p><div className="flex items-center gap-1.5 mt-2"><div className="w-6 h-6 rounded-full bg-muted" /><span className="text-xs text-muted-foreground">Your Board</span></div></div>
    </div>
  );
}

export function RedditPreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex">
        <div className="flex flex-col items-center gap-1 px-2 py-3 bg-muted/50"><ArrowUp className="w-4 h-4 text-muted-foreground" /><span className="text-xs font-bold text-foreground">0</span><ArrowDown className="w-4 h-4 text-muted-foreground" /></div>
        <div className="p-3 flex-1">
          <p className="text-xs text-muted-foreground">r/subreddit · Posted by u/you · just now</p>
          <p className="text-sm font-semibold text-foreground mt-1">{content || "Post title here..."}</p>
          <div className="rounded mt-2 overflow-hidden"><ImagePlaceholder platform="reddit" device={device} imageCount={imageCount} /></div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground"><span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 0 Comments</span><span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> Share</span></div>
        </div>
      </div>
    </div>
  );
}

export function ThreadsPreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className="flex gap-3">
        <div className="flex flex-col items-center"><div className="w-9 h-9 rounded-full bg-muted" /><div className="w-0.5 flex-1 bg-border mt-2" /></div>
        <div className="flex-1">
          <div className="flex items-center gap-1"><span className="text-sm font-bold text-foreground">your_page</span><span className="text-xs text-muted-foreground">· now</span></div>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{content || "Your post preview..."}</p>
          <div className="rounded-lg mt-2 overflow-hidden"><ImagePlaceholder platform="threads" device={device} imageCount={imageCount} /></div>
          <div className="flex items-center gap-4 mt-3 text-muted-foreground">{[Heart, MessageCircle, Repeat2, Send].map((Icon, i) => (<Icon key={i} className="w-4 h-4 hover:text-foreground cursor-pointer transition-colors" />))}</div>
        </div>
      </div>
    </div>
  );
}

export function BlueskyPreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className="flex gap-2">
        <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-1"><span className="text-sm font-bold text-foreground">Your Name</span><span className="text-sm text-muted-foreground">@you.bsky.social · now</span></div>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{content || "Your post preview..."}</p>
          <div className="rounded-lg mt-2 overflow-hidden"><ImagePlaceholder platform="bluesky" device={device} imageCount={imageCount} /></div>
          <div className="flex items-center gap-6 mt-3 text-muted-foreground">{[MessageCircle, Repeat2, Heart].map((Icon, i) => (<button key={i} className="flex items-center gap-1 text-xs hover:text-primary transition-colors"><Icon className="w-4 h-4" /> 0</button>))}</div>
        </div>
      </div>
    </div>
  );
}

export function MastodonPreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className="flex gap-2">
        <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-1"><span className="text-sm font-bold text-foreground">Your Name</span><span className="text-sm text-muted-foreground">@you@mastodon.social · now</span></div>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{content || "Your post preview..."}</p>
          <div className="rounded-lg mt-2 overflow-hidden"><ImagePlaceholder platform="mastodon" device={device} imageCount={imageCount} /></div>
          <div className="flex items-center gap-6 mt-3 text-muted-foreground">{[MessageCircle, Repeat2, Heart, Bookmark].map((Icon, i) => (<Icon key={i} className="w-4 h-4 hover:text-foreground cursor-pointer transition-colors" />))}</div>
        </div>
      </div>
    </div>
  );
}

export function TelegramPreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-2 border-b border-border"><div className="w-8 h-8 rounded-full bg-[hsl(200,80%,50%)]" /><p className="text-sm font-semibold text-foreground">Your Channel</p></div>
      <div className="p-3">
        <p className="text-sm text-foreground whitespace-pre-wrap">{content || "Your message preview..."}</p>
        <div className="rounded mt-2 overflow-hidden"><ImagePlaceholder platform="telegram" device={device} imageCount={imageCount} /></div>
        <div className="flex items-center justify-between mt-2"><div className="flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">0 views</span></div><span className="text-[10px] text-muted-foreground">12:00</span></div>
      </div>
    </div>
  );
}

export function GooglePreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-2"><div className="w-10 h-10 rounded-lg bg-[hsl(217,89%,61%)] flex items-center justify-center text-primary-foreground font-bold text-sm">G</div><div><p className="text-sm font-semibold text-foreground">Your Business</p><p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Location · Just now</p></div></div>
      <p className="px-3 pb-3 text-sm text-foreground whitespace-pre-wrap">{content || "Your update preview..."}</p>
      <ImagePlaceholder platform="google" device={device} imageCount={imageCount} />
      <div className="p-3"><button className="w-full py-2 border border-primary text-primary text-sm font-medium rounded hover:bg-primary/5 transition-colors">Learn more</button></div>
    </div>
  );
}

export function TumblrPreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 flex items-center gap-2"><div className="w-8 h-8 rounded bg-[hsl(210,25%,25%)]" /><p className="text-sm font-semibold text-foreground">yourblog</p></div>
      <ImagePlaceholder platform="tumblr" device={device} imageCount={imageCount} />
      <div className="p-3"><p className="text-sm text-foreground whitespace-pre-wrap">{content || "Your post preview..."}</p><div className="flex items-center gap-4 mt-3 text-muted-foreground"><Heart className="w-4 h-4 hover:text-foreground cursor-pointer" /><Repeat2 className="w-4 h-4 hover:text-foreground cursor-pointer" /><span className="text-xs ml-auto">0 notes</span></div></div>
    </div>
  );
}

export function WordPressPreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-3 border-b border-border flex items-center gap-2"><div className="w-8 h-8 rounded bg-[hsl(205,60%,40%)] flex items-center justify-center text-primary-foreground font-bold text-xs">W</div><div><p className="text-sm font-semibold text-foreground">Your Blog Post</p><p className="text-xs text-muted-foreground">smartlyq.com · Draft</p></div></div>
      <ImagePlaceholder platform="wordpress" device={device} imageCount={imageCount} />
      <div className="p-3"><p className="text-sm text-foreground whitespace-pre-wrap">{content || "Your blog post content..."}</p><div className="flex items-center gap-2 mt-3"><span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">Category</span><span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">Tags</span></div></div>
    </div>
  );
}

export function WhatsAppPreview({ content, device, imageCount = 1 }: FeedPreviewProps) {
  return (
    <div className="bg-[hsl(140,20%,90%)] rounded-lg overflow-hidden">
      <div className="p-3 bg-[hsl(142,70%,35%)] flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground text-sm">💬</div><p className="text-sm font-semibold text-primary-foreground">Your Group</p></div>
      <div className="p-3 min-h-[120px]">
        <div className="inline-block bg-card rounded-lg p-2.5 shadow-sm max-w-[85%]">
          <div className="rounded overflow-hidden mb-2"><ImagePlaceholder platform="whatsapp" device={device} imageCount={imageCount} /></div>
          <p className="text-sm text-foreground whitespace-pre-wrap">{content || "Your message preview..."}</p>
          <span className="text-[10px] text-muted-foreground float-right mt-1 ml-2">12:00 ✓✓</span>
        </div>
      </div>
    </div>
  );
}

export function GenericPreview({ platform, content, device, imageCount = 1 }: FeedPreviewProps & { platform: string }) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 flex items-center gap-2"><PlatformBrandIcon platformId={platform} size={16} /><div><p className="text-sm font-semibold text-foreground capitalize">{platform}</p><p className="text-xs text-muted-foreground">Just now</p></div></div>
      <p className="px-4 pb-3 text-sm text-foreground whitespace-pre-wrap">{content || "Your post preview will appear here..."}</p>
      <ImagePlaceholder platform={platform} device={device} imageCount={imageCount} />
    </div>
  );
}
