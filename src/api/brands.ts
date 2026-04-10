import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface Brand {
	id: number;
	name: string;
	logo: string;
	industry: string;
	tagline: string;
	primary_color: string;
	created_at: string;
}

const inv = () => queryClient.invalidateQueries({ queryKey: ["brands"] });

export function useBrands() {
	return useQuery({
		queryKey: ["brands"],
		queryFn: () => apiClient.get<{ brands: Brand[] }>("/api/spa/brands"),
	});
}

export function useBrandGet(id: number) {
	return useQuery({
		queryKey: ["brands", id],
		queryFn: () => apiClient.get<{ brand: Record<string, unknown> }>(`/api/spa/brands/get?id=${id}`),
		enabled: id > 0,
	});
}

export function useBrandSave() {
	return useMutation({
		mutationFn: (data: { id?: number; name: string; industry?: string; tagline?: string; description?: string; audience?: string; logo_url?: string }) =>
			apiClient.post<{ message: string; id: number }>("/api/spa/brands/save", data),
		onSuccess: inv,
	});
}

export function useBrandDelete() {
	return useMutation({
		mutationFn: (id: number) => apiClient.post<{ message: string }>("/api/spa/brands/delete", { id }),
		onSuccess: inv,
	});
}
