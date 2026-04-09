import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";
import { useAds } from "@/api/ad-manager/ads";

export function AdsPage() {
	const { data, isLoading } = useAds();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Ads</h1>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						{data ? `${(data?.ads ?? []).length} ad${(data?.ads ?? []).length !== 1 ? "s" : ""}` : "Loading..."}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !(data?.ads ?? []).length ? (
						<div className="flex flex-col items-center gap-3 py-12">
							<Megaphone size={48} className="text-[var(--muted-foreground)]" />
							<p className="text-[var(--muted-foreground)]">No ads yet.</p>
							<p className="text-sm text-[var(--muted-foreground)]">
								Create ads within your ad sets to start running campaigns.
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)]">
										<th className="py-2 text-left font-medium">Name</th>
										<th className="py-2 text-left font-medium">Ad Set</th>
										<th className="py-2 text-left font-medium">Status</th>
										<th className="py-2 text-left font-medium">Format</th>
										<th className="py-2 text-right font-medium">Spend</th>
										<th className="py-2 text-right font-medium">Impressions</th>
										<th className="py-2 text-right font-medium">Clicks</th>
										<th className="py-2 text-right font-medium">CTR</th>
									</tr>
								</thead>
								<tbody>
									{data?.ads.map((ad) => (
										<tr key={ad.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
											<td className="py-2 font-medium">{ad.name}</td>
											<td className="py-2 text-[var(--muted-foreground)]">{ad.ad_set_name}</td>
											<td className="py-2">
												<AdStatusBadge status={ad.status} />
											</td>
											<td className="py-2">
												<span className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs capitalize">
													{ad.format}
												</span>
											</td>
											<td className="py-2 text-right">${ad.spent.toFixed(2)}</td>
											<td className="py-2 text-right">{ad.impressions.toLocaleString()}</td>
											<td className="py-2 text-right">{ad.clicks.toLocaleString()}</td>
											<td className="py-2 text-right font-medium">{ad.ctr.toFixed(2)}%</td>
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

function AdStatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		active: "bg-green-100 text-green-700",
		paused: "bg-yellow-100 text-yellow-700",
		rejected: "bg-red-100 text-red-700",
		pending_review: "bg-orange-100 text-orange-700",
		completed: "bg-gray-100 text-gray-600",
	};
	return (
		<span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
			{status.replace("_", " ")}
		</span>
	);
}
