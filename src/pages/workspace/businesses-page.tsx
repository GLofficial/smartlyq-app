import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { useBusinesses } from "@/api/businesses";

export function BusinessesPage() {
	const { data, isLoading } = useBusinesses();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Business Groups</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !(data?.groups ?? []).length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-12">
						<Building2 size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No business groups yet.</p>
						<p className="text-sm text-[var(--muted-foreground)]">Group your integrations and analytics by business.</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{data?.groups.map((g) => (
						<Card key={g.id}>
							<CardContent className="p-4">
								<p className="font-medium">{g.name}</p>
								{g.description && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{g.description}</p>}
								<p className="mt-2 text-xs text-[var(--muted-foreground)]">{new Date(g.created_at).toLocaleDateString()}</p>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
