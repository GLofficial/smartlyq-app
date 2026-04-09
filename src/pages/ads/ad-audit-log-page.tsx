import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { useAdAuditLog } from "@/api/ad-manager/audit-log";

export function AdAuditLogPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useAdAuditLog(page);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Ad Audit Log</h1>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						{data ? `${data.total} log entries` : "Loading..."}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !data?.entries.length ? (
						<div className="flex flex-col items-center gap-3 py-12">
							<ClipboardList size={48} className="text-[var(--muted-foreground)]" />
							<p className="text-[var(--muted-foreground)]">No audit log entries yet.</p>
							<p className="text-sm text-[var(--muted-foreground)]">
								Actions on campaigns, ad sets, and ads will appear here.
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)]">
										<th className="py-2 text-left font-medium">Timestamp</th>
										<th className="py-2 text-left font-medium">User</th>
										<th className="py-2 text-left font-medium">Action</th>
										<th className="py-2 text-left font-medium">Entity</th>
										<th className="py-2 text-left font-medium">Details</th>
									</tr>
								</thead>
								<tbody>
									{data.entries.map((entry) => (
										<tr key={entry.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
											<td className="py-2 whitespace-nowrap text-[var(--muted-foreground)]">
												{new Date(entry.timestamp).toLocaleString()}
											</td>
											<td className="py-2 font-medium">{entry.user_name}</td>
											<td className="py-2">
												<ActionBadge action={entry.action} />
											</td>
											<td className="py-2">{entry.entity}</td>
											<td className="py-2 text-[var(--muted-foreground)] max-w-xs truncate">
												{entry.details || "\u2014"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
					{data && data.pages > 1 && (
						<div className="mt-4 flex items-center justify-between">
							<p className="text-sm text-[var(--muted-foreground)]">
								Page {data.page} of {data.pages}
							</p>
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

function ActionBadge({ action }: { action: string }) {
	const colors: Record<string, string> = {
		created: "bg-green-100 text-green-700",
		updated: "bg-blue-100 text-blue-700",
		deleted: "bg-red-100 text-red-700",
		paused: "bg-yellow-100 text-yellow-700",
		activated: "bg-green-100 text-green-700",
	};
	return (
		<span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[action] ?? "bg-gray-100 text-gray-600"}`}>
			{action}
		</span>
	);
}
