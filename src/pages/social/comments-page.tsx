import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, MessageCircle, Send, CheckCircle, MessageSquare, WifiOff } from "lucide-react";
import { useSocialComments, useCommentsSync } from "@/api/social";
import { useReplyComment } from "@/api/social-posts";
import { useSocialAccounts } from "@/api/social-reports";
import { PlatformIcon } from "./platform-icon";
import { SocialFilterSidebar } from "./social-filter-sidebar";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { toast } from "sonner";

export function CommentsPage() {
	const [filter, setFilter] = useState<string>("");
	const [platform, setPlatform] = useState("");
	const [accountId, setAccountId] = useState<number | null>(null);
	const [page, setPage] = useState(1);
	const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
	const { data, isLoading, refetch, isFetching } = useSocialComments(filter || undefined, page);
	const { data: accountsData, isLoading: accountsLoading } = useSocialAccounts();
	const replyMut = useReplyComment();
	const syncMut = useCommentsSync();
	const handleRefresh = () => {
		syncMut.mutate(undefined, {
			onSuccess: (r) => { toast.success(r.message ?? "Comments synced."); refetch(); },
			onError: (err) => toast.error((err as Error).message || "Sync failed."),
		});
	};
	const [reply, setReply] = useState("");

	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const accountsPath = wsHash ? `/w/${wsHash}/social-media/accounts` : "/social-media/accounts";

	const accounts = accountsData?.accounts ?? [];
	const activeAccount = accountId ? accounts.find(a => a.id === accountId) : null;

	const allComments = data?.comments ?? [];
	const repliedCount = allComments.filter(c => c.has_reply).length;
	const unrepliedCount = allComments.length - repliedCount;
	const totalShown = data?.total ?? 0;

	const comments = allComments.filter((c) => {
		if (platform && c.platform !== platform) return false;
		if (activeAccount && c.platform !== activeAccount.platform) return false;
		return true;
	});

	const activeComment = activeCommentId ? comments.find(c => c.id === activeCommentId) : null;

	const handleReply = () => {
		if (!reply.trim() || !activeCommentId) return;
		replyMut.mutate({ comment_id: activeCommentId, reply }, {
			onSuccess: () => { toast.success("Reply sent."); setReply(""); refetch(); },
			onError: () => toast.error("Failed to send reply."),
		});
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[280px_380px_1fr] gap-4 h-[calc(100vh-120px)] min-h-[600px]">
			<SocialFilterSidebar
				title="Comments"
				icon={<MessageSquare size={16} className="text-[var(--sq-primary)]" />}
				platform={platform}
				accountId={accountId}
				accounts={accounts}
				isLoading={accountsLoading}
				needsReconnectCount={accountsData?.needs_reconnect_count ?? 0}
				onPlatformChange={setPlatform}
				onAccountChange={setAccountId}
				onRefresh={handleRefresh}
				isRefreshing={isFetching || syncMut.isPending}
			/>

			<Card className="flex flex-col overflow-hidden">
				<div className="p-3 border-b border-[var(--border)] space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-sm font-semibold">{comments.length} comment{comments.length === 1 ? "" : "s"}</span>
						{data && data.pages > 1 && (
							<div className="flex gap-1">
								<Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
								<Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
							</div>
						)}
					</div>
					<div className="flex gap-1.5 flex-wrap">
						<button onClick={() => { setFilter(""); setPage(1); }}
							className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filter === "" ? "bg-[var(--sq-primary)] text-white" : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/70"}`}>
							All <span className="min-w-[18px] h-4 rounded-full bg-black/10 text-[10px] font-bold px-1.5 flex items-center justify-center">{totalShown}</span>
						</button>
						<button onClick={() => { setFilter("replied"); setPage(1); }}
							className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filter === "replied" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
							Replied <span className="min-w-[18px] h-4 rounded-full bg-black/10 text-[10px] font-bold px-1.5 flex items-center justify-center">{filter === "replied" ? totalShown : repliedCount}</span>
						</button>
						<button onClick={() => { setFilter("unreplied"); setPage(1); }}
							className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filter === "unreplied" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>
							Unreplied <span className="min-w-[18px] h-4 rounded-full bg-black/10 text-[10px] font-bold px-1.5 flex items-center justify-center">{filter === "unreplied" ? totalShown : unrepliedCount}</span>
						</button>
					</div>
				</div>
				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						<div className="flex h-40 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : comments.length === 0 ? (
						<p className="py-8 text-center text-sm text-[var(--muted-foreground)]">No comments found.</p>
					) : (
						comments.map((c) => {
							const isActive = activeCommentId === c.id;
							return (
								<button
									key={c.id}
									onClick={() => setActiveCommentId(c.id)}
									className={`w-full flex items-start gap-3 px-3 py-3 text-left border-b border-[var(--border)] transition-colors ${isActive ? "bg-[var(--sq-primary)]/10 border-l-4 border-l-[var(--sq-primary)] pl-2" : "hover:bg-[var(--muted)]/30"}`}
								>
									<div className="relative shrink-0">
										{c.author_avatar ? (
											<img src={c.author_avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
										) : (
											<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)] text-sm font-semibold">
												{c.author_name.charAt(0).toUpperCase()}
											</div>
										)}
										<div className="absolute -bottom-0.5 -right-0.5 bg-[var(--card)] rounded-full p-0.5">
											<PlatformIcon platform={c.platform} size={12} />
										</div>
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between gap-2">
											<span className="text-sm font-semibold truncate">{c.author_name}</span>
											<span className="text-[10px] text-[var(--muted-foreground)] shrink-0">
												{c.commented_at ? new Date(c.commented_at).toLocaleDateString() : ""}
											</span>
										</div>
										<p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-0.5">{c.content}</p>
										{c.post_title && (
											<p className="text-[10px] text-[var(--muted-foreground)]/70 truncate mt-0.5">on: {c.post_title}</p>
										)}
									</div>
									{c.has_reply && <CheckCircle size={14} className="text-green-500 shrink-0 mt-1" />}
								</button>
							);
						})
					)}
				</div>
			</Card>

			<Card className="flex flex-col overflow-hidden">
				{!activeComment ? (
					<div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--muted-foreground)]">
						<MessageCircle size={48} className="opacity-30" />
						<p className="text-sm font-semibold text-[var(--foreground)]">Comment details</p>
						<p className="text-xs">Select a comment to view details and reply</p>
					</div>
				) : (
					<>
						<div className="p-3 border-b border-[var(--border)] flex items-center gap-3">
							{activeComment.author_avatar ? (
								<img src={activeComment.author_avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
							) : (
								<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)] text-sm font-semibold">
									{activeComment.author_name.charAt(0).toUpperCase()}
								</div>
							)}
							<div className="min-w-0 flex-1">
								<p className="text-sm font-semibold truncate">{activeComment.author_name}</p>
								<div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
									<PlatformIcon platform={activeComment.platform} size={11} />
									<span className="capitalize">{activeComment.platform}</span>
								</div>
							</div>
						</div>
						{activeComment.post_title && (
							<div className="px-4 py-2 bg-[var(--muted)]/30 border-b border-[var(--border)]">
								<p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">Comment on post</p>
								<p className="text-sm truncate mt-0.5">{activeComment.post_title}</p>
							</div>
						)}
						<div className="flex-1 overflow-y-auto p-4 space-y-3">
							<div className="flex items-start gap-3">
								{activeComment.author_avatar ? (
									<img src={activeComment.author_avatar} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
								) : (
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold shrink-0">
										{activeComment.author_name.charAt(0).toUpperCase()}
									</div>
								)}
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<span className="text-sm font-semibold">{activeComment.author_name}</span>
										<span className="text-[10px] text-[var(--muted-foreground)]">
											{activeComment.commented_at ? new Date(activeComment.commented_at).toLocaleString() : ""}
										</span>
									</div>
									<div className="mt-1 bg-[var(--muted)]/40 rounded-lg rounded-tl-none p-3">
										<p className="text-sm whitespace-pre-wrap">{activeComment.content}</p>
									</div>
								</div>
							</div>
							{activeComment.has_reply && activeComment.our_reply && (
								<div className="flex items-start gap-3 justify-end">
									<div className="flex-1 max-w-[85%]">
										<div className="flex items-center justify-end gap-2">
											<span className="text-[10px] text-[var(--muted-foreground)]">Your reply</span>
											<CheckCircle size={12} className="text-green-500" />
										</div>
										<div className="mt-1 bg-[var(--sq-primary)]/10 rounded-lg rounded-tr-none p-3">
											<p className="text-sm whitespace-pre-wrap">{activeComment.our_reply}</p>
										</div>
									</div>
								</div>
							)}
						</div>
						{(() => {
							const commentAcct = accounts.find(a => a.platform === activeComment.platform && a.needs_reconnect);
							if (!commentAcct) return null;
							return (
								<div className="px-3 py-2 border-t border-[var(--border)] flex items-start gap-2 bg-red-50 text-red-700">
									<WifiOff size={14} className="shrink-0 mt-0.5" />
									<div className="text-xs flex-1">
										<p className="font-semibold">Account disconnected — replies unavailable.</p>
										<p className="mt-0.5">The connected {commentAcct.platform} account has expired or been revoked.</p>
									</div>
									<Link to={accountsPath} className="text-xs font-semibold underline shrink-0 mt-0.5">Reconnect</Link>
								</div>
							);
						})()}
						{!activeComment.has_reply && (
							<div className="p-3 border-t border-[var(--border)] flex items-center gap-2">
								{(() => {
									const commentAcctBlocked = accounts.some(a => a.platform === activeComment.platform && a.needs_reconnect);
									return (
										<>
											<Input
												value={reply}
												onChange={(e) => setReply(e.target.value)}
												onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !commentAcctBlocked) { e.preventDefault(); handleReply(); } }}
												placeholder={commentAcctBlocked ? "Account disconnected — reconnect to reply." : "Write a reply..."}
												className="flex-1"
												disabled={commentAcctBlocked}
											/>
											<Button onClick={handleReply} disabled={replyMut.isPending || !reply.trim() || commentAcctBlocked}>
												<Send size={14} /> Reply
											</Button>
										</>
									);
								})()}
							</div>
						)}
					</>
				)}
			</Card>
		</div>
	);
}
