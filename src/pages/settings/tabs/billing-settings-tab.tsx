import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Wallet, Bell, Receipt, Pencil, Save, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import {
	useBillingOverview, useBillingPayments, useBillingTransactions,
	usePaymentMethod, useSaveBillingAddress, useAutoRecharge, useSaveAutoRecharge,
	useSpendingAlerts, useSaveSpendingAlerts, useCancelSubscription,
} from "@/api/billing";
import { toast } from "sonner";

const SUB_TABS = [
	{ key: "subscriptions", label: "Subscriptions", icon: Receipt },
	{ key: "payments", label: "Payments", icon: CreditCard },
	{ key: "wallet", label: "Wallet & Transactions", icon: Wallet },
	{ key: "notifications", label: "Notifications", icon: Bell },
];

export function BillingSettingsTab() {
	const [tab, setTab] = useState("subscriptions");

	return (
		<div className="max-w-4xl">
			<h2 className="text-xl font-bold mb-1">Billing Dashboard</h2>
			<div className="flex gap-1 border-b border-[var(--border)] mb-6">
				{SUB_TABS.map((t) => (
					<button key={t.key} onClick={() => setTab(t.key)} className={cn(
						"flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
						tab === t.key ? "border-[var(--sq-primary)] text-[var(--sq-primary)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
					)}><t.icon size={14} />{t.label}</button>
				))}
			</div>
			{tab === "subscriptions" && <SubscriptionsTab />}
			{tab === "payments" && <PaymentsTab />}
			{tab === "wallet" && <WalletTab />}
			{tab === "notifications" && <NotificationsTab />}
		</div>
	);
}

function SubscriptionsTab() {
	const { data, isLoading } = useBillingOverview();
	const cancelMut = useCancelSubscription();
	if (isLoading) return <Spinner />;

	return (
		<div className="space-y-6">
			<Card>
				<CardContent className="flex items-center justify-between p-6">
					<div>
						<p className="text-sm text-[var(--muted-foreground)]">Your current plan</p>
						<div className="flex items-baseline gap-3 mt-1">
							<span className="text-3xl font-bold">{data?.plan?.name ?? "Free"}</span>
							{data?.plan?.price ? (
								<span className="text-2xl text-[var(--muted-foreground)]">${data.plan.price}<span className="text-sm">/{data.plan.duration === "year" ? "year" : "month"}</span></span>
							) : null}
						</div>
						{data?.subscription?.expires_at && (
							<p className="text-xs text-[var(--muted-foreground)] mt-2">Next invoice: {new Date(data.subscription.expires_at).toLocaleDateString()}</p>
						)}
					</div>
					{data?.has_active_subscription && (
						<Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => { if (confirm("Cancel your subscription?")) cancelMut.mutate(); }}>
							Cancel Subscription
						</Button>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardContent className="flex items-center justify-between p-6">
					<div>
						<p className="text-sm text-[var(--muted-foreground)]">Credits balance</p>
						<p className="text-3xl font-bold mt-1">{Math.round(data?.credits ?? 0).toLocaleString()}</p>
					</div>
					<div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
						<Wallet size={14} /> Active
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function PaymentsTab() {
	const { data: pm } = usePaymentMethod();
	const saveMut = useSaveBillingAddress();
	const [page, setPage] = useState(1);
	const { data: payments } = useBillingPayments(page);
	const [editAddr, setEditAddr] = useState(false);
	const [addr, setAddr] = useState({ address: "", city: "", state: "", country: "", postal: "" });
	const [addrInit, setAddrInit] = useState(false);

	if (pm && !addrInit) { setAddr(pm.billing_address); setAddrInit(true); }

	const handleSaveAddr = () => {
		saveMut.mutate(addr, {
			onSuccess: () => { toast.success("Billing address saved."); setEditAddr(false); },
			onError: () => toast.error("Failed to save."),
		});
	};

	return (
		<div className="space-y-6">
			<div className="grid gap-4 lg:grid-cols-2">
				{/* Payment Method */}
				<Card>
					<CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Payment Method</CardTitle></CardHeader>
					<CardContent>
						{pm?.card ? (
							<div className="flex items-center gap-3">
								<div className="rounded bg-[var(--muted)] px-3 py-2 text-xs font-bold uppercase">{pm.card.brand}</div>
								<div>
									<p className="text-sm font-medium">•••• •••• •••• {pm.card.last4}</p>
									<p className="text-xs text-[var(--muted-foreground)]">Expires {pm.card.exp_month}/{pm.card.exp_year}</p>
								</div>
							</div>
						) : (
							<p className="text-sm text-[var(--muted-foreground)]">No payment method on file</p>
						)}
					</CardContent>
				</Card>

				{/* Billing Info */}
				<Card>
					<CardHeader className="flex-row items-center justify-between">
						<CardTitle className="text-base">Billing Information</CardTitle>
						<Button variant="ghost" size="sm" onClick={() => setEditAddr(!editAddr)}><Pencil size={14} /></Button>
					</CardHeader>
					<CardContent>
						{editAddr ? (
							<div className="space-y-2">
								<Input placeholder="Address" value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} />
								<div className="grid grid-cols-2 gap-2">
									<Input placeholder="City" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
									<Input placeholder="Postal" value={addr.postal} onChange={(e) => setAddr({ ...addr, postal: e.target.value })} />
								</div>
								<div className="grid grid-cols-2 gap-2">
									<Input placeholder="State" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} />
									<Input placeholder="Country" value={addr.country} onChange={(e) => setAddr({ ...addr, country: e.target.value })} />
								</div>
								<Button size="sm" onClick={handleSaveAddr} disabled={saveMut.isPending}><Save size={14} /> Save</Button>
							</div>
						) : (
							<p className="text-sm">{[addr.address, addr.city, addr.state, addr.postal, addr.country].filter(Boolean).join(", ") || "No billing address"}</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Payments History */}
			<Card>
				<CardHeader><CardTitle className="text-base">Payments History</CardTitle></CardHeader>
				<CardContent className="p-0">
					<table className="w-full text-sm">
						<thead><tr className="border-b border-[var(--border)]">
							<th className="py-2 px-4 text-left font-medium">Date</th>
							<th className="py-2 px-4 text-left font-medium">Amount</th>
							<th className="py-2 px-4 text-left font-medium">Status</th>
						</tr></thead>
						<tbody>
							{(payments?.payments ?? []).map((p) => (
								<tr key={p.id} className="border-b border-[var(--border)]">
									<td className="py-2 px-4 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
									<td className="py-2 px-4 text-xs font-medium">{p.currency} {p.amount.toFixed(2)}</td>
									<td className="py-2 px-4"><StatusBadge status={p.status} /></td>
								</tr>
							))}
							{!(payments?.payments ?? []).length && <tr><td colSpan={3} className="py-6 text-center text-sm text-[var(--muted-foreground)]">No payments yet</td></tr>}
						</tbody>
					</table>
				</CardContent>
			</Card>
			{(payments?.pages ?? 0) > 1 && <Pagination page={page} pages={payments!.pages} onPage={setPage} />}
		</div>
	);
}

function WalletTab() {
	const { data: overview } = useBillingOverview();
	const { data: ar } = useAutoRecharge();
	const saveMut = useSaveAutoRecharge();
	const [page, setPage] = useState(1);
	const { data: txns } = useBillingTransactions(page);
	const [arForm, setArForm] = useState({ enabled: false, threshold: 500, pack_plan_id: 0 });
	const [arInit, setArInit] = useState(false);

	if (ar && !arInit) { setArForm({ enabled: ar.enabled, threshold: ar.threshold, pack_plan_id: ar.pack_plan_id }); setArInit(true); }

	const handleSaveAr = () => {
		saveMut.mutate(arForm, {
			onSuccess: () => toast.success("Auto-recharge settings saved."),
			onError: () => toast.error("Failed to save."),
		});
	};

	return (
		<div className="space-y-6">
			{/* Balance */}
			<Card>
				<CardContent className="flex items-center justify-between p-6">
					<div>
						<p className="text-sm text-[var(--muted-foreground)]">Your wallet balance</p>
						<p className="text-3xl font-bold mt-1">{Math.round(overview?.credits ?? 0).toLocaleString()} <span className="text-lg font-normal text-[var(--muted-foreground)]">credits</span></p>
					</div>
				</CardContent>
			</Card>

			{/* Auto-recharge */}
			<Card>
				<CardHeader><CardTitle className="text-base">Auto-Recharge</CardTitle></CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<p className="text-sm">Automatically recharge when balance is low</p>
						<button type="button" role="switch" aria-checked={arForm.enabled} onClick={() => setArForm({ ...arForm, enabled: !arForm.enabled })}
							className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${arForm.enabled ? "bg-[var(--sq-primary)]" : "bg-gray-200"}`}>
							<span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${arForm.enabled ? "translate-x-5" : "translate-x-0"}`} />
						</button>
					</div>
					{arForm.enabled && (
						<div className="flex items-center gap-3 flex-wrap">
							<span className="text-sm">Recharge with</span>
							<select value={arForm.pack_plan_id} onChange={(e) => setArForm({ ...arForm, pack_plan_id: Number(e.target.value) })} className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-1.5 text-sm">
								<option value={0}>Select pack...</option>
								{(ar?.packs ?? []).map((p) => <option key={p.id} value={p.id}>${p.price} ({p.credits} credits)</option>)}
							</select>
							<span className="text-sm">when balance is lower than</span>
							<Input type="number" value={arForm.threshold} onChange={(e) => setArForm({ ...arForm, threshold: Number(e.target.value) })} className="w-24 h-8" />
							<span className="text-sm">credits</span>
						</div>
					)}
					<Button size="sm" onClick={handleSaveAr} disabled={saveMut.isPending}><Save size={14} /> Save</Button>
				</CardContent>
			</Card>

			{/* Transactions */}
			<Card>
				<CardHeader><CardTitle className="text-base">Wallet Transactions</CardTitle></CardHeader>
				<CardContent className="p-0">
					<table className="w-full text-sm">
						<thead><tr className="border-b border-[var(--border)]">
							<th className="py-2 px-4 text-left font-medium">Date</th>
							<th className="py-2 px-4 text-left font-medium">Type</th>
							<th className="py-2 px-4 text-right font-medium">Amount</th>
							<th className="py-2 px-4 text-right font-medium">Balance</th>
						</tr></thead>
						<tbody>
							{(txns?.transactions ?? []).map((t) => (
								<tr key={t.id} className="border-b border-[var(--border)]">
									<td className="py-2 px-4 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
									<td className="py-2 px-4 text-xs capitalize">{t.type.replace("_", " ")}</td>
									<td className={`py-2 px-4 text-xs text-right font-medium ${t.amount >= 0 ? "text-green-600" : "text-red-600"}`}>{t.amount >= 0 ? "+" : ""}{t.amount.toFixed(2)}</td>
									<td className="py-2 px-4 text-xs text-right">{t.balance_after.toFixed(2)}</td>
								</tr>
							))}
							{!(txns?.transactions ?? []).length && <tr><td colSpan={4} className="py-6 text-center text-sm text-[var(--muted-foreground)]">No transactions yet</td></tr>}
						</tbody>
					</table>
				</CardContent>
			</Card>
			{(txns?.pages ?? 0) > 1 && <Pagination page={page} pages={txns!.pages} onPage={setPage} />}
		</div>
	);
}

function NotificationsTab() {
	const { data } = useSpendingAlerts();
	const saveMut = useSaveSpendingAlerts();
	const [form, setForm] = useState({ enabled: false, threshold: 100, frequency: "monthly", recipients: [] as string[] });
	const [init, setInit] = useState(false);
	const [newEmail, setNewEmail] = useState("");

	if (data && !init) { setForm({ enabled: data.enabled, threshold: data.threshold, frequency: data.frequency, recipients: data.recipients }); setInit(true); }

	const addRecipient = () => {
		const email = newEmail.trim();
		if (!email || form.recipients.includes(email)) return;
		setForm({ ...form, recipients: [...form.recipients, email] });
		setNewEmail("");
	};

	const removeRecipient = (email: string) => {
		setForm({ ...form, recipients: form.recipients.filter((r) => r !== email) });
	};

	const handleSave = () => {
		saveMut.mutate(form, {
			onSuccess: () => toast.success("Spending alert settings saved."),
			onError: () => toast.error("Failed to save."),
		});
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader><CardTitle className="text-base">Spending Alert</CardTitle></CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<p className="text-sm">Notify when spending exceeds a threshold</p>
						<button type="button" role="switch" aria-checked={form.enabled} onClick={() => setForm({ ...form, enabled: !form.enabled })}
							className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.enabled ? "bg-[var(--sq-primary)]" : "bg-gray-200"}`}>
							<span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${form.enabled ? "translate-x-5" : "translate-x-0"}`} />
						</button>
					</div>
					{form.enabled && (
						<>
							<div className="flex items-center gap-3">
								<span className="text-sm">Notify when usage exceeds</span>
								<div className="flex items-center gap-1"><span className="text-sm">$</span><Input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} className="w-24 h-8" /></div>
								<select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-1.5 text-sm">
									<option value="monthly">Monthly</option>
									<option value="weekly">Weekly</option>
								</select>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{form.enabled && (
				<Card>
					<CardHeader><CardTitle className="text-base">Notification Recipients</CardTitle></CardHeader>
					<CardContent className="space-y-3">
						<div className="flex gap-2">
							<Input placeholder="Add email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addRecipient()} className="max-w-xs" />
							<Button size="sm" variant="outline" onClick={addRecipient}><Plus size={14} /></Button>
						</div>
						{form.recipients.map((email) => (
							<div key={email} className="flex items-center justify-between rounded-md border border-[var(--border)] px-3 py-2">
								<span className="text-sm">{email}</span>
								<Button variant="ghost" size="sm" className="text-red-500 h-7 w-7 p-0" onClick={() => removeRecipient(email)}><Trash2 size={14} /></Button>
							</div>
						))}
						{!form.recipients.length && <p className="text-xs text-[var(--muted-foreground)]">No recipients added yet</p>}
					</CardContent>
				</Card>
			)}

			<Button onClick={handleSave} disabled={saveMut.isPending}><Save size={14} /> Save Settings</Button>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const s = String(status);
	const color = s === "1" || s === "succeeded" ? "bg-green-100 text-green-700" : s === "2" || s === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600";
	const label = s === "1" || s === "succeeded" ? "Succeeded" : s === "2" || s === "pending" ? "Pending" : s === "0" ? "Failed" : s;
	return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{label}</span>;
}

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
	return (
		<div className="flex items-center justify-between">
			<p className="text-xs text-[var(--muted-foreground)]">Page {page} of {pages}</p>
			<div className="flex gap-1">
				<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={14} /></Button>
				<Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={14} /></Button>
			</div>
		</div>
	);
}

function Spinner() { return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
