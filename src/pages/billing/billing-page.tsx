import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, Receipt, Calendar, ChevronLeft, ChevronRight, ArrowUpCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
	useBillingOverview,
	useBillingPayments,
	useBillingSubscriptions,
	useBillingTransactions,
	useCheckout,
	useCancelSubscription,
} from "@/api/billing";

type Tab = "overview" | "payments" | "subscriptions" | "transactions";

export function BillingPage() {
	const [tab, setTab] = useState<Tab>("overview");

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Billing</h1>
			<div className="flex gap-2 border-b border-[var(--border)] pb-2">
				{(["overview", "payments", "subscriptions", "transactions"] as Tab[]).map((t) => (
					<button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${tab === t ? "bg-[var(--primary)] text-white font-medium" : "text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}>
						{t.charAt(0).toUpperCase() + t.slice(1)}
					</button>
				))}
			</div>
			{tab === "overview" && <OverviewTab />}
			{tab === "payments" && <PaymentsTab />}
			{tab === "subscriptions" && <SubscriptionsTab />}
			{tab === "transactions" && <TransactionsTab />}
		</div>
	);
}

function OverviewTab() {
	const { data, isLoading } = useBillingOverview();
	const checkoutMut = useCheckout();
	const cancelMut = useCancelSubscription();
	const [showPlans, setShowPlans] = useState(false);
	const [confirmCancel, setConfirmCancel] = useState(false);

	const handleUpgrade = (planId: number, cycle: string) => {
		checkoutMut.mutate({ plan_id: planId, cycle }, {
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Checkout failed"),
		});
	};

	const handleCancel = () => {
		cancelMut.mutate(undefined, {
			onSuccess: () => { toast.success("Subscription cancelled."); setConfirmCancel(false); },
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Cancellation failed"),
		});
	};

	return (
		<>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard icon={Wallet} color="text-[var(--sq-primary)]" label="Credits" value={isLoading ? "..." : Math.round(data?.credits ?? 0).toLocaleString()} />
				<StatCard icon={CreditCard} color="text-purple-600" label="Current Plan" value={isLoading ? "..." : data?.plan?.name ?? "Free"} />
				<StatCard icon={Receipt} color="text-green-600" label="Price" value={isLoading ? "..." : data?.plan ? `$${data.plan.price}/${data.plan.duration}` : "Free"} />
				<StatCard icon={Calendar} color="text-blue-600" label="Renews" value={isLoading ? "..." : data?.subscription?.expires_at ? new Date(data.subscription.expires_at).toLocaleDateString() : "N/A"} />
			</div>

			<div className="flex gap-3">
				<Button onClick={() => setShowPlans(!showPlans)}><ArrowUpCircle size={16} /> {showPlans ? "Hide Plans" : "Upgrade Plan"}</Button>
				{data?.has_active_subscription && !confirmCancel && (
					<Button variant="outline" onClick={() => setConfirmCancel(true)}><XCircle size={16} /> Cancel Subscription</Button>
				)}
			</div>

			{confirmCancel && (
				<Card className="border-red-200">
					<CardContent className="flex items-center justify-between py-4">
						<p className="text-sm">Cancel your subscription? You'll lose access to premium features.</p>
						<div className="flex gap-2">
							<Button variant="destructive" size="sm" onClick={handleCancel} disabled={cancelMut.isPending}>{cancelMut.isPending ? "Cancelling..." : "Confirm Cancel"}</Button>
							<Button variant="outline" size="sm" onClick={() => setConfirmCancel(false)}>Keep Plan</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{showPlans && data?.available_plans && (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{data.available_plans.filter(p => p.id !== data.plan?.id).map(p => (
						<Card key={p.id}>
							<CardContent className="p-4 space-y-3">
								<div><p className="font-bold text-lg">{p.name}</p><p className="text-sm text-[var(--muted-foreground)]">${p.price}/{p.duration}</p></div>
								<Button size="sm" className="w-full" onClick={() => handleUpgrade(p.id, p.duration)} disabled={checkoutMut.isPending}>
									{checkoutMut.isPending ? "Redirecting..." : "Upgrade"}
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</>
	);
}

function PaymentsTab() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useBillingPayments(page);

	return (
		<Card>
			<CardHeader><CardTitle className="text-lg">Payment History</CardTitle></CardHeader>
			<CardContent>
				{isLoading ? <Spinner /> : !(data?.payments ?? []).length ? <Empty text="No payments yet." /> : (
					<>
						<Table headers={["ID", "Amount", "Currency", "Gateway", "Status", "Date"]}>
							{data!.payments.map(p => (
								<tr key={p.id} className="border-b border-[var(--border)]">
									<td className="py-2">{p.id}</td>
									<td className="py-2 font-medium">${p.amount.toFixed(2)}</td>
									<td className="py-2">{p.currency}</td>
									<td className="py-2">{p.gateway}</td>
									<td className="py-2"><StatusBadge status={p.status} /></td>
									<td className="py-2 text-xs text-[var(--muted-foreground)]">{new Date(p.created_at).toLocaleDateString()}</td>
								</tr>
							))}
						</Table>
						<Pagination page={page} pages={data!.pages} onPage={setPage} />
					</>
				)}
			</CardContent>
		</Card>
	);
}

function SubscriptionsTab() {
	const { data, isLoading } = useBillingSubscriptions();

	return (
		<Card>
			<CardHeader><CardTitle className="text-lg">Subscriptions</CardTitle></CardHeader>
			<CardContent>
				{isLoading ? <Spinner /> : !(data?.subscriptions ?? []).length ? <Empty text="No subscriptions." /> : (
					<Table headers={["ID", "Plan", "Price", "Status", "Start", "Expires"]}>
						{data!.subscriptions.map(s => (
							<tr key={s.id} className="border-b border-[var(--border)]">
								<td className="py-2">{s.id}</td>
								<td className="py-2 font-medium">{s.plan_name}</td>
								<td className="py-2">${s.price.toFixed(2)}</td>
								<td className="py-2"><StatusBadge status={s.status === 1 ? "active" : "inactive"} /></td>
								<td className="py-2 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
								<td className="py-2 text-xs">{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "—"}</td>
							</tr>
						))}
					</Table>
				)}
			</CardContent>
		</Card>
	);
}

function TransactionsTab() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useBillingTransactions(page);

	return (
		<Card>
			<CardHeader><CardTitle className="text-lg">Credit Transactions</CardTitle></CardHeader>
			<CardContent>
				{isLoading ? <Spinner /> : !(data?.transactions ?? []).length ? <Empty text="No transactions." /> : (
					<>
						<Table headers={["ID", "Type", "Amount", "Balance After", "Description", "Date"]}>
							{data!.transactions.map(t => (
								<tr key={t.id} className="border-b border-[var(--border)]">
									<td className="py-2">{t.id}</td>
									<td className="py-2"><StatusBadge status={t.type} /></td>
									<td className="py-2 font-medium">{t.amount.toFixed(4)}</td>
									<td className="py-2">{t.balance_after.toFixed(2)}</td>
									<td className="py-2 text-xs">{t.description || "—"}</td>
									<td className="py-2 text-xs text-[var(--muted-foreground)]">{new Date(t.created_at).toLocaleDateString()}</td>
								</tr>
							))}
						</Table>
						<Pagination page={page} pages={data!.pages} onPage={setPage} />
					</>
				)}
			</CardContent>
		</Card>
	);
}

function StatCard({ icon: Icon, color, label, value }: { icon: React.ElementType; color: string; label: string; value: string }) {
	return (
		<Card><CardContent className="flex items-center gap-3 p-4">
			<Icon size={20} className={color} />
			<div><p className="text-lg font-bold">{value}</p><p className="text-xs text-[var(--muted-foreground)]">{label}</p></div>
		</CardContent></Card>
	);
}

function StatusBadge({ status }: { status: string | number }) {
	const s = String(status).toLowerCase();
	const color = ["active", "1", "paid", "completed"].includes(s) ? "bg-green-100 text-green-700" : ["cancelled", "0", "failed"].includes(s) ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700";
	return <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>{s}</span>;
}

function Spinner() { return <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
function Empty({ text }: { text: string }) { return <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">{text}</p>; }
function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
	return <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-[var(--border)]">{headers.map(h => <th key={h} className="py-2 text-left font-medium">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
	if (pages <= 1) return null;
	return (
		<div className="mt-4 flex items-center justify-between">
			<p className="text-sm text-[var(--muted-foreground)]">Page {page} of {pages}</p>
			<div className="flex gap-2">
				<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={16} /></Button>
				<Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={16} /></Button>
			</div>
		</div>
	);
}
