import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ArticleConfig {
	has_access: boolean;
	has_webhook: boolean;
	total_limit: number | null;
	languages: string[];
	tones: string[];
	text_models: { model: string; name: string; provider: string }[];
	image_models: { model: string; name: string; provider: string }[];
	brands: { id: number; name: string }[];
}

export interface Article {
	id: string;
	title: string;
	keywords: string;
	language: string;
	tone: string;
	audience: string;
	content: string;
	original_content: string;
	slug: string;
	tags: string;
	meta_description: string;
	featured_media: string;
	text_model: string;
	image_source: string;
	status: number;
	created: string;
}

export interface ArticleListItem {
	id: string;
	title: string;
	status: number;
	platform: string;
	publish_url: string;
	featured_media: string;
	created: string;
}

export function useArticleConfig() {
	return useQuery({
		queryKey: ["article", "config"],
		queryFn: () => apiClient.get<ArticleConfig>("/api/spa/article/config"),
		staleTime: 60_000,
	});
}

export function useGenerateTitle() {
	return useMutation({
		mutationFn: (data: { keywords: string; language: string; tone?: string }) =>
			apiClient.post<{ title: string }>("/api/spa/article/title", data),
	});
}

export function useCreateArticle() {
	return useMutation({
		mutationFn: (data: {
			keywords: string;
			language: string;
			tone?: string;
			audience?: string;
			context?: string;
			title?: string;
			text_model?: string;
			image_source?: string;
			video_source?: string;
			brand_id?: number;
		}) => apiClient.post<{ id: string; credits: number }>("/api/spa/article/create", data),
	});
}

export function useStreamPrepare() {
	return useMutation({
		mutationFn: (id: string) =>
			apiClient.get<{ stream_url?: string; stream_token?: string; fallback?: boolean; meta?: object }>(
				`/api/spa/article/stream-prepare?id=${encodeURIComponent(id)}`
			),
	});
}

export function useStreamComplete() {
	return useMutation({
		mutationFn: (data: { id: string; content: string; output_tokens: number; model: string }) =>
			apiClient.post<{ ok: boolean; article_id: string }>("/api/spa/article/stream-complete", data),
	});
}

export function usePollArticle(id: string, enabled: boolean) {
	return useQuery({
		queryKey: ["article", "poll", id],
		queryFn: () =>
			apiClient.get<{
				ready: boolean;
				status: number;
				slug: string;
				tags: string;
				meta_description: string;
				featured_media: string;
			}>(`/api/spa/article/poll?id=${encodeURIComponent(id)}`),
		enabled: enabled && !!id,
		refetchInterval: (query) => (query.state.data?.ready ? false : 4000),
		staleTime: 0,
	});
}

export function useArticleDetail(id: string) {
	return useQuery({
		queryKey: ["article", "detail", id],
		queryFn: () => apiClient.get<{ article: Article }>(`/api/spa/article/detail?id=${encodeURIComponent(id)}`),
		enabled: !!id,
	});
}

export function useSaveArticle() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: { id: string; title?: string; content?: string; tags?: string; meta_description?: string; slug?: string; keywords?: string }) =>
			apiClient.post<{ ok: boolean }>("/api/spa/article/save", data),
		onSuccess: (_d, vars) => {
			qc.invalidateQueries({ queryKey: ["article", "detail", vars.id] });
			qc.invalidateQueries({ queryKey: ["articles"] });
		},
	});
}

export function useDeleteArticle() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => apiClient.post<{ ok: boolean }>("/api/spa/article/delete", { id }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["articles"] }),
	});
}

export function useArticlesListFull(page = 1, search = "") {
	return useQuery({
		queryKey: ["articles", "full", page, search],
		queryFn: () => {
			const params = new URLSearchParams({ page: String(page) });
			if (search) params.set("search", search);
			return apiClient.get<{
				articles: ArticleListItem[];
				total: number;
				pages: number;
				page: number;
			}>(`/api/spa/articles/list?${params}`);
		},
	});
}
