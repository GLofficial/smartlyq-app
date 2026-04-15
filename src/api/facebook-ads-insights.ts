import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { FbAdsResponse, FbAdsQueryParams } from "@/pages/integrations/facebook-ads/fb-ads-types";

function buildQueryString(params: FbAdsQueryParams): string {
	const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
	return entries.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
}

export function useFbAdsInsights(params: FbAdsQueryParams, enabled = true) {
	const qs = buildQueryString(params);
	return useQuery({
		queryKey: ["fb-ads-insights", qs],
		queryFn: () => apiClient.get<FbAdsResponse>(`/api/spa/integrations/facebook-ads/insights?${qs}`),
		enabled,
		staleTime: 60_000,
		refetchInterval: 120_000,
	});
}

export function useFbAdsAction() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: Record<string, string>) =>
			apiClient.post<{ ok?: number; error?: string }>("/api/spa/integrations/facebook-ads/action", body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["fb-ads-insights"] });
		},
	});
}

export function fbAdsExportUrl(params: FbAdsQueryParams, format: string): string {
	const base = `${import.meta.env.VITE_API_BASE_URL || ""}/api/spa/integrations/facebook-ads/export`;
	const qs = buildQueryString({ ...params, refresh: undefined } as FbAdsQueryParams);
	return `${base}?export=${format}&${qs}`;
}
