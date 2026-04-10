import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Check, X, RotateCw, Trash2 } from "lucide-react";
import { useSocialPosts } from "@/api/social";
import { useApprovePost, useRejectPost, useRetryPost, useDeletePost } from "@/api/social-posts";
import { PlatformIcon } from "./platform-icon";
import { toast } from "sonner";

const STATUSES = [
	{ value: "", label: "All" },
	{ value: "scheduled", label: "Scheduled" },
	{ value: "published", label: "Published" },
	{ value: "draft", label: "Draft" },
	{ value: "failed", label: "Failed" },
];

export function ManagePostsPage() {
	const [status, setStatus] = useState("");
	const [page, setPage] = useState(1);
	const { data, isLoading } = useSocialPosts(status || undefined, page);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Manage Posts</h1>
				<Link to="/my/social-media/create-post">
					<Button>
						<Plus size={16} />
						Create Post
					</Button>
				</Link>
			</div>

			{/* Filters */}
			<div className="flex gap-2">
				{STATUSES.map((s) => (
					<Button
						key={s.value}
						variant={status === s.value ? "default" : "outline"}
						size="sm"
						onClick={() => {
							setStatus(s.value);
							setPage(1);
						}}
					>
						{s.label}
					</Button>
				))}
			</div>

			{/* Posts List */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						{data ? `${data?.total} posts` : "Loading..."}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !(data?.posts ?? []).length ? (
						<p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
							No posts found.
						</p>
					) : (
						<div className="space-y-2">
							{data?.posts.map((post) => (
								<div
									key={post.id}
									className="flex items-center gap-4 rounded-md border border-[var(--border)] p-4 transition-colors hover:bg-[var(--accent)]"
								>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">
											{post.title || post.content || "Untitled post"}
										</p>
										<div className="mt-1 flex items-center gap-3">
											<div className="flex items-center gap-1">
												{post.platforms.map((p) => (
													<PlatformIcon key={p} platform={p} size={14} />
												))}
											</div>
											<span className="text-xs text-[var(--muted-foreground)]">
												{post.scheduled_time
													? `Scheduled: ${new Date(post.scheduled_time).toLocaleString()}`
													: post.published_at
														? `Published: ${new Date(post.published_at).toLocaleString()}`
														: post.created_at
															? `Created: ${new Date(post.created_at).toLocaleDateString()}`
															: ""}
											</span>
										</div>
									</div>
									<StatusBadge status={post.status} />
									<PostActions postId={post.id} status={post.status} />
								</div>
							))}
						</div>
					)}

					{/* Pagination */}
					{data && data?.pages > 1 && (
						<div className="mt-4 flex items-center justify-between">
							<p className="text-sm text-[var(--muted-foreground)]">
								Page {data?.page} of {data?.pages}
							</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={page <= 1}
									onClick={() => setPage((p) => p - 1)}
								>
									<ChevronLeft size={16} />
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={page >= data?.pages}
									onClick={() => setPage((p) => p + 1)}
								>
									<ChevronRight size={16} />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function PostActions({ postId, status }: { postId: number; status: string }) {
	const approveMut = useApprovePost();
	const rejectMut = useRejectPost();
	const retryMut = useRetryPost();
	const deleteMut = useDeletePost();

	return (
		<div className="flex shrink-0 gap-1">
			{(status === "draft" || status === "scheduled") && (
				<Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" title="Approve"
					onClick={() => approveMut.mutate(postId, { onSuccess: () => toast.success("Approved"), onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed") })}>
					<Check size={14} />
				</Button>
			)}
			{(status === "draft" || status === "scheduled") && (
				<Button variant="ghost" size="icon" className="h-7 w-7 text-orange-500" title="Reject"
					onClick={() => { if (confirm("Reject this post?")) rejectMut.mutate({ post_id: postId }, { onSuccess: () => toast.success("Rejected"), onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed") }); }}>
					<X size={14} />
				</Button>
			)}
			{(status === "failed" || status === "partially_published") && (
				<Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600" title="Retry"
					onClick={() => retryMut.mutate(postId, { onSuccess: () => toast.success("Queued for retry"), onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed") })}>
					<RotateCw size={14} />
				</Button>
			)}
			<Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" title="Delete"
				onClick={() => { if (confirm("Delete this post?")) deleteMut.mutate(postId, { onSuccess: () => toast.success("Deleted"), onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed") }); }}>
				<Trash2 size={14} />
			</Button>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		scheduled: "bg-blue-100 text-blue-700",
		published: "bg-green-100 text-green-700",
		draft: "bg-gray-100 text-gray-600",
		failed: "bg-red-100 text-red-700",
		partially_published: "bg-yellow-100 text-yellow-700",
	};
	return (
		<span
			className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}
		>
			{status.replace("_", " ")}
		</span>
	);
}
