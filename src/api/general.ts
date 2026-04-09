import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ConnectedAccount {
	id: number;
	platform: string;
	account_name: string;
	profile_picture: string;
	token_status: string;
	is_active: boolean;
}

export function useIntegrations() {
	return useQuery({
		queryKey: ["integrations"],
		queryFn: () =>
			apiClient.get<{
				platforms: Record<string, { name: string; category: string }>;
				connected: ConnectedAccount[];
			}>("/api/spa/integrations"),
	});
}

export interface BillingData {
	credits: number;
	plan: { id: number; name: string; price: number; duration: string } | null;
	subscription: { id: number; status: number; created_at: string; expires_at: string | null } | null;
	recent_transactions: {
		id: number;
		amount: number;
		currency: string;
		status: string;
		description: string;
		created_at: string;
	}[];
}

export function useBilling() {
	return useQuery({
		queryKey: ["billing"],
		queryFn: () => apiClient.get<BillingData>("/api/spa/billing"),
	});
}

export interface WorkspaceData {
	workspace: { id: number; name: string; slug: string } | null;
	members: {
		id: number;
		user_id: number;
		name: string;
		email: string;
		role: string;
		status: string;
	}[];
}

export function useWorkspace() {
	return useQuery({
		queryKey: ["workspace"],
		queryFn: () => apiClient.get<WorkspaceData>("/api/spa/workspace"),
	});
}

export interface MediaItem {
	id: number;
	uid: string;
	filename: string;
	content_type: string;
	url: string;
	thumb_url: string;
	file_size: number;
	created_at: string;
}

export function useMedia(type?: string, page = 1) {
	const params = new URLSearchParams();
	if (type) params.set("type", type);
	params.set("page", String(page));
	return useQuery({
		queryKey: ["media", type, page],
		queryFn: () =>
			apiClient.get<{ items: MediaItem[]; total: number; page: number; pages: number }>(
				`/api/spa/media?${params.toString()}`,
			),
	});
}

export function useHistory(page = 1) {
	return useQuery({
		queryKey: ["history", page],
		queryFn: () =>
			apiClient.get<{
				items: { id: number; title: string; template: string; preview: string; created: string }[];
				total: number;
				page: number;
				pages: number;
			}>(`/api/spa/history?page=${page}`),
	});
}

export function useAccount() {
	return useQuery({
		queryKey: ["account"],
		queryFn: () =>
			apiClient.get<{
				user: { id: number; name: string; email: string; role: number; created_at: string | null };
			}>("/api/spa/account"),
	});
}
