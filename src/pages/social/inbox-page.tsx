import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, MessageSquare, Send, Search, Archive, ArchiveRestore, Mail, AlertTriangle, WifiOff, Smile, Image as ImageIcon, X, Video, Loader2 } from "lucide-react";
import { useSocialInbox, useInboxThread, useInboxSync, useInboxArchive, useInboxUnarchive } from "@/api/social";
import { useInboxReply, useInboxTyping } from "@/api/social-posts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InboxMediaPicker, type MediaItem } from "./InboxMediaPicker";
import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { queryClient } from "@/lib/query-client";
import { useSocialAccounts } from "@/api/social-reports";
import { PlatformIcon } from "./platform-icon";
import { PlatformBadge } from "./PlatformIcons";
import { SocialFilterSidebar } from "./social-filter-sidebar";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";
import { getRealtimeSocket } from "@/lib/realtime";
import { toast } from "sonner";

function SnippetPreview({ snippet }: { snippet: string }) {
	const s = snippet ?? "";
	if (!s || s === "0" || s === "[Image]" || s === "[Video]") return <><ImageIcon size={11} className="shrink-0" /><span>Media</span></>;
	return <span className="truncate">{s}</span>;
}

export function InboxPage() {
	const [page, setPage] = useState(1);
	const [platform, setPlatform] = useState("");
	const [accountId, setAccountId] = useState<number | null>(null);
	const [activeConvId, setActiveConvId] = useState<number | null>(null);
	const [search, setSearch] = useState("");
	const [scope, setScope] = useState<"active" | "archived">("active");
	const { data, isLoading, refetch, isFetching } = useSocialInbox(page, scope);
	const { data: accountsData, isLoading: accountsLoading } = useSocialAccounts();
	const { data: thread, isLoading: threadLoading } = useInboxThread(activeConvId);
	const replyMut = useInboxReply();
	const typingMut = useInboxTyping();
	const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastTypingSentRef = useRef<number>(0);
	const socketStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [remoteTyping, setRemoteTyping] = useState(false);
	const remoteTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const socketRef = useRef<ReturnType<typeof getRealtimeSocket>>(null);
	const user = useAuthStore((s) => s.user);
	const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
	const syncMut = useInboxSync();
	const archiveMut = useInboxArchive();
	const unarchiveMut = useInboxUnarchive();
	const handleRefresh = () => {
		syncMut.mutate(undefined, {
			onSuccess: (r) => { toast.success(r.message ?? "Inbox synced."); refetch(); },
			onError: (err) => toast.error((err as Error).message || "Sync failed."),
		});
	};
	const handleArchive = () => {
		if (!activeConvId) return;
		if (scope === "archived") {
			unarchiveMut.mutate(activeConvId, {
				onSuccess: (r) => { toast.success(r.message ?? "Restored."); setActiveConvId(null); queryClient.invalidateQueries({ queryKey: ["social", "inbox"] }); },
				onError: (err) => toast.error((err as Error).message || "Unarchive failed."),
			});
		} else {
			archiveMut.mutate(activeConvId, {
				onSuccess: (r) => { toast.success(r.message ?? "Archived."); setActiveConvId(null); queryClient.invalidateQueries({ queryKey: ["social", "inbox"] }); },
				onError: (err) => toast.error((err as Error).message || "Archive failed."),
			});
		}
	};

	// 24h Meta messaging window — derived from meta_window returned by the thread API.
	const getWindowState = (metaWindow: { open: boolean; expires_at: string | null } | null | undefined): { expired: boolean; hoursLeft: number } | null => {
		if (!metaWindow) return null;
		if (!metaWindow.open) return { expired: true, hoursLeft: 0 };
		if (!metaWindow.expires_at) return null;
		const hoursLeft = (new Date(metaWindow.expires_at).getTime() - Date.now()) / (60 * 60 * 1000);
		return { expired: false, hoursLeft: Math.max(0, hoursLeft) };
	};
	const [reply, setReply] = useState("");
	const [emojiOpen, setEmojiOpen] = useState(false);
	const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
	const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
	const scrollRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
	}, [thread?.messages?.length, remoteTyping]);

	// Backend clears unread_count when the thread is fetched — invalidate list so the badge drops immediately.
	useEffect(() => {
		if (!activeConvId) return;
		queryClient.invalidateQueries({ queryKey: ["social", "inbox"] });
	}, [activeConvId]);

	// Subscribe to WebSocket typing events. Store socket in a ref so onChange can emit without re-calling getRealtimeSocket.
	useEffect(() => {
		setRemoteTyping(false);
		if (!user || !workspaceId) return;
		const socket = getRealtimeSocket({ uid: user.id, workspaceId });
		socketRef.current = socket;
		if (!socket) return;

		const showTyping = (data: { conversation_id: number }) => {
			if (!activeConvId || data?.conversation_id !== activeConvId) return;
			setRemoteTyping(true);
			if (remoteTypingTimerRef.current) clearTimeout(remoteTypingTimerRef.current);
			remoteTypingTimerRef.current = setTimeout(() => setRemoteTyping(false), 5000);
		};
		const hideTyping = (data: { conversation_id: number }) => {
			if (!activeConvId || data?.conversation_id !== activeConvId) return;
			setRemoteTyping(false);
		};

		socket.on("inbox:typing", showTyping);
		socket.on("inbox:typing_stop", hideTyping);
		return () => {
			socket.off("inbox:typing", showTyping);
			socket.off("inbox:typing_stop", hideTyping);
		};
	}, [user, workspaceId, activeConvId]);

	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const accountsPath = wsHash ? `/w/${wsHash}/social-media/accounts` : "/social-media/accounts";

	const accounts = accountsData?.accounts ?? [];

	const conversations = (data?.conversations ?? []).filter((c) => {
		if (platform && c.platform !== platform) return false;
		if (accountId !== null && c.social_account_id !== accountId) return false;
		if (search.trim() && !(c.participant_name.toLowerCase().includes(search.toLowerCase()) || c.snippet.toLowerCase().includes(search.toLowerCase()))) return false;
		return true;
	});

	const handleSendReply = async () => {
		if (!activeConvId || (!reply.trim() && mediaItems.length === 0)) return;
		try {
			if (reply.trim()) {
				await replyMut.mutateAsync({ conversation_id: activeConvId, message: reply });
			}
			for (const item of mediaItems) {
				await replyMut.mutateAsync({ conversation_id: activeConvId, message: "", media_url: item.url, media_type: item.type });
			}
			toast.success("Reply sent.");
			setReply("");
			setMediaItems([]);
		} catch {
			toast.error("Failed to send.");
		}
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
				onRefresh={handleRefresh}
				isRefreshing={isFetching || syncMut.isPending}
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
					<div className="flex gap-1.5">
						<button
							onClick={() => { setScope("active"); setActiveConvId(null); setPage(1); }}
							className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${scope === "active" ? "bg-[var(--sq-primary)] text-white" : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/70"}`}
						>
							Active
						</button>
						<button
							onClick={() => { setScope("archived"); setActiveConvId(null); setPage(1); }}
							className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${scope === "archived" ? "bg-[var(--sq-primary)] text-white" : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/70"}`}
						>
							Archived
						</button>
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
									className={`w-full flex items-center gap-3 px-3 py-3 text-left border-b border-[var(--border)] transition-colors ${isActive ? "bg-[var(--sq-primary)]/10 border-l-4 border-l-[var(--sq-primary)] pl-2" : "hover:bg-[var(--muted)]/30"}`}
								>
									<div className="relative shrink-0">
										{conv.participant_avatar ? (
											<img src={conv.participant_avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
										) : (
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)] text-sm font-semibold">
												{conv.participant_name.charAt(0).toUpperCase()}
											</div>
										)}
										<div className="absolute -bottom-0.5 -right-0.5">
											<PlatformBadge platformId={conv.platform} size={16} />
										</div>
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between">
											<span className="text-sm font-semibold truncate">{conv.participant_name}</span>
											<span className="text-[10px] text-[var(--muted-foreground)] shrink-0 ml-1">
												{conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ""}
											</span>
										</div>
										<p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5 flex items-center gap-1">
											<SnippetPreview snippet={conv.snippet} />
										</p>
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
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								title={thread?.conversation.status === "archived" ? "Restore from archive" : "Archive conversation"}
								onClick={handleArchive}
								disabled={archiveMut.isPending || unarchiveMut.isPending}
							>
								{thread?.conversation.status === "archived" ? <ArchiveRestore size={14} /> : <Archive size={14} />}
							</Button>
						</div>
						{(() => {
							const activeConv = (data?.conversations ?? []).find(c => c.id === activeConvId);
							const activeAcct = accounts.find(a => a.id === activeConv?.social_account_id);
							if (!activeAcct?.needs_reconnect) return null;
							return (
								<div className="px-3 py-2 border-b border-[var(--border)] flex items-start gap-2 bg-red-50 text-red-700">
									<WifiOff size={14} className="shrink-0 mt-0.5" />
									<div className="text-xs flex-1">
										<p className="font-semibold">Account disconnected — replies unavailable.</p>
										<p className="mt-0.5">The connected {activeAcct.platform} account has expired or been revoked.</p>
									</div>
									<Link to={accountsPath} className="text-xs font-semibold underline shrink-0 mt-0.5">Reconnect</Link>
								</div>
							);
						})()}
						{(() => {
							const win = thread ? getWindowState(thread.meta_window) : null;
							if (!win || (!win.expired && win.hoursLeft >= 6)) return null;
							return (
								<div className={`px-3 py-2 border-b border-[var(--border)] flex items-start gap-2 ${win.expired ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
									<AlertTriangle size={14} className="shrink-0 mt-0.5" />
									<div className="text-xs">
										{win.expired ? (
											<>
												<p className="font-semibold">24-hour reply window has expired.</p>
												<p className="mt-0.5">{thread?.conversation.platform === "instagram" ? "Instagram" : "The platform"} only allows replies within 24 hours of the last incoming message. Wait for them to message again.</p>
											</>
										) : (
											<p><span className="font-semibold">{Math.round(win.hoursLeft)}h left</span> in the 24-hour reply window.</p>
										)}
									</div>
								</div>
							);
						})()}
						<div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--muted)]/20">
							{(thread?.messages ?? []).length === 0 ? (
								<p className="text-center text-sm text-[var(--muted-foreground)] py-8">No messages yet.</p>
							) : (
								thread?.messages.map((m) => {
									const isUs = m.sender_type === "us";
									return (
										<div key={m.id} className={`flex ${isUs ? "justify-end" : "justify-start"}`}>
											<div className={`max-w-[70%] rounded-2xl px-3 py-2 ${isUs ? "bg-[var(--sq-primary)] text-white rounded-br-sm" : "bg-[var(--card)] border border-[var(--border)] rounded-bl-sm"}`}>
												{m.media_url && (
													(m.media_type === "video" || m.attachment_type === "video") ? (
														<video src={m.media_url} controls className="rounded mb-1.5 max-w-full max-h-64" />
													) : (
														<img src={m.media_url} alt="" className="rounded mb-1.5 max-w-full" />
													)
												)}
												{m.content && m.content !== "0" && (
													<p className="text-sm whitespace-pre-wrap" style={{ fontFamily: "emoji, system-ui, sans-serif" }}>{m.content}</p>
												)}
												<p className={`text-[10px] mt-1 ${isUs ? "text-white/70" : "text-[var(--muted-foreground)]"}`}>
													{m.sent_at ? new Date(m.sent_at).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" }) : ""}
												</p>
											</div>
										</div>
									);
								})
							)}
							{remoteTyping && (
								<div className="flex justify-start">
									<div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
										<span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-bounce" style={{ animationDelay: "0ms" }} />
										<span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-bounce" style={{ animationDelay: "150ms" }} />
										<span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-bounce" style={{ animationDelay: "300ms" }} />
									</div>
								</div>
							)}
						</div>
						{(() => {
							const win = thread ? getWindowState(thread.meta_window) : null;
							const windowExpired = !!win?.expired;
							const activeConv2 = (data?.conversations ?? []).find(c => c.id === activeConvId);
							const activeAcct2 = accounts.find(a => a.id === activeConv2?.social_account_id);
							const acctBlocked = !!activeAcct2?.needs_reconnect;
							const sendBlocked = windowExpired || acctBlocked;
							const placeholder = acctBlocked ? "Account disconnected — reconnect to reply." : windowExpired ? "Reply window expired." : "Write a reply...";
							return (
								<div className="border-t border-[var(--border)]">
									{mediaItems.length > 0 && (
										<div className="px-3 pt-2 flex flex-wrap gap-2">
											{mediaItems.map((item, i) => (
												<div key={i} className="relative inline-block">
													{item.type === "video" ? (
														<div className="h-16 w-16 rounded border border-[var(--border)] bg-black flex items-center justify-center">
															<Video size={20} className="text-white opacity-80" />
														</div>
													) : (
														<img src={item.previewUrl} alt="" className="h-16 w-16 rounded object-cover border border-[var(--border)]" />
													)}
													<button onClick={() => setMediaItems(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center">
														<X size={10} />
													</button>
												</div>
											))}
										</div>
									)}
									<div className="p-3 flex items-center gap-1.5">
										<Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
											<PopoverTrigger asChild>
												<Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={sendBlocked} title="Emoji">
													<Smile size={16} />
												</Button>
											</PopoverTrigger>
											<PopoverContent side="top" align="start" className="p-0 border-0 shadow-none bg-transparent w-auto">
												<Picker data={emojiData} onEmojiSelect={(e: { native: string }) => { setReply(r => r + e.native); setEmojiOpen(false); }} theme="light" />
											</PopoverContent>
										</Popover>
										<Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled={sendBlocked} title="Attach media" onClick={() => setMediaPickerOpen(true)}>
											<ImageIcon size={16} />
										</Button>
										<InboxMediaPicker
											open={mediaPickerOpen}
											onOpenChange={setMediaPickerOpen}
											onSelect={(items) => setMediaItems(prev => [...prev, ...items].slice(0, 10))}
										/>
										<Input
											value={reply}
											onChange={(e) => {
												setReply(e.target.value);
												if (!activeConvId) return;
												// Emit via stored socket ref — avoids re-calling getRealtimeSocket on every keystroke
												const socket = socketRef.current;
												if (socket?.connected) {
													socket.emit("inbox:typing", { conversation_id: activeConvId });
													if (socketStopTimerRef.current) clearTimeout(socketStopTimerRef.current);
													socketStopTimerRef.current = setTimeout(() => {
														socket.emit("inbox:typing_stop", { conversation_id: activeConvId });
													}, 2000);
												}
												// Call PHP API for FB/IG external typing_on (throttled to every 5s)
												const convPlatform = thread?.conversation.platform ?? "";
												if (convPlatform === "facebook" || convPlatform === "instagram") {
													const now = Date.now();
													if (now - lastTypingSentRef.current > 5000) {
														lastTypingSentRef.current = now;
														typingMut.mutate(activeConvId);
													}
													if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
													typingTimerRef.current = setTimeout(() => { lastTypingSentRef.current = 0; }, 6000);
												}
											}}
											onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !sendBlocked) { e.preventDefault(); handleSendReply(); } }}
											placeholder={placeholder}
											className="flex-1"
											disabled={sendBlocked || replyMut.isPending}
										/>
										<Button onClick={handleSendReply} disabled={replyMut.isPending || (!reply.trim() && mediaItems.length === 0) || sendBlocked}>
											{replyMut.isPending ? <><Loader2 size={14} className="animate-spin" />Sending…</> : <><Send size={14} />Send</>}
										</Button>
									</div>
								</div>
							);
						})()}
					</>
				)}
			</Card>
		</div>
	);
}
