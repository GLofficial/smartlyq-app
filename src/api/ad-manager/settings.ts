import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface AdAccount {
	id: number;
	platform: string;
	account_name: string;
	account_id: string;
	status: string;
	connected_at: string;
}

export interface AdSettings {
	accounts: AdAccount[];
	default_currency: string;
	default_timezone: string;
	auto_optimize: boolean;
}

export function useAdSettings() {
	return useQuery({
		queryKey: ["ad-manager", "settings"],
		queryFn: () => apiClient.get<AdSettings>("/api/spa/ad-manager/settings"),
	});
}
