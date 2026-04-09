import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminSubscriptions } from "@/api/admin";

export function AdminSubscriptionsPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useAdminSubscriptions(page);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Subscriptions</h1>
			<Card>
				<CardHeader><CardTitle className="text-lg">{data ? `${data.total} active` : "Loading..."}</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead><tr className="border-b border-[var(--border)]">
									<th className="py-2 text-left font-medium">ID</th>
									<th className="py-2 text-left font-medium">User</th>
									<th className="py-2 text-left font-medium">Plan</th>
									<th className="py-2 text-left font-medium">Created</th>
									<th className="py-2 text-left font-medium">Expires</th>
								</tr></thead>
								<tbody>
									{(data?.subscriptions ?? []).map((s) => (
										<tr key={s.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
											<td className="py-2">{s.id}</td>
											<td className="py-2"><p className="font-medium">{s.user_name}</p><p className="text-xs text-[var(--muted-foreground)]">{s.user_email}</p></td>
											<td className="py-2">{s.plan_name}</td>
											<td className="py-2 text-[var(--muted-foreground)]">{new Date(s.created_at).toLocaleDateString()}</td>
											<td className="py-2 text-[var(--muted-foreground)]">{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "—"}</td>
										</tr>
									))}
								</tbody>
							</table>
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
