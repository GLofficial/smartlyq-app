import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface Label {
	id: number;
	name: string;
	color: string;
	created_at: string;
}

export function useLabels() {
	return useQuery({
		queryKey: ["labels"],
		queryFn: () => apiClient.get<{ labels: Label[] }>("/api/spa/labels"),
	});
}

export function useLabelSave() {
	return useMutation({
		mutationFn: (data: { id?: number; name: string; color: string }) =>
			apiClient.post<{ message: string }>("/api/spa/labels/save", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["labels"] }),
	});
}

export function useLabelDelete() {
	return useMutation({
		mutationFn: (id: number) =>
			apiClient.post<{ message: string }>("/api/spa/labels/delete", { id }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["labels"] }),
	});
}
