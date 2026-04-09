import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Building2,
	Users,
	UserPlus,
	Trash2,
	X,
} from "lucide-react";
import {
	useAgencyWorkspaces,
	useAgencyTeam,
	useAddTeamMember,
	useRemoveTeamMember,
} from "@/api/whitelabel";
import { toast } from "sonner";

export function AgencyPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Agency</h1>
			<WorkspacesSection />
			<TeamSection />
		</div>
	);
}

/* ── Workspaces ── */

function WorkspacesSection() {
	const { data, isLoading } = useAgencyWorkspaces();
	const workspaces = data?.workspaces ?? [];

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Building2 size={18} />
					Workspaces
					{!isLoading && (
						<span className="ml-auto text-sm font-normal text-[var(--muted-foreground)]">
							{workspaces.length} total
						</span>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<Spinner />
				) : !workspaces.length ? (
					<Empty icon={Building2} text="No workspaces yet." />
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-[var(--border)]">
									<th className="py-2 text-left font-medium">Name</th>
									<th className="py-2 text-left font-medium">Status</th>
									<th className="py-2 text-left font-medium">Created</th>
								</tr>
							</thead>
							<tbody>
								{workspaces.map((ws) => (
									<tr
										key={ws.id}
										className="border-b border-[var(--border)] hover:bg-[var(--accent)]"
									>
										<td className="py-2 font-medium">{ws.name}</td>
										<td className="py-2">
											<StatusBadge status={ws.status} />
										</td>
										<td className="py-2 text-[var(--muted-foreground)]">
											{new Date(ws.created_at).toLocaleDateString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

/* ── Team ── */

function TeamSection() {
	const { data, isLoading } = useAgencyTeam();
	const members = data?.members ?? [];
	const [showForm, setShowForm] = useState(false);
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("member");
	const addMutation = useAddTeamMember();
	const removeMutation = useRemoveTeamMember();

	const handleAdd = () => {
		if (!email.trim()) return;
		addMutation.mutate(
			{ email: email.trim(), role },
			{
				onSuccess: (d) => {
					toast.success(d.message);
					setEmail("");
					setRole("member");
					setShowForm(false);
				},
				onError: () => toast.error("Failed to add team member."),
			},
		);
	};

	const handleRemove = (memberId: number) => {
		removeMutation.mutate(
			{ member_id: memberId },
			{
				onSuccess: (d) => toast.success(d.message),
				onError: () => toast.error("Failed to remove member."),
			},
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Users size={18} />
					Team Members
					<span className="ml-auto">
						<Button
							size="sm"
							variant={showForm ? "outline" : "default"}
							onClick={() => setShowForm(!showForm)}
						>
							{showForm ? (
								<>
									<X size={14} /> Cancel
								</>
							) : (
								<>
									<UserPlus size={14} /> Add Member
								</>
							)}
						</Button>
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Add form */}
				{showForm && (
					<div className="flex flex-wrap items-end gap-3 rounded-lg border border-[var(--border)] bg-[var(--accent)] p-4">
						<div className="flex-1 min-w-[200px] space-y-1.5">
							<label className="text-sm font-medium">Email</label>
							<Input
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="team@example.com"
							/>
						</div>
						<div className="w-40 space-y-1.5">
							<label className="text-sm font-medium">Role</label>
							<select
								value={role}
								onChange={(e) => setRole(e.target.value)}
								className="flex h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
							>
								<option value="member">Member</option>
								<option value="admin">Admin</option>
								<option value="viewer">Viewer</option>
							</select>
						</div>
						<Button onClick={handleAdd} disabled={addMutation.isPending}>
							{addMutation.isPending ? "Adding..." : "Add"}
						</Button>
					</div>
				)}

				{/* Members table */}
				{isLoading ? (
					<Spinner />
				) : !members.length ? (
					<Empty icon={Users} text="No team members yet." />
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-[var(--border)]">
									<th className="py-2 text-left font-medium">Name</th>
									<th className="py-2 text-left font-medium">Email</th>
									<th className="py-2 text-left font-medium">Role</th>
									<th className="py-2 text-left font-medium">Status</th>
									<th className="py-2 text-right font-medium">Actions</th>
								</tr>
							</thead>
							<tbody>
								{members.map((m) => (
									<tr
										key={m.id}
										className="border-b border-[var(--border)] hover:bg-[var(--accent)]"
									>
										<td className="py-2 font-medium">{m.name}</td>
										<td className="py-2 text-[var(--muted-foreground)]">
											{m.email}
										</td>
										<td className="py-2">
											<RoleBadge role={m.role} />
										</td>
										<td className="py-2">
											<StatusBadge status={m.status} />
										</td>
										<td className="py-2 text-right">
											<button
												type="button"
												onClick={() => handleRemove(m.id)}
												disabled={removeMutation.isPending}
												className="inline-flex items-center gap-1 rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-50"
												title="Remove member"
											>
												<Trash2 size={14} />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

/* ── Shared Components ── */

function StatusBadge({ status }: { status: string }) {
	const c: Record<string, string> = {
		active: "bg-green-100 text-green-700",
		pending: "bg-yellow-100 text-yellow-700",
		invited: "bg-blue-100 text-blue-700",
		suspended: "bg-red-100 text-red-700",
	};
	return (
		<span
			className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${c[status] ?? "bg-gray-100 text-gray-600"}`}
		>
			{status || "unknown"}
		</span>
	);
}

function RoleBadge({ role }: { role: string }) {
	const c: Record<string, string> = {
		admin: "bg-purple-100 text-purple-700",
		member: "bg-blue-100 text-blue-700",
		viewer: "bg-gray-100 text-gray-700",
	};
	return (
		<span
			className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${c[role] ?? "bg-gray-100 text-gray-600"}`}
		>
			{role}
		</span>
	);
}

function Spinner() {
	return (
		<div className="flex h-32 items-center justify-center">
			<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
		</div>
	);
}

function Empty({ icon: Icon, text }: { icon: typeof Building2; text: string }) {
	return (
		<div className="flex flex-col items-center gap-3 py-12">
			<Icon size={48} className="text-[var(--muted-foreground)]" />
			<p className="text-[var(--muted-foreground)]">{text}</p>
		</div>
	);
}
