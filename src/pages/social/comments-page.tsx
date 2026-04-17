import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, MessageCircle, CheckCircle, Send } from "lucide-react";
import { useSocialComments } from "@/api/social";
import { useReplyComment } from "@/api/social-posts";
import { PlatformIcon } from "./platform-icon";
import { toast } from "sonner";

export function CommentsPage() {
	const [filter, setFilter] = useState<string>("");
	const [page, setPage] = useState(1);
	const { data, isLoading } = useSocialComments(filter || undefined, page);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Comments</h1>

			{(() => {
				const all = data?.comments ?? [];
				const repliedCount = all.filter(c => c.has_reply).length;
				const unrepliedCount = all.length - repliedCount;
				const totalShown = data?.total ?? 0;
				return (
					<div className="flex gap-2 flex-wrap">
						<Button variant={filter === "" ? "default" : "outline"} size="sm" onClick={() => { setFilter(""); setPage(1); }}>
							All <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-[var(--muted)] text-[10px] font-bold px-1.5">{totalShown}</span>
						</Button>
						<Button variant={filter === "replied" ? "default" : "outline"} size="sm" onClick={() => { setFilter("replied"); setPage(1); }}>
							Replied <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold px-1.5">{filter === "replied" ? totalShown : repliedCount}</span>
						</Button>
						<Button variant={filter === "unreplied" ? "default" : "outline"} size="sm" onClick={() => { setFilter("unreplied"); setPage(1); }}>
							Unreplied <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold px-1.5">{filter === "unreplied" ? totalShown : unrepliedCount}</span>
						</Button>
					</div>
				);
			})()}

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						{data ? `${data?.total} comments` : "Loading..."}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Spinner />
					) : !(data?.comments ?? []).length ? (
						<p className="py-8 text-center text-sm text-[var(--muted-foreground)]">No comments found.</p>
					) : (
						<div className="space-y-3">
							{data?.comments.map((c) => (
								<div key={c.id} className="rounded-md border border-[var(--border)] p-4">
									<div className="flex items-start gap-3">
										{c.author_avatar ? (
											<img src={c.author_avatar} alt="" className="h-8 w-8 rounded-full" />
										) : (
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted)]">
												<MessageCircle size={14} />
											</div>
										)}
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">{c.author_name}</span>
												<PlatformIcon platform={c.platform} size={14} />
												<span className="text-xs text-[var(--muted-foreground)]">
													{new Date(c.commented_at).toLocaleString()}
												</span>
												{c.has_reply && (
													<CheckCircle size={14} className="text-green-500" />
												)}
											</div>
											<p className="mt-1 text-sm">{c.content}</p>
											{c.post_title && (
												<p className="mt-1 text-xs text-[var(--muted-foreground)]">
													on: {c.post_title}
												</p>
											)}
											{c.has_reply && c.our_reply ? (
												<div className="mt-2 rounded bg-[var(--muted)] p-2 text-sm">
													<span className="font-medium">Your reply: </span>
													{c.our_reply}
												</div>
											) : (
												<ReplyInput commentId={c.id} />
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{data && data?.pages > 1 && (
						<Pagination page={data?.page} pages={data?.pages} onPage={setPage} />
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function Spinner() {
	return (
		<div className="flex h-32 items-center justify-center">
			<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
		</div>
	);
}

function ReplyInput({ commentId }: { commentId: number }) {
	const [reply, setReply] = useState("");
	const replyMut = useReplyComment();

	const handleReply = () => {
		if (!reply.trim()) return;
		replyMut.mutate({ comment_id: commentId, reply }, {
			onSuccess: () => { toast.success("Reply sent."); setReply(""); },
			onError: () => toast.error("Failed to send reply."),
		});
	};

	return (
		<div className="mt-2 flex gap-2">
			<Input placeholder="Write a reply..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleReply()} className="flex-1 h-8 text-xs" />
			<Button size="sm" variant="outline" className="h-8" disabled={replyMut.isPending} onClick={handleReply}><Send size={12} /></Button>
		</div>
	);
}

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
	return (
		<div className="mt-4 flex items-center justify-between">
			<p className="text-sm text-[var(--muted-foreground)]">Page {page} of {pages}</p>
			<div className="flex gap-2">
				<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
					<ChevronLeft size={16} />
				</Button>
				<Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
					<ChevronRight size={16} />
				</Button>
			</div>
		</div>
	);
}
