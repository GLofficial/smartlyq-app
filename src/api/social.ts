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

export function useSocialPosts(status?: string, page = 1) {
	const params = new URLSearchParams();
	if (status) params.set("status", status);
	params.set("page", String(page));

	return useQuery({
		queryKey: ["social", "posts", status, page],
		queryFn: () =>
			apiClient.get<SocialPostsResponse>(`/api/spa/social/posts?${params.toString()}`),
	});
}
