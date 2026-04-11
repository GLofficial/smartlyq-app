import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface WorkspaceOverview {
	workspace: { id: number; name: string; icon_url: string; require_post_approval: boolean };
	seats: { active: number; included: number; billable: number; max: number | null };
}

export interface WorkspaceBilling {
	plan: { name: string; price: number; seat_price_monthly: number; seat_price_yearly: number; seats_included: number; seats_max: number } | null;
	credits: number | null;
	subscription: { expires_at?: string } | null;
	stripe: { has_subscription: boolean; seat_quantity: number; extra_storage_gb: number } | null;
}

export interface ActivityEntry {
	id: number; event: string; meta: string; who: string; created_at: string;
}

export interface FeatureDefault {
	id: number; feature: string; allow_owner: boolean; allow_admin: boolean; allow_member: boolean;
}

export function useWorkspaceOverview() {
	return useQuery({
		queryKey: ["workspace", "overview"],
		queryFn: () => apiClient.get<WorkspaceOverview>("/api/spa/workspace/overview"),
	});
}

export function useWorkspaceBilling() {
	return useQuery({
		queryKey: ["workspace", "billing"],
		queryFn: () => apiClient.get<WorkspaceBilling>("/api/spa/workspace/billing"),
	});
}

export function useWorkspaceActivity(page: number) {
	return useQuery({
		queryKey: ["workspace", "activity", page],
		queryFn: () => apiClient.get<{ activity: ActivityEntry[]; total: number; page: number; pages: number }>(`/api/spa/workspace/activity?page=${page}`),
	});
}

export function useWorkspaceDefaults() {
	return useQuery({
		queryKey: ["workspace", "defaults"],
		queryFn: () => apiClient.get<{ defaults: FeatureDefault[] }>("/api/spa/workspace/defaults"),
	});
}

export function useRenameWorkspace() {
	return useMutation({
		mutationFn: (name: string) =>
			apiClient.post<{ message: string }>("/api/spa/workspace/rename", { name }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace"] }),
	});
}

export function useToggleApproval() {
	return useMutation({
		mutationFn: (enabled: boolean) =>
			apiClient.post<{ message: string }>("/api/spa/workspace/toggle-approval", { enabled: enabled ? 1 : 0 }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace"] }),
	});
}

export function useSaveWorkspaceDefaults() {
	return useMutation({
		mutationFn: (defaults: { id: number; allow_admin: boolean; allow_member: boolean }[]) =>
			apiClient.post<{ message: string }>("/api/spa/workspace/defaults/save", { defaults }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace", "defaults"] }),
	});
}
