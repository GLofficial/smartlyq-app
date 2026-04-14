import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAdContext } from "@/pages/ad-manager/ad-context";

export interface Ad {
	id: number; name: string; ad_set_name: string; status: string; format: string;
	headline: string; spent: number; impressions: number; clicks: number; ctr: number;
	conversions: number; cpa: number; platform: string; destination_url: string;
}

export function useAds() {
	const { queryString } = useAdContext();
	return useQuery({
		queryKey: ["ad-manager", "ads", queryString],
		queryFn: () => apiClient.get<{ ads: Ad[] }>(`/api/spa/ad-manager/ads?_=1${queryString}`),
	});
}
