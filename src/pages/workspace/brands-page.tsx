import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { useBrands } from "@/api/brands";

export function BrandsPage() {
	const { data, isLoading } = useBrands();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Brands</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !data?.brands.length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-12">
						<Briefcase size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No brand voices configured yet.</p>
						<p className="text-sm text-[var(--muted-foreground)]">Brand voices help AI generate content that matches your tone and style.</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{data.brands.map((b) => (
						<Card key={b.id}>
							<CardContent className="flex items-center gap-3 p-4">
								{b.logo ? (
									<img src={b.logo} alt="" className="h-10 w-10 rounded-lg object-cover" />
								) : (
									<div className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold" style={{ backgroundColor: b.primary_color || 'var(--sq-primary)' }}>
										{b.name.charAt(0).toUpperCase()}
									</div>
								)}
								<div className="min-w-0 flex-1">
									<p className="font-medium truncate">{b.name}</p>
									<p className="text-xs text-[var(--muted-foreground)]">{new Date(b.created_at).toLocaleDateString()}</p>
								</div>
								{b.primary_color && <div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: b.primary_color }} />}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
