import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface Brand {
	id: number;
	name: string;
	logo: string;
	industry: string;
	tagline: string;
	website: string;
	audience: string;
	description: string;
	primary_color: string;
	secondary_color: string;
	accent_color: string;
	status: number;
	created_at: string;
}

export interface BrandPreset {
	id: number;
	brand_id: number;
	type: string;
	title: string;
	content: string;
	sort_order: number;
	is_default: number;
}

export interface BrandSaveInput {
	id?: number;
	name: string;
	industry?: string;
	tagline?: string;
	website?: string;
	audience?: string;
	description?: string;
	logo_url?: string;
	primary_color?: string;
	secondary_color?: string;
	accent_color?: string;
	status?: number;
}

const inv = () => queryClient.invalidateQueries({ queryKey: ["brands"] });

export function useBrands() {
	return useQuery({
		queryKey: ["brands"],
		queryFn: () => apiClient.get<{ brands: Brand[] }>("/api/spa/brands"),
	});
}

export function useBrandGet(id: number) {
	return useQuery({
		queryKey: ["brands", id],
		queryFn: () => apiClient.get<{ brand: Record<string, unknown> }>(`/api/spa/brands/get?id=${id}`),
		enabled: id > 0,
	});
}

export function useBrandSave() {
	return useMutation({
		mutationFn: (data: BrandSaveInput) =>
			apiClient.post<{ message: string; id: number }>("/api/spa/brands/save", data),
		onSuccess: inv,
	});
}

export function useBrandDelete() {
	return useMutation({
		mutationFn: (id: number) => apiClient.post<{ message: string }>("/api/spa/brands/delete", { id }),
		onSuccess: inv,
	});
}

export function useBrandLogoUpload() {
	return useMutation({
		mutationFn: async ({ brandId, file }: { brandId: number; file: File }) => {
			const form = new FormData();
			form.append("brand_id", String(brandId));
			form.append("logo", file);
			return apiClient.upload<{ url: string; error?: string }>("/api/spa/brands/upload-logo", form);
		},
		onSuccess: inv,
	});
}

export function useBrandPresets(brandId: number) {
	return useQuery({
		queryKey: ["brands", brandId, "presets"],
		queryFn: () => apiClient.get<{ presets: BrandPreset[] }>(`/api/spa/brands/presets?brand_id=${brandId}`),
		enabled: brandId > 0,
	});
}

export function useBrandPresetAdd() {
	return useMutation({
		mutationFn: (data: { brand_id: number; type: string; title?: string; content: string; is_default?: number }) =>
			apiClient.post<{ id: number; message: string }>("/api/spa/brands/presets/add", data),
		onSuccess: (_, v) => queryClient.invalidateQueries({ queryKey: ["brands", v.brand_id, "presets"] }),
	});
}

export function useBrandPresetDelete() {
	return useMutation({
		mutationFn: ({ id }: { id: number; brand_id: number }) =>
			apiClient.post<{ message: string }>("/api/spa/brands/presets/delete", { id }),
		onSuccess: (_, v) => queryClient.invalidateQueries({ queryKey: ["brands", v.brand_id, "presets"] }),
	});
}
