import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, ChevronLeft, ChevronRight, Plus, Loader2, Search, Eye, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useArticlesListFull } from "@/api/articles";

function StatusBadge({ status, publishUrl }: { status: number; publishUrl: string }) {
	if (publishUrl) return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Published</span>;
	if (status === 2) return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Ready</span>;
	if (status === 1 || status === 3) return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Processing</span>;
	return <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground">Pending</span>;
}

export function ArticlesPage() {
	const navigate = useNavigate();
	const { hashId } = useParams<{ hashId: string }>();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const { data, isLoading, isFetching } = useArticlesListFull(page, search);

	const handleOpen = (id: string) => navigate(`/w/${hashId}/articles/${id}`);
	const handleNew  = () => navigate(`/w/${hashId}/article-generator`);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
		setSearch(searchInput);
	};

	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Articles</h1>
					{data && <p className="text-sm text-muted-foreground mt-0.5">{data.total} article{data.total !== 1 ? "s" : ""}</p>}
				</div>
				<div className="flex items-center gap-2 flex-1 max-w-xs justify-end">
					<form onSubmit={handleSearch} className="relative flex-1">
						<Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="Search articles..."
							className="pl-8 h-9 text-sm"
						/>
					</form>
					<Button onClick={handleNew} className="gap-1.5 shrink-0">
						<Plus size={16} /> Create Article
					</Button>
				</div>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<Loader2 size={28} className="animate-spin text-primary" />
				</div>
			) : !(data?.articles ?? []).length ? (
				<div className="flex flex-col items-center gap-3 py-16 rounded-xl border border-dashed border-border">
					<FileText size={40} className="text-muted-foreground" />
					<p className="text-muted-foreground text-sm">{search ? "No articles match your search." : "No articles yet."}</p>
					{!search && (
						<Button onClick={handleNew} size="sm" className="gap-1.5 mt-1">
							<Plus size={14} /> Generate your first article
						</Button>
					)}
				</div>
			) : (
				<>
					{isFetching && !isLoading && <div className="h-0.5 bg-primary/20 rounded-full overflow-hidden"><div className="h-full w-1/3 bg-primary animate-pulse rounded-full" /></div>}

					<div className="rounded-xl border border-border overflow-hidden">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border bg-muted/40">
									<th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</th>
									<th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-32">Platform</th>
									<th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Status</th>
									<th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Created</th>
									<th className="px-4 py-3 w-20">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{(data?.articles ?? []).map((a) => (
									<tr key={a.id} className="hover:bg-muted/30 transition-colors group">
										<td className="px-4 py-3">
											<p className="font-medium truncate max-w-xs" title={a.title}>{a.title || "Untitled"}</p>
										</td>
										<td className="px-4 py-3 text-muted-foreground">{a.platform}</td>
										<td className="px-4 py-3">
											<StatusBadge status={a.status} publishUrl={a.publish_url} />
										</td>
										<td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
											{new Date(a.created).toLocaleDateString()}
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-1">
												{a.publish_url ? (
													<a
														href={a.publish_url}
														target="_blank"
														rel="noreferrer"
														className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
														title="View published"
													>
														<Eye size={14} />
													</a>
												) : (
													<button
														type="button"
														onClick={() => handleOpen(a.id)}
														className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
														title="View"
													>
														<Eye size={14} />
													</button>
												)}
												<button
													type="button"
													onClick={() => handleOpen(a.id)}
													className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
													title="Edit"
												>
													<Pen size={14} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
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
