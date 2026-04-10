import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Trash2, X, Mail } from "lucide-react";
import { useWorkspaceMembers, useInviteMember, useCancelInvite, useRemoveMember, useChangeMemberRole } from "@/api/workspace-members";
import { toast } from "sonner";

export function MembersPage() {
	const { data, isLoading } = useWorkspaceMembers();
	const inviteMut = useInviteMember();
	const cancelMut = useCancelInvite();
	const removeMut = useRemoveMember();
	const roleMut = useChangeMemberRole();
	const [showInvite, setShowInvite] = useState(false);
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("member");

	const handleInvite = () => {
		if (!email.trim()) { toast.error("Email required"); return; }
		inviteMut.mutate({ email: email.trim(), role }, {
			onSuccess: () => { toast.success("Invite sent."); setShowInvite(false); setEmail(""); },
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed"),
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Workspace Members</h1>
				<Button size="sm" onClick={() => setShowInvite(!showInvite)}><Plus size={14} /> Invite Member</Button>
			</div>

			{showInvite && (
				<Card>
					<CardContent className="flex items-end gap-3 py-4">
						<div className="flex-1 space-y-1">
							<label className="text-xs font-medium">Email</label>
							<Input placeholder="colleague@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
						</div>
						<div className="w-32 space-y-1">
							<label className="text-xs font-medium">Role</label>
							<select value={role} onChange={(e) => setRole(e.target.value)} className="w-full h-10 rounded-md border border-[var(--input)] bg-[var(--background)] px-3 text-sm">
								<option value="member">Member</option>
								<option value="admin">Admin</option>
								<option value="approver">Approver</option>
							</select>
						</div>
						<Button onClick={handleInvite} disabled={inviteMut.isPending}>{inviteMut.isPending ? "Sending..." : "Send Invite"}</Button>
						<Button variant="outline" onClick={() => setShowInvite(false)}><X size={14} /></Button>
					</CardContent>
				</Card>
			)}

			{isLoading ? <Spinner /> : (
				<>
					{/* Active Members */}
					<Card>
						<CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users size={18} /> Members ({(data?.members ?? []).length})</CardTitle></CardHeader>
						<CardContent>
							{!(data?.members ?? []).length ? <p className="text-sm text-[var(--muted-foreground)]">No members yet.</p> : (
								<div className="space-y-2">
									{data!.members.map((m) => (
										<div key={m.id} className="flex items-center justify-between rounded-md border border-[var(--border)] p-3">
											<div className="flex items-center gap-3">
												{m.avatar ? <img src={m.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
												: <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--sq-primary)] text-xs font-bold text-white">{m.name?.charAt(0)?.toUpperCase() || "?"}</div>}
												<div>
													<p className="text-sm font-medium">{m.name}</p>
													<p className="text-xs text-[var(--muted-foreground)]">{m.email}</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<select value={m.role} onChange={(e) => roleMut.mutate({ member_id: m.id, role: e.target.value }, { onSuccess: () => toast.success("Role updated."), onError: () => toast.error("Failed.") })}
													disabled={m.role === "owner"} className="h-8 rounded border border-[var(--input)] bg-[var(--background)] px-2 text-xs">
													<option value="owner" disabled>Owner</option>
													<option value="admin">Admin</option>
													<option value="member">Member</option>
													<option value="approver">Approver</option>
												</select>
												{m.role !== "owner" && (
													<Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" title="Remove"
														onClick={() => { if (confirm(`Remove ${m.name}?`)) removeMut.mutate(m.id, { onSuccess: () => toast.success("Removed.") }); }}>
														<Trash2 size={14} />
													</Button>
												)}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Pending Invites */}
					{(data?.invites ?? []).length > 0 && (
						<Card>
							<CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Mail size={18} /> Pending Invites ({data!.invites.length})</CardTitle></CardHeader>
							<CardContent>
								<div className="space-y-2">
									{data!.invites.map((inv) => (
										<div key={inv.id} className="flex items-center justify-between rounded-md border border-dashed border-[var(--border)] p-3">
											<div>
												<p className="text-sm font-medium">{inv.email}</p>
												<p className="text-xs text-[var(--muted-foreground)]">Role: {inv.role} · Sent {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : ""}</p>
											</div>
											<Button variant="ghost" size="sm" className="text-red-500"
												onClick={() => cancelMut.mutate(inv.id, { onSuccess: () => toast.success("Invite cancelled.") })}>
												Cancel
											</Button>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</>
			)}
		</div>
	);
}

function Spinner() { return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
