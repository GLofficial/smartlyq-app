import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

const inv = () => queryClient.invalidateQueries({ queryKey: ["campaigns"] });

export function useCampaigns() {
	return useQuery({ queryKey: ["campaigns"], queryFn: () => apiClient.get<{ campaigns: { id: number; name: string; type: string; status: number; active: boolean; generated: number; total: number; scheduled: string | null }[] }>("/api/spa/campaigns") });
}

export function useCampaignGet(id: number) {
	return useQuery({ queryKey: ["campaigns", id], queryFn: () => apiClient.get<{ campaign: Record<string, unknown> }>(`/api/spa/campaigns/get?id=${id}`), enabled: id > 0 });
}

export function useCampaignSave() {
	return useMutation({ mutationFn: (data: Record<string, unknown>) => apiClient.post<{ message: string; id: number }>("/api/spa/campaigns/save", data), onSuccess: inv });
}

export function useCampaignDelete() {
	return useMutation({ mutationFn: (id: number) => apiClient.post<{ message: string }>("/api/spa/campaigns/delete", { id }), onSuccess: inv });
}

export function useCampaignToggle() {
	return useMutation({ mutationFn: (data: { id: number; active: number }) => apiClient.post<{ message: string }>("/api/spa/campaigns/toggle", data), onSuccess: inv });
}
