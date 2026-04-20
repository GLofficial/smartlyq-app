import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface BizAssetSummary {
	type: string;
	icon: string;
	label: string;
	name: string;
}

export interface BizGroupAsset {
	id: number;
	group_id: number;
	asset_type: string;
	asset_reference_id: number | null;
	external_identifier: string | null;
	display_name: string;
}

export interface BizGroup {
	id: number;
	workspace_id: number;
	name: string;
	description: string | null;
	primary_domain: string | null;
	currency: string | null;
	timezone: string | null;
	brand_id: number | null;
	logo_url: string | null;
	status: string;
	created_at: string;
	assets?: BizGroupAsset[];
	assets_summary?: BizAssetSummary[];
	brand?: { id: number; name: string };
}

export interface BizAvailableAsset {
	reference_id: number | null;
	external_id: string | null;
	display_name: string;
	meta?: Record<string, string>;
}

export type BizAvailableAssets = Record<string, BizAvailableAsset[]>;

export interface BizBrand { id: number; name: string; logo_url?: string | null }

export interface BizGroupsFeed {
	ok: number;
	can_create: boolean;
	limit: number | null;
	used: number;
	remaining: number | null;
	count: number;
	groups: BizGroup[];
	available_assets: BizAvailableAssets;
	available_brands: BizBrand[];
}

export interface BizSaveInput {
	id?: number;
	name: string;
	description?: string;
	primary_domain?: string;
	currency?: string;
	timezone?: string;
	brand_id?: number | null;
	logo_url?: string;
	assets?: Array<{ asset_type: string; asset_reference_id?: number | null; external_identifier?: string; display_name?: string }>;
}

const inv = () => queryClient.invalidateQueries({ queryKey: ["businesses"] });

export function useBusinessGroups() {
	return useQuery({
		queryKey: ["businesses"],
		queryFn: () => apiClient.get<BizGroupsFeed>("/api/spa/businesses"),
	});
}

export function useBusinessGroupGet(id: number) {
	return useQuery({
		queryKey: ["businesses", id],
		queryFn: () => apiClient.get<{ group: BizGroup }>(`/api/spa/businesses/get?id=${id}`),
		enabled: id > 0,
	});
}

export function useBusinessGroupSave() {
	return useMutation({
		mutationFn: (data: BizSaveInput) =>
			apiClient.post<{ message: string; id: number }>("/api/spa/businesses/save", data),
		onSuccess: inv,
	});
}

export function useBusinessGroupDelete() {
	return useMutation({
		mutationFn: (id: number) => apiClient.post<{ message: string }>("/api/spa/businesses/delete", { id }),
		onSuccess: inv,
	});
}
