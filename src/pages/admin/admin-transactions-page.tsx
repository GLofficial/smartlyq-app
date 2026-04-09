import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminTransactions } from "@/api/admin";

export function AdminTransactionsPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useAdminTransactions(page);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Transactions</h1>
			<Card>
				<CardHeader><CardTitle className="text-lg">{data ? `${data.total} transactions` : "Loading..."}</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead><tr className="border-b border-[var(--border)]">
									<th className="py-2 text-left font-medium">ID</th>
									<th className="py-2 text-left font-medium">User</th>
									<th className="py-2 text-left font-medium">Amount</th>
									<th className="py-2 text-left font-medium">Description</th>
									<th className="py-2 text-left font-medium">Status</th>
									<th className="py-2 text-left font-medium">Date</th>
								</tr></thead>
								<tbody>
									{(data?.transactions ?? []).map((t) => (
										<tr key={t.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
											<td className="py-2">{t.id}</td>
											<td className="py-2"><p className="font-medium">{t.user_name}</p><p className="text-xs text-[var(--muted-foreground)]">{t.user_email}</p></td>
											<td className="py-2 font-medium">${t.amount.toFixed(2)} {t.currency}</td>
											<td className="py-2 text-[var(--muted-foreground)]">{t.description || "—"}</td>
											<td className="py-2"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{t.status}</span></td>
											<td className="py-2 text-[var(--muted-foreground)]">{new Date(t.created_at).toLocaleDateString()}</td>
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
