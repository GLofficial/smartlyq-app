import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import { useHistory } from "@/api/general";

export function HistoryPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useHistory(page);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">History</h1>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">{data ? `${data.total} items` : "Loading..."}</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !data?.items.length ? (
						<div className="flex flex-col items-center gap-2 py-12">
							<History size={40} className="text-[var(--muted-foreground)]" />
							<p className="text-sm text-[var(--muted-foreground)]">No history yet.</p>
						</div>
					) : (
						<div className="space-y-2">
							{data.items.map((item) => (
								<div key={item.id} className="rounded border border-[var(--border)] p-4">
									<div className="flex items-center justify-between">
										<p className="font-medium">{item.title || "Untitled"}</p>
										<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs">{item.template}</span>
									</div>
									<p className="mt-1 text-sm text-[var(--muted-foreground)] line-clamp-2">{item.preview}</p>
									<p className="mt-2 text-xs text-[var(--muted-foreground)]">
										{new Date(item.created).toLocaleString()}
									</p>
								</div>
							))}
						</div>
					)}

					{data && data.pages > 1 && (
						<div className="mt-4 flex items-center justify-between">
							<p className="text-sm text-[var(--muted-foreground)]">Page {data.page} of {data.pages}</p>
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
				</CardContent>
			</Card>
		</div>
	);
}
