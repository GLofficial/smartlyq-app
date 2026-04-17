import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface SystemModel { id: number; provider: string; type: string; name: string; model: string; }
export interface Language    { name: string; selected: number; status: number; }
export interface Tone        { name: string; status: number; }

// ── Models ──────────────────────────────────────────────────────────────────

export function useAdminSystemModels() {
	return useQuery({
		queryKey: ["admin", "ai", "models"],
		queryFn: () => apiClient.get<{ models: SystemModel[] }>("/api/spa/admin/models"),
		staleTime: 60_000,
	});
}

export function useAddSystemModel() {
	return useMutation({
		mutationFn: (data: { provider: string; type: string; name: string; model: string }) =>
			apiClient.post<{ message: string }>("/api/spa/admin/ai/models/add", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "ai", "models"] }),
	});
}

export function useDeleteSystemModel() {
	return useMutation({
		mutationFn: (id: number) =>
			apiClient.post<{ message: string }>("/api/spa/admin/ai/models/delete", { id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "ai", "models"] });
			queryClient.invalidateQueries({ queryKey: ["admin", "models"] });
		},
	});
}

// ── Languages ────────────────────────────────────────────────────────────────

export function useAdminLanguages() {
	return useQuery({
		queryKey: ["admin", "ai", "languages"],
		queryFn: () => apiClient.get<{ languages: Language[] }>("/api/spa/admin/ai/languages"),
	});
}

export function useAddLanguage() {
	return useMutation({
		mutationFn: (name: string) =>
			apiClient.post<{ message: string }>("/api/spa/admin/ai/languages/add", { name }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "ai", "languages"] }),
	});
}

export function useDeleteLanguage() {
	return useMutation({
		mutationFn: (name: string) =>
			apiClient.post<{ message: string }>("/api/spa/admin/ai/languages/delete", { name }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "ai", "languages"] }),
	});
}

export function useUpdateLanguage() {
	return useMutation({
		mutationFn: (data: { name: string; selected?: boolean; status?: boolean }) =>
			apiClient.post<{ message: string }>("/api/spa/admin/ai/languages/update", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "ai", "languages"] }),
	});
}

// ── Tones ────────────────────────────────────────────────────────────────────

export function useAdminTones() {
	return useQuery({
		queryKey: ["admin", "ai", "tones"],
		queryFn: () => apiClient.get<{ tones: Tone[] }>("/api/spa/admin/ai/tones"),
	});
}

export function useAddTone() {
	return useMutation({
		mutationFn: (name: string) =>
			apiClient.post<{ message: string }>("/api/spa/admin/ai/tones/add", { name }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "ai", "tones"] }),
	});
}

export function useDeleteTone() {
	return useMutation({
		mutationFn: (name: string) =>
			apiClient.post<{ message: string }>("/api/spa/admin/ai/tones/delete", { name }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "ai", "tones"] }),
	});
}

export function useUpdateTone() {
	return useMutation({
		mutationFn: (data: { name: string; status: boolean }) =>
			apiClient.post<{ message: string }>("/api/spa/admin/ai/tones/update", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "ai", "tones"] }),
	});
}
