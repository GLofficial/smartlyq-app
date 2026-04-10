import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Undo2 } from "lucide-react";
import { useAdminTransactions } from "@/api/admin";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";

interface TxRow {
	id: number;
	user_name: string;
	user_email: string;
	amount: number;
	currency: string;
	status: string;
	description: string;
	created_at: string;
}

export function AdminTransactionsPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useAdminTransactions(page);
	const [confirmRefund, setConfirmRefund] = useState<TxRow | null>(null);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Transactions</h1>

			{confirmRefund && (
				<RefundConfirm tx={confirmRefund} onClose={() => setConfirmRefund(null)} />
			)}

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						{data ? `${data.total} transactions` : "Loading..."}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Spinner />
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)]">
										<th className="py-2 text-left font-medium">ID</th>
										<th className="py-2 text-left font-medium">User</th>
										<th className="py-2 text-left font-medium">Amount</th>
										<th className="py-2 text-left font-medium">Description</th>
										<th className="py-2 text-left font-medium">Status</th>
										<th className="py-2 text-left font-medium">Date</th>
										<th className="py-2 text-left font-medium">Actions</th>
									</tr>
								</thead>
								<tbody>
									{(data?.transactions ?? []).map((t) => (
										<tr key={t.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
											<td className="py-2">{t.id}</td>
											<td className="py-2">
												<p className="font-medium">{t.user_name}</p>
												<p className="text-xs text-[var(--muted-foreground)]">{t.user_email}</p>
											</td>
											<td className="py-2 font-medium">
												${t.amount.toFixed(2)} {t.currency}
											</td>
											<td className="py-2 text-[var(--muted-foreground)]">{t.description || "—"}</td>
											<td className="py-2">
												<StatusBadge status={t.status} />
											</td>
											<td className="py-2 text-[var(--muted-foreground)]">
												{new Date(t.created_at).toLocaleDateString()}
											</td>
											<td className="py-2">
												{t.status === "completed" && (
													<Button
														variant="ghost"
														size="sm"
														className="h-7"
														onClick={() => setConfirmRefund(t)}
													>
														<Undo2 size={14} className="mr-1" /> Refund
													</Button>
												)}
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

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		completed: "bg-green-100 text-green-700",
		refunded: "bg-orange-100 text-orange-700",
		pending: "bg-yellow-100 text-yellow-700",
		failed: "bg-red-100 text-red-700",
	};
	return (
		<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
			{status}
		</span>
	);
}

function RefundConfirm({ tx, onClose }: { tx: TxRow; onClose: () => void }) {
	const mutation = useMutation({
		mutationFn: () =>
			apiClient.post<{ message: string }>("/api/spa/admin/transactions/refund", { id: tx.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "transactions"] });
			toast.success(`Transaction #${tx.id} marked as refunded`);
			onClose();
		},
		onError: (err: { message?: string }) => {
			toast.error(err.message ?? "Failed to refund transaction");
		},
	});

	return (
		<Card className="border-orange-200">
			<CardContent className="flex items-center justify-between py-4">
				<p className="text-sm">
					Mark transaction <strong>#{tx.id}</strong> (${tx.amount.toFixed(2)}) for{" "}
					<strong>{tx.user_name}</strong> as refunded?
				</p>
				<div className="flex gap-2">
					<Button variant="destructive" size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
						{mutation.isPending ? "Processing..." : "Refund"}
					</Button>
					<Button variant="outline" size="sm" onClick={onClose}>
						Cancel
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function Spinner() {
	return (
		<div className="flex h-32 items-center justify-center">
			<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
		</div>
	);
}
