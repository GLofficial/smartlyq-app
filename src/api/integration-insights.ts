import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useAdsInsights(platform: string) {
	return useQuery({
		queryKey: ["integrations", "ads", platform],
		queryFn: () =>
			apiClient.get<{
				platform: string;
				accounts: { id: number; name: string; account_id: string; status: string }[];
				connected: boolean;
			}>(`/api/spa/integrations/ads?platform=${platform}`),
	});
}

export function useGoogleInsights() {
	return useQuery({
		queryKey: ["integrations", "google-insights"],
		queryFn: () =>
			apiClient.get<{
				properties: { id: number; property_id: string; property_name: string; status: string }[];
			}>("/api/spa/integrations/google-insights"),
	});
}

export function useWoocommerceStores() {
	return useQuery({
		queryKey: ["integrations", "woocommerce"],
		queryFn: () =>
			apiClient.get<{
				stores: { id: number; url: string; title: string }[];
			}>("/api/spa/integrations/woocommerce"),
	});
}
