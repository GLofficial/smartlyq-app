import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { useAdminPlans } from "@/api/admin";

export function AdminPlansPage() {
	const { data, isLoading } = useAdminPlans();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Plans</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{(data?.plans ?? []).map((p) => (
						<Card key={p.id}>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">{p.name}</CardTitle>
									{p.status === 1 ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-gray-400" />}
								</div>
							</CardHeader>
							<CardContent className="space-y-2">
								<p className="text-2xl font-bold">${p.price}<span className="text-sm font-normal text-[var(--muted-foreground)]">/{p.duration}</span></p>
								<p className="text-sm text-[var(--muted-foreground)]">{p.credits} credits</p>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
