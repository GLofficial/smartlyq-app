import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWorkspaceDefaults, useSaveWorkspaceDefaults } from "@/api/workspace/settings";

export function DefaultsSettingsTab() {
	const { data } = useWorkspaceDefaults();
	const saveMut = useSaveWorkspaceDefaults();
	const [edits, setEdits] = useState<Record<number, { allow_admin: boolean; allow_member: boolean }>>({});

	if (!data) return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;

	return (
		<div className="max-w-3xl">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-bold">Workspace Defaults</h2>
				<Button onClick={() => saveMut.mutate(Object.entries(edits).map(([id, v]) => ({ id: Number(id), ...v })))} disabled={saveMut.isPending || !Object.keys(edits).length}>
					Save changes
				</Button>
			</div>
			<p className="mb-4 rounded-md bg-purple-50 p-3 text-sm text-purple-700">Changes made here apply to your workspace members going forward. Workspace owners always have access.</p>
			<Card>
				<CardContent className="p-0">
					<table className="w-full text-sm">
						<thead><tr className="border-b border-[var(--border)]"><th className="py-2 px-4 text-left font-medium">Feature</th><th className="py-2 px-4 text-left font-medium">Description</th><th className="py-2 px-4 text-right font-medium">Access</th></tr></thead>
						<tbody>
							{data.defaults.map((d) => {
								const e = edits[d.id];
								const admin = e?.allow_admin ?? d.allow_admin;
								const member = e?.allow_member ?? d.allow_member;
								return (
									<tr key={d.id} className="border-b border-[var(--border)]">
										<td className="py-2 px-4 capitalize font-medium">{d.feature.replace(/_/g, " ")}</td>
										<td className="py-2 px-4 text-xs text-[var(--muted-foreground)]">Controls access to {d.feature.replace(/_/g, "-")}.</td>
										<td className="py-2 px-4 text-right">
											<select value={admin && member ? "all" : admin ? "admin" : "owner"} onChange={(ev) => setEdits((prev) => ({ ...prev, [d.id]: { allow_admin: ev.target.value !== "owner", allow_member: ev.target.value === "all" } }))} className="rounded border border-[var(--input)] bg-[var(--background)] px-2 py-1 text-xs">
												<option value="all">Admins + Members</option>
												<option value="admin">Admins only</option>
												<option value="owner">Owner only</option>
											</select>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</CardContent>
			</Card>
		</div>
	);
}
