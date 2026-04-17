import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, MessageSquare, Send, Search, Archive, Mail } from "lucide-react";
import { useSocialInbox, useInboxThread } from "@/api/social";
import { useInboxReply } from "@/api/social-posts";
import { useSocialAccounts } from "@/api/social-reports";
import { PlatformIcon } from "./platform-icon";
import { SocialFilterSidebar } from "./social-filter-sidebar";
import { toast } from "sonner";

export function InboxPage() {
	const [page, setPage] = useState(1);
	const [platform, setPlatform] = useState("");
	const [accountId, setAccountId] = useState<number | null>(null);
	const [activeConvId, setActiveConvId] = useState<number | null>(null);
	const [search, setSearch] = useState("");
	const { data, isLoading, refetch, isFetching } = useSocialInbox(page);
	const { data: accountsData, isLoading: accountsLoading } = useSocialAccounts();
	const { data: thread, isLoading: threadLoading } = useInboxThread(activeConvId);
	const replyMut = useInboxReply();
	const [reply, setReply] = useState("");
	const scrollRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [thread?.messages?.length]);

	const accounts = accountsData?.accounts ?? [];
	const activeAccount = accountId ? accounts.find(a => a.id === accountId) : null;

	const conversations = (data?.conversations ?? []).filter((c) => {
		if (platform && c.platform !== platform) return false;
		if (activeAccount && c.platform !== activeAccount.platform) return false;
		if (search.trim() && !(c.participant_name.toLowerCase().includes(search.toLowerCase()) || c.snippet.toLowerCase().includes(search.toLowerCase()))) return false;
		return true;
	});

	const handleSendReply = () => {
		if (!reply.trim() || !activeConvId) return;
		replyMut.mutate(
			{ conversation_id: activeConvId, message: reply },
			{ onSuccess: () => { toast.success("Reply sent."); setReply(""); }, onError: () => toast.error("Failed to send.") },
		);
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[280px_360px_1fr] gap-4 h-[calc(100vh-120px)] min-h-[600px]">
			<SocialFilterSidebar
				title="Inbox"
				icon={<Mail size={16} className="text-[var(--sq-primary)]" />}
				platform={platform}
				accountId={accountId}
				accounts={accounts}
				isLoading={accountsLoading}
				needsReconnectCount={accountsData?.needs_reconnect_count ?? 0}
				onPlatformChange={setPlatform}
				onAccountChange={setAccountId}
				onRefresh={() => refetch()}
				isRefreshing={isFetching}
			/>

			<Card className="flex flex-col overflow-hidden">
				<div className="p-3 border-b border-[var(--border)] space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-sm font-semibold">{conversations.length} conversation{conversations.length === 1 ? "" : "s"}</span>
						{data && data.pages > 1 && (
							<div className="flex gap-1">
								<Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
								<Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
							</div>
						)}
					</div>
					<div className="relative">
						<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
						<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." className="pl-9 h-9 text-sm" />
					</div>
				</div>
				<div className="flex-1 overflow-y-auto">
					{isLoading ? (
						<div className="flex h-40 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : conversations.length === 0 ? (
						<div className="flex flex-col items-center gap-2 py-12">
							<MessageSquare size={32} className="text-[var(--muted-foreground)]/40" />
							<p className="text-sm text-[var(--muted-foreground)]">No conversations.</p>
						</div>
					) : (
						conversations.map((conv) => {
							const isActive = activeConvId === conv.id;
							return (
								<button
									key={conv.id}
									onClick={() => setActiveConvId(conv.id)}
									className={`w-full flex items-center gap-3 px-3 py-3 text-left border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors ${isActive ? "bg-[var(--muted)]/50" : ""}`}
								>
									<div className="relative shrink-0">
										{conv.participant_avatar ? (
											<img src={conv.participant_avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
										) : (
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)] text-sm font-semibold">
												{conv.participant_name.charAt(0).toUpperCase()}
											</div>
										)}
										<div className="absolute -bottom-0.5 -right-0.5 bg-[var(--card)] rounded-full p-0.5">
											<PlatformIcon platform={conv.platform} size={12} />
										</div>
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between">
											<span className="text-sm font-semibold truncate">{conv.participant_name}</span>
											<span className="text-[10px] text-[var(--muted-foreground)] shrink-0 ml-1">
												{conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ""}
											</span>
										</div>
										<p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">{conv.snippet}</p>
									</div>
									{conv.unread_count > 0 && (
										<span className="shrink-0 min-w-[20px] h-5 rounded-full bg-[var(--sq-primary)] text-white text-[10px] font-bold flex items-center justify-center px-1.5">
											{conv.unread_count}
										</span>
									)}
								</button>
							);
						})
					)}
				</div>
			</Card>

			<Card className="flex flex-col overflow-hidden">
				{!activeConvId ? (
					<div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--muted-foreground)]">
						<MessageSquare size={48} className="opacity-30" />
						<p className="text-sm">Select a conversation to view messages</p>
					</div>
				) : threadLoading ? (
					<div className="flex-1 flex items-center justify-center">
						<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
					</div>
				) : (
					<>
						<div className="p-3 border-b border-[var(--border)] flex items-center gap-3">
							{thread?.conversation.participant_avatar ? (
								<img src={thread.conversation.participant_avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
							) : (
								<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)] text-sm font-semibold">
									{thread?.conversation.participant_name.charAt(0).toUpperCase()}
								</div>
							)}
							<div className="min-w-0 flex-1">
								<p className="text-sm font-semibold truncate">{thread?.conversation.participant_name}</p>
								<div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
									<PlatformIcon platform={thread?.conversation.platform ?? ""} size={11} />
									<span>{thread?.conversation.platform}</span>
								</div>
							</div>
							<Button variant="ghost" size="icon" className="h-8 w-8" title="Archive"><Archive size={14} /></Button>
						</div>
						<div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--muted)]/20">
							{(thread?.messages ?? []).length === 0 ? (
								<p className="text-center text-sm text-[var(--muted-foreground)] py-8">No messages yet.</p>
							) : (
								thread?.messages.map((m) => {
									const isUs = m.sender_type === "us";
									return (
										<div key={m.id} className={`flex ${isUs ? "justify-end" : "justify-start"}`}>
											<div className={`max-w-[70%] rounded-2xl px-3 py-2 ${isUs ? "bg-[var(--sq-primary)] text-white rounded-br-sm" : "bg-[var(--card)] border border-[var(--border)] rounded-bl-sm"}`}>
												{m.media_url && <img src={m.media_url} alt="" className="rounded mb-1.5 max-w-full" />}
												<p className="text-sm whitespace-pre-wrap">{m.content}</p>
												<p className={`text-[10px] mt-1 ${isUs ? "text-white/70" : "text-[var(--muted-foreground)]"}`}>
													{m.sent_at ? new Date(m.sent_at).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" }) : ""}
												</p>
											</div>
										</div>
									);
								})
							)}
						</div>
						<div className="p-3 border-t border-[var(--border)] flex items-center gap-2">
							<Input
								value={reply}
								onChange={(e) => setReply(e.target.value)}
								onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
								placeholder="Write a reply..."
								className="flex-1"
							/>
							<Button onClick={handleSendReply} disabled={replyMut.isPending || !reply.trim()}>
								<Send size={14} /> Send
							</Button>
						</div>
					</>
				)}
			</Card>
		</div>
	);
}
