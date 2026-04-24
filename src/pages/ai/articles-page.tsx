import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ChevronLeft, ChevronRight, Trash2, Pen, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useArticlesListFull, useDeleteArticle } from "@/api/articles";

function StatusBadge({ status }: { status: string | number }) {
	const s = String(status);
	if (s === "2" || s === "ready") return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Ready</span>;
	if (s === "3") return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Processing</span>;
	return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">Pending</span>;
}

export function ArticlesPage() {
	const navigate = useNavigate();
	const [page, setPage] = useState(1);
	const { data, isLoading, isFetching } = useArticlesListFull(page);
	const deleteArticle = useDeleteArticle();
	const [deleting, setDeleting] = useState<string | null>(null);

	const handleDelete = async (id: string, title: string) => {
		if (!confirm(`Delete "${title || "this article"}"? This cannot be undone.`)) return;
		setDeleting(id);
		try {
			await deleteArticle.mutateAsync(id);
			toast.success("Article deleted.");
		} catch {
			toast.error("Failed to delete.");
		} finally {
			setDeleting(null);
		}
	};

	const handleOpen = (id: string) => {
		const ws = location.pathname.split("/")[2] ?? "";
		navigate(`/w/${ws}/ai/articles/${id}`);
	};

	const handleNew = () => {
		const ws = location.pathname.split("/")[2] ?? "";
		navigate(`/w/${ws}/ai/article-generator`);
	};

	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Articles</h1>
					{data && <p className="text-sm text-muted-foreground mt-0.5">{data.total} article{data.total !== 1 ? "s" : ""}</p>}
				</div>
				<Button onClick={handleNew} className="gap-1.5">
					<Plus size={16} /> New Article
				</Button>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<Loader2 size={28} className="animate-spin text-primary" />
				</div>
			) : !(data?.articles ?? []).length ? (
				<div className="flex flex-col items-center gap-3 py-16 rounded-xl border border-dashed border-border">
					<FileText size={40} className="text-muted-foreground" />
					<p className="text-muted-foreground text-sm">No articles yet.</p>
					<Button onClick={handleNew} size="sm" className="gap-1.5 mt-1">
						<Plus size={14} /> Generate your first article
					</Button>
				</div>
			) : (
				<>
					{isFetching && !isLoading && <div className="h-0.5 bg-primary/20 rounded-full overflow-hidden"><div className="h-full w-1/3 bg-primary animate-pulse rounded-full" /></div>}

					<div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
						{(data?.articles ?? []).map((a) => (
							<div key={a.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group">
								{/* Thumbnail */}
								{a.featured_media ? (
									<img src={a.featured_media} alt="" className="h-14 w-20 rounded-lg object-cover shrink-0" />
								) : (
									<div className="h-14 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
										<FileText size={18} className="text-muted-foreground" />
									</div>
								)}

								{/* Main info */}
								<div className="min-w-0 flex-1 space-y-1">
									<p className="font-medium text-sm truncate">{a.title || "Untitled"}</p>
									{a.tags && (
										<p className="text-xs text-muted-foreground truncate">
											{a.tags.split(",").slice(0, 4).map((t) => t.trim()).filter(Boolean).map((t) => (
												<span key={t} className="inline-block bg-muted rounded px-1.5 py-0.5 mr-1 mb-0.5">{t}</span>
											))}
										</p>
									)}
									<p className="text-xs text-muted-foreground">{new Date(a.created).toLocaleDateString()}</p>
								</div>

								{/* Status + Actions */}
								<div className="flex items-center gap-2 shrink-0">
									<StatusBadge status={a.status} />
									<button
										type="button"
										onClick={() => handleOpen(a.id)}
										className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
										title="Edit"
									>
										<Pen size={14} />
									</button>
									<button
										type="button"
										onClick={() => handleDelete(a.id, a.title)}
										disabled={deleting === a.id}
										className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
										title="Delete"
									>
										{deleting === a.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
									</button>
								</div>
							</div>
						))}
					</div>

					{data && data.pages > 1 && (
						<div className="flex items-center justify-between pt-2">
							<p className="text-sm text-muted-foreground">Page {data.page} of {data.pages}</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
									<ChevronLeft size={16} />
								</Button>
								<Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
									<ChevronRight size={16} />
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
