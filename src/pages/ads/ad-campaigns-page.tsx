import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Folders } from "lucide-react";
import { apiClient } from "@/lib/api-client";

function useAdCampaigns() {
	return useQuery({
		queryKey: ["ad-manager", "campaigns"],
		queryFn: () => apiClient.get<{ campaigns: Campaign[] }>("/api/spa/ad-manager/campaigns"),
	});
}

interface Campaign {
	id: number;
	name: string;
	platform: string;
	status: string;
	objective: string;
	budget: number;
	spent: number;
	impressions: number;
	clicks: number;
	conversions: number;
	created_at: string;
}

export function AdCampaignsPage() {
	const { data, isLoading } = useAdCampaigns();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Campaigns</h1>
				<span className="text-sm text-[var(--muted-foreground)]">{(data?.campaigns ?? []).length} campaigns</span>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !(data?.campaigns ?? []).length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-12">
						<Folders size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No campaigns yet.</p>
						<p className="text-sm text-[var(--muted-foreground)]">Create your first ad campaign to start advertising.</p>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardContent className="p-0">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-[var(--border)]">
									<th className="py-2 px-4 text-left font-medium">Campaign</th>
									<th className="py-2 px-3 text-left font-medium">Platform</th>
									<th className="py-2 px-3 text-left font-medium">Objective</th>
									<th className="py-2 px-3 text-center font-medium">Status</th>
									<th className="py-2 px-3 text-right font-medium">Budget</th>
									<th className="py-2 px-3 text-right font-medium">Spent</th>
									<th className="py-2 px-3 text-right font-medium">Impressions</th>
									<th className="py-2 px-3 text-right font-medium">Clicks</th>
									<th className="py-2 px-3 text-right font-medium">Conv.</th>
								</tr>
							</thead>
							<tbody>
								{data?.campaigns.map((c) => (
									<tr key={c.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
										<td className="py-2 px-4 font-medium">{c.name}</td>
										<td className="py-2 px-3"><span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs capitalize">{c.platform}</span></td>
										<td className="py-2 px-3 text-xs capitalize">{c.objective}</td>
										<td className="py-2 px-3 text-center"><CampaignBadge status={c.status} /></td>
										<td className="py-2 px-3 text-right">${c.budget.toLocaleString()}</td>
										<td className="py-2 px-3 text-right">${c.spent.toFixed(2)}</td>
										<td className="py-2 px-3 text-right">{c.impressions.toLocaleString()}</td>
										<td className="py-2 px-3 text-right">{c.clicks.toLocaleString()}</td>
										<td className="py-2 px-3 text-right">{c.conversions.toLocaleString()}</td>
									</tr>
								))}
							</tbody>
						</table>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

function CampaignBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		active: "bg-green-100 text-green-700",
		paused: "bg-yellow-100 text-yellow-700",
		completed: "bg-gray-100 text-gray-600",
		draft: "bg-blue-100 text-blue-700",
		archived: "bg-orange-100 text-orange-700",
	};
	return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</span>;
}
