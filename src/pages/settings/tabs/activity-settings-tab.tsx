import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useWorkspaceActivity } from "@/api/workspace/settings";

export function ActivitySettingsTab() {
	const [page, setPage] = useState(1);
	const { data } = useWorkspaceActivity(page);

	if (!data) return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;

	return (
		<div className="max-w-3xl">
			<h2 className="text-xl font-bold mb-4">Activity Log</h2>
			<Card>
				<CardContent className="p-0">
					<table className="w-full text-sm">
						<thead><tr className="border-b border-[var(--border)]"><th className="py-2 px-4 text-left font-medium">When</th><th className="py-2 px-4 text-left font-medium">Who</th><th className="py-2 px-4 text-left font-medium">What</th></tr></thead>
						<tbody>
							{data.activity.map((a) => (
								<tr key={a.id} className="border-b border-[var(--border)]">
									<td className="py-2 px-4 text-xs text-[var(--muted-foreground)] whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td>
									<td className="py-2 px-4 text-xs">{a.who}</td>
									<td className="py-2 px-4 text-xs">{a.event}{a.meta ? ": " + a.meta.substring(0, 120) : ""}</td>
								</tr>
							))}
						</tbody>
					</table>
				</CardContent>
			</Card>
			{data.pages > 1 && (
				<div className="mt-3 flex items-center justify-between">
					<p className="text-xs text-[var(--muted-foreground)]">Page {page} of {data.pages}</p>
					<div className="flex gap-1">
						<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /></Button>
						<Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={14} /></Button>
					</div>
				</div>
			)}
		</div>
	);
}
