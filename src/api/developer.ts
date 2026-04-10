import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

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

export function useDeveloperOverview() {
	return useQuery({ queryKey: ["developer", "overview"], queryFn: () => apiClient.get<{ active_keys: number; balance: number; monthly_balance: number }>("/api/spa/developer/overview") });
}

export function useDeveloperWebhooks() {
	return useQuery({ queryKey: ["developer", "webhooks"], queryFn: () => apiClient.get<{ webhooks: { id: number; url: string; events: string; status: string; created_at: string }[] }>("/api/spa/developer/webhooks") });
}

export function useWebhookSave() {
	return useMutation({
		mutationFn: (data: { id?: number; url: string; events?: string }) => apiClient.post<{ message: string; id?: number }>("/api/spa/developer/webhooks/save", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["developer", "webhooks"] }),
	});
}

export function useWebhookDelete() {
	return useMutation({
		mutationFn: (id: number) => apiClient.post<{ message: string }>("/api/spa/developer/webhooks/delete", { id }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["developer", "webhooks"] }),
	});
}

export function useDeveloperTransactions(page = 1) {
	return useQuery({
		queryKey: ["developer", "transactions", page],
		queryFn: () => apiClient.get<{ transactions: { id: number; type: string; amount: number; balance_after: number; description: string; status: string; created_at: string }[]; total: number; page: number; pages: number }>(`/api/spa/developer/transactions?page=${page}`),
	});
}
