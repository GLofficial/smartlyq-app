import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { apiClient } from "@/lib/api-client";

function useAdAudiences() {
	return useQuery({
		queryKey: ["ad-manager", "audiences"],
		queryFn: () => apiClient.get<{ audiences: Audience[] }>("/api/spa/ad-manager/audiences"),
	});
}

interface Audience {
	id: number;
	name: string;
	platform: string;
	type: string;
	size: number;
	status: string;
	created_at: string;
}

export function AdAudiencesPage() {
	const { data, isLoading } = useAdAudiences();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Audiences</h1>
				<span className="text-sm text-[var(--muted-foreground)]">{(data?.audiences ?? []).length} audiences</span>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !(data?.audiences ?? []).length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-12">
						<Target size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No audiences created yet.</p>
						<p className="text-sm text-[var(--muted-foreground)]">Build custom audiences for your ad campaigns.</p>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader><CardTitle className="text-lg">All Audiences</CardTitle></CardHeader>
					<CardContent>
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-[var(--border)]">
									<th className="py-2 text-left font-medium">Name</th>
									<th className="py-2 text-left font-medium">Platform</th>
									<th className="py-2 text-left font-medium">Type</th>
									<th className="py-2 text-right font-medium">Size</th>
									<th className="py-2 text-center font-medium">Status</th>
									<th className="py-2 text-right font-medium">Created</th>
								</tr>
							</thead>
							<tbody>
								{data?.audiences.map((a) => (
									<tr key={a.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
										<td className="py-2 font-medium">{a.name}</td>
										<td className="py-2"><span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs capitalize">{a.platform}</span></td>
										<td className="py-2 text-xs capitalize">{a.type}</td>
										<td className="py-2 text-right">{a.size.toLocaleString()}</td>
										<td className="py-2 text-center"><AudienceBadge status={a.status} /></td>
										<td className="py-2 text-right text-xs text-[var(--muted-foreground)]">{new Date(a.created_at).toLocaleDateString()}</td>
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

function AudienceBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		ready: "bg-green-100 text-green-700",
		building: "bg-blue-100 text-blue-700",
		too_small: "bg-yellow-100 text-yellow-700",
		error: "bg-red-100 text-red-700",
	};
	return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</span>;
}
