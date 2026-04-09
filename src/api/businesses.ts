import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface BusinessGroup {
	id: number;
	name: string;
	description: string;
	created_at: string;
}

export function useBusinesses() {
	return useQuery({
		queryKey: ["businesses"],
		queryFn: () => apiClient.get<{ groups: BusinessGroup[] }>("/api/spa/businesses"),
	});
}
