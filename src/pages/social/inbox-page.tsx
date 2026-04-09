import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { useSocialInbox } from "@/api/social";
import { PlatformIcon } from "./platform-icon";

export function InboxPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useSocialInbox(page);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Inbox</h1>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						{data ? `${data?.total} conversations` : "Loading..."}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !(data?.conversations ?? []).length ? (
						<div className="flex flex-col items-center gap-2 py-12">
							<MessageSquare size={40} className="text-[var(--muted-foreground)]" />
							<p className="text-sm text-[var(--muted-foreground)]">No conversations yet.</p>
						</div>
					) : (
						<div className="space-y-2">
							{data?.conversations.map((conv) => (
								<div
									key={conv.id}
									className="flex items-center gap-4 rounded-md border border-[var(--border)] p-4 transition-colors hover:bg-[var(--accent)] cursor-pointer"
								>
									{conv.participant_avatar ? (
										<img src={conv.participant_avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
									) : (
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)]">
											<MessageSquare size={16} />
										</div>
									)}
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<span className="font-medium">{conv.participant_name}</span>
											<PlatformIcon platform={conv.platform} size={14} />
											{conv.unread_count > 0 && (
												<span className="rounded-full bg-[var(--sq-primary)] px-2 py-0.5 text-[10px] font-bold text-white">
													{conv.unread_count}
												</span>
											)}
										</div>
										<p className="mt-0.5 truncate text-sm text-[var(--muted-foreground)]">
											{conv.snippet}
										</p>
									</div>
									<span className="shrink-0 text-xs text-[var(--muted-foreground)]">
										{conv.last_message_at
											? new Date(conv.last_message_at).toLocaleDateString()
											: ""}
									</span>
								</div>
							))}
						</div>
					)}

					{data && data?.pages > 1 && (
						<div className="mt-4 flex items-center justify-between">
							<p className="text-sm text-[var(--muted-foreground)]">Page {data?.page} of {data?.pages}</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
									<ChevronLeft size={16} />
								</Button>
								<Button variant="outline" size="sm" disabled={page >= data?.pages} onClick={() => setPage((p) => p + 1)}>
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
