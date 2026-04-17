import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronLeft, ChevronRight, Search, Pencil, Copy, Trash2, RotateCw, XCircle, SlidersHorizontal, Loader2, Calendar, Inbox as InboxIcon, Send, FileDown, ExternalLink } from "lucide-react";
import { useSocialPosts } from "@/api/social";
import { useRetryPost, useDeletePost, useDuplicatePost, useMoveToDraft, useShareNow } from "@/api/social-posts";
import { PlatformIcon } from "./platform-icon";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */

const TABS = [
	{ key: "", label: "Queued Posts", countKey: "queued" },
	{ key: "unscheduled", label: "Unscheduled", countKey: "unscheduled" },
	{ key: "error", label: "Error", countKey: "error" },
	{ key: "published", label: "Published", countKey: "published" },
	{ key: "pending_review", label: "Pending Review", countKey: "pending_review" },
	{ key: "cancelled", label: "Cancelled", countKey: "cancelled" },
] as const;

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string; emoji: string }> = {
	draft: { bg: "bg-gray-100", text: "text-gray-600", label: "Draft", emoji: "📝" },
	scheduled: { bg: "bg-blue-50", text: "text-blue-600", label: "Scheduled", emoji: "⏰" },
	published: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Published", emoji: "✅" },
	processing: { bg: "bg-teal-50", text: "text-teal-600", label: "Processing", emoji: "⏳" },
	failed: { bg: "bg-red-50", text: "text-red-600", label: "Failed", emoji: "❌" },
	partially_published: { bg: "bg-orange-50", text: "text-orange-600", label: "Partial", emoji: "⚠️" },
	pending_review: { bg: "bg-purple-50", text: "text-purple-600", label: "Pending", emoji: "👁" },
	cancelled: { bg: "bg-gray-100", text: "text-gray-500", label: "Cancelled", emoji: "🚫" },
};

export function ManagePostsPage() {
	const [tab, setTab] = useState("");
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const retryMut = useRetryPost();
	const deleteMut = useDeletePost();
	const duplicateMut = useDuplicatePost();
	const moveToDraftMut = useMoveToDraft();
	const shareNowMut = useShareNow();

	const handleSearch = useCallback((val: string) => {
		setSearch(val);
		if (searchTimer) clearTimeout(searchTimer);
		setSearchTimer(setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 400));
	}, [searchTimer]);

	// Build query params — send tab OR status to backend
	const queryStatus = tab === "" ? "scheduled" : undefined;
	const { data, isLoading } = useSocialPosts(queryStatus, page, tab || undefined, debouncedSearch || undefined);
	const posts = data?.posts ?? [];
	const tabCounts = (data as any)?.tab_counts ?? {};
	const total = data?.total ?? 0;
	const pages = data?.pages ?? 1;

	const editPath = (id: number) => wsHash ? `/w/${wsHash}/social-media/create?edit=${id}` : `/social-media/create?edit=${id}`;
	const createPath = wsHash ? `/w/${wsHash}/social-media/create-post` : "/social-media/create-post";

	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-[var(--foreground)]">Manage Posts</h1>
				<Link to={createPath}><Button><Plus size={14} className="mr-1.5" /> Create Post</Button></Link>
			</div>

			{/* Tabs */}
			<div className="flex gap-0.5 border-b border-[var(--border)] pb-px overflow-x-auto">
				{TABS.map((t) => {
					const count = tabCounts[t.countKey] ?? 0;
					const active = tab === t.key;
					return (
						<button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
							className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${active ? "border-[var(--sq-primary)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>
							{t.label} {count > 0 && <span className={`ml-1 text-xs ${t.key === "error" ? "text-red-500 font-bold" : ""}`}>({count})</span>}
						</button>
					);
				})}
			</div>

			{/* Filters bar */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative flex-1 max-w-[250px]">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
					<Input placeholder="Search a Post" value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9 h-9 text-sm" />
				</div>
				<Button variant="outline" size="sm" className="gap-1.5 text-xs"><SlidersHorizontal size={14} /> Filter Posts</Button>
				{total > 0 && (
					<span className="ml-auto text-xs text-[var(--muted-foreground)]">
						{(page - 1) * 20 + 1} — {Math.min(page * 20, total)} of {total}
					</span>
				)}
				{pages > 1 && (
					<div className="flex gap-1">
						<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-8 w-8 p-0"><ChevronLeft size={16} /></Button>
						<Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)} className="h-8 w-8 p-0"><ChevronRight size={16} /></Button>
					</div>
				)}
			</div>

			{/* Post list */}
			<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
				{isLoading ? (
					<div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" /></div>
				) : posts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 gap-3">
						<InboxIcon size={48} className="text-[var(--muted-foreground)]/30" />
						<p className="text-sm font-medium text-[var(--foreground)]">
							{tab === "" ? "No queued posts" : tab === "pending_review" ? "You are all caught up!" : "No posts found"}
						</p>
						<p className="text-xs text-[var(--muted-foreground)]">
							{tab === "" ? "Posts scheduled for later will appear here." : tab === "pending_review" ? "All posts that require approval will end up here." : ""}
						</p>
						<Link to={createPath}><Button size="sm"><Plus size={14} className="mr-1" /> Create post</Button></Link>
					</div>
				) : (
					<div>
						{posts.map((post: any) => {
							const sc = STATUS_COLORS[post.status] ?? STATUS_COLORS.draft;
							return (
								<div key={post.id} className="flex items-center gap-4 px-4 py-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/20 transition-colors group">
									{/* Thumbnail (image or video with play overlay) */}
									<div className="shrink-0">
										{post.thumbnail ? (
											/\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(post.thumbnail) ? (
												<div className="relative h-14 w-14 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--muted)]">
													<video src={post.thumbnail} className="h-full w-full object-cover" muted playsInline preload="metadata" />
													<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
														<div className="w-5 h-5 rounded-full bg-black/55 flex items-center justify-center">
															<div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-white ml-0.5" />
														</div>
													</div>
												</div>
											) : (
												<img src={post.thumbnail} alt="" className="h-14 w-14 rounded-lg object-cover border border-[var(--border)]"
													onError={(e) => { e.currentTarget.style.display = "none"; }} />
											)
										) : (
											<div className="h-14 w-14 rounded-lg bg-[var(--muted)] flex items-center justify-center">
												<Calendar size={20} className="text-[var(--muted-foreground)]/30" />
											</div>
										)}
									</div>

									{/* Content */}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-[var(--foreground)] truncate">{(post.title && String(post.title).trim() !== "" && String(post.title) !== "0") ? post.title : (post.content || "Untitled post")}</p>
										<p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">{post.content}</p>
										{post.error_message && <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><XCircle size={10} /> {post.error_message}</p>}
										<span className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sc?.bg} ${sc?.text}`}>
											{sc?.emoji} {sc?.label}
										</span>
									</div>

									{/* Right side: platforms + account + date + actions */}
									<div className="shrink-0 text-right">
										<div className="flex items-center justify-end gap-1 mb-1">
											{post.platforms.slice(0, 5).map((p: string) => <PlatformIcon key={p} platform={p} size={16} />)}
										</div>
										{post.account_name && post.account_name !== "Cross-Platform Post" ? (
											<p className="text-xs text-[var(--foreground)]">{post.account_name}</p>
										) : post.platforms.length > 1 ? (
											<p className="text-xs text-[var(--sq-primary)]">Cross-Platform Post →</p>
										) : null}
										<p className="text-[10px] text-[var(--muted-foreground)] flex items-center justify-end gap-0.5 mt-0.5">
											<Calendar size={10} />
											{post.scheduled_time ? new Date(post.scheduled_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ", " + new Date(post.scheduled_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
												: post.published_at ? new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ", " + new Date(post.published_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
												: post.created_at ? new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ", " + new Date(post.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
												: ""}
										</p>
										{/* Action buttons — below date, appear on hover */}
										<div className="flex items-center justify-end gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
											{/* View Post — available for published/partially_published posts with at least one live URL */}
											{(() => {
												if (post.status !== "published" && post.status !== "partially_published") return null;
												const pickUrl = (v: any): string | null => {
													if (!v) return null;
													if (typeof v === "string") return v.startsWith("http") ? v : null;
													if (Array.isArray(v)) return (v.find((x: any) => typeof x === "string" && x.startsWith("http")) as string | undefined) ?? null;
													return null;
												};
												const urls: { platform: string; url: string }[] = [];
												if (post.post_urls && typeof post.post_urls === "object" && !Array.isArray(post.post_urls)) {
													for (const [k, v] of Object.entries(post.post_urls)) {
														if (k.startsWith("_")) continue;
														const u = pickUrl(v);
														if (u) urls.push({ platform: k, url: u });
													}
												}
												if (urls.length === 0) return null;
												if (urls.length === 1) {
													return (
														<Button variant="outline" size="sm" className="h-7 w-7 p-0 text-[var(--sq-primary)]" title="View Post"
															onClick={() => window.open(urls[0]!.url, "_blank", "noopener,noreferrer")}>
															<ExternalLink size={13} />
														</Button>
													);
												}
												return (
													<Button variant="outline" size="sm" className="h-7 w-7 p-0 text-[var(--sq-primary)]" title={`View on ${urls.map(u => u.platform).join(", ")}`}
														onClick={() => urls.forEach(u => window.open(u.url, "_blank", "noopener,noreferrer"))}>
														<ExternalLink size={13} />
													</Button>
												);
											})()}
											{/* Edit is only meaningful for posts that can still be changed. Published/failed posts can't be edited. */}
											{(post.status === "draft" || post.status === "scheduled" || post.status === "pending_review") && (
												<Link to={editPath(post.id)}>
													<Button variant="outline" size="sm" className="h-7 w-7 p-0" title="Edit"><Pencil size={13} /></Button>
												</Link>
											)}
											<Button variant="outline" size="sm" className="h-7 w-7 p-0" title="Duplicate"
												onClick={() => duplicateMut.mutate(post.id, { onSuccess: () => toast.success("Post duplicated as draft") })}>
												<Copy size={13} />
											</Button>
											{post.status === "scheduled" && (
												<>
													<Button variant="outline" size="sm" className="h-7 w-7 p-0 text-green-600" title="Share Now"
														onClick={() => shareNowMut.mutate(post.id, { onSuccess: () => toast.success("Publishing now...") })}>
														<Send size={13} />
													</Button>
													<Button variant="outline" size="sm" className="h-7 w-7 p-0 text-amber-600" title="Move to Draft"
														onClick={() => moveToDraftMut.mutate(post.id, { onSuccess: () => toast.success("Moved to draft") })}>
														<FileDown size={13} />
													</Button>
												</>
											)}
											{(post.status === "failed" || post.status === "partially_published") && (
												<Button variant="outline" size="sm" className="h-7 w-7 p-0 text-blue-600" title="Retry"
													onClick={() => retryMut.mutate(post.id, { onSuccess: () => toast.success("Queued for retry") })}>
													<RotateCw size={13} />
												</Button>
											)}
											<Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-500" title="Delete"
												onClick={() => { if (confirm("Delete this post?")) deleteMut.mutate(post.id, { onSuccess: () => toast.success("Deleted") }); }}>
												<Trash2 size={13} />
											</Button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
