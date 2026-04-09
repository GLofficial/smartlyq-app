import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface Ad {
	id: number;
	name: string;
	ad_set_name: string;
	status: string;
	format: string;
	spent: number;
	impressions: number;
	clicks: number;
	ctr: number;
}

export function useAds() {
	return useQuery({
		queryKey: ["ad-manager", "ads"],
		queryFn: () => apiClient.get<{ ads: Ad[] }>("/api/spa/ad-manager/ads"),
	});
}
