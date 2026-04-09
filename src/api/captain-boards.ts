import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Board {
	id: number;
	name: string;
	description: string;
	status: string;
	source_count: number;
	created_at: string;
}

export function useCaptainBoards() {
	return useQuery({
		queryKey: ["captain", "boards"],
		queryFn: () => apiClient.get<{ boards: Board[] }>("/api/spa/ai-captain/boards"),
	});
}
