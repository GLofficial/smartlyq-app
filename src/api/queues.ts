import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface PostQueue {
	id: number;
	name: string;
	schedule: Record<string, unknown>;
	is_active: boolean;
	created_at: string;
}

export function useQueues() {
	return useQuery({
		queryKey: ["queues"],
		queryFn: () => apiClient.get<{ queues: PostQueue[] }>("/api/spa/queues"),
	});
}
