import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Coins, ToggleLeft, Shield, CreditCard, Trash2 } from "lucide-react";
import { useAdminUsers } from "@/api/admin";
import { useAdminPlansFull } from "@/api/admin-plans";
import { CreditAdjustDialog, StatusToggle, RoleChange, PlanAssign, DeleteConfirm } from "./admin-user-actions";

type ActionType = "credits" | "status" | "role" | "plan" | "delete" | null;
interface UserRow { id: number; name: string; email: string; role: number; status: number; credits: number; created_at: string; }

export function AdminUsersPage() {
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [page, setPage] = useState(1);
	const { data, isLoading } = useAdminUsers(page, search);
	const { data: plansData } = useAdminPlansFull();
	const [action, setAction] = useState<ActionType>(null);
	const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

	const openAction = (user: UserRow, act: ActionType) => { setSelectedUser(user); setAction(act); };
	const close = () => { setSelectedUser(null); setAction(null); };

	const plans = (plansData?.plans ?? []).map((p: Record<string, unknown>) => ({
		id: Number(p.id), name: String(p.name ?? ""),
	}));

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Users</h1>

			<div className="flex gap-3">
				<div className="relative flex-1 max-w-sm">
					<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
					<Input placeholder="Search by name or email..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
						onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }} className="pl-9" />
				</div>
				<Button onClick={() => { setSearch(searchInput); setPage(1); }}>Search</Button>
			</div>

			{selectedUser && action === "credits" && <CreditAdjustDialog user={selectedUser} onClose={close} />}
			{selectedUser && action === "status" && <StatusToggle user={selectedUser} onClose={close} />}
			{selectedUser && action === "role" && <RoleChange user={selectedUser} onClose={close} />}
			{selectedUser && action === "plan" && <PlanAssign user={selectedUser} plans={plans} onClose={close} />}
			{selectedUser && action === "delete" && <DeleteConfirm user={selectedUser} onClose={close} />}

			<Card>
				<CardHeader><CardTitle className="text-lg">{data ? `${data.total} users` : "Loading..."}</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? <Spinner /> : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)]">
										<th className="py-2 text-left font-medium">ID</th>
										<th className="py-2 text-left font-medium">Name</th>
										<th className="py-2 text-left font-medium">Email</th>
										<th className="py-2 text-left font-medium">Role</th>
										<th className="py-2 text-left font-medium">Credits</th>
										<th className="py-2 text-left font-medium">Status</th>
										<th className="py-2 text-left font-medium">Joined</th>
										<th className="py-2 text-left font-medium">Actions</th>
									</tr>
								</thead>
								<tbody>
									{(data?.users ?? []).map((u) => (
										<tr key={u.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
											<td className="py-2">{u.id}</td>
											<td className="py-2 font-medium">{u.name}</td>
											<td className="py-2 text-[var(--muted-foreground)]">{u.email}</td>
											<td className="py-2">{u.role === 1 ? <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">Admin</span> : "User"}</td>
											<td className="py-2">{u.credits}</td>
											<td className="py-2"><span className={`h-2 w-2 inline-block rounded-full ${u.status === 1 ? "bg-green-500" : "bg-gray-400"}`} /></td>
											<td className="py-2 text-[var(--muted-foreground)] text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
											<td className="py-2">
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

function Spinner() { return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
