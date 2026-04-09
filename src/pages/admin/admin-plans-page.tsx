import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Check, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { useEditPlan } from "@/api/admin-pricing";
import { PLAN_COLUMN_GROUPS } from "./admin-plans-config";
import { toast } from "sonner";

export function AdminPlansPage() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin", "plans", "full"],
		queryFn: () => apiClient.get<{ plans: Record<string, unknown>[] }>("/api/spa/admin/plans/full"),
	});
	const [activeGroup, setActiveGroup] = useState(0);
	const [editingPlan, setEditingPlan] = useState<number | null>(null);
	const [editValues, setEditValues] = useState<Record<string, unknown>>({});
	const editMutation = useEditPlan();

	const plans = data?.plans ?? [];
	const group = PLAN_COLUMN_GROUPS[activeGroup];

	const startEdit = (plan: Record<string, unknown>) => {
		setEditingPlan(Number(plan.id));
		setEditValues({ ...plan });
	};

	const cancelEdit = () => { setEditingPlan(null); setEditValues({}); };

	const saveEdit = () => {
		if (!editingPlan) return;
		const fields: Record<string, unknown> = {};
		for (const col of group?.columns ?? []) {
			if (editValues[col.key] !== undefined) fields[col.key] = editValues[col.key];
		}
		editMutation.mutate({ id: editingPlan, fields }, {
			onSuccess: () => {
				toast.success("Plan updated.");
				setEditingPlan(null);
				queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
			},
			onError: () => toast.error("Failed to update."),
		});
	};

	if (isLoading) return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Plans and Pricing</h1>
				<span className="text-sm text-[var(--muted-foreground)]">{plans.length} plans</span>
			</div>

			<div className="flex flex-wrap gap-2">
				{PLAN_COLUMN_GROUPS.map((g, i) => (
					<Button key={g.label} variant={activeGroup === i ? "default" : "outline"} size="sm" onClick={() => { setActiveGroup(i); cancelEdit(); }}>
						{g.label}
					</Button>
				))}
			</div>

			{group && (
				<Card>
					<CardHeader><CardTitle className="text-lg">{group.label}</CardTitle></CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)]">
										{group.columns.map((col) => (
											<th key={col.key} className="py-2 px-3 text-left font-medium whitespace-nowrap">{col.label}</th>
										))}
										<th className="py-2 px-3 text-center font-medium">Action</th>
									</tr>
								</thead>
								<tbody>
									{plans.map((plan) => {
										const planId = Number(plan.id);
										const isEditing = editingPlan === planId;
										return (
											<tr key={planId} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
												{group.columns.map((col) => {
													const val = isEditing ? editValues[col.key] : plan[col.key];
													return (
														<td key={col.key} className="py-2 px-3 whitespace-nowrap">
															{isEditing ? (
																col.type === "bool" ? (
																	<select value={Number(val ?? 0)} onChange={(e) => setEditValues(p => ({...p, [col.key]: Number(e.target.value)}))}
																		className="h-7 rounded border border-[var(--input)] bg-[var(--background)] px-2 text-xs">
																		<option value={1}>Yes</option>
																		<option value={0}>No</option>
																	</select>
																) : col.type === "price" ? (
																	<Input type="number" step="0.01" value={String(val ?? 0)} onChange={(e) => setEditValues(p => ({...p, [col.key]: e.target.value}))} className="h-7 w-20 text-xs" />
																) : col.type === "number" ? (
																	<Input type="number" value={String(val ?? "")} onChange={(e) => setEditValues(p => ({...p, [col.key]: e.target.value}))} className="h-7 w-20 text-xs" />
																) : (
																	<Input value={String(val ?? "")} onChange={(e) => setEditValues(p => ({...p, [col.key]: e.target.value}))} className="h-7 w-28 text-xs" />
																)
															) : (
																col.type === "bool" ? (
																	<span className={`text-xs font-medium ${Number(val) ? "text-green-600" : "text-red-500"}`}>{Number(val) ? "Yes" : "No"}</span>
																) : col.type === "price" ? (
																	<span className="font-medium">{`€${Number(val ?? 0).toFixed(0)}/${String(plan.duration ?? "m")}`}</span>
																) : col.type === "number" ? (
																	<span>{val === null || val === undefined ? "—" : String(val)}</span>
																) : (
																	<span className="font-medium">{String(val ?? "")}</span>
																)
															)}
														</td>
													);
												})}
												<td className="py-2 px-3 text-center">
													{isEditing ? (
														<div className="flex gap-1 justify-center">
															<Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveEdit} disabled={editMutation.isPending}><Check size={14} /></Button>
															<Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}><X size={14} /></Button>
														</div>
													) : (
														<Button variant="default" size="sm" onClick={() => startEdit(plan)}><Pencil size={12} className="mr-1" /> Edit</Button>
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
