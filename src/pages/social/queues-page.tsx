import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Power, PowerOff } from "lucide-react";
import { useQueues } from "@/api/queues";

export function QueuesPage() {
	const { data, isLoading } = useQueues();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Post Queues</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !(data?.queues ?? []).length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-12">
						<Layers size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No post queues configured yet.</p>
						<p className="text-sm text-[var(--muted-foreground)]">
							Queues let you set recurring time slots for automatic post scheduling.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{data?.queues.map((q) => (
						<Card key={q.id}>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">{q.name}</CardTitle>
									{q.is_active ? (
										<Power size={16} className="text-green-500" />
									) : (
										<PowerOff size={16} className="text-gray-400" />
									)}
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-xs text-[var(--muted-foreground)]">
									Created {new Date(q.created_at).toLocaleDateString()}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
