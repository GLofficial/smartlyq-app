import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAdContext } from "@/pages/ad-manager/ad-context";

export interface AdSet {
	id: number; name: string; campaign_name: string; status: string; budget: number;
	bid_strategy: string; spent: number; impressions: number; clicks: number;
	conversions: number; cpa: number; platform: string;
}

export function useAdSets() {
	const { queryString } = useAdContext();
	return useQuery({
		queryKey: ["ad-manager", "ad-sets", queryString],
		queryFn: () => apiClient.get<{ ad_sets: AdSet[] }>(`/api/spa/ad-manager/ad-sets?_=1${queryString}`),
	});
}
