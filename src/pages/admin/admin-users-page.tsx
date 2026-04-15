import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Coins, ToggleLeft, Shield, CreditCard, Trash2, Download, UserPlus, Users } from "lucide-react";
import { useAdminUsers, adminUsersExportUrl, useAdminUserCreate } from "@/api/admin";
import { STORAGE_KEYS } from "@/lib/constants";
import { useAdminPlansFull } from "@/api/admin-plans";
import { CreditAdjustDialog, StatusToggle, RoleChange, PlanAssign, DeleteConfirm } from "./admin-user-actions";
import { toast } from "sonner";

type ActionType = "credits" | "status" | "role" | "plan" | "delete" | null;
interface UserRow { id: number; name: string; email: string; role: number; status: number; credits: number; created_at: string; }

export function AdminUsersPage() {
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [planFilter, setPlanFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [page, setPage] = useState(1);
	const { data, isLoading, refetch } = useAdminUsers(page, search, planFilter, statusFilter);
	const { data: plansData } = useAdminPlansFull();
	const [action, setAction] = useState<ActionType>(null);
	const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
	const [showAdd, setShowAdd] = useState(false);

	const openAction = (user: UserRow, act: ActionType) => { setSelectedUser(user); setAction(act); };
	const close = () => { setSelectedUser(null); setAction(null); refetch(); };

	const plans = (plansData?.plans ?? []).map((p: Record<string, unknown>) => ({
		id: Number(p.id), name: String(p.name ?? ""), duration: String(p.duration ?? "month"),
	}));
	const monthlyPlans  = plans.filter((p) => p.duration === "month");
	const annualPlans   = plans.filter((p) => p.duration === "year");
	const lifetimePlans = plans.filter((p) => p.duration === "lifetime");
	const prepaidPlans  = plans.filter((p) => p.duration === "prepaid");

	const applySearch = () => { setSearch(searchInput); setPage(1); };

	const handleFilterChange = (type: "plan" | "status", val: string) => {
		setPage(1);
		if (type === "plan") setPlanFilter(val);
		else setStatusFilter(val);
	};

	const handleExport = () => {
		const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ?? "";
		const a = document.createElement("a");
		a.href = adminUsersExportUrl();
		// Trigger via fetch to include auth header
		fetch(adminUsersExportUrl(), { headers: { Authorization: `Bearer ${token}` } })
			.then((r) => r.blob())
			.then((blob) => {
				const url = URL.createObjectURL(blob);
				a.href = url;
				a.download = `Users-${new Date().toISOString().slice(0, 10)}.csv`;
				a.click();
				URL.revokeObjectURL(url);
			});
	};

	const v = (n?: number) => (isLoading ? "..." : (n ?? 0).toLocaleString());

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Users</h1>

			{/* Stat cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard label="Free Users" value={v(data?.free_users)} />
				<StatCard label="Paid Users" value={v(data?.paid_users)} />
				<StatCard label="Active Users" value={v(data?.active_users)} />
				<StatCard label="Users This Month" value={v(data?.new_users)} />
			</div>

			{/* Filters + actions */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative flex-1 min-w-48">
					<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
					<Input placeholder="Search users..." value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						onKeyDown={(e) => { if (e.key === "Enter") applySearch(); }}
						className="pl-9" />
				</div>
				<Button onClick={applySearch}>Search</Button>

				<select value={planFilter} onChange={(e) => handleFilterChange("plan", e.target.value)}
					className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm">
					<option value="">All Plans</option>
					{monthlyPlans.length > 0 && <optgroup label="Monthly">{monthlyPlans.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}</optgroup>}
					{annualPlans.length > 0 && <optgroup label="Annual">{annualPlans.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}</optgroup>}
					{lifetimePlans.length > 0 && <optgroup label="Lifetime">{lifetimePlans.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}</optgroup>}
					{prepaidPlans.length > 0 && <optgroup label="Prepaid">{prepaidPlans.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}</optgroup>}
				</select>

				<select value={statusFilter} onChange={(e) => handleFilterChange("status", e.target.value)}
					className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm">
					<option value="">All Statuses</option>
					<option value="1">Active</option>
					<option value="0">Inactive</option>
				</select>

				<div className="ml-auto flex gap-2">
					<Button variant="outline" onClick={handleExport}><Download size={15} className="mr-1.5" />Export</Button>
					<Button onClick={() => setShowAdd(true)}><UserPlus size={15} className="mr-1.5" />Add User</Button>
				</div>
			</div>

			{/* Dialogs */}
			{selectedUser && action === "credits" && <CreditAdjustDialog user={selectedUser} onClose={close} />}
			{selectedUser && action === "status" && <StatusToggle user={selectedUser} onClose={close} />}
			{selectedUser && action === "role" && <RoleChange user={selectedUser} onClose={close} />}
			{selectedUser && action === "plan" && <PlanAssign user={selectedUser} plans={plans} onClose={close} />}
			{selectedUser && action === "delete" && <DeleteConfirm user={selectedUser} onClose={close} />}
			{showAdd && <AddUserDialog plans={plans} onClose={() => { setShowAdd(false); refetch(); }} />}

			{/* Table */}
			<Card>
				<CardHeader><CardTitle className="text-lg">{data ? `${data.total.toLocaleString()} users` : "Loading..."}</CardTitle></CardHeader>
				<CardContent className="p-0">
					{isLoading ? <Spinner /> : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)]">
										<th className="px-4 py-2 font-medium">Username</th>
										<th className="px-4 py-2 font-medium">Email</th>
										<th className="px-4 py-2 font-medium">Join Date</th>
										<th className="px-4 py-2 font-medium">Active Plan</th>
										<th className="px-4 py-2 font-medium">Credits</th>
										<th className="px-4 py-2 font-medium">Status</th>
										<th className="px-4 py-2 font-medium">Actions</th>
									</tr>
								</thead>
								<tbody>
									{(data?.users ?? []).map((u) => (
										<tr key={u.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent)]">
											<td className="px-4 py-2 font-medium">
												{u.name}
												{u.role === 1 && <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">Admin</span>}
											</td>
											<td className="px-4 py-2 text-[var(--muted-foreground)]">{u.email}</td>
											<td className="px-4 py-2 text-xs text-[var(--muted-foreground)]">{new Date(u.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</td>
											<td className="px-4 py-2 text-xs">{u.plan_name || "—"}</td>
											<td className="px-4 py-2 text-xs">{u.credits}</td>
											<td className="px-4 py-2">
												<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.status === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
													{u.status === 1 ? "Active" : "Inactive"}
												</span>
											</td>
											<td className="px-4 py-2">
												<div className="flex gap-1">
													<Button variant="ghost" size="icon" className="h-7 w-7" title="Credits" onClick={() => openAction(u as UserRow, "credits")}><Coins size={14} /></Button>
													<Button variant="ghost" size="icon" className="h-7 w-7" title="Status" onClick={() => openAction(u as UserRow, "status")}><ToggleLeft size={14} /></Button>
													<Button variant="ghost" size="icon" className="h-7 w-7" title="Role" onClick={() => openAction(u as UserRow, "role")}><Shield size={14} /></Button>
													<Button variant="ghost" size="icon" className="h-7 w-7" title="Plan" onClick={() => openAction(u as UserRow, "plan")}><CreditCard size={14} /></Button>
													<Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" title="Delete" onClick={() => openAction(u as UserRow, "delete")}><Trash2 size={14} /></Button>
												</div>
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

function AddUserDialog({ plans, onClose }: { plans: { id: number; name: string }[]; onClose: () => void }) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [planId, setPlanId] = useState(0);
	const [loading, setLoading] = useState(false);
	const create = useAdminUserCreate();

	const submit = async () => {
		if (!name.trim() || !email.trim()) { toast.error("Name and email are required."); return; }
		setLoading(true);
		try {
			const res = await create({ name, email, plan_id: planId });
			toast.success(`User created. Temporary password: ${res.password}`);
			onClose();
		} catch {
			toast.error("Failed to create user.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="w-full max-w-md rounded-xl bg-[var(--card)] p-6 shadow-xl space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold flex items-center gap-2"><Users size={18} />Add User</h2>
					<button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕</button>
				</div>
				<div className="space-y-3">
					<div><label className="text-xs font-medium text-[var(--muted-foreground)]">Full Name</label>
						<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="mt-1" /></div>
					<div><label className="text-xs font-medium text-[var(--muted-foreground)]">Email Address</label>
						<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="mt-1" /></div>
					<div><label className="text-xs font-medium text-[var(--muted-foreground)]">Plan</label>
						<select value={planId} onChange={(e) => setPlanId(Number(e.target.value))}
							className="mt-1 w-full h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm">
							<option value={0}>No Plan</option>
							{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
						</select>
					</div>
				</div>
				<div className="flex justify-end gap-2 pt-2">
					<Button variant="outline" onClick={onClose}>Cancel</Button>
					<Button onClick={submit} disabled={loading}>{loading ? "Creating..." : "Create User"}</Button>
				</div>
			</div>
		</div>
	);
}

function StatCard({ label, value }: { label: string; value: string }) {
	return (
		<Card>
			<CardContent className="flex items-center justify-between p-5">
				<div>
					<p className="text-2xl font-bold">{value}</p>
					<p className="text-sm text-[var(--muted-foreground)]">{label}</p>
				</div>
				<Users size={28} className="text-[var(--sq-primary)] opacity-20" />
			</CardContent>
		</Card>
	);
}

function Spinner() { return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
