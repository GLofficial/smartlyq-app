import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSearch, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useArticles } from "@/api/tools";

export function ArticleGeneratorPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useArticles(page);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Article Generator</h1>

			<Card>
				<CardHeader><CardTitle className="text-lg">Generated Articles ({data?.total ?? 0})</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !(data?.articles ?? []).length ? (
						<div className="flex flex-col items-center gap-3 py-12">
							<FileSearch size={48} className="text-[var(--muted-foreground)]" />
							<p className="text-[var(--muted-foreground)]">No articles generated yet.</p>
						</div>
					) : (
						<div className="space-y-2">
							{data?.articles.map((a) => (
								<div key={a.id} className="flex items-center gap-4 rounded border border-[var(--border)] p-4 hover:bg-[var(--accent)] transition-colors">
									<FileText size={18} className="shrink-0 text-[var(--sq-primary)]" />
									<div className="min-w-0 flex-1">
										<p className="font-medium">{a.title || "Untitled"}</p>
										<p className="text-xs text-[var(--muted-foreground)]">{new Date(a.created).toLocaleDateString()}</p>
									</div>
									<span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
										{a.status || "draft"}
									</span>
								</div>
							))}
						</div>
					)}
					{data && data?.pages > 1 && (
						<div className="mt-4 flex items-center justify-between">
							<p className="text-sm text-[var(--muted-foreground)]">Page {data?.page} of {data?.pages}</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button>
								<Button variant="outline" size="sm" disabled={page >= data?.pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
