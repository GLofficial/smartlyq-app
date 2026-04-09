import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useArticlesList } from "@/api/content";

export function ArticlesPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useArticlesList(page);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Articles</h1>
			<Card>
				<CardHeader><CardTitle className="text-lg">Generated Articles ({data?.total ?? 0})</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
					) : !data?.articles.length ? (
						<div className="flex flex-col items-center gap-2 py-8"><FileText size={32} className="text-[var(--muted-foreground)]" /><p className="text-sm text-[var(--muted-foreground)]">No articles yet.</p></div>
					) : (
						<div className="space-y-2">
							{data.articles.map((a) => (
								<div key={a.id} className="flex items-center gap-3 rounded border border-[var(--border)] p-3 hover:bg-[var(--accent)]">
									{a.featured_media ? (
										<img src={a.featured_media} alt="" className="h-12 w-16 rounded object-cover" />
									) : (
										<div className="flex h-12 w-16 items-center justify-center rounded bg-[var(--muted)]"><FileText size={16} className="text-[var(--muted-foreground)]" /></div>
									)}
									<div className="min-w-0 flex-1">
										<p className="font-medium text-sm truncate">{a.title || "Untitled"}</p>
										<p className="text-xs text-[var(--muted-foreground)]">{new Date(a.created).toLocaleDateString()}</p>
									</div>
									<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{a.status}</span>
								</div>
							))}
						</div>
					)}
					{data && data.pages > 1 && (
						<div className="mt-4 flex items-center justify-between">
							<p className="text-sm text-[var(--muted-foreground)]">Page {data.page} of {data.pages}</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button>
								<Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
