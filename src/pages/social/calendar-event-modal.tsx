import { useState } from "react";
import { X, ExternalLink, Pencil, Trash2, Share2, RefreshCw, XCircle, Image as ImageIcon, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Link } from "react-router-dom";

export interface CalendarEventData {
	id: number;
	title: string;
	start: string;
	extendedProps: {
		type: string;
		postId?: number;
		noteId?: number;
		status?: string;
		platforms?: string[];
		accountName?: string;
		content?: string;
		thumbnail?: string;
		mediaUrls?: string[];
		postUrls?: Record<string, string>;
		hasMedia?: boolean;
		timeDisplay?: string;
		bgColor?: string;
	};
}

const STATUS_CFG: Record<string, { icon: typeof CheckCircle; label: string; color: string; bg: string; border: string }> = {
	draft: { icon: Pencil, label: "Draft", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
	scheduled: { icon: Clock, label: "Scheduled", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
	published: { icon: CheckCircle, label: "Published", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
	processing: { icon: Clock, label: "Processing", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200" },
	failed: { icon: XCircle, label: "Failed", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
	partially_published: { icon: AlertTriangle, label: "Partially Published", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
};

export function CalendarEventModal({ event, onClose }: { event: CalendarEventData | null; onClose: () => void }) {
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const [activeTab, setActiveTab] = useState(0);
	if (!event) return null;

	const ep = event.extendedProps;
	if (ep.type === "note") return <NoteModal content={ep.content ?? ""} bgColor={ep.bgColor ?? "#F8F8F8"} onClose={onClose} />;

	const status = ep.status ?? "draft";
	const sc = STATUS_CFG[status] || STATUS_CFG.draft!;
	const platforms = ep.platforms ?? [];
	const postUrls = ep.postUrls ?? {};
	const mediaUrls = ep.mediaUrls ?? [];
	const isFailed = status === "failed" || status === "partially_published";
	const editPath = wsHash ? `/w/${wsHash}/social-media/create?edit=${ep.postId}` : `/social-media/create?edit=${ep.postId}`;

	// Per-platform status: if postUrls has a URL for the platform, it succeeded
	const platformStatus = platforms.map((p) => ({
		platform: p,
		published: !!postUrls[p],
		url: postUrls[p] ?? "",
	}));

	// Partial publish banner
	const succeededCount = platformStatus.filter((p) => p.published).length;
	const failedPlatforms = platformStatus.filter((p) => !p.published).map((p) => p.platform);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
			<div className="w-full max-w-2xl max-h-[85vh] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl flex flex-col mx-4">
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
					<div className="flex items-center gap-2 min-w-0">
						{platforms.map((p) => <PlatformIcon key={p} platform={p} size={18} />)}
						<h2 className="text-base font-semibold truncate">{event.title}</h2>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						{sc && <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${sc.bg} ${sc.color} ${sc.border}`}>
							{sc.label.toUpperCase()}
						</span>}
						<button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--muted)]"><X size={18} /></button>
					</div>
				</div>

				{/* Partial publish warning */}
				{status === "partially_published" && (
					<div className="mx-5 mt-3 rounded-lg bg-orange-50 border border-orange-200 p-3 text-sm">
						<p className="font-medium text-orange-700">
							<AlertTriangle size={14} className="inline mr-1" />
							Posting Partially Published. {succeededCount}/{platforms.length} platforms succeeded.
							{failedPlatforms.length > 0 && ` ${failedPlatforms.join(", ")} failed.`}
						</p>
					</div>
				)}

				{/* Platform tabs */}
				{platforms.length > 1 && (
					<div className="flex gap-1 px-5 pt-3 border-b border-[var(--border)] pb-px">
						{platformStatus.map((ps, i) => (
							<button key={ps.platform} onClick={() => setActiveTab(i)}
								className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${activeTab === i ? "border-[var(--sq-primary)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-foreground)]"}`}>
								<PlatformIcon platform={ps.platform} size={14} />
								<span className="capitalize">{ps.platform}</span>
								{ps.published ? <CheckCircle size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
							</button>
						))}
					</div>
				)}

				{/* Body */}
				<div className="flex-1 overflow-y-auto p-5">
					{/* Active platform info */}
					{platforms.length > 0 && (
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center gap-2">
								<PlatformIcon platform={platforms[activeTab] ?? platforms[0]!} size={16} />
								<span className="text-sm font-medium capitalize">{ep.accountName || platforms[activeTab]}</span>
							</div>
							{platformStatus[activeTab]?.url && (
								<a href={platformStatus[activeTab]!.url} target="_blank" rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-xs text-[var(--sq-primary)] hover:underline">
									<ExternalLink size={12} /> View Post
								</a>
							)}
						</div>
					)}

					{/* Media */}
					{ep.thumbnail ? (
						<div className="rounded-lg border border-[var(--border)] overflow-hidden mb-4">
							{isVideoUrl(ep.thumbnail) ? (
								<video src={ep.thumbnail} controls className="w-full max-h-[350px]" />
							) : (
								<img src={ep.thumbnail} alt="" className="w-full max-h-[350px] object-contain bg-black/5" />
							)}
						</div>
					) : (
						<div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] mb-4">
							<ImageIcon size={32} className="text-[var(--muted-foreground)]/30" />
						</div>
					)}

					{/* Additional media thumbnails */}
					{mediaUrls.length > 1 && (
						<div className="flex gap-2 mb-4 overflow-x-auto">
							{mediaUrls.slice(1, 6).map((url, i) => (
								<img key={i} src={url} alt="" className="h-16 w-16 rounded-md object-cover border border-[var(--border)] shrink-0" loading="lazy" />
							))}
						</div>
					)}

					{/* Content */}
					{ep.content && (
						<div className="mb-4">
							<p className="text-[10px] uppercase font-medium text-[var(--muted-foreground)] mb-1">Content:</p>
							<div className="rounded-lg border border-[var(--border)] p-3">
								<p className="text-sm whitespace-pre-wrap text-[var(--foreground)]">{ep.content}</p>
							</div>
						</div>
					)}

					{/* Time info */}
					{ep.timeDisplay && (
						<p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
							<Clock size={12} />
							{status === "published" ? "Published on" : status === "scheduled" ? "Scheduled for" : "Created"}: {event.start ? new Date(event.start).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : ""} at {ep.timeDisplay}
						</p>
					)}
				</div>

				{/* Footer actions */}
				<div className="flex flex-wrap items-center justify-center gap-2 px-5 py-3 border-t border-[var(--border)]">
					{isFailed && (
						<>
							<Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5"><RefreshCw size={12} /> Retry Failed</Button>
							<Button variant="outline" size="sm" className="gap-1.5"><XCircle size={12} /> Remove Failed</Button>
						</>
					)}
					<Button variant="outline" size="sm" className="gap-1.5"><Share2 size={12} /> Share</Button>
					<Button variant="outline" size="sm" className="gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 size={12} /> Delete</Button>
					{isFailed && (
						<Link to={editPath}>
							<Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"><Pencil size={12} /> Edit Failed</Button>
						</Link>
					)}
					{!isFailed && (
						<Link to={editPath}>
							<Button variant="outline" size="sm" className="gap-1.5"><Pencil size={12} /> Edit Post</Button>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}

function NoteModal({ content, bgColor, onClose }: { content: string; bgColor: string; onClose: () => void }) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
			<div className="w-full max-w-md rounded-xl border bg-[var(--card)] shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
					<h2 className="text-base font-semibold">Calendar Note</h2>
					<button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--muted)]"><X size={18} /></button>
				</div>
				<div className="p-5 rounded-b-xl" style={{ backgroundColor: bgColor }}>
					<p className="text-sm whitespace-pre-wrap" style={{ color: isLightBg(bgColor) ? "#1a1a1a" : "#fff" }}>{content || "Empty note"}</p>
				</div>
			</div>
		</div>
	);
}

function isVideoUrl(url: string): boolean {
	return /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url);
}

function isLightBg(hex: string): boolean {
	const c = hex.replace("#", "");
	if (c.length < 6) return true;
	const r = parseInt(c.substring(0, 2), 16);
	const g = parseInt(c.substring(2, 4), 16);
	const b = parseInt(c.substring(4, 6), 16);
	return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
