import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface PostQueue {
	id: number;
	name: string;
	schedule: Record<string, unknown>;
	is_active: boolean;
	created_at: string;
}

const invalidateQueues = () => queryClient.invalidateQueries({ queryKey: ["queues"] });

export function useQueues() {
	return useQuery({
		queryKey: ["queues"],
		queryFn: () => apiClient.get<{ queues: PostQueue[] }>("/api/spa/queues"),
	});
}

export function useSaveQueue() {
	return useMutation({
		mutationFn: (data: { id?: number; name: string; schedule: Record<string, unknown>; is_active?: boolean }) =>
			apiClient.post<{ message: string; id: number }>("/api/spa/queues/save", data),
		onSuccess: invalidateQueues,
	});
}

export function useDeleteQueue() {
	return useMutation({
		mutationFn: (id: number) =>
			apiClient.post<{ message: string }>("/api/spa/queues/delete", { id }),
		onSuccess: invalidateQueues,
	});
}

export function useToggleQueue() {
	return useMutation({
		mutationFn: (id: number) =>
			apiClient.post<{ message: string; is_active: boolean }>("/api/spa/queues/toggle", { id }),
		onSuccess: invalidateQueues,
	});
}
