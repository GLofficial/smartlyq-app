import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function usePresentationsRedirect() {
	return useMutation({
		mutationFn: () => apiClient.get<{ redirect_url: string }>("/api/spa/external/presentations"),
		onSuccess: (data) => { if (data.redirect_url) window.location.href = data.redirect_url; },
	});
}

export function useVideoEditorToken() {
	return useMutation({
		mutationFn: () => apiClient.post<{ token: string; editor_url: string }>("/api/spa/external/video-editor/token"),
	});
}

export function useVideoEditorProjects() {
	return useQuery({
		queryKey: ["video-editor", "projects"],
		queryFn: () => apiClient.get<{ projects: { id: number; title: string; thumbnail: string; status: string; modified: string | null }[] }>("/api/spa/external/video-editor/projects"),
	});
}

export function useCalendarToken() {
	return useMutation({
		mutationFn: () => apiClient.post<{ token: string; calendar_url: string }>("/api/spa/external/calendar/token"),
	});
}
