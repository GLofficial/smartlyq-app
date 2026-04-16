import { X, ExternalLink, Pencil, Image as ImageIcon, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
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

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; label: string; color: string; bg: string }> = {
	draft: { icon: Pencil, label: "Draft", color: "text-gray-600", bg: "bg-gray-100" },
	scheduled: { icon: Clock, label: "Scheduled", color: "text-amber-600", bg: "bg-amber-50" },
	published: { icon: CheckCircle, label: "Published", color: "text-emerald-600", bg: "bg-emerald-50" },
	processing: { icon: Clock, label: "Processing", color: "text-teal-600", bg: "bg-teal-50" },
	failed: { icon: XCircle, label: "Failed", color: "text-red-600", bg: "bg-red-50" },
	partially_published: { icon: AlertTriangle, label: "Partial", color: "text-orange-600", bg: "bg-orange-50" },
};

export function CalendarEventModal({ event, onClose }: { event: CalendarEventData | null; onClose: () => void }) {
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	if (!event) return null;

	const { extendedProps: ep } = event;
	const isNote = ep.type === "note";

	if (isNote) {
		return (
			<Overlay onClose={onClose}>
				<div className="w-full max-w-md rounded-xl border bg-[var(--card)] shadow-2xl mx-4">
					<div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
						<h2 className="text-base font-semibold">Calendar Note</h2>
						<button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--muted)]"><X size={18} /></button>
					</div>
					<div className="p-5" style={{ backgroundColor: ep.bgColor || "#F8F8F8" }}>
						<p className="text-sm whitespace-pre-wrap">{ep.content || "Empty note"}</p>
					</div>
					<div className="flex justify-end px-5 py-3 border-t border-[var(--border)]">
						<Button variant="outline" size="sm" onClick={onClose}>Close</Button>
					</div>
				</div>
			</Overlay>
		);
	}

	const status = ep.status ?? "draft";
	const sc = STATUS_CONFIG[status] || STATUS_CONFIG.draft!;
	const StatusIcon = sc?.icon ?? Pencil;
	const platforms = ep.platforms ?? [];
	const postUrls = ep.postUrls ?? {};
	const mediaUrls = ep.mediaUrls ?? [];
	const editPath = wsHash ? `/w/${wsHash}/social-media/create?edit=${ep.postId}` : `/social-media/create?edit=${ep.postId}`;

	return (
		<Overlay onClose={onClose}>
			<div className="w-full max-w-2xl max-h-[85vh] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl flex flex-col mx-4">
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
					<div className="flex items-center gap-2 min-w-0">
						<h2 className="text-base font-semibold truncate">{event.title}</h2>
						{sc && (
							<span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.color}`}>
								<StatusIcon size={10} /> {sc.label}
							</span>
						)}
					</div>
					<button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--muted)]"><X size={18} /></button>
				</div>

				{/* Body */}
				<div className="flex-1 overflow-y-auto p-5">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						{/* Media */}
						<div>
							{ep.thumbnail ? (
								<img src={ep.thumbnail} alt="" className="w-full rounded-lg border border-[var(--border)] object-cover max-h-[300px]" />
							) : (
								<div className="flex items-center justify-center h-40 rounded-lg border border-[var(--border)] bg-[var(--muted)]">
									<ImageIcon size={32} className="text-[var(--muted-foreground)]/30" />
								</div>
							)}
							{mediaUrls.length > 1 && (
								<div className="flex gap-2 mt-2 overflow-x-auto">
									{mediaUrls.slice(1, 5).map((url, i) => (
										<img key={i} src={url} alt="" className="h-16 w-16 rounded object-cover border" loading="lazy" />
									))}
								</div>
							)}
						</div>

						{/* Details */}
						<div className="space-y-4">
							{ep.content && <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{ep.content}</p>}

							{ep.accountName && (
								<div><p className="text-[10px] text-[var(--muted-foreground)] uppercase">Account</p><p className="text-sm font-medium">{ep.accountName}</p></div>
							)}

							{ep.timeDisplay && (
								<div><p className="text-[10px] text-[var(--muted-foreground)] uppercase">Time</p><p className="text-sm font-medium">{ep.timeDisplay}</p></div>
							)}

							{/* Platforms + published URLs */}
							{platforms.length > 0 && (
								<div>
									<p className="text-[10px] text-[var(--muted-foreground)] uppercase mb-1">Platforms</p>
									<div className="space-y-1.5">
										{platforms.map((p) => (
											<div key={p} className="flex items-center gap-2">
												<PlatformIcon platform={p} size={14} />
												<span className="text-xs capitalize">{p}</span>
												{postUrls[p] && (
													<a href={postUrls[p]} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--sq-primary)] hover:underline flex items-center gap-0.5">
														<ExternalLink size={10} /> View
													</a>
												)}
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)]">
					<Link to={editPath}>
						<Button variant="outline" size="sm" className="gap-1.5"><Pencil size={12} /> Edit Post</Button>
					</Link>
					<Button variant="outline" size="sm" onClick={onClose}>Close</Button>
				</div>
			</div>
		</Overlay>
	);
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
			{children}
		</div>
	);
}
