import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export function useVideoModels() {
	return useQuery({
		queryKey: ["video", "models"],
		queryFn: () =>
			apiClient.get<{
				text_models: { model: string }[];
				image_models: { model: string }[];
			}>("/api/spa/video/models"),
	});
}

export function useGenerateVideo() {
	return useMutation({
		mutationFn: (data: { prompt: string; model?: string; type?: string; image_url?: string }) =>
			apiClient.post<{ message: string; video_id: number; task_id: string }>(
				"/api/spa/video/generate",
				data,
			),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["videos"] }),
	});
}
