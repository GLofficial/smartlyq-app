import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface AdSet {
	id: number;
	name: string;
	campaign_name: string;
	status: string;
	budget: number;
	spent: number;
	impressions: number;
	clicks: number;
}

export function useAdSets() {
	return useQuery({
		queryKey: ["ad-manager", "ad-sets"],
		queryFn: () => apiClient.get<{ ad_sets: AdSet[] }>("/api/spa/ad-manager/ad-sets"),
	});
}
