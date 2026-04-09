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

export interface PricingModel {
	id: number;
	provider: string;
	model: string;
	type: string;
	resolution: string | null;
	length: string | null;
	mode: string | null;
	audio: string | null;
	input_cost: number;
	output_cost: number;
	vendor_cost: number;
	markup: number;
	min_charge: number;
}

export function useAdminPricingModels() {
	return useQuery({
		queryKey: ["admin", "pricing", "models"],
		queryFn: () =>
			apiClient.get<{
				model_groups: Record<string, PricingModel[]>;
				total: number;
			}>("/api/spa/admin/pricing/models"),
	});
}

export function useEditModelPricing() {
	return useMutation({
		mutationFn: (data: { id: number; input_cost?: number; output_cost?: number; vendor_cost?: number; markup_factor?: number }) =>
			apiClient.post<{ message: string }>("/api/spa/admin/pricing/models/edit", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "pricing", "models"] }),
	});
}

export function useEditPlan() {
	return useMutation({
		mutationFn: (data: { id: number; fields: Record<string, unknown> }) =>
			apiClient.post<{ message: string }>("/api/spa/admin/pricing/plans/edit", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] }),
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
