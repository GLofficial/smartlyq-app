import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useWoocommerceStores } from "@/api/integration-insights";

export function WoocommercePage() {
	const { data, isLoading } = useWoocommerceStores();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">WooCommerce</h1>
			<Card>
				<CardHeader><CardTitle className="text-lg">Connected Stores</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
					) : !data?.stores.length ? (
						<div className="flex flex-col items-center gap-2 py-8">
							<ShoppingCart size={32} className="text-[var(--muted-foreground)]" />
							<p className="text-sm text-[var(--muted-foreground)]">No WooCommerce stores connected.</p>
						</div>
					) : (
						<div className="space-y-2">
							{data.stores.map((s) => (
								<div key={s.id} className="flex items-center gap-3 rounded border border-[var(--border)] p-3">
									<ShoppingCart size={16} className="text-[var(--sq-primary)]" />
									<div className="min-w-0 flex-1">
										<p className="font-medium text-sm">{s.title}</p>
										<p className="text-xs text-[var(--muted-foreground)]">{s.url}</p>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
