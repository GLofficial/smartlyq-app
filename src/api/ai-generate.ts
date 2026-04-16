import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface AiModel {
	id: number;
	name: string;
	model: string;
	provider: string;
	type: string;
}

export function useAiModels() {
	return useQuery({
		queryKey: ["ai", "models"],
		queryFn: () =>
			apiClient.get<{ text_models: AiModel[]; image_models: AiModel[] }>("/api/spa/ai/models"),
	});
}

export function useAiImage() {
	return useMutation({
		mutationFn: (data: { prompt: string; model?: string; size?: string; brand_voice?: boolean; brand_id?: number }) =>
			apiClient.post<{ image_url: string; id: number }>("/api/spa/ai/image", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media"] }),
	});
}

export function useAiRewrite() {
	return useMutation({
		mutationFn: (data: { content: string; tone?: string; model?: string; brand_voice?: boolean; brand_id?: number; content_type?: string }) =>
			apiClient.post<{ rewritten: string }>("/api/spa/ai/rewrite", data),
	});
}

export function useAiTts() {
	return useMutation({
		mutationFn: (data: { text: string; voice?: string }) =>
			apiClient.post<{ url: string; filename: string }>("/api/spa/ai/tts", data),
	});
}

export function useAiEditorAssist() {
	return useMutation({
		mutationFn: (data: { content: string; instruction?: string }) =>
			apiClient.post<{ result: string }>("/api/spa/ai/editor-assist", data),
	});
}
