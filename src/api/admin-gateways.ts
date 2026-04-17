import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface GatewayOption {
	key: string;
	value: string;
	label: string;
	placeholder?: string;
}

export interface Gateway {
	provider: string;
	name: string;
	description: string;
	options: GatewayOption[];
	recurring: boolean;
	status: boolean;
}

export function useAdminGateways() {
	return useQuery({
		queryKey: ["admin", "gateways"],
		queryFn: () => apiClient.get<{ gateways: Gateway[] }>("/api/spa/admin/gateways"),
		staleTime: 30_000,
	});
}

export function useSaveGateway() {
	return useMutation({
		mutationFn: (data: {
			provider: string;
			options: { key: string; value: string }[];
			recurring?: boolean;
			status: boolean;
		}) => apiClient.post<{ message: string }>("/api/spa/admin/gateways/save", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "gateways"] }),
	});
}
