import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CreditCard, Receipt } from "lucide-react";
import { useAgencyBilling } from "@/api/agency/billing";

export function AgencyBillingPage() {
	const { data, isLoading } = useAgencyBilling();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Agency Billing</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : (
				<>
					<div className="grid gap-4 sm:grid-cols-3">
						<Card>
							<CardContent className="flex items-center gap-3 p-4">
								<DollarSign size={20} className="text-green-600" />
								<div>
									<p className="text-2xl font-bold">
										${(data?.total_revenue ?? 0).toFixed(2)}
									</p>
									<p className="text-xs text-[var(--muted-foreground)]">Total Revenue</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="flex items-center gap-3 p-4">
								<CreditCard size={20} className="text-blue-600" />
								<div>
									<p className="text-2xl font-bold">{data?.active_subscriptions ?? 0}</p>
									<p className="text-xs text-[var(--muted-foreground)]">Active Subscriptions</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="flex items-center gap-3 p-4">
								<Users size={20} className="text-purple-600" />
								<div>
									<p className="text-2xl font-bold">{data?.total_tenants ?? 0}</p>
									<p className="text-xs text-[var(--muted-foreground)]">Total Tenants</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Receipt size={18} />
								Recent Invoices
							</CardTitle>
						</CardHeader>
						<CardContent>
							{!(data?.invoices ?? []).length ? (
								<div className="flex flex-col items-center gap-3 py-12">
									<Receipt size={48} className="text-[var(--muted-foreground)]" />
									<p className="text-[var(--muted-foreground)]">No invoices yet.</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-[var(--border)]">
												<th className="py-2 text-left font-medium">Tenant</th>
												<th className="py-2 text-left font-medium">Period</th>
												<th className="py-2 text-right font-medium">Amount</th>
												<th className="py-2 text-left font-medium">Status</th>
												<th className="py-2 text-left font-medium">Date</th>
											</tr>
										</thead>
										<tbody>
											{data?.invoices.map((inv) => (
												<tr key={inv.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
													<td className="py-2 font-medium">{inv.tenant_name}</td>
													<td className="py-2 text-[var(--muted-foreground)]">{inv.period}</td>
													<td className="py-2 text-right font-medium">
														${inv.amount.toFixed(2)} {inv.currency}
													</td>
													<td className="py-2">
														<InvoiceBadge status={inv.status} />
													</td>
													<td className="py-2 text-[var(--muted-foreground)]">
														{new Date(inv.created_at).toLocaleDateString()}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}

function InvoiceBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		paid: "bg-green-100 text-green-700",
		pending: "bg-yellow-100 text-yellow-700",
		overdue: "bg-red-100 text-red-700",
		cancelled: "bg-gray-100 text-gray-600",
	};
	return (
		<span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
			{status}
		</span>
	);
}
