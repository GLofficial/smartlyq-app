import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Image } from "lucide-react";
import { apiClient } from "@/lib/api-client";

function useAdCreatives() {
	return useQuery({
		queryKey: ["ad-manager", "creatives"],
		queryFn: () => apiClient.get<{ creatives: Creative[] }>("/api/spa/ad-manager/creatives"),
	});
}

interface Creative {
	id: number;
	name: string;
	format: string;
	platform: string;
	status: string;
	preview_url: string | null;
	created_at: string;
}

export function AdCreativesPage() {
	const { data, isLoading } = useAdCreatives();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Ad Creatives</h1>
				<span className="text-sm text-[var(--muted-foreground)]">{(data?.creatives ?? []).length} creatives</span>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !(data?.creatives ?? []).length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-12">
						<Image size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No creatives yet.</p>
						<p className="text-sm text-[var(--muted-foreground)]">Create ad creatives to use in your campaigns.</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{data?.creatives.map((c) => (
						<Card key={c.id}>
							<CardContent className="p-4 space-y-3">
								{c.preview_url ? (
									<div className="aspect-video rounded bg-[var(--muted)] overflow-hidden">
										<img src={c.preview_url} alt={c.name} className="h-full w-full object-cover" />
									</div>
								) : (
									<div className="aspect-video rounded bg-[var(--muted)] flex items-center justify-center">
										<Image size={32} className="text-[var(--muted-foreground)]" />
									</div>
								)}
								<div>
									<p className="font-medium">{c.name}</p>
									<div className="flex items-center gap-2 mt-1">
										<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs">{c.format}</span>
										<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs capitalize">{c.platform}</span>
										<StatusBadge status={c.status} />
									</div>
									<p className="text-xs text-[var(--muted-foreground)] mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		active: "bg-green-100 text-green-700",
		draft: "bg-gray-100 text-gray-600",
		archived: "bg-yellow-100 text-yellow-700",
	};
	return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</span>;
}
