import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useChatList() {
	return useQuery({
		queryKey: ["chat", "list"],
		queryFn: () =>
			apiClient.get<{ chats: { id: number; title: string; created: string }[] }>("/api/spa/chat/list"),
	});
}

export function useArticlesList(page = 1) {
	return useQuery({
		queryKey: ["articles", "list", page],
		queryFn: () =>
			apiClient.get<{
				articles: { id: number; title: string; status: string; featured_media: string; created: string }[];
				total: number; page: number; pages: number;
			}>(`/api/spa/articles/list?page=${page}`),
	});
}

export function useAvailablePlans() {
	return useQuery({
		queryKey: ["plans", "available"],
		queryFn: () =>
			apiClient.get<{
				plans: { id: number; name: string; title: string; price: number; duration: string; credits: number; description: string; highlight: boolean; tiers: { id: number; name: string; credits: number; price_per_credit: number; price: number; is_default: boolean }[] }[];
				currency: string;
			}>("/api/spa/plans/available"),
	});
}
