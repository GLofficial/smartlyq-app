import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface ShortUrl {
	id: number;
	code: string;
	original_url: string;
	clicks: number;
	created_at: string;
}

export function useShortUrls(page = 1) {
	return useQuery({
		queryKey: ["url-shortener", page],
		queryFn: () =>
			apiClient.get<{ urls: ShortUrl[]; total: number; page: number; pages: number }>(
				`/api/spa/url-shortener?page=${page}`,
			),
	});
}

export function useCreateShortUrl() {
	return useMutation({
		mutationFn: (url: string) =>
			apiClient.post<{ message: string; code: string }>("/api/spa/url-shortener/create", { url }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["url-shortener"] }),
	});
}
