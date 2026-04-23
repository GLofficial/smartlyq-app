import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ImageModel { name: string; model: string; provider: string; credits: number | null; icon_url: string; tier: "basic" | "advanced" | "premium" | "ultra"; }
export interface ImageStyle { value: string; prompt: string; icon_url: string; }
export interface AdOption { key: string; label: string; }
export interface ImageConfig {
	models: ImageModel[];
	styles: ImageStyle[];
	ad_use_cases: AdOption[];
	ad_objectives: AdOption[];
	ad_audience_temps: AdOption[];
	ad_visual_angles: AdOption[];
	ad_placements: AdOption[];
	ad_goals: AdOption[];
	ad_visual_styles: AdOption[];
	ad_moods: AdOption[];
}

export function useImageConfig(aspectRatio = "Square") {
	return useQuery({
		queryKey: ["image-config", aspectRatio],
		queryFn: () => apiClient.get<ImageConfig>(`/api/spa/ai/image-config?aspect_ratio=${encodeURIComponent(aspectRatio)}`),
		staleTime: 60_000,
	});
}

export interface Template {
	id: number;
	name: string;
	description: string;
	icon: string;
	category: string;
	premium: boolean;
}

export function useTemplates() {
	return useQuery({
		queryKey: ["templates"],
		queryFn: () =>
			apiClient.get<{ templates: Template[]; categories: string[] }>("/api/spa/templates"),
	});
}

export function useImages(page = 1) {
	return useQuery({
		queryKey: ["images", page],
		queryFn: () =>
			apiClient.get<{
				images: { id: string; thumb: string; description: string; provider: string; model: string; created: string }[];
				total: number; page: number; pages: number;
			}>(`/api/spa/images?page=${page}`),
	});
}

export function useArticles(page = 1) {
	return useQuery({
		queryKey: ["articles", page],
		queryFn: () =>
			apiClient.get<{
				articles: { id: number; title: string; status: string; created: string }[];
				total: number; page: number; pages: number;
			}>(`/api/spa/articles?page=${page}`),
	});
}

export function useVideos() {
	return useQuery({
		queryKey: ["videos"],
		queryFn: () =>
			apiClient.get<{
				videos: { id: number; url: string; prompt: string; status: number; created: string }[];
			}>("/api/spa/videos"),
	});
}

export interface Campaign {
	id: number;
	name: string;
	platform: string;
	status: string;
	objective: string;
	budget: number;
	spent: number;
	impressions: number;
	clicks: number;
	conversions: number;
	ctr: number;
	cpa: number;
	roas: number;
	purchase_value: number;
	leads: number;
	start_date: string | null;
	end_date: string | null;
}

export function useAdManager() {
	return useQuery({
		queryKey: ["ad-manager"],
		queryFn: () =>
			apiClient.get<{
				campaigns: Campaign[];
				total_spent: number;
				total_impressions: number;
				total_clicks: number;
			}>("/api/spa/ad-manager"),
	});
}

export interface Tenant {
	id: number;
	subdomain: string;
	custom_domain: string;
	site_name: string;
	status: string;
	license_active: boolean;
	created_at: string;
}

export function useAgency() {
	return useQuery({
		queryKey: ["agency"],
		queryFn: () => apiClient.get<{ tenants: Tenant[] }>("/api/spa/agency"),
	});
}
