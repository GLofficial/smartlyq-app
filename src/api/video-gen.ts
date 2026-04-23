import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface VideoPricingRow {
	length: string;
	resolution: string;
	mode: string;
	audio: number;
	credits: number;
}

export interface VideoModel {
	model: string;
	name: string;
	text: string;
	icon_url: string;
	length: string;        // comma-separated allowed lengths e.g. "5,10"
	resolution: string;   // comma-separated e.g. "720p,1080p"
	mode: string;         // comma-separated e.g. "std,pro"
	style: string;        // comma-separated e.g. "auto,anime,comic"
	aspect_ratio: string; // comma-separated e.g. "16:9,9:16,1:1"
	movement: string;     // comma-separated e.g. "auto,small,medium,large"
	seed: boolean;
	image_tail: boolean;
	negative_prompt: boolean;
	fixed_camera: boolean;
	generate_audio: boolean;
	director_mode: boolean;
	sound_effects: boolean;
	prompt_strength: number | null;
	prompt_max_length: number;
	pricing: VideoPricingRow[];
}

export interface VideoConfig {
	models: VideoModel[];
}

export function useVideoConfig() {
	return useQuery({
		queryKey: ["video", "config"],
		queryFn: () => apiClient.get<VideoConfig>("/api/spa/video/config"),
		staleTime: 60_000,
	});
}

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
		mutationFn: (data: {
			prompt: string;
			model?: string;
			length?: string;
			resolution?: string;
			mode?: string;
			style?: string;
			audio?: number;
			aspect_ratio?: string;
			negative_prompt?: string;
			movement?: string;
			camera_fixed?: boolean;
			director_mode?: boolean;
			sound_effects?: boolean;
			prompt_strength?: number | null;
			seed?: number | null;
			outputs?: number;
		}) =>
			apiClient.post<{ message: string; ids: number[] }>(
				"/api/spa/video/generate",
				data,
			),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["videos"] }),
	});
}

export function useGenerateVideoPrompt() {
	return useMutation({
		mutationFn: (idea: string) =>
			apiClient.post<{ prompts: string[] }>("/api/spa/ai/video-prompt", { idea }),
	});
}
