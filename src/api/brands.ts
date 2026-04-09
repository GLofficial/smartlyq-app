import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Brand {
	id: number;
	name: string;
	logo: string;
	primary_color: string;
	created_at: string;
}

export function useBrands() {
	return useQuery({
		queryKey: ["brands"],
		queryFn: () => apiClient.get<{ brands: Brand[] }>("/api/spa/brands"),
	});
}
