import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Plus, Send } from "lucide-react";
import { useChatConversations, useChatMessages, useSendMessage } from "@/api/chat";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";

export function ChatPage() {
	const { data, isLoading } = useChatConversations();
	const [activeChatId, setActiveChatId] = useState(0);
	const { data: msgData } = useChatMessages(activeChatId);
	const sendMutation = useSendMessage();
	const [input, setInput] = useState("");

	const handleNewChat = async () => {
		try {
			const res = await apiClient.post<{ id: number }>("/api/spa/chat/create");
			queryClient.invalidateQueries({ queryKey: ["chat"] });
			setActiveChatId(res.id);
		} catch { toast.error("Failed."); }
	};

	const handleSend = () => {
		if (!input.trim() || activeChatId <= 0) return;
		sendMutation.mutate({ chat_id: activeChatId, message: input }, {
			onSuccess: () => setInput(""),
			onError: (e) => toast.error((e as { message?: string })?.message ?? "Failed."),
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Chat</h1>
				<Button onClick={handleNewChat}><Plus size={16} /> New Chat</Button>
			</div>
			<div className="grid gap-6 lg:grid-cols-3" style={{ minHeight: "60vh" }}>
				<Card className="lg:col-span-1">
					<CardHeader><CardTitle className="text-base">Conversations</CardTitle></CardHeader>
					<CardContent>
						{isLoading ? <Spinner /> : !(data?.chats ?? []).length ? (
							<p className="text-sm text-[var(--muted-foreground)]">No chats yet.</p>
						) : (
							<div className="space-y-1">{data?.chats.map((c) => (
								<button key={c.id} type="button" onClick={() => setActiveChatId(c.id)}
									className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors ${activeChatId === c.id ? "bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)] font-medium" : "hover:bg-[var(--accent)]"}`}>
									<MessageSquare size={14} /><span className="truncate flex-1">{c.title}</span>
								</button>
							))}</div>
						)}
					</CardContent>
				</Card>
				<Card className="lg:col-span-2 flex flex-col">
					<CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
						{activeChatId <= 0 ? (
							<p className="text-sm text-[var(--muted-foreground)] text-center py-12">Select or create a chat.</p>
						) : !msgData?.messages.length ? (
							<p className="text-sm text-[var(--muted-foreground)]">Send a message below.</p>
						) : msgData.messages.map((m) => (
							<div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
								<div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-[var(--sq-primary)] text-white" : "bg-[var(--muted)]"}`}>
									<p className="whitespace-pre-wrap">{m.content}</p>
								</div>
							</div>
						))}
						{sendMutation.isPending && <div className="flex justify-start"><div className="rounded-lg bg-[var(--muted)] px-3 py-2"><div className="h-4 w-16 animate-pulse rounded bg-gray-300" /></div></div>}
					</CardContent>
					{activeChatId > 0 && (
						<div className="border-t border-[var(--border)] p-3 flex gap-2">
							<Input placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} className="flex-1" />
							<Button onClick={handleSend} disabled={sendMutation.isPending}><Send size={16} /></Button>
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}

function Spinner() { return <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
