import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface EditablePost {
	id: number;
	title: string;
	content: string;
	platforms: string[];
	selected_account_ids: number[];
	accounts: { id: number; platform: string; account_name: string; account_username: string; profile_picture: string }[];
	media_urls: string[];
	platform_overrides: Record<string, unknown> | null;
	status: string;
	scheduled_time: string | null;
	created_at: string | null;
}

export function usePostForEdit(postId: number | null) {
	return useQuery({
		queryKey: ["social", "post-edit", postId],
		queryFn: () => apiClient.get<{ post: EditablePost }>(`/api/spa/social/posts/fetch?id=${postId}`),
		enabled: postId !== null && postId > 0,
		staleTime: 0,
	});
}

const invalidatePosts = () => {
	queryClient.invalidateQueries({ queryKey: ["social"] });
};

export interface CreatePostData {
	title: string;
	content: string;
	platforms: string[];
	selected_accounts: number[];
	action: "save_draft" | "scheduled" | "post_now" | "send_for_approval" | "add_to_queue" | "recurring";
	scheduled_time: string | null;
	media_urls: string[];
	/** Queue ID for action=add_to_queue. Post publishes in the queue's next open slot. */
	queue_id?: number;
	/** Recurrence config for action=recurring. See RecurrenceConfig in post-action-modals. */
	recurrence?: {
		frequency: "daily" | "weekly" | "monthly";
		interval: number;
		days_of_week: string[];
		day_of_month: number | null;
		time_of_day: string;
		starts_at: string;
		ends_at: string | null;
		max_occurrences: number | null;
	};
	/** IANA timezone (e.g. "Europe/Athens"). Required for scheduled posts — backend uses this to convert to UTC. */
	timezone?: string;
	/** Per-platform options keyed by platform (e.g. `{ tiktok: { visibility, allow_comments, ... } }`).
	    Shape is read by the platform handlers (see TikTokVideoHandler::extractTikTokOptions). */
	platform_options?: Record<string, Record<string, unknown>>;
	/** Per-platform content overrides when Customize channel is on.
	    Legacy shape: `{ facebook: "custom text for FB" }` (text only).
	    Extended shape: `{ facebook: { content?: string; media_urls?: string[] } }` —
	    lets each platform have its own media subset too. Publishers read this
	    from SocialPostingService and substitute for content/media per platform. */
	platform_overrides?: Record<string, string | { content?: string; media_urls?: string[] }>;
}

export function useCreatePost() {
	return useMutation({
		mutationFn: (data: CreatePostData) =>
			apiClient.post<{ message: string }>("/api/spa/social/posts/create", data),
		onSuccess: invalidatePosts,
	});
}

export function useEditPost() {
	return useMutation({
		mutationFn: (data: { post_id: number; content?: string; platforms?: string[]; scheduled_time?: string; timezone?: string; account_ids?: number[]; media_urls?: string[]; platform_overrides?: Record<string, unknown>; approval_status?: string }) =>
			apiClient.post<{ message: string; post: Record<string, unknown> }>("/api/spa/social/posts/edit", data),
		onSuccess: invalidatePosts,
	});
}

export function useDeletePost() {
	return useMutation({
		mutationFn: (postId: number) =>
			apiClient.post<{ message: string }>("/api/spa/social/posts/delete", { post_id: postId }),
		onSuccess: invalidatePosts,
	});
}

export function useApprovePost() {
	return useMutation({
		mutationFn: (postId: number) =>
			apiClient.post<{ message: string }>("/api/spa/social/posts/approve", { post_id: postId }),
		onSuccess: invalidatePosts,
	});
}

export function useRejectPost() {
	return useMutation({
		mutationFn: (data: { post_id: number; reason?: string }) =>
			apiClient.post<{ message: string }>("/api/spa/social/posts/reject", data),
		onSuccess: invalidatePosts,
	});
}

export function useRetryPost() {
	return useMutation({
		mutationFn: (postId: number) =>
			apiClient.post<{ message: string }>("/api/spa/social/posts/retry", { post_id: postId }),
		onSuccess: invalidatePosts,
	});
}

export function useDuplicatePost() {
	return useMutation({
		mutationFn: (postId: number) =>
			apiClient.post<{ message: string; id: number }>("/api/spa/social/posts/duplicate", { post_id: postId }),
		onSuccess: invalidatePosts,
	});
}

export function useMoveToDraft() {
	return useMutation({
		mutationFn: (postId: number) =>
			apiClient.post<{ message: string }>("/api/spa/social/posts/move-to-draft", { post_id: postId }),
		onSuccess: invalidatePosts,
	});
}

export function useShareNow() {
	return useMutation({
		mutationFn: (postId: number) =>
			apiClient.post<{ message: string }>("/api/spa/social/posts/share-now", { post_id: postId }),
		onSuccess: invalidatePosts,
	});
}

export function useReschedulePost() {
	return useMutation({
		mutationFn: (data: { post_id: number; scheduled_time: string; timezone?: string }) =>
			apiClient.post<{ message: string; scheduled_time: string }>("/api/spa/social/posts/reschedule", data),
		onSuccess: invalidatePosts,
	});
}

export function useReplyComment() {
	return useMutation({
		mutationFn: (data: { comment_id: number; reply: string }) =>
			apiClient.post<{ message: string }>("/api/spa/social/comments/reply", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social", "comments"] }),
	});
}

export function useInboxReply() {
	return useMutation({
		mutationFn: (data: { conversation_id: number; message: string; media_url?: string; media_type?: string }) =>
			apiClient.post<{ message: string }>("/api/spa/social/inbox/reply", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social", "inbox"] }),
	});
}

export function useInboxTyping() {
	return useMutation({
		mutationFn: (conversationId: number) =>
			apiClient.post<{ ok: boolean }>("/api/spa/social/inbox/typing", { conversation_id: conversationId }),
	});
}

export function useInboxUploadMedia() {
	return useMutation({
		mutationFn: (file: File) => {
			const fd = new FormData();
			fd.append("file", file);
			return apiClient.upload<{ url: string }>("/api/spa/social/inbox/upload-media", fd);
		},
	});
}
