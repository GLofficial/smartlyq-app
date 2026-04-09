import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";
import { useAdSets } from "@/api/ad-manager/ad-sets";

export function AdSetsPage() {
	const { data, isLoading } = useAdSets();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Ad Sets</h1>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						{data ? `${data?.ad_sets.length} ad set${data?.ad_sets.length !== 1 ? "s" : ""}` : "Loading..."}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !(data?.ad_sets ?? []).length ? (
						<div className="flex flex-col items-center gap-3 py-12">
							<Layers size={48} className="text-[var(--muted-foreground)]" />
							<p className="text-[var(--muted-foreground)]">No ad sets yet.</p>
							<p className="text-sm text-[var(--muted-foreground)]">
								Ad sets are created within campaigns to target specific audiences.
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)]">
										<th className="py-2 text-left font-medium">Name</th>
										<th className="py-2 text-left font-medium">Campaign</th>
										<th className="py-2 text-left font-medium">Status</th>
										<th className="py-2 text-right font-medium">Budget</th>
										<th className="py-2 text-right font-medium">Spend</th>
										<th className="py-2 text-right font-medium">Impressions</th>
										<th className="py-2 text-right font-medium">Clicks</th>
									</tr>
								</thead>
								<tbody>
									{data?.ad_sets.map((s) => (
										<tr key={s.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
											<td className="py-2 font-medium">{s.name}</td>
											<td className="py-2 text-[var(--muted-foreground)]">{s.campaign_name}</td>
											<td className="py-2">
												<StatusBadge status={s.status} />
											</td>
											<td className="py-2 text-right">${s.budget.toFixed(2)}</td>
											<td className="py-2 text-right">${s.spent.toFixed(2)}</td>
											<td className="py-2 text-right">{s.impressions.toLocaleString()}</td>
											<td className="py-2 text-right">{s.clicks.toLocaleString()}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		active: "bg-green-100 text-green-700",
		paused: "bg-yellow-100 text-yellow-700",
		completed: "bg-gray-100 text-gray-600",
		draft: "bg-blue-100 text-blue-700",
	};
	return (
		<span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
			{status}
		</span>
	);
}
