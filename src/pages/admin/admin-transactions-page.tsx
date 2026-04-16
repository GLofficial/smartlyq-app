import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Undo2, Search } from "lucide-react";
import { useAdminTransactions } from "@/api/admin";
import { useAdminPlansFull } from "@/api/admin-plans";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface TxRow {
	id: number;
	user_name: string;
	user_email: string;
	amount: number;
	currency: string;
	status: string;
	method: string;
	plan_name: string;
	payment_id: string;
	created_at: string;
}

const currencySymbol = (c: string) => ({ EUR: "€", USD: "$", GBP: "£", CAD: "CA$", AUD: "A$" }[c] ?? c + " ");
const fmtDate = (d: string) => {
	if (!d) return "—";
	const dt = new Date(d);
	return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};

export function AdminTransactionsPage() {
	const [page, setPage] = useState(1);
	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [methodFilter, setMethodFilter] = useState("");
	const [planFilter, setPlanFilter] = useState("");
	const [sort, setSort] = useState("desc");
	const { data, isLoading } = useAdminTransactions(page, search, statusFilter, methodFilter, planFilter, sort);
	const { data: plansData } = useAdminPlansFull();
	const plans = (plansData?.plans ?? []).map((p) => ({ id: Number(p.id), name: String(p.name ?? ""), duration: String(p.duration ?? "month") }));
	const monthlyPlans  = plans.filter((p) => p.duration === "month");
	const annualPlans   = plans.filter((p) => p.duration === "year");
	const lifetimePlans = plans.filter((p) => p.duration === "lifetime");
	const prepaidPlans  = plans.filter((p) => p.duration === "prepaid");
	const [confirmRefund, setConfirmRefund] = useState<TxRow | null>(null);

	const applySearch = () => { setSearch(searchInput); setPage(1); };
	const handleFilter = (setter: (v: string) => void, val: string) => { setter(val); setPage(1); };

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Transactions</h1>

			{/* Revenue chart */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Revenue</CardTitle>
					<p className="text-sm text-[var(--muted-foreground)]">Below you'll find current month summary of earnings per day except tax. All dates and times are UTC-based.</p>
				</CardHeader>
				<CardContent>
					{isLoading ? <Spinner /> : (
						<ResponsiveContainer width="100%" height={220}>
							<AreaChart data={data?.chart ?? []} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
								<defs>
									<linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
										<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
								<XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
								<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={40} />
								<Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
									formatter={(v: number) => [`${v.toFixed(2)}`, "Revenue"]} />
								<Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#gRevenue)" dot={false} />
							</AreaChart>
						</ResponsiveContainer>
					)}
				</CardContent>
			</Card>

			{confirmRefund && (
				<RefundConfirm tx={confirmRefund} onClose={() => setConfirmRefund(null)} />
			)}

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						Transaction History {data ? `· ${data.total.toLocaleString()}` : ""}
					</CardTitle>
					{/* Filters */}
					<div className="mt-3 flex flex-wrap gap-3">
						<div className="relative flex-1 min-w-48">
							<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
							<Input placeholder="Search by user, email, or transaction ID..." value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								onKeyDown={(e) => { if (e.key === "Enter") applySearch(); }}
								className="pl-9 h-9 text-sm" />
						</div>
						<Button size="sm" onClick={applySearch}>Search</Button>
						<select value={statusFilter} onChange={(e) => handleFilter(setStatusFilter, e.target.value)}
							className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm">
							<option value="">All Statuses</option>
							<option value="paid">Paid</option>
							<option value="cancelled">Cancelled</option>
							<option value="refunded">Refunded</option>
						</select>
						<select value={methodFilter} onChange={(e) => handleFilter(setMethodFilter, e.target.value)}
							className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm">
							<option value="">All Methods</option>
							{(data?.methods ?? []).map((m) => <option key={m} value={m}>{m}</option>)}
						</select>
						<select value={planFilter} onChange={(e) => handleFilter(setPlanFilter, e.target.value)}
							className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm">
							<option value="">All Plans</option>
							{monthlyPlans.length > 0 && <optgroup label="Monthly">{monthlyPlans.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}</optgroup>}
							{annualPlans.length > 0 && <optgroup label="Annual">{annualPlans.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}</optgroup>}
							{lifetimePlans.length > 0 && <optgroup label="Lifetime">{lifetimePlans.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}</optgroup>}
							{prepaidPlans.length > 0 && <optgroup label="Prepaid">{prepaidPlans.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}</optgroup>}
						</select>
						<select value={sort} onChange={(e) => handleFilter(setSort, e.target.value)}
							className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm">
							<option value="desc">Date Descending</option>
							<option value="asc">Date Ascending</option>
						</select>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? <Spinner /> : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)]">
										<th className="px-4 py-2 font-medium">ID</th>
										<th className="px-4 py-2 font-medium">User</th>
										<th className="px-4 py-2 font-medium">Amount</th>
										<th className="px-4 py-2 font-medium">Plan</th>
										<th className="px-4 py-2 font-medium">Method</th>
										<th className="px-4 py-2 font-medium">Status</th>
										<th className="px-4 py-2 font-medium">Date</th>
										<th className="px-4 py-2 font-medium">Actions</th>
									</tr>
								</thead>
								<tbody>
									{(data?.transactions ?? []).map((t) => (
										<tr key={t.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent)]">
											<td className="px-4 py-2 text-xs text-[var(--muted-foreground)]">#{t.id}</td>
											<td className="px-4 py-2">
												<p className="font-medium">{t.user_name}</p>
												<p className="text-xs text-[var(--muted-foreground)]">{t.user_email}</p>
											</td>
											<td className="px-4 py-2 font-medium">{currencySymbol(t.currency)}{t.amount.toFixed(2)}</td>
											<td className="px-4 py-2 text-xs">{t.plan_name || "—"}</td>
											<td className="px-4 py-2 text-xs">{t.method || "—"}</td>
											<td className="px-4 py-2"><StatusBadge status={t.status} /></td>
											<td className="px-4 py-2 text-xs text-[var(--muted-foreground)]">{fmtDate(t.created_at)}</td>
											<td className="px-4 py-2">
												{t.status === "paid" && (
													<Button variant="ghost" size="sm" className="h-7 text-xs"
														onClick={() => setConfirmRefund(t as TxRow)}>
														<Undo2 size={13} className="mr-1" /> Refund
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
						<div className="flex items-center justify-between px-4 py-3">
							<p className="text-sm text-[var(--muted-foreground)]">Page {data.page} of {data.pages}</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /></Button>
								<Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={16} /></Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const map: Record<string, string> = {
		paid:       "bg-green-100 text-green-700",
		cancelled:  "bg-red-100 text-red-600",
		refunded:   "bg-orange-100 text-orange-700",
	};
	const label = status.charAt(0).toUpperCase() + status.slice(1);
	return (
		<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
			{label}
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
					Mark transaction <strong>#{tx.id}</strong> ({currencySymbol(tx.currency)}{tx.amount.toFixed(2)}) for{" "}
					<strong>{tx.user_name}</strong> as refunded?
				</p>
				<div className="flex gap-2">
					<Button variant="destructive" size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
						{mutation.isPending ? "Processing..." : "Refund"}
					</Button>
					<Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
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
