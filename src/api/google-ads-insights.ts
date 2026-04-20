import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { GoogleAdsResponse, GoogleAdsQueryParams } from "@/pages/integrations/google-ads/google-ads-types";

function buildQueryString(params: GoogleAdsQueryParams): string {
	const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
	return entries.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
}

export function useGoogleAdsInsights(params: GoogleAdsQueryParams, enabled = true) {
	const qs = buildQueryString(params);
	return useQuery({
		queryKey: ["google-ads-insights", qs],
		queryFn: () => apiClient.get<GoogleAdsResponse>(`/api/spa/integrations/google-ads/insights?${qs}`),
		enabled,
		staleTime: 120_000,
		refetchInterval: 300_000,
	});
}

export function useGoogleAdsAction() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: Record<string, string>) =>
			apiClient.post<{ ok?: number; error?: string }>("/api/spa/integrations/google-ads/action", body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["google-ads-insights"] });
		},
	});
}

export function googleAdsExportUrl(params: GoogleAdsQueryParams, format: string): string {
	const base = `${import.meta.env.VITE_API_BASE_URL || ""}/api/spa/integrations/google-ads/export`;
	const qs = buildQueryString({ ...params, refresh: undefined } as GoogleAdsQueryParams);
	return `${base}?export=${format}&${qs}`;
}
