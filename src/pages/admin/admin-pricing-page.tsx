import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// icons
import { useAdminPricing } from "@/api/admin-pages";

export function AdminPricingPage() {
	const { data, isLoading } = useAdminPricing();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">API Pricing</h1>

			<Card>
				<CardHeader><CardTitle className="text-lg">Pricing Rules</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<Spinner />
					) : !data?.pricing.length ? (
						<p className="text-sm text-[var(--muted-foreground)]">No pricing rules configured.</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)]">
										<th className="py-2 text-left font-medium">Endpoint</th>
										<th className="py-2 text-left font-medium">Type</th>
										<th className="py-2 text-right font-medium">Cost/Unit</th>
										<th className="py-2 text-right font-medium">Vendor Cost</th>
										<th className="py-2 text-left font-medium">Description</th>
										<th className="py-2 text-center font-medium">Status</th>
									</tr>
								</thead>
								<tbody>
									{data.pricing.map((p) => (
										<tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
											<td className="py-2 font-mono text-xs">{p.endpoint}</td>
											<td className="py-2"><span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs">{p.type}</span></td>
											<td className="py-2 text-right font-medium">${p.cost.toFixed(4)}</td>
											<td className="py-2 text-right text-[var(--muted-foreground)]">${p.vendor_cost.toFixed(4)}</td>
											<td className="py-2 text-[var(--muted-foreground)] text-xs">{p.description}</td>
											<td className="py-2 text-center">
												<span className={`h-2 w-2 inline-block rounded-full ${p.status === 1 ? "bg-green-500" : "bg-gray-400"}`} />
											</td>
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

function Spinner() {
	return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;
}
