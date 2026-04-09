import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { useChatbotHistory } from "@/api/chatbot/history";

export function ChatbotHistoryPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useChatbotHistory(page);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Chatbot History</h1>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						{data ? `${data.total} conversation${data.total !== 1 ? "s" : ""}` : "Loading..."}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !data?.sessions.length ? (
						<div className="flex flex-col items-center gap-3 py-12">
							<MessageSquare size={48} className="text-[var(--muted-foreground)]" />
							<p className="text-[var(--muted-foreground)]">No chat history yet.</p>
							<p className="text-sm text-[var(--muted-foreground)]">
								Conversations with your chatbots will appear here.
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)]">
										<th className="py-2 text-left font-medium">Visitor</th>
										<th className="py-2 text-left font-medium">Bot</th>
										<th className="py-2 text-right font-medium">Messages</th>
										<th className="py-2 text-left font-medium">Started</th>
										<th className="py-2 text-left font-medium">Last Message</th>
										<th className="py-2 text-left font-medium">Status</th>
									</tr>
								</thead>
								<tbody>
									{data.sessions.map((s) => (
										<tr key={s.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
											<td className="py-2">
												<p className="font-medium">{s.visitor_name || "Anonymous"}</p>
												{s.visitor_email && (
													<p className="text-xs text-[var(--muted-foreground)]">{s.visitor_email}</p>
												)}
											</td>
											<td className="py-2 text-[var(--muted-foreground)]">{s.bot_name}</td>
											<td className="py-2 text-right font-medium">{s.message_count}</td>
											<td className="py-2 text-[var(--muted-foreground)]">
												{new Date(s.started_at).toLocaleString()}
											</td>
											<td className="py-2 text-[var(--muted-foreground)]">
												{new Date(s.last_message_at).toLocaleString()}
											</td>
											<td className="py-2">
												<SessionBadge status={s.status} />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
					{data && data.pages > 1 && (
						<div className="mt-4 flex items-center justify-between">
							<p className="text-sm text-[var(--muted-foreground)]">
								Page {data.page} of {data.pages}
							</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
									<ChevronLeft size={16} />
								</Button>
								<Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
									<ChevronRight size={16} />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function SessionBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		active: "bg-green-100 text-green-700",
		ended: "bg-gray-100 text-gray-600",
		escalated: "bg-orange-100 text-orange-700",
		resolved: "bg-blue-100 text-blue-700",
	};
	return (
		<span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
			{status}
		</span>
	);
}
