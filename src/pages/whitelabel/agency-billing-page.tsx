import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Wallet,
	Package,
	CreditCard,
	ArrowUpCircle,
} from "lucide-react";
import { useAgencyBilling } from "@/api/whitelabel";

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
					{/* Stats Cards */}
					<div className="grid gap-4 sm:grid-cols-3">
						<StatCard
							icon={Wallet}
							iconColor="text-green-600"
							label="Wallet Balance"
							value={`${(data?.wallet_balance ?? 0).toFixed(2)} ${data?.currency ?? "SQC"}`}
						/>
						<StatCard
							icon={Package}
							iconColor="text-blue-600"
							label="Total Packages"
							value={String(data?.total_packages ?? 0)}
						/>
						<StatCard
							icon={CreditCard}
							iconColor="text-purple-600"
							label="Active Subscriptions"
							value={String(data?.active_subscriptions ?? 0)}
						/>
					</div>

					{/* Packages Table */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Package size={18} />
								Packages
							</CardTitle>
						</CardHeader>
						<CardContent>
							{!(data?.packages ?? []).length ? (
								<EmptyState icon={Package} text="No packages configured." />
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-[var(--border)]">
												<th className="py-2 text-left font-medium">Name</th>
												<th className="py-2 text-right font-medium">Price</th>
												<th className="py-2 text-left font-medium">Duration</th>
												<th className="py-2 text-left font-medium">Status</th>
											</tr>
										</thead>
										<tbody>
											{data?.packages.map((pkg) => (
												<tr
													key={pkg.id}
													className="border-b border-[var(--border)] hover:bg-[var(--accent)]"
												>
													<td className="py-2 font-medium">{pkg.name}</td>
													<td className="py-2 text-right">
														${pkg.price.toFixed(2)}
													</td>
													<td className="py-2 text-[var(--muted-foreground)]">
														{pkg.duration}
													</td>
													<td className="py-2">
														<StatusBadge status={pkg.status} />
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Recent Topups Table */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<ArrowUpCircle size={18} />
								Recent Top-ups
							</CardTitle>
						</CardHeader>
						<CardContent>
							{!(data?.topups ?? []).length ? (
								<EmptyState icon={ArrowUpCircle} text="No top-ups yet." />
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-[var(--border)]">
												<th className="py-2 text-left font-medium">Date</th>
												<th className="py-2 text-right font-medium">Amount</th>
												<th className="py-2 text-right font-medium">Credits</th>
												<th className="py-2 text-left font-medium">Status</th>
											</tr>
										</thead>
										<tbody>
											{data?.topups.map((t) => (
												<tr
													key={t.id}
													className="border-b border-[var(--border)] hover:bg-[var(--accent)]"
												>
													<td className="py-2 text-[var(--muted-foreground)]">
														{new Date(t.date).toLocaleDateString()}
													</td>
													<td className="py-2 text-right font-medium">
														${t.amount.toFixed(2)}
													</td>
													<td className="py-2 text-right">{t.credits}</td>
													<td className="py-2">
														<StatusBadge status={t.status} />
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

/* ── Shared Components ── */

function StatCard({
	icon: Icon,
	iconColor,
	label,
	value,
}: {
	icon: typeof Wallet;
	iconColor: string;
	label: string;
	value: string;
}) {
	return (
		<Card>
			<CardContent className="flex items-center gap-3 p-4">
				<Icon size={20} className={iconColor} />
				<div>
					<p className="text-2xl font-bold">{value}</p>
					<p className="text-xs text-[var(--muted-foreground)]">{label}</p>
				</div>
			</CardContent>
		</Card>
	);
}

function StatusBadge({ status }: { status: string }) {
	const c: Record<string, string> = {
		active: "bg-green-100 text-green-700",
		pending: "bg-yellow-100 text-yellow-700",
		completed: "bg-green-100 text-green-700",
		failed: "bg-red-100 text-red-700",
		inactive: "bg-gray-100 text-gray-600",
	};
	return (
		<span
			className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${c[status] ?? "bg-gray-100 text-gray-600"}`}
		>
			{status}
		</span>
	);
}

function EmptyState({
	icon: Icon,
	text,
}: {
	icon: typeof Wallet;
	text: string;
}) {
	return (
		<div className="flex flex-col items-center gap-3 py-12">
			<Icon size={48} className="text-[var(--muted-foreground)]" />
			<p className="text-[var(--muted-foreground)]">{text}</p>
		</div>
	);
}
