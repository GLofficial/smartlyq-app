import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Eye, MousePointer, Megaphone } from "lucide-react";
import { useAdManager } from "@/api/tools";
import { PlatformIcon } from "@/pages/social/platform-icon";

export function AdManagerPage() {
	const { data, isLoading } = useAdManager();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Ad Manager</h1>

			<div className="grid gap-4 sm:grid-cols-3">
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<DollarSign size={20} className="text-green-600" />
						<div>
							<p className="text-2xl font-bold">${isLoading ? "..." : (data?.total_spent ?? 0).toFixed(2)}</p>
							<p className="text-xs text-[var(--muted-foreground)]">Total Spent</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<Eye size={20} className="text-blue-600" />
						<div>
							<p className="text-2xl font-bold">{isLoading ? "..." : (data?.total_impressions ?? 0).toLocaleString()}</p>
							<p className="text-xs text-[var(--muted-foreground)]">Impressions</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<MousePointer size={20} className="text-purple-600" />
						<div>
							<p className="text-2xl font-bold">{isLoading ? "..." : (data?.total_clicks ?? 0).toLocaleString()}</p>
							<p className="text-xs text-[var(--muted-foreground)]">Clicks</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader><CardTitle className="text-lg">Campaigns</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !data?.campaigns.length ? (
						<div className="flex flex-col items-center gap-3 py-12">
							<Megaphone size={48} className="text-[var(--muted-foreground)]" />
							<p className="text-[var(--muted-foreground)]">No campaigns yet.</p>
						</div>
					) : (
						<div className="space-y-2">
							{data.campaigns.map((c) => (
								<div key={c.id} className="flex items-center gap-4 rounded border border-[var(--border)] p-4">
									<PlatformIcon platform={c.platform || "facebook"} size={20} />
									<div className="min-w-0 flex-1">
										<p className="font-medium">{c.name}</p>
										<div className="flex gap-4 text-xs text-[var(--muted-foreground)]">
											<span>Budget: ${c.budget.toFixed(2)}</span>
											<span>Spent: ${c.spent.toFixed(2)}</span>
											<span>{c.impressions.toLocaleString()} impr</span>
											<span>{c.clicks.toLocaleString()} clicks</span>
										</div>
									</div>
									<CampaignBadge status={c.status} />
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function CampaignBadge({ status }: { status: string }) {
	const c: Record<string, string> = {
		active: "bg-green-100 text-green-700",
		paused: "bg-yellow-100 text-yellow-700",
		completed: "bg-gray-100 text-gray-600",
		draft: "bg-blue-100 text-blue-700",
	};
	return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${c[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</span>;
}
