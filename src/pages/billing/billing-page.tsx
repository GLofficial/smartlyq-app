import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Wallet, Receipt, Calendar } from "lucide-react";
import { useBilling } from "@/api/general";

export function BillingPage() {
	const { data, isLoading } = useBilling();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Billing</h1>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<Wallet size={20} className="text-[var(--sq-primary)]" />
						<div>
							<p className="text-2xl font-bold">{isLoading ? "..." : data?.credits ?? 0}</p>
							<p className="text-xs text-[var(--muted-foreground)]">Credits</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<CreditCard size={20} className="text-purple-600" />
						<div>
							<p className="text-lg font-bold">{isLoading ? "..." : data?.plan?.name ?? "Free"}</p>
							<p className="text-xs text-[var(--muted-foreground)]">Current Plan</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<Receipt size={20} className="text-green-600" />
						<div>
							<p className="text-lg font-bold">
								{isLoading ? "..." : data?.plan ? `$${data?.plan.price}/${data?.plan.duration}` : "Free"}
							</p>
							<p className="text-xs text-[var(--muted-foreground)]">Price</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<Calendar size={20} className="text-blue-600" />
						<div>
							<p className="text-sm font-bold">
								{isLoading ? "..." : data?.subscription?.expires_at
									? new Date(data?.subscription.expires_at).toLocaleDateString()
									: "N/A"}
							</p>
							<p className="text-xs text-[var(--muted-foreground)]">Renews</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Recent Transactions</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-20 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !(data?.recent_transactions ?? []).length ? (
						<p className="text-sm text-[var(--muted-foreground)]">No transactions yet.</p>
					) : (
						<div className="space-y-2">
							{data?.recent_transactions.map((t) => (
								<div key={t.id} className="flex items-center justify-between rounded border border-[var(--border)] p-3">
									<div>
										<p className="text-sm font-medium">{t.description || "Transaction"}</p>
										<p className="text-xs text-[var(--muted-foreground)]">{new Date(t.created_at).toLocaleString()}</p>
									</div>
									<span className="font-medium">${t.amount.toFixed(2)}</span>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
