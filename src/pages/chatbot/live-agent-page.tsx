import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock, UserCheck } from "lucide-react";
import { useLiveAgent } from "@/api/chatbot";

export function LiveAgentPage() {
	const { data, isLoading } = useLiveAgent();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Live Agent</h1>

			<div className="grid gap-4 sm:grid-cols-3">
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<Clock size={20} className="text-yellow-600" />
						<div>
							<p className="text-2xl font-bold">{isLoading ? "..." : data?.pending ?? 0}</p>
							<p className="text-xs text-[var(--muted-foreground)]">Pending</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<UserCheck size={20} className="text-blue-600" />
						<div>
							<p className="text-2xl font-bold">{isLoading ? "..." : data?.assigned ?? 0}</p>
							<p className="text-xs text-[var(--muted-foreground)]">Assigned</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-3 p-4">
						<CheckCircle size={20} className="text-green-600" />
						<div>
							<p className="text-2xl font-bold">
								{isLoading ? "..." : (data?.escalations.filter((e) => e.status === "resolved").length ?? 0)}
							</p>
							<p className="text-xs text-[var(--muted-foreground)]">Resolved</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Escalations</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !data?.escalations.length ? (
						<div className="flex flex-col items-center gap-2 py-12">
							<AlertCircle size={40} className="text-[var(--muted-foreground)]" />
							<p className="text-sm text-[var(--muted-foreground)]">No escalations yet.</p>
						</div>
					) : (
						<div className="space-y-2">
							{data.escalations.map((esc) => (
								<div key={esc.id} className="flex items-center gap-4 rounded-md border border-[var(--border)] p-4">
									<div className="min-w-0 flex-1">
										<p className="font-medium">{esc.chatbot_title || `Conversation #${esc.conversation_id}`}</p>
										<p className="text-xs text-[var(--muted-foreground)]">
											{new Date(esc.created_at).toLocaleString()}
											{esc.resolved_at && ` — Resolved ${new Date(esc.resolved_at).toLocaleString()}`}
										</p>
									</div>
									<EscalationBadge status={esc.status} />
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function EscalationBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		pending: "bg-yellow-100 text-yellow-700",
		assigned: "bg-blue-100 text-blue-700",
		resolved: "bg-green-100 text-green-700",
	};
	return (
		<span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
			{status}
		</span>
	);
}
