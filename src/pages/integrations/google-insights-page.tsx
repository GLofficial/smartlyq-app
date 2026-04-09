import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ExternalLink } from "lucide-react";
import { useGoogleInsights } from "@/api/integration-insights";

export function GoogleInsightsPage() {
	const { data, isLoading } = useGoogleInsights();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Google Analytics</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !(data?.properties ?? []).length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12">
						<BarChart3 size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No Google Analytics properties connected.</p>
						<a href="/my/integrations/google/start" target="_blank" rel="noopener noreferrer">
							<Button><ExternalLink size={16} /> Connect Google Analytics</Button>
						</a>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader><CardTitle className="text-lg">Properties ({(data?.properties ?? []).length})</CardTitle></CardHeader>
					<CardContent>
						<div className="space-y-2">
							{data?.properties.map((p) => (
								<div key={p.id} className="flex items-center gap-3 rounded border border-[var(--border)] p-3">
									<BarChart3 size={16} className="text-[var(--sq-primary)]" />
									<div className="min-w-0 flex-1">
										<p className="font-medium text-sm">{p.property_name}</p>
										<p className="text-xs text-[var(--muted-foreground)]">{p.property_id}</p>
									</div>
									<span className={`rounded-full px-2 py-0.5 text-xs ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{p.status}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
