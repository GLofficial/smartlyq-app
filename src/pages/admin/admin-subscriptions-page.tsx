import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, XCircle, CheckCircle } from "lucide-react";
import { useAdminSubscriptions } from "@/api/admin";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";

interface SubRow {
	id: number;
	user_name: string;
	user_email: string;
	plan_name: string;
	status: number;
	created_at: string;
	expires_at: string | null;
}

export function AdminSubscriptionsPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useAdminSubscriptions(page);
	const [confirmCancel, setConfirmCancel] = useState<SubRow | null>(null);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Subscriptions</h1>

			{confirmCancel && (
				<CancelConfirm sub={confirmCancel} onClose={() => setConfirmCancel(null)} />
			)}

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						{data ? `${data.total} active` : "Loading..."}
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
										<th className="py-2 text-left font-medium">Plan</th>
										<th className="py-2 text-left font-medium">Status</th>
										<th className="py-2 text-left font-medium">Created</th>
										<th className="py-2 text-left font-medium">Expires</th>
										<th className="py-2 text-left font-medium">Actions</th>
									</tr>
								</thead>
								<tbody>
									{(data?.subscriptions ?? []).map((s) => (
										<tr key={s.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
											<td className="py-2">{s.id}</td>
											<td className="py-2">
												<p className="font-medium">{s.user_name}</p>
												<p className="text-xs text-[var(--muted-foreground)]">{s.user_email}</p>
											</td>
											<td className="py-2">{s.plan_name}</td>
											<td className="py-2">
												{s.status === 1 ? (
													<span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
														<CheckCircle size={12} /> Active
													</span>
												) : (
													<span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
														<XCircle size={12} /> Cancelled
													</span>
												)}
											</td>
											<td className="py-2 text-[var(--muted-foreground)]">
												{new Date(s.created_at).toLocaleDateString()}
											</td>
											<td className="py-2 text-[var(--muted-foreground)]">
												{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "—"}
											</td>
											<td className="py-2">
												{s.status === 1 && (
													<Button
														variant="ghost"
														size="sm"
														className="h-7 text-red-500 hover:text-red-600"
														onClick={() => setConfirmCancel(s)}
													>
														<XCircle size={14} className="mr-1" /> Cancel
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

function CancelConfirm({ sub, onClose }: { sub: SubRow; onClose: () => void }) {
	const mutation = useMutation({
		mutationFn: () =>
			apiClient.post<{ message: string }>("/api/spa/admin/subscriptions/cancel", { id: sub.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
			toast.success(`Subscription #${sub.id} cancelled`);
			onClose();
		},
		onError: (err: { message?: string }) => {
			toast.error(err.message ?? "Failed to cancel subscription");
		},
	});

	return (
		<Card className="border-red-200">
			<CardContent className="flex items-center justify-between py-4">
				<p className="text-sm">
					Cancel subscription for <strong>{sub.user_name}</strong> ({sub.plan_name})?
				</p>
				<div className="flex gap-2">
					<Button variant="destructive" size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
						{mutation.isPending ? "Cancelling..." : "Cancel Subscription"}
					</Button>
					<Button variant="outline" size="sm" onClick={onClose}>
						Keep
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
