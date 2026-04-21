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
		mutationFn: (body: { platform: string; connection_method?: string; popup?: boolean }) => {
			// Instagram "direct" method maps to the "instagram_direct" provider
			let platform = body.platform;
			if (platform === "instagram" && body.connection_method === "direct") {
				platform = "instagram_direct";
			}
			const popup = body.popup ? "&spa_popup=1" : "";
			return apiClient.get<{ redirect_url: string }>(
				`/api/spa/social/oauth/start?platform=${encodeURIComponent(platform)}${popup}`,
			);
		},
		onSuccess: (data) => { if (data.redirect_url) window.location.href = data.redirect_url; else toast.error("No OAuth URL"); },
		onError: (e: Error) => toast.error(e.message),
	});
}

// Native-picker-only hooks (SPA popup OAuth flow).
// Returns pending status=0 AND active status=1 rows for the given platform so the React picker
// modal can render both lists and let users disconnect existing accounts inline to free up
// plan-limit slots before connecting new ones.
export interface PendingAccount {
	id: number;
	platform: string;
	account_id: string;
	account_name: string;
	account_username: string;
	account_type: string;
	profile_picture: string;
	created_at: string;
	status: number;
	connected_by_name?: string;
	connected_by_user_id?: number;
}

export interface PickerData {
	pending: PendingAccount[];
	active: PendingAccount[];
	plan_limit: number | null;
	active_count: number;
}

export function useSocialAccountsPending(platform: string, enabled: boolean) {
	return useQuery({
		queryKey: ["social", "accounts", "pending", platform],
		queryFn: () =>
			apiClient.get<PickerData>(
				`/api/spa/social/accounts/pending?platform=${encodeURIComponent(platform)}`,
			),
		enabled: enabled && platform !== "",
		staleTime: 0,
	});
}

export function useActivateSocialAccounts() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: { platform: string; selected_ids: number[] }) =>
			apiClient.post<{ success: boolean; activated: number; platform: string }>(
				"/api/spa/social/accounts/activate",
				body,
			),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["social", "accounts"] });
		},
	});
}
