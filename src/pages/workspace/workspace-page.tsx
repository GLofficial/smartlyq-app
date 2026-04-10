import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { useWorkspaceMembers, useInviteMember, useCancelInvite, useRemoveMember } from "@/api/workspace-members";
import { toast } from "sonner";

const TABS = ["Overview", "Members", "Billing", "Activity", "Workspace defaults", "BYOK (AI Providers)"];

export function WorkspacePage() {
	const [params, setParams] = useSearchParams();
	const tab = params.get("tab") || "Overview";
	const setTab = (t: string) => setParams({ tab: t });

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Workspace</h1>
			<p className="text-sm text-[var(--muted-foreground)]">Manage members, defaults, and billing seats.</p>
			<div className="flex gap-1 border-b border-[var(--border)]">
				{TABS.map((t) => (
					<button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-[var(--sq-primary)] text-[var(--sq-primary)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>{t}</button>
				))}
			</div>
			{tab === "Overview" && <OverviewTab />}
			{tab === "Members" && <MembersTab />}
			{tab === "Billing" && <BillingTab />}
			{tab === "Activity" && <ActivityTab />}
			{tab === "Workspace defaults" && <DefaultsTab />}
			{tab === "BYOK (AI Providers)" && <ByokTab />}
		</div>
	);
}

function OverviewTab() {
	const { data } = useQuery({ queryKey: ["workspace", "overview"], queryFn: () => apiClient.get<{ workspace: { id: number; name: string; icon_url: string; require_post_approval: boolean }; seats: { active: number; included: number; billable: number; max: number | null } }>("/api/spa/workspace/overview") });
	const [editing, setEditing] = useState(false);
	const [name, setName] = useState("");
	const renameMut = useMutation({ mutationFn: (n: string) => apiClient.post<{ message: string }>("/api/spa/workspace/rename", { name: n }), onSuccess: () => { toast.success("Renamed."); setEditing(false); queryClient.invalidateQueries({ queryKey: ["workspace"] }); } });
	const approvalMut = useMutation({ mutationFn: (v: boolean) => apiClient.post<{ message: string }>("/api/spa/workspace/toggle-approval", { enabled: v ? 1 : 0 }), onSuccess: () => { toast.success("Updated."); queryClient.invalidateQueries({ queryKey: ["workspace"] }); } });

	if (!data) return <Spinner />;
	const ws = data.workspace; const s = data.seats;
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<Card><CardHeader><CardTitle>Workspace name</CardTitle></CardHeader><CardContent className="space-y-3">
				<p className="text-xs text-[var(--muted-foreground)]">Workspace ID: {ws.id} <button onClick={() => { navigator.clipboard.writeText(String(ws.id)); toast.success("Copied!"); }}><Copy size={12} className="inline" /></button></p>
				{editing ? <div className="flex gap-2"><Input value={name} onChange={(e) => setName(e.target.value)} /><Button onClick={() => renameMut.mutate(name)}><Check size={14} /></Button><Button variant="outline" onClick={() => setEditing(false)}><X size={14} /></Button></div>
				: <div className="flex gap-2 items-center"><Input value={ws.name} disabled /><Button variant="outline" onClick={() => { setName(ws.name); setEditing(true); }}><Pencil size={14} /></Button></div>}
				<p className="text-xs text-[var(--muted-foreground)]">Only the owner can rename the workspace.</p>
			</CardContent></Card>
			<Card><CardHeader><CardTitle>Seats</CardTitle></CardHeader><CardContent className="space-y-2">
				{[["Active", s.active], ["Included", s.included], ["Billable", s.billable], ["Max", s.max ?? "—"]].map(([l, v]) => <div key={String(l)} className="flex justify-between text-sm"><span>{String(l)}</span><span className="font-bold">{String(v)}</span></div>)}
			</CardContent></Card>
			<Card className="lg:col-span-2"><CardHeader><CardTitle>Post Approval</CardTitle></CardHeader><CardContent className="flex items-center justify-between">
				<p className="text-sm text-[var(--muted-foreground)]">When enabled, posts need approval before publishing. Invite clients as <strong>Approver</strong> role.</p>
				<button onClick={() => approvalMut.mutate(!ws.require_post_approval)} className={`relative h-6 w-11 rounded-full transition-colors ${ws.require_post_approval ? "bg-[var(--sq-primary)]" : "bg-gray-300"}`}>
					<span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${ws.require_post_approval ? "translate-x-5" : "translate-x-0.5"}`} /></button>
			</CardContent></Card>
		</div>
	);
}

function MembersTab() {
	const { data, isLoading } = useWorkspaceMembers();
	const inviteMut = useInviteMember(); const cancelMut = useCancelInvite(); const removeMut = useRemoveMember();
	const [email, setEmail] = useState(""); const [role, setRole] = useState("member");
	return (
		<div className="space-y-6">
			<Card><CardHeader><CardTitle>Invite member</CardTitle></CardHeader><CardContent className="flex items-end gap-3">
				<Input placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="max-w-sm" />
				<select value={role} onChange={(e) => setRole(e.target.value)} className="h-10 rounded-md border border-[var(--input)] bg-[var(--background)] px-3 text-sm"><option value="member">Member</option><option value="admin">Admin</option><option value="approver">Approver</option></select>
				<Button onClick={() => { if (!email.trim()) return; inviteMut.mutate({ email, role }, { onSuccess: () => { toast.success("Invited."); setEmail(""); } }); }}>Invite</Button>
			</CardContent></Card>
			{(data?.invites ?? []).length > 0 && <Card><CardHeader><CardTitle>Pending invites</CardTitle></CardHeader><CardContent><Table headers={["Email", "Role", "Actions"]}>{data!.invites.map(i => <tr key={i.id} className="border-b border-[var(--border)]"><td className="py-2">{i.email}</td><td className="py-2"><Badge color="purple">{i.role}</Badge></td><td className="py-2 text-right"><Button variant="outline" size="sm" className="text-red-500" onClick={() => cancelMut.mutate(i.id, { onSuccess: () => toast.success("Cancelled.") })}>Cancel</Button></td></tr>)}</Table></CardContent></Card>}
			<Card><CardHeader><CardTitle>Members</CardTitle></CardHeader><CardContent>{isLoading ? <Spinner /> : <Table headers={["User", "Role", "Status", "Actions"]}>{(data?.members ?? []).map(m => <tr key={m.id} className="border-b border-[var(--border)]"><td className="py-2"><p className="font-medium">{m.name}</p><p className="text-xs text-[var(--muted-foreground)]">{m.email}</p></td><td className="py-2"><Badge color={m.role === "owner" ? "blue" : "purple"}>{m.role}</Badge></td><td className="py-2"><Badge color="green">Active</Badge></td><td className="py-2 text-right">{m.role !== "owner" && <Button variant="outline" size="sm" className="text-red-500" onClick={() => { if (confirm(`Remove ${m.name}?`)) removeMut.mutate(m.id, { onSuccess: () => toast.success("Removed.") }); }}>Remove</Button>}</td></tr>)}</Table>}</CardContent></Card>
		</div>
	);
}

function BillingTab() {
	const { data } = useQuery({ queryKey: ["workspace", "billing"], queryFn: () => apiClient.get<{ plan: { name: string; price: number; seat_price_monthly: number; seat_price_yearly: number; seats_included: number; seats_max: number } | null; credits: number | null; subscription: { expires_at?: string } | null; stripe: { has_subscription: boolean; seat_quantity: number; extra_storage_gb: number } | null }>("/api/spa/workspace/billing") });
	if (!data) return <Spinner />;
	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2">
				<Card><CardContent className="p-4"><p className="text-xs text-[var(--muted-foreground)]">Workspace subscription</p><p className="text-xl font-bold">{data.plan?.name ?? "Free"}</p>{data.subscription?.expires_at && <p className="text-xs text-[var(--muted-foreground)]">Renews: {data.subscription.expires_at}</p>}</CardContent></Card>
				<Card><CardContent className="p-4"><p className="text-xs text-[var(--muted-foreground)]">Credits</p><p className="text-xl font-bold">{data.credits !== null ? Math.round(data.credits) : "Unlimited"}</p></CardContent></Card>
			</div>
			{data.plan && <Card><CardHeader><CardTitle>Seat billing</CardTitle></CardHeader><CardContent>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{[["Included seats", data.plan.seats_included], ["Active seats", data.stripe?.seat_quantity ?? 0], ["Billable seats", Math.max(0, (data.stripe?.seat_quantity ?? 0) - data.plan.seats_included)], ["Max seats", data.plan.seats_max || "—"]].map(([l, v]) => <Card key={String(l)}><CardContent className="p-4"><p className="text-xs text-[var(--muted-foreground)]">{String(l)}</p><p className="text-2xl font-bold">{String(v)}</p></CardContent></Card>)}
				</div>
				<div className="mt-4 space-y-1 text-sm"><p>Seat price (monthly): {data.plan.seat_price_monthly.toFixed(2)}</p><p>Seat price (yearly): {data.plan.seat_price_yearly.toFixed(2)}</p></div>
			</CardContent></Card>}
		</div>
	);
}

function ActivityTab() {
	const [page, setPage] = useState(1);
	const { data } = useQuery({ queryKey: ["workspace", "activity", page], queryFn: () => apiClient.get<{ activity: { id: number; event: string; meta: string; who: string; created_at: string }[]; total: number; page: number; pages: number }>(`/api/spa/workspace/activity?page=${page}`) });
	if (!data) return <Spinner />;
	return (
		<Card><CardHeader><CardTitle>Activity</CardTitle></CardHeader><CardContent>
			<Table headers={["When", "Who", "What"]}>{data.activity.map(a => <tr key={a.id} className="border-b border-[var(--border)]"><td className="py-2 text-xs text-[var(--muted-foreground)] whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td><td className="py-2 text-xs">{a.who}</td><td className="py-2 text-xs">{a.event}{a.meta ? ': ' + a.meta.substring(0, 120) : ''}</td></tr>)}</Table>
			{data.pages > 1 && <div className="mt-3 flex items-center justify-between"><p className="text-xs text-[var(--muted-foreground)]">Page {page} of {data.pages}</p><div className="flex gap-1"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button><Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button></div></div>}
		</CardContent></Card>
	);
}

function DefaultsTab() {
	const { data } = useQuery({ queryKey: ["workspace", "defaults"], queryFn: () => apiClient.get<{ defaults: { id: number; feature: string; allow_owner: boolean; allow_admin: boolean; allow_member: boolean }[] }>("/api/spa/workspace/defaults") });
	const saveMut = useMutation({ mutationFn: (d: unknown[]) => apiClient.post<{ message: string }>("/api/spa/workspace/defaults/save", { defaults: d }), onSuccess: () => { toast.success("Saved."); queryClient.invalidateQueries({ queryKey: ["workspace", "defaults"] }); } });
	const [edits, setEdits] = useState<Record<number, { allow_admin: boolean; allow_member: boolean }>>({});
	if (!data) return <Spinner />;
	return (
		<Card><CardHeader className="flex-row items-center justify-between"><CardTitle>Feature access</CardTitle><Button onClick={() => saveMut.mutate(Object.entries(edits).map(([id, v]) => ({ id: Number(id), ...v })))} disabled={saveMut.isPending || !Object.keys(edits).length}>Save changes</Button></CardHeader><CardContent>
			<p className="mb-3 rounded-md bg-purple-50 p-3 text-sm text-purple-700">Changes made here apply to your workspace members going forward. Workspace owners always have access.</p>
			<Table headers={["Feature", "Description", "Access"]}>{data.defaults.map(d => { const e = edits[d.id]; const admin = e?.allow_admin ?? d.allow_admin; const member = e?.allow_member ?? d.allow_member; return (
				<tr key={d.id} className="border-b border-[var(--border)]"><td className="py-2 capitalize font-medium">{d.feature.replace(/_/g, " ")}</td><td className="py-2 text-xs text-[var(--muted-foreground)]">Controls access to /{d.feature.replace(/_/g, "-")}.</td><td className="py-2 text-right">
					<select value={admin && member ? "all" : admin ? "admin" : "owner"} onChange={(ev) => setEdits(prev => ({ ...prev, [d.id]: { allow_admin: ev.target.value !== "owner", allow_member: ev.target.value === "all" } }))} className="rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-xs"><option value="all">Admins + Members</option><option value="admin">Admins only</option><option value="owner">Owner only</option></select>
				</td></tr>
			)})}</Table>
		</CardContent></Card>
	);
}

function ByokTab() {
	return (
		<Card><CardHeader><CardTitle>Workspace BYOK (AI provider keys)</CardTitle></CardHeader><CardContent className="space-y-4">
			<p className="text-sm text-[var(--muted-foreground)]">Workspace AI provider keys are inherited from the workspace billing owner/agency (Option A). Members use the same OpenAI/Anthropic/Gemini/xAI context and cannot create separate workspace-level provider keys.</p>
			<h4 className="font-medium">Where to manage keys</h4>
			<p className="text-sm text-[var(--muted-foreground)]">Manage AI provider BYOK in <strong>Account → AI Provider Keys (BYOK)</strong> or <strong>Whitelabel → Agency AI keys</strong>.</p>
			<div className="rounded-md bg-purple-50 p-3"><p className="text-sm text-purple-700">Developer API bearer keys are separate and are managed in <a href="/next/my/developer" className="font-medium underline">Developer API</a>.</p></div>
		</CardContent></Card>
	);
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
	const c = color === "blue" ? "bg-blue-100 text-blue-700" : color === "green" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700";
	return <span className={`rounded px-2 py-0.5 text-xs font-medium uppercase ${c}`}>{children}</span>;
}
function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
	return <table className="w-full text-sm"><thead><tr className="border-b border-[var(--border)]">{headers.map(h => <th key={h} className="py-2 text-left font-medium">{h}</th>)}</tr></thead><tbody>{children}</tbody></table>;
}
function Spinner() { return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
