import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

const inv = () => queryClient.invalidateQueries({ queryKey: ["businesses"] });

export function useBusinessGroups() {
	return useQuery({ queryKey: ["businesses"], queryFn: () => apiClient.get<{ groups: { id: number; name: string; description: string; asset_count: number; status: string }[] }>("/api/spa/businesses") });
}

export function useBusinessGroupGet(id: number) {
	return useQuery({ queryKey: ["businesses", id], queryFn: () => apiClient.get<{ group: Record<string, unknown>; assets: { id: number; asset_type: string; asset_id: string; display_name: string }[] }>(`/api/spa/businesses/get?id=${id}`), enabled: id > 0 });
}

export function useBusinessGroupSave() {
	return useMutation({ mutationFn: (data: { id?: number; name: string; description?: string; brand_id?: number }) => apiClient.post<{ message: string; id: number }>("/api/spa/businesses/save", data), onSuccess: inv });
}

export function useBusinessGroupDelete() {
	return useMutation({ mutationFn: (id: number) => apiClient.post<{ message: string }>("/api/spa/businesses/delete", { id }), onSuccess: inv });
}

export function useBusinessGroupAddAsset() {
	return useMutation({ mutationFn: (data: { group_id: number; asset_type: string; asset_id: string; display_name?: string }) => apiClient.post<{ message: string; id: number }>("/api/spa/businesses/assets/add", data), onSuccess: inv });
}

export function useBusinessGroupRemoveAsset() {
	return useMutation({ mutationFn: (assetId: number) => apiClient.post<{ message: string }>("/api/spa/businesses/assets/remove", { asset_id: assetId }), onSuccess: inv });
}
