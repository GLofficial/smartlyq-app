import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface SocialAccount {
	id: number;
	platform: string;
	account_name: string;
	account_username: string;
	profile_picture: string;
	followers_count: number;
	token_status: string;
	expires_at: string | null;
}

export interface SocialPost {
	id: number;
	title: string;
	content: string;
	platforms: string[];
	status: string;
	scheduled_time: string | null;
	published_at: string | null;
	created_at: string | null;
	has_media: boolean;
	thumbnail: string;
	post_urls: Record<string, string>;
	account_name: string;
	error_message: string;
}

export interface SocialHubData {
	accounts: SocialAccount[];
	stats: {
		published_today: number;
		scheduled: number;
		failed: number;
		unread_messages: number;
		unreplied_comments: number;
	};
	upcoming_posts: SocialPost[];
	recent_posts: SocialPost[];
}

export interface SocialPostsResponse {
	posts: SocialPost[];
	total: number;
	page: number;
	pages: number;
}

export function useSocialHub() {
	return useQuery({
		queryKey: ["social", "hub"],
		queryFn: () => apiClient.get<SocialHubData>("/api/spa/social/hub"),
	});
}

export function useSocialPosts(status?: string, page = 1, tab?: string, search?: string) {
	const params = new URLSearchParams();
	if (status) params.set("status", status);
	if (tab) params.set("tab", tab);
	if (search) params.set("search", search);
	params.set("page", String(page));

	return useQuery({
		queryKey: ["social", "posts", status, tab, search, page],
		queryFn: () =>
			apiClient.get<SocialPostsResponse>(`/api/spa/social/posts?${params.toString()}`),
	});
}

export interface CalendarEvent {
	id: number | string;
	title: string;
	start: string | null;
	allDay?: boolean;
	extendedProps: {
		type: "post" | "note";
		postId?: number;
		noteId?: number;
		status?: string;
		platforms?: string[];
		accountName?: string;
		content?: string;
		thumbnail?: string;
		mediaUrls?: string[];
		postUrls?: Record<string, string | string[]>;
		hasMedia?: boolean;
		timeDisplay?: string;
		bgColor?: string;
		errorMessage?: string;
		/** Platform → account display name, for per-platform chip labels. */
		platformAccounts?: Record<string, string>;
		/** Platform → error message string for failed platforms. */
		platformErrors?: Record<string, string>;
		/** Platform → true if it successfully posted. */
		platformSucceeded?: Record<string, boolean>;
		/** Platform → post type label (Reel, Short, Video, etc.) */
		platformPostTypes?: Record<string, string>;
		/** Per-platform content/media overrides from Customize channel */
		platformOverrides?: Record<string, string | { content?: string; media_urls?: string[] }>;
		/** Approval lifecycle: 'none' | 'pending' | 'approved' | 'rejected'. */
		approvalStatus?: string;
		/** Non-null when the post was added to a named queue (awaits queue drainer). */
		queueId?: number | null;
		/** Non-null when the post was materialized from a recurring schedule. */
		recurrenceId?: number | null;
	};
	// Legacy fields (keep for backward compat)
	date?: string | null;
	time?: string | null;
	status?: string;
	platforms?: string[];
	has_media?: boolean;
}

/** Legacy month-based calendar hook */
export function useSocialCalendar(month: string) {
	return useQuery({
		queryKey: ["social", "calendar", month],
		queryFn: () =>
			apiClient.get<{ events: CalendarEvent[] }>(
				`/api/spa/social/calendar?month=${month}`,
			),
	});
}

/** FullCalendar date-range based calendar hook */
export function useCalendarEvents(start: string, end: string) {
	return useQuery({
		queryKey: ["social", "calendar", start, end],
		queryFn: () =>
			apiClient.get<{ events: CalendarEvent[] }>(
				`/api/spa/social/calendar?start=${start}&end=${end}`,
			),
		enabled: !!start && !!end,
		staleTime: 60_000,
	});
}

export interface Comment {
	id: number;
	author_name: string;
	author_avatar: string;
	content: string;
	platform: string;
	commented_at: string;
	has_reply: boolean;
	our_reply: string;
	post_title: string;
}

export interface InboxMessage {
	id: number;
	sender_type: "us" | "them" | string;
	content: string;
	sent_at: string | null;
	media_url: string;
}

export interface InboxThread {
	conversation: { id: number; participant_name: string; participant_avatar: string; platform: string; status: string };
	messages: InboxMessage[];
	meta_window: { open: boolean; expires_at: string | null } | null;
}

export function useInboxArchive() {
	return useMutation({
		mutationFn: (conversationId: number) =>
			apiClient.post<{ message: string }>("/api/spa/social/inbox/archive", { conversation_id: conversationId }),
	});
}

export function useInboxUnarchive() {
	return useMutation({
		mutationFn: (conversationId: number) =>
			apiClient.post<{ message: string }>("/api/spa/social/inbox/unarchive", { conversation_id: conversationId }),
	});
}

export function useInboxSync() {
	return useMutation({
		mutationFn: () => apiClient.post<{ message: string; synced: number }>("/api/spa/social/inbox/sync", {}),
	});
}

export function useCommentsSync() {
	return useMutation({
		mutationFn: () => apiClient.post<{ message: string; synced: number }>("/api/spa/social/comments/sync", {}),
	});
}

export function useInboxThread(conversationId: number | null) {
	return useQuery({
		queryKey: ["social", "inbox", "thread", conversationId],
		queryFn: () => apiClient.get<InboxThread>(`/api/spa/social/inbox/thread?conversation_id=${conversationId}`),
		enabled: conversationId !== null && conversationId > 0,
	});
}

export function useSocialComments(filter?: string, page = 1) {
	const params = new URLSearchParams();
	if (filter) params.set("filter", filter);
	params.set("page", String(page));

	return useQuery({
		queryKey: ["social", "comments", filter, page],
		queryFn: () =>
			apiClient.get<{ comments: Comment[]; total: number; page: number; pages: number }>(
				`/api/spa/social/comments?${params.toString()}`,
			),
		// Realtime socket is the primary path (see src/hooks/use-realtime.ts).
		// Poll every 2 min as fallback for when the socket is down.
		refetchInterval: 120_000,
		refetchOnWindowFocus: true,
	});
}

export interface Conversation {
	id: number;
	social_account_id: number;
	participant_name: string;
	participant_avatar: string;
	platform: string;
	last_message_at: string | null;
	last_inbound_at: string | null;
	unread_count: number;
	status: string;
	snippet: string;
}

export function useSocialInbox(page = 1, scope: "active" | "archived" = "active") {
	return useQuery({
		queryKey: ["social", "inbox", page, scope],
		queryFn: () =>
			apiClient.get<{
				conversations: Conversation[];
				total: number;
				page: number;
				pages: number;
			}>(`/api/spa/social/inbox?page=${page}&scope=${scope}`),
		// Realtime socket is the primary path (see src/hooks/use-realtime.ts).
		// Poll every 2 min as fallback for when the socket is down.
		refetchInterval: 120_000,
		refetchOnWindowFocus: true,
	});
}

export interface AnalyticsData {
	period: string;
	total_posts: number;
	published: number;
	failed: number;
	by_status: Record<string, number>;
	by_platform: Record<string, number>;
	daily: { date: string; count: number }[];
}

export function useSocialAnalytics(period = "30d") {
	return useQuery({
		queryKey: ["social", "analytics", period],
		queryFn: () =>
			apiClient.get<AnalyticsData>(`/api/spa/social/analytics?period=${period}`),
	});
}

export interface PostingLimits {
	has_social_media: boolean;
	account_limit: number | null;
	connected_accounts: number;
	global_daily_cap: number;
	global_used_today: number;
	platform_usage: Record<string, number>;
	platform_limits: Record<string, number>;
	upload_limits: { max_image_mb: number; max_video_mb: number };
	duplicate_window_hours: number;
}

export function usePostingLimits() {
	return useQuery({
		queryKey: ["social", "posting-limits"],
		queryFn: () => apiClient.get<PostingLimits>("/api/spa/social/posting-limits"),
		staleTime: 30_000,
	});
}
