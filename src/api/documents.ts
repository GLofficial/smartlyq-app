import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface Document { id: number; name: string; modified: string | null; }

export function useDocuments(search = "", page = 1) {
	return useQuery({
		queryKey: ["documents", search, page],
		queryFn: () => apiClient.get<{ documents: Document[]; total: number; page: number; pages: number }>(
			`/api/spa/documents?search=${encodeURIComponent(search)}&page=${page}`),
	});
}

export function useDocumentRename() {
	return useMutation({
		mutationFn: (data: { id: number; name: string }) => apiClient.post<{ message: string }>("/api/spa/documents/rename", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
	});
}

export function useDocumentDelete() {
	return useMutation({
		mutationFn: (id: number) => apiClient.post<{ message: string }>("/api/spa/documents/delete", { id }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
	});
}
