import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export function useGenerateImage() {
	return useMutation({
		mutationFn: (data: { prompt: string; model?: string }) =>
			apiClient.post<{ message: string; image_url: string; id: number }>(
				"/api/spa/generate/image",
				data,
			),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["images"] }),
	});
}

export function useRewriteContent() {
	return useMutation({
		mutationFn: (data: { content: string; tone?: string }) =>
			apiClient.post<{ rewritten: string }>("/api/spa/generate/rewrite", data),
	});
}
