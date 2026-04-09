import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Wrench, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminTraces } from "@/api/admin-ai-captain";

export function AdminTracesPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useAdminTraces(page);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">AI Captain Traces</h1>
			<Card>
				<CardHeader><CardTitle className="text-lg">Recent Responses ({data?.total ?? 0})</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? <Spinner /> : !data?.traces.length ? (
						<div className="flex flex-col items-center gap-2 py-8"><Sparkles size={32} className="text-[var(--muted-foreground)]" /><p className="text-sm text-[var(--muted-foreground)]">No traces yet.</p></div>
					) : (
						<div className="space-y-2">
							{data.traces.map((t) => (
								<div key={t.id} className="rounded border border-[var(--border)] p-3">
									<div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
										<span className="font-medium text-[var(--foreground)]">{t.user_name}</span>
										<span>·</span>
										<span>{t.chat_title || `Chat #${t.chat_id}`}</span>
										{t.has_tool_calls && <Wrench size={12} className="text-orange-500" />}
										<span className="ml-auto">{new Date(t.created_at).toLocaleString()}</span>
									</div>
									<p className="mt-1 text-sm line-clamp-2">{t.content}</p>
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

function Spinner() { return <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
