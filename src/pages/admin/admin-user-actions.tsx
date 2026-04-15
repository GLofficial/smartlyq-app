import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
	useAdminAdjustCredits,
	useAdminToggleStatus,
	useAdminChangeRole,
	useAdminAssignPlan,
	useAdminDeleteUser,
} from "@/api/admin-users";

interface UserRow {
	id: number;
	name: string;
	email: string;
	role: number;
	status: number;
	credits: number | null;
}

export function CreditAdjustDialog({ user, onClose }: { user: UserRow; onClose: () => void }) {
	const [credits, setCredits] = useState(user.credits !== null ? String(user.credits) : "");
	const mut = useAdminAdjustCredits();

	const handleSave = () => {
		const val = parseFloat(credits);
		if (isNaN(val) || val < 0) { toast.error("Enter a valid credit amount."); return; }
		mut.mutate({ user_id: user.id, credits: val }, {
			onSuccess: (d) => { toast.success(d.message); onClose(); },
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed"),
		});
	};

	return (
		<ActionCard title={`Adjust Credits — ${user.name}`} onClose={onClose}>
			<Input type="number" value={credits} placeholder={user.credits === null ? "Unlimited" : "0"}
				onChange={(e) => setCredits(e.target.value)} />
			<Button size="sm" onClick={handleSave} disabled={mut.isPending}>{mut.isPending ? "Saving..." : "Set Credits"}</Button>
		</ActionCard>
	);
}

export function StatusToggle({ user, onClose }: { user: UserRow; onClose: () => void }) {
	const mut = useAdminToggleStatus();
	const newStatus = user.status === 1 ? 0 : 1;

	const handleToggle = () => {
		mut.mutate({ user_id: user.id, status: newStatus }, {
			onSuccess: (d) => { toast.success(d.message); onClose(); },
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed"),
		});
	};

	return (
		<ActionCard title={`${newStatus === 1 ? "Activate" : "Deactivate"} — ${user.name}`} onClose={onClose}>
			<p className="text-sm">{newStatus === 0 ? "This will log the user out and prevent login." : "This will re-enable the user's account."}</p>
			<Button size="sm" variant={newStatus === 0 ? "destructive" : "default"} onClick={handleToggle} disabled={mut.isPending}>
				{mut.isPending ? "..." : newStatus === 1 ? "Activate" : "Deactivate"}
			</Button>
		</ActionCard>
	);
}

export function RoleChange({ user, onClose }: { user: UserRow; onClose: () => void }) {
	const mut = useAdminChangeRole();
	const newRole = user.role === 1 ? 0 : 1;

	const handleChange = () => {
		mut.mutate({ user_id: user.id, role: newRole }, {
			onSuccess: (d) => { toast.success(d.message); onClose(); },
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed"),
		});
	};

	return (
		<ActionCard title={`Change Role — ${user.name}`} onClose={onClose}>
			<p className="text-sm">Current: <strong>{user.role === 1 ? "Admin" : "User"}</strong> → <strong>{newRole === 1 ? "Admin" : "User"}</strong></p>
			<Button size="sm" onClick={handleChange} disabled={mut.isPending}>{mut.isPending ? "..." : "Change Role"}</Button>
		</ActionCard>
	);
}

export function PlanAssign({ user, plans, onClose }: { user: UserRow; plans: { id: number; name: string }[]; onClose: () => void }) {
	const [planId, setPlanId] = useState(0);
	const mut = useAdminAssignPlan();

	const handleAssign = () => {
		if (planId <= 0) { toast.error("Select a plan"); return; }
		mut.mutate({ user_id: user.id, plan_id: planId }, {
			onSuccess: (d) => { toast.success(d.message); onClose(); },
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed"),
		});
	};

	return (
		<ActionCard title={`Assign Plan — ${user.name}`} onClose={onClose}>
			<select value={planId} onChange={(e) => setPlanId(Number(e.target.value))} className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm">
				<option value={0}>Select plan...</option>
				{plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
			</select>
			<Button size="sm" onClick={handleAssign} disabled={mut.isPending || planId <= 0}>{mut.isPending ? "..." : "Assign Plan"}</Button>
		</ActionCard>
	);
}

export function DeleteConfirm({ user, onClose }: { user: UserRow; onClose: () => void }) {
	const mut = useAdminDeleteUser();

	const handleDelete = () => {
		mut.mutate(user.id, {
			onSuccess: (d) => { toast.success(d.message); onClose(); },
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed"),
		});
	};

	return (
		<ActionCard title={`Delete User — ${user.name}`} onClose={onClose}>
			<p className="text-sm text-red-600">This will permanently delete <strong>{user.email}</strong> and all their data. This cannot be undone.</p>
			<Button size="sm" variant="destructive" onClick={handleDelete} disabled={mut.isPending}>{mut.isPending ? "Deleting..." : "Delete Permanently"}</Button>
		</ActionCard>
	);
}

function ActionCard({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
	return (
		<Card className="border-[var(--sq-primary)]/20">
			<CardContent className="py-4 space-y-3">
				<div className="flex items-center justify-between">
					<p className="font-medium text-sm">{title}</p>
					<Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
				</div>
				{children}
			</CardContent>
		</Card>
	);
}
