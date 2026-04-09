import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { PLAN_COLUMN_GROUPS } from "./admin-plans-config";

export function AdminPlansPage() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin", "plans", "full"],
		queryFn: () => apiClient.get<{ plans: Record<string, unknown>[] }>("/api/spa/admin/plans/full"),
	});
	const [activeGroup, setActiveGroup] = useState(0);

	if (isLoading) return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;

	const plans = data?.plans ?? [];
	const group = PLAN_COLUMN_GROUPS[activeGroup];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Plans and Pricing</h1>
				<span className="text-sm text-[var(--muted-foreground)]">{plans.length} plans</span>
			</div>

			{/* Section tabs */}
			<div className="flex flex-wrap gap-2">
				{PLAN_COLUMN_GROUPS.map((g, i) => (
					<Button key={g.label} variant={activeGroup === i ? "default" : "outline"} size="sm" onClick={() => setActiveGroup(i)}>
						{g.label}
					</Button>
				))}
			</div>

			{/* Matrix table */}
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
									</tr>
								</thead>
								<tbody>
									{plans.map((plan) => (
										<tr key={String(plan.id)} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
											{group.columns.map((col) => {
												const val = plan[col.key];
												return (
													<td key={col.key} className="py-2 px-3 whitespace-nowrap">
														{col.type === "bool" ? (
															<span className={`text-xs font-medium ${Number(val) ? "text-green-600" : "text-red-500"}`}>
																{Number(val) ? "Yes" : "No"}
															</span>
														) : col.type === "price" ? (
															<span className="font-medium">{`€${Number(val ?? 0).toFixed(0)}/${String(plan.duration ?? "m")}`}</span>
														) : col.type === "number" ? (
															<span>{val === null || val === undefined ? "—" : String(val)}</span>
														) : (
															<span className="font-medium">{String(val ?? "")}</span>
														)}
													</td>
												);
											})}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
