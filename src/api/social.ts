import { useQuery } from "@tanstack/react-query";
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
	account_name: string;
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
		postUrls?: Record<string, string>;
		hasMedia?: boolean;
		timeDisplay?: string;
		bgColor?: string;
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
	});
}

export interface Conversation {
	id: number;
	participant_name: string;
	participant_avatar: string;
	platform: string;
	last_message_at: string;
	unread_count: number;
	snippet: string;
}

export function useSocialInbox(page = 1) {
	return useQuery({
		queryKey: ["social", "inbox", page],
		queryFn: () =>
			apiClient.get<{
				conversations: Conversation[];
				total: number;
				page: number;
				pages: number;
			}>(`/api/spa/social/inbox?page=${page}`),
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
