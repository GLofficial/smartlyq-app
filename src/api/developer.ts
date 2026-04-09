import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ApiKey {
	id: number;
	name: string;
	key_prefix: string;
	status: string;
	rate_limit: number;
	created_at: string;
}

export function useDeveloperKeys() {
	return useQuery({
		queryKey: ["developer"],
		queryFn: () => apiClient.get<{ api_keys: ApiKey[] }>("/api/spa/developer"),
	});
}
