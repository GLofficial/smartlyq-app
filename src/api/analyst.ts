import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export function useAnalysisList() {
	return useQuery({
		queryKey: ["analyst", "list"],
		queryFn: () =>
			apiClient.get<{ analyses: { id: number; title: string; created: string }[] }>(
				"/api/spa/analyst/list",
			),
	});
}

export function useCreateAnalysis() {
	return useMutation({
		mutationFn: (title: string) =>
			apiClient.post<{ message: string; id: number; assistant_id: string; thread_id: string }>(
				"/api/spa/analyst/create",
				{ title },
			),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["analyst"] }),
	});
}

export function useAskAnalyst() {
	return useMutation({
		mutationFn: (data: { analysis_id: number; question: string }) =>
			apiClient.post<{ answer: string }>("/api/spa/analyst/ask", data),
	});
}
