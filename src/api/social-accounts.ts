import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface SocialAccountFull {
	id: number;
	platform: string;
	account_id: string;
	account_name: string;
	account_username: string;
	profile_picture: string;
	is_active: boolean;
	token_status: string;
	connected_at: string | null;
}

export function useSocialAccountsFull() {
	return useQuery({
		queryKey: ["social", "accounts", "full"],
		queryFn: () => apiClient.get<{ accounts: SocialAccountFull[] }>("/api/spa/social/accounts/full"),
	});
}

export function useStartOAuth() {
	return useMutation({
		mutationFn: (platform: string) =>
			apiClient.get<{ redirect_url: string }>(`/api/spa/social/oauth/start?platform=${platform}`),
		onSuccess: (data) => { if (data.redirect_url) window.location.href = data.redirect_url; },
	});
}

export function useDisconnectAccount() {
	return useMutation({
		mutationFn: (accountId: number) =>
			apiClient.post<{ message: string }>("/api/spa/social/accounts/disconnect", { account_id: accountId }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social", "accounts"] }),
	});
}

export function useReconnectAccount() {
	return useMutation({
		mutationFn: (accountId: number) =>
			apiClient.post<{ redirect_url: string }>("/api/spa/social/accounts/reconnect", { account_id: accountId }),
		onSuccess: (data) => { if (data.redirect_url) window.location.href = data.redirect_url; },
	});
}

export function useSyncAccount() {
	return useMutation({
		mutationFn: (accountId: number) =>
			apiClient.post<{ message: string }>("/api/spa/social/accounts/sync", { account_id: accountId }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social", "accounts"] }),
	});
}
