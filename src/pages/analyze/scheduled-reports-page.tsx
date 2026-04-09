import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, Power, PowerOff } from "lucide-react";
import { useScheduledReports } from "@/api/reports";

export function ScheduledReportsPage() {
	const { data, isLoading } = useScheduledReports();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Scheduled Reports</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !(data?.reports ?? []).length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-12">
						<CalendarCheck size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No scheduled reports yet.</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{data?.reports.map((r) => (
						<Card key={r.id}>
							<CardContent className="flex items-center gap-4 p-4">
								<div className="min-w-0 flex-1">
									<p className="font-medium">{r.title}</p>
									<p className="text-xs text-[var(--muted-foreground)]">
										{r.frequency} · Next: {r.next_send_at ? new Date(r.next_send_at).toLocaleDateString() : "—"}
									</p>
								</div>
								{r.is_active ? <Power size={16} className="text-green-500" /> : <PowerOff size={16} className="text-gray-400" />}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
