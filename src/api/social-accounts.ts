import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface SocialAccount {
	id: number; platform: string; account_id: string; account_name: string;
	account_username: string; profile_picture: string; account_type: string;
	is_active: number; token_status: string; status_label: string; validity: string;
	needs_reconnect: boolean; expires_at: string | null; last_sync: string | null;
	followers_count: number; connected_by: string; connected_at: string | null;
}

export function useSocialAccountsFull() {
	return useQuery({
		queryKey: ["social", "accounts", "full"],
		queryFn: () => apiClient.get<{ accounts: SocialAccount[] }>("/api/spa/social/accounts/full"),
	});
}

export function useSyncAccount() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (accountId: number) =>
			apiClient.post<{ message: string }>("/api/spa/social/accounts/sync", { account_id: accountId }),
		onSuccess: (data) => { toast.success(data.message || "Synced"); qc.invalidateQueries({ queryKey: ["social", "accounts"] }); },
		onError: (e: Error) => toast.error(e.message),
	});
}

export function useSyncAll() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (accountIds: number[]) => {
			const results = await Promise.allSettled(
				accountIds.map((id) => apiClient.post<{ message: string }>("/api/spa/social/accounts/sync", { account_id: id }))
			);
			return { synced: results.filter((r) => r.status === "fulfilled").length, failed: results.filter((r) => r.status === "rejected").length, total: accountIds.length };
		},
		onSuccess: (d) => { toast.success(`Synced ${d.synced}/${d.total} accounts`); qc.invalidateQueries({ queryKey: ["social", "accounts"] }); },
		onError: (e: Error) => toast.error(e.message),
	});
}

export function useDisconnectAccount() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (accountId: number) =>
			apiClient.post<{ message: string }>("/api/spa/social/accounts/disconnect", { account_id: accountId }),
		onSuccess: () => { toast.success("Account disconnected"); qc.invalidateQueries({ queryKey: ["social", "accounts"] }); },
		onError: (e: Error) => toast.error(e.message),
	});
}

export function useReconnectAccount() {
	return useMutation({
		mutationFn: (accountId: number) =>
			apiClient.post<{ redirect_url: string }>("/api/spa/social/accounts/reconnect", { account_id: accountId }),
		onSuccess: (data) => { if (data.redirect_url) window.location.href = data.redirect_url; else toast.error("No reconnect URL"); },
		onError: (e: Error) => toast.error(e.message),
	});
}

export function useStartOAuth() {
	return useMutation({
		mutationFn: (body: { platform: string; connection_method?: string }) =>
			apiClient.post<{ redirect_url: string }>("/api/spa/integrations/oauth/start", body),
		onSuccess: (data) => { if (data.redirect_url) window.location.href = data.redirect_url; else toast.error("No OAuth URL"); },
		onError: (e: Error) => toast.error(e.message),
	});
}
