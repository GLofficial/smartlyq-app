import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export function useAdminPricingGlobals() {
	return useQuery({
		queryKey: ["admin", "pricing", "globals"],
		queryFn: () =>
			apiClient.get<{ globals: Record<string, number> }>("/api/spa/admin/pricing/globals"),
	});
}

export function useSaveGlobals() {
	return useMutation({
		mutationFn: (values: Record<string, number>) =>
			apiClient.post<{ message: string }>("/api/spa/admin/pricing/globals/save", { values }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "pricing", "globals"] }),
	});
}

export function useAdminPricingModels() {
	return useQuery({
		queryKey: ["admin", "pricing", "models"],
		queryFn: () =>
			apiClient.get<{
				model_groups: Record<string, { id: number; provider: string; type: string; name: string; model: string }[]>;
				total: number;
			}>("/api/spa/admin/pricing/models"),
	});
}

export function useAdminPricingEndpoints() {
	return useQuery({
		queryKey: ["admin", "pricing", "endpoints"],
		queryFn: () =>
			apiClient.get<{
				pricing: { id: number; endpoint: string; unit_name: string; cost: number; min_units: number; max_units: number; is_active: boolean }[];
			}>("/api/spa/admin/pricing/endpoints"),
	});
}
