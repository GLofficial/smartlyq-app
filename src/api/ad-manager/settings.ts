import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface AdAccount {
	id: number; platform: string; account_name: string; account_id: string;
	status: string; connected_at: string; currency: string; timezone: string;
}

export interface AdSettings {
	accounts: AdAccount[];
	default_currency: string;
	default_timezone: string;
	auto_optimize: boolean;
	preferences: Record<string, string>;
}

export function useAdSettings() {
	return useQuery({
		queryKey: ["ad-manager", "settings"],
		queryFn: () => apiClient.get<AdSettings>("/api/spa/ad-manager/settings"),
	});
}

// ── Meta Ads: per-account opt-in list ────────────────────────────────────
//
// Users must explicitly tick each Meta ad account they want SmartlyQ to
// track. The sync NEVER auto-iterates /me/adaccounts — only the accounts
// listed in `tracked` below are ever synced. Available = what the token
// can reach, shown only so the user can pick from it.

export interface FbAvailableAccount {
	id: string;           // act_XXX
	account_id: string;   // numeric portion
	name: string;
	currency: string;
	timezone: string;
}

export interface FbAccountsResponse {
	connected: number;
	primary_account_id?: string;
	available: FbAvailableAccount[];
	tracked: string[]; // act_XXX ids the user has opted into
}

export function useFbAdAccounts() {
	return useQuery({
		queryKey: ["ad-manager", "fb-accounts"],
		queryFn: () =>
			apiClient.get<FbAccountsResponse>("/api/spa/integrations/facebook-ads/accounts"),
	});
}

export function useSetFbTrackedAccounts() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (accountIds: string[]) =>
			apiClient.post<{ ok?: number; count?: number; error?: string }>(
				"/api/spa/integrations/facebook-ads/action",
				{ action: "fb_ads_set_tracked_accounts", account_ids: accountIds },
			),
		onSuccess: (data) => {
			if (data?.error) {
				toast.error(data.error);
				return;
			}
			toast.success(`Now tracking ${data?.count ?? 0} Meta ad account${(data?.count ?? 0) === 1 ? "" : "s"}`);
			qc.invalidateQueries({ queryKey: ["ad-manager", "fb-accounts"] });
			qc.invalidateQueries({ queryKey: ["ad-manager", "settings"] });
		},
		onError: (err: Error) => toast.error(err.message || "Failed to save"),
	});
}
