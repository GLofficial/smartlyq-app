import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Copy } from "lucide-react";
import { useWorkspaceOverview, useRenameWorkspace, useToggleApproval } from "@/api/workspace/settings";
import { toast } from "sonner";

export function WorkspaceSettingsTab() {
	const { data } = useWorkspaceOverview();
	const renameMut = useRenameWorkspace();
	const approvalMut = useToggleApproval();
	const [editing, setEditing] = useState(false);
	const [name, setName] = useState("");

	if (!data) return <Spinner />;
	const ws = data.workspace;
	const s = data.seats;

	return (
		<div className="space-y-6 max-w-3xl">
			<h2 className="text-xl font-bold">Workspace</h2>

			<Card>
				<CardHeader><CardTitle>Workspace Name</CardTitle></CardHeader>
				<CardContent className="space-y-3">
					<p className="text-xs text-[var(--muted-foreground)]">
						Workspace ID: {ws.id}
						<button className="ml-1.5" onClick={() => { navigator.clipboard.writeText(String(ws.id)); toast.success("Copied!"); }}>
							<Copy size={10} className="inline" />
						</button>
					</p>
					{editing ? (
						<div className="flex gap-2">
							<Input value={name} onChange={(e) => setName(e.target.value)} />
							<Button onClick={() => renameMut.mutate(name, { onSuccess: () => { toast.success("Renamed."); setEditing(false); } })}><Check size={14} /></Button>
							<Button variant="outline" onClick={() => setEditing(false)}><X size={14} /></Button>
						</div>
					) : (
						<div className="flex gap-2 items-center">
							<Input value={ws.name} disabled />
							<Button variant="outline" onClick={() => { setName(ws.name); setEditing(true); }}><Pencil size={14} /></Button>
						</div>
					)}
					<p className="text-xs text-[var(--muted-foreground)]">Only the owner can rename the workspace.</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle>Seats</CardTitle></CardHeader>
				<CardContent className="space-y-2">
					{[["Active", s.active], ["Included", s.included], ["Billable", s.billable], ["Max", s.max ?? "—"]].map(([l, v]) => (
						<div key={String(l)} className="flex justify-between text-sm">
							<span>{String(l)}</span>
							<span className="font-bold">{String(v)}</span>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle>Post Approval</CardTitle></CardHeader>
				<CardContent className="flex items-center justify-between">
					<p className="text-sm text-[var(--muted-foreground)]">When enabled, posts need approval before publishing.</p>
					<button
						type="button"
						role="switch"
						aria-checked={ws.require_post_approval}
						onClick={() => approvalMut.mutate(!ws.require_post_approval, { onSuccess: () => toast.success("Updated.") })}
						className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${ws.require_post_approval ? "bg-[var(--sq-primary)]" : "bg-gray-200"}`}
					>
						<span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${ws.require_post_approval ? "translate-x-5" : "translate-x-0"}`} />
					</button>
				</CardContent>
			</Card>
		</div>
	);
}

function Spinner() {
	return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;
}
