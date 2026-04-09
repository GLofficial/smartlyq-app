import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatList } from "@/api/content";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";

export function ChatPage() {
	const { data, isLoading } = useChatList();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Chat</h1>
				<Button onClick={async () => {
					try {
						await apiClient.post("/api/spa/chat/create");
						queryClient.invalidateQueries({ queryKey: ["chat"] });
						toast.success("New chat created.");
					} catch { toast.error("Failed to create chat."); }
				}}><Plus size={16} /> New Chat</Button>
			</div>

			<Card>
				<CardHeader><CardTitle className="text-lg">Conversations ({data?.chats.length ?? 0})</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? <Spinner /> : !data?.chats.length ? (
						<Empty icon={MessageSquare} text="No conversations yet. Start a new chat." />
					) : (
						<div className="space-y-2">
							{data.chats.map((c) => (
								<div key={c.id} className="flex items-center gap-3 rounded border border-[var(--border)] p-3 hover:bg-[var(--accent)] cursor-pointer">
									<MessageSquare size={16} className="text-[var(--sq-primary)]" />
									<div className="min-w-0 flex-1">
										<p className="font-medium text-sm truncate">{c.title}</p>
										<p className="text-xs text-[var(--muted-foreground)]">{new Date(c.created).toLocaleString()}</p>
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

function Spinner() { return <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
function Empty({ icon: Icon, text }: { icon: React.ElementType; text: string }) { return <div className="flex flex-col items-center gap-2 py-8"><Icon size={32} className="text-[var(--muted-foreground)]" /><p className="text-sm text-[var(--muted-foreground)]">{text}</p></div>; }
