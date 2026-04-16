// @ts-nocheck
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { EventDropArg } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput, EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
// AppSidebar removed — we already have our own sidebar
import { PLATFORM_BRANDS, PlatformIcon, PlatformBadge } from "./PlatformIcons";
import { Bell, HelpCircle, Settings, Users, Search, ChevronLeft, ChevronRight, CalendarDays, Share2, Plus, X, ExternalLink, RotateCw, MinusCircle, Trash2, PenLine, AlertTriangle, Clock, CheckCircle2, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

const VIEW_LABELS: Record<CalendarView, { label: string; icon?: string }> = {
  dayGridMonth: { label: "Month" },
  timeGridWeek: { label: "Week" },
  timeGridDay: { label: "Day" },
  listWeek: { label: "List" },
};

const PLATFORM_FILTERS = [
  { id: "all", label: "All Platforms", icon: "🌐" },
  { id: "facebook", label: "Facebook", icon: "f", color: "bg-[hsl(var(--facebook))]" },
  { id: "instagram", label: "Instagram", icon: "📷", color: "bg-[hsl(var(--instagram))]" },
  { id: "twitter", label: "X (Twitter)", icon: "𝕏", color: "bg-[hsl(var(--twitter))]" },
  { id: "linkedin", label: "LinkedIn", icon: "in", color: "bg-[hsl(var(--linkedin))]" },
  { id: "youtube", label: "YouTube", icon: "▶", color: "bg-[hsl(var(--youtube))]" },
  { id: "tiktok", label: "TikTok", icon: "♪", color: "bg-[hsl(var(--tiktok))]" },
  { id: "pinterest", label: "Pinterest", icon: "P", color: "bg-[hsl(var(--pinterest))]" },
  { id: "tumblr", label: "Tumblr", icon: "t", color: "bg-[hsl(210,25%,25%)]" },
  { id: "bluesky", label: "Bluesky", icon: "🦋", color: "bg-primary" },
];

const STATUS_OPTIONS = ["All Status", "Published", "Scheduled", "Draft", "Failed", "Partial"];

interface DemoPost {
  id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  platforms: { id: string; name: string; status: "published" | "scheduled" | "draft" | "failed" }[];
  thumbnail?: string;
  status: "published" | "scheduled" | "draft" | "failed" | "partial";
}

const today = new Date();
const y = today.getFullYear();
const m = today.getMonth();

const DEMO_POSTS: DemoPost[] = [
  {
    id: "p1",
    title: "Cross-Platform Post",
    content: "Ένα ακόμα μοναδικό feature του SmartlyQ! Enjoy!",
    date: `${y}-${String(m + 1).padStart(2, "0")}-09`,
    time: "13:42",
    platforms: [
      { id: "facebook", name: "George Liontos", status: "published" },
      { id: "linkedin", name: "George Liontos", status: "failed" },
      { id: "tiktok", name: "George Liontos |AI & Marketing", status: "published" },
    ],
    status: "partial",
  },
  {
    id: "p2",
    title: "yes yes yes",
    content: "yes yes yes",
    date: `${y}-${String(m + 1).padStart(2, "0")}-09`,
    time: "10:00",
    platforms: [{ id: "facebook", name: "Stav Test page", status: "published" }],
    status: "published",
  },
  {
    id: "p3",
    title: "rearaerar😊",
    content: "rearaerar😊",
    date: `${y}-${String(m + 1).padStart(2, "0")}-09`,
    time: "11:00",
    platforms: [{ id: "instagram", name: "stavroswebnet", status: "published" }],
    status: "published",
  },
  {
    id: "p4",
    title: "hellloooo😊",
    content: "hellloooo😊",
    date: `${y}-${String(m + 1).padStart(2, "0")}-09`,
    time: "14:00",
    platforms: [{ id: "facebook", name: "Unknown", status: "published" }],
    status: "published",
  },
  {
    id: "p5",
    title: "test new ffmp",
    content: "test new ffmp",
    date: `${y}-${String(m + 1).padStart(2, "0")}-10`,
    time: "15:49",
    platforms: [{ id: "tiktok", name: "Stavros Kats", status: "published" }],
    status: "published",
  },
  {
    id: "p6",
    title: "Hello againnnn",
    content: "Hello againnnn",
    date: `${y}-${String(m + 1).padStart(2, "0")}-10`,
    time: "15:50",
    platforms: [{ id: "tiktok", name: "Stavros Kats", status: "published" }],
    status: "published",
  },
  {
    id: "p7",
    title: "catzilla",
    content: "catzilla",
    date: `${y}-${String(m + 1).padStart(2, "0")}-12`,
    time: "09:00",
    platforms: [{ id: "tumblr", name: "My Blog", status: "published" }],
    status: "published",
  },
  {
    id: "p8",
    title: "the mightly catzilla roar",
    content: "the mightly catzilla roar",
    date: `${y}-${String(m + 1).padStart(2, "0")}-13`,
    time: "10:00",
    platforms: [{ id: "pinterest", name: "stavroskatsoulotos", status: "published" }],
    status: "published",
  },
  {
    id: "p9",
    title: "Super catzilla",
    content: "Super catzilla",
    date: `${y}-${String(m + 1).padStart(2, "0")}-13`,
    time: "11:00",
    platforms: [{ id: "pinterest", name: "stavroskatsoulotos", status: "published" }],
    status: "published",
  },
  {
    id: "p10",
    title: "catzilla!!!🐱",
    content: "catzilla!!!🐱",
    date: `${y}-${String(m + 1).padStart(2, "0")}-13`,
    time: "12:00",
    platforms: [{ id: "bluesky", name: "stavroswebnet.bsky.s...", status: "published" }],
    status: "published",
  },
  {
    id: "p11",
    title: "Scheduled post example",
    content: "This post is scheduled for later this month.",
    date: `${y}-${String(m + 1).padStart(2, "0")}-20`,
    time: "14:00",
    platforms: [
      { id: "facebook", name: "George Liontos", status: "scheduled" },
      { id: "instagram", name: "stavroswebnet", status: "scheduled" },
    ],
    status: "scheduled",
  },
  {
    id: "p12",
    title: "Draft post idea",
    content: "Need to finalize this content before publishing.",
    date: `${y}-${String(m + 1).padStart(2, "0")}-22`,
    time: "10:00",
    platforms: [{ id: "tiktok", name: "Stavros Kats", status: "draft" }],
    status: "draft",
  },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string }> = {
    published: { label: "PUBLISHED", classes: "bg-success/10 text-success border-success/20" },
    scheduled: { label: "SCHEDULED", classes: "bg-primary/10 text-primary border-primary/20" },
    draft: { label: "DRAFT", classes: "bg-warning/10 text-warning border-warning/20" },
    failed: { label: "FAILED", classes: "bg-destructive/10 text-destructive border-destructive/20" },
    partial: { label: "PARTIAL", classes: "bg-warning/10 text-warning border-warning/20" },
  };
  const c = config[status] || config.draft;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", c.classes)}>
      {status === "published" && <CheckCircle2 className="w-3 h-3" />}
      {status === "partial" && <AlertTriangle className="w-3 h-3" />}
      {status === "draft" && <PenLine className="w-3 h-3" />}
      {status === "scheduled" && <Clock className="w-3 h-3" />}
      {c.label}
    </span>
  );
}

function PlatformIcons({ platforms }: { platforms: { id: string }[] }) {
  return (
    <div className="flex items-center gap-0.5">
      {platforms.map((p, i) => (
        <PlatformBadge key={i} platformId={p.id} size={18} />
      ))}
    </div>
  );
}

interface CalendarProps {
  /** Real events from API — if provided, replaces DEMO_POSTS */
  realEvents?: { id: number | string; title: string; start: string | null; extendedProps: Record<string, unknown> }[];
  onDeletePost?: (postId: number) => void;
  onRetryPost?: (postId: number) => void;
  onReschedulePost?: (postId: number, newDate: string, newTime: string) => void;
}

export default function ContentCalendar({ realEvents, onDeletePost, onRetryPost, onReschedulePost }: CalendarProps = {}) {
  const navigate = useNavigate();
  // toast imported from sonner at top
  const calendarRef = useRef<FullCalendar>(null);

  // Convert real API events to DemoPost format
  const apiPosts: DemoPost[] = useMemo(() => {
    if (!realEvents?.length) return [];
    return realEvents.map(ev => {
      const ep = ev.extendedProps || {};
      const startStr = ev.start ?? "";
      const [datePart, timePart] = startStr.split("T");
      return {
        id: String(ev.id),
        title: ev.title || (ep.content as string || "").slice(0, 50) || "Untitled",
        content: (ep.content as string) || "",
        date: datePart || "",
        time: timePart ? timePart.slice(0, 5) : "00:00",
        platforms: Array.isArray(ep.platforms) ? (ep.platforms as string[]).map(pid => ({
          id: pid,
          name: (ep.accountName as string) || pid,
          status: ((ep.status as string) || "scheduled") as "published" | "scheduled" | "draft" | "failed",
        })) : [],
        thumbnail: (ep.thumbnail as string) || undefined,
        status: ((ep.status as string) || "scheduled") as DemoPost["status"],
      };
    });
  }, [realEvents]);

  const useReal = apiPosts.length > 0;
  const [posts, setPosts] = useState<DemoPost[]>(DEMO_POSTS);
  const [currentView, setCurrentView] = useState<CalendarView>("dayGridMonth");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [title, setTitle] = useState(() => {
    const now = new Date();
    return `${now.toLocaleString("en-US", { month: "long" })} ${now.getFullYear()}`;
  });
  const [selectedPost, setSelectedPost] = useState<DemoPost | null>(null);
  const [dayDetailDate, setDayDetailDate] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareAccount, setShareAccount] = useState("All accounts");
  const [shareStart, setShareStart] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  });
  const [shareEnd, setShareEnd] = useState(() => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  });

  const updateTitle = useCallback(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      const d = api.getDate();
      setTitle(`${d.toLocaleString("en-US", { month: "long" })} ${d.getFullYear()}`);
    }
  }, []);

  const sourcePosts = useReal ? apiPosts : posts;
  const filteredPosts = sourcePosts.filter((p) => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== "All Status" && p.status !== statusFilter.toLowerCase()) return false;
    if (platformFilter !== "all" && !p.platforms.some((pl) => pl.id === platformFilter)) return false;
    return true;
  });

  const events: EventInput[] = filteredPosts.map((p) => ({
    id: p.id,
    title: p.title,
    start: `${p.date}T${p.time}:00`,
    extendedProps: { post: p },
    backgroundColor: "transparent",
    borderColor: "transparent",
    textColor: "inherit",
  }));

  const handleEventClick = (info: EventClickArg) => {
    const post = info.event.extendedProps.post as DemoPost;
    setSelectedPost(post);
  };

  const handleDateClick = (info: DateClickArg) => {
    setDayDetailDate(info.dateStr);
  };

  const handleEventDrop = useCallback((info: EventDropArg) => {
    const postId = info.event.id;
    const post = info.event.extendedProps.post as DemoPost;
    const oldDate = post.date;
    const oldTime = post.time;
    const newStart = info.event.start;
    if (!newStart) { info.revert(); return; }
    const newDate = newStart.toISOString().split("T")[0];
    const newTime = `${String(newStart.getHours()).padStart(2, "0")}:${String(newStart.getMinutes()).padStart(2, "0")}`;

    const formatDate = (d: string) => {
      const dt = new Date(d + "T00:00:00");
      return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, date: newDate, time: newTime } : p
      )
    );

    // Call API to reschedule if wired
    if (onReschedulePost && post.id) {
      onReschedulePost(Number(post.id), newDate, newTime);
    }
    toast.success(`Post rescheduled: "${post.title}" moved to ${formatDate(newDate)} at ${newTime}`);
  }, [onReschedulePost]);

  const postsForDay = dayDetailDate
    ? filteredPosts.filter((p) => p.date === dayDetailDate)
    : [];

  const dayDetailDateFormatted = dayDetailDate
    ? new Date(dayDetailDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : "";

  const changeView = (view: CalendarView) => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
  };

  const handlePrev = () => { calendarRef.current?.getApi().prev(); updateTitle(); };
  const handleNext = () => { calendarRef.current?.getApi().next(); updateTitle(); };
  const handleToday = () => { calendarRef.current?.getApi().today(); updateTitle(); };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div className="max-w-[1400px] mx-auto space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase mb-1 block">Content</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search content"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase mb-1 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase mb-1 block">Platform</label>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PLATFORM_FILTERS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calendar toolbar */}
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-muted rounded-lg">
                  <button onClick={handlePrev} className="p-2 hover:bg-card rounded-l-lg transition-colors"><ChevronLeft className="w-4 h-4 text-foreground" /></button>
                  <span className="px-4 py-2 text-sm font-semibold text-foreground min-w-[140px] text-center">{title}</span>
                  <button onClick={handleNext} className="p-2 hover:bg-card rounded-r-lg transition-colors"><ChevronRight className="w-4 h-4 text-foreground" /></button>
                </div>
                <Button variant="outline" size="sm" onClick={handleToday} className="gap-1.5">
                  <CalendarDays className="w-4 h-4" /> Today
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* View toggles */}
                <div className="flex items-center bg-muted rounded-lg p-0.5">
                  {(Object.entries(VIEW_LABELS) as [CalendarView, { label: string }][]).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => changeView(key)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                        currentView === key
                          ? "bg-destructive text-destructive-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>

                <Button variant="outline" className="gap-1.5" onClick={() => setShareOpen(true)}>
                  <Share2 className="w-4 h-4" /> Share
                </Button>
                <Button className="gap-1.5" onClick={() => {
                  const api = calendarRef.current?.getApi();
                  const currentDate = api?.getDate();
                  const dateStr = currentDate ? currentDate.toISOString().split("T")[0] : undefined;
                  navigate("/", { state: { prefillDate: dateStr } });
                }}>
                  <Plus className="w-4 h-4" /> Create Post
                </Button>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-card rounded-lg border border-border overflow-hidden calendar-wrapper">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                editable={true}
                eventDrop={handleEventDrop}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                headerToolbar={false}
                height="auto"
                dayMaxEvents={3}
                moreLinkClick={(info) => {
                  setDayDetailDate(info.date.toISOString().split("T")[0]);
                  return "none";
                }}
                eventContent={(arg) => {
                  const post = arg.event.extendedProps.post as DemoPost;
                  return (
                    <div className="w-full px-1.5 py-1 cursor-pointer group">
                      <div className="bg-card border border-border rounded-md p-1.5 shadow-sm hover:shadow-md transition-shadow">
                        {post.thumbnail && (
                          <div className="w-full h-12 bg-muted rounded mb-1 overflow-hidden">
                            <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <p className="text-[10px] font-semibold text-foreground line-clamp-1">{post.title}</p>
                        <p className="text-[9px] text-muted-foreground line-clamp-1 mt-0.5">{post.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <PlatformIcons platforms={post.platforms} />
                          <StatusBadge status={post.status} />
                        </div>
                      </div>
                    </div>
                  );
                }}
                datesSet={() => updateTitle()}
              />
            </div>
          </div>
      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <PlatformIcons platforms={selectedPost.platforms} />
                  <DialogTitle className="text-lg">{selectedPost.title}</DialogTitle>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {selectedPost.status === "published" ? "Published on" : selectedPost.status === "scheduled" ? "Scheduled for" : "Created"}: {new Date(selectedPost.date + "T" + selectedPost.time).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at {selectedPost.time}
                  </span>
                  <StatusBadge status={selectedPost.status} />
                </div>
              </DialogHeader>

              {/* Error banner for partial */}
              {selectedPost.status === "partial" && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mt-2">
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Posting Partially Published. {selectedPost.platforms.filter(p => p.status === "published").length}/{selectedPost.platforms.length} platforms succeeded. {selectedPost.platforms.find(p => p.status === "failed")?.id && `${selectedPost.platforms.find(p => p.status === "failed")?.id.charAt(0).toUpperCase()}${selectedPost.platforms.find(p => p.status === "failed")?.id.slice(1)} failed.`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-semibold">LinkedIn:</span> Media upload issue. Please check your file format and size.
                  </p>
                </div>
              )}

              {/* Platform tabs */}
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedPost.platforms.map((p, i) => {
                  const brand = PLATFORM_BRANDS[p.id];
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium",
                        i === 0 ? "bg-[hsl(var(--facebook))]/10 border-[hsl(var(--facebook))]/30 text-foreground" : "border-border text-muted-foreground"
                      )}
                    >
                      <PlatformBadge platformId={p.id} size={20} />
                      {p.name}
                      {p.status === "published" && <CheckCircle2 className="w-4 h-4 text-success" />}
                      {p.status === "failed" && <X className="w-4 h-4 text-destructive" />}
                      {p.status === "scheduled" && <Clock className="w-4 h-4 text-primary" />}
                    </div>
                  );
                })}
              </div>

              {/* Content preview */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {selectedPost.platforms[0]?.id && <PlatformBadge platformId={selectedPost.platforms[0].id} size={24} />}
                    <span className="text-sm font-semibold text-foreground">{selectedPost.platforms[0]?.name}</span>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-primary">
                    <ExternalLink className="w-3.5 h-3.5" /> View Post
                  </Button>
                </div>

                {/* Video/image placeholder */}
                <div className="bg-muted rounded-lg aspect-video flex items-center justify-center text-muted-foreground mb-3">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-foreground/20 flex items-center justify-center mx-auto mb-2">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-foreground/60 ml-1" />
                    </div>
                    <span className="text-xs">Media preview</span>
                  </div>
                </div>
              </div>

              {/* Content text */}
              <div className="border-t border-border pt-3">
                <p className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase mb-1">Content:</p>
                <p className="text-sm text-foreground">{selectedPost.content}</p>
              </div>

              {/* Timestamps */}
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Created: {new Date(selectedPost.date + "T" + selectedPost.time).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at {selectedPost.time}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border justify-center">
                {(selectedPost.status === "scheduled" || selectedPost.status === "draft") && (
                  <Button className="gap-1.5" onClick={() => {
                    setSelectedPost(null);
                    navigate("/", {
                      state: {
                        editPost: {
                          content: selectedPost.content,
                          platforms: selectedPost.platforms.map(p => p.id),
                          date: selectedPost.date,
                          time: selectedPost.time,
                        }
                      }
                    });
                  }}>
                    <PenLine className="w-4 h-4" /> Edit Post
                  </Button>
                )}
                {selectedPost.status === "partial" && (
                  <>
                    <Button variant="warning" className="gap-1.5" onClick={() => { if (onRetryPost && selectedPost) { onRetryPost(Number(selectedPost.id)); setSelectedPost(null); } }}><RotateCw className="w-4 h-4" /> Retry Failed</Button>
                    <Button variant="outline" className="gap-1.5" onClick={() => { if (onDeletePost && selectedPost) { onDeletePost(Number(selectedPost.id)); setSelectedPost(null); } }}><MinusCircle className="w-4 h-4" /> Remove Failed</Button>
                  </>
                )}
                <Button variant="outline" className="gap-1.5"><Share2 className="w-4 h-4" /> Share</Button>
                <Button variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => { if (onDeletePost && selectedPost) { onDeletePost(Number(selectedPost.id)); setSelectedPost(null); } }}><Trash2 className="w-4 h-4" /> Delete</Button>
                {selectedPost.status === "partial" && (
                  <Button className="gap-1.5 bg-warning text-warning-foreground hover:bg-warning/90"><FileEdit className="w-4 h-4" /> Edit Failed</Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Day Detail Modal */}
      <Dialog open={!!dayDetailDate} onOpenChange={() => setDayDetailDate(null)}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              {dayDetailDateFormatted}
            </DialogTitle>
          </DialogHeader>

          {postsForDay.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No posts on this day</p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {postsForDay.map((post) => (
                <div
                  key={post.id}
                  className="border border-border rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => { setDayDetailDate(null); setSelectedPost(post); }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PlatformIcons platforms={post.platforms} />
                      <span className="text-sm font-semibold text-foreground">{post.platforms[0]?.name}</span>
                    </div>
                    <StatusBadge status={post.status} />
                  </div>
                  <div className="flex gap-3 mt-2">
                    {post.thumbnail ? (
                      <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                        <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[9px] border-l-foreground/30 ml-0.5" />
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{post.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{post.content}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.status === "published" ? "Published on" : post.status === "scheduled" ? "Scheduled for" : "Created"}: {new Date(post.date + "T" + post.time).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at {post.time}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-center">
            <Button className="gap-1.5" onClick={() => { setDayDetailDate(null); navigate("/", { state: { prefillDate: dayDetailDate } }); }}>
              <Plus className="w-4 h-4" /> Add New Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Calendar Modal */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Share Calendar</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-1">
            Share is <span className="font-bold text-foreground">client-scoped</span> (by Social account) and <span className="font-bold text-foreground">date-range scoped</span>. Use this to share only what a single client should see.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Client (Social account)</label>
              <select
                value={shareAccount}
                onChange={(e) => setShareAccount(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>All accounts</option>
                <option>stavroswebnet.bsky.social</option>
                <option>George Liontos</option>
                <option>Stav Test page</option>
                <option>stavroswebnet</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Start</label>
              <input
                type="text"
                value={shareStart}
                onChange={(e) => setShareStart(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">End</label>
              <input
                type="text"
                value={shareEnd}
                onChange={(e) => setShareEnd(e.target.value)}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs text-muted-foreground mb-1 block">Link expires</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value="In 30 days"
                readOnly
                className="flex-1 px-3 py-2.5 border border-border rounded-lg text-sm bg-muted text-foreground"
              />
              <Button className="px-8">Generate link</Button>
            </div>
          </div>

          <div className="flex justify-end mt-4 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setShareOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
