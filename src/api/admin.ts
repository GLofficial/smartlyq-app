import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface AdminDashboard {
	total_users: number;
	active_users: number;
	total_subs: number;
	total_tenants: number;
	total_chatbots: number;
	total_posts: number;
	chart: {
		words: { x: string; y: number }[];
		images: { x: string; y: number }[];
		videos: { x: string; y: number }[];
	};
	recent_users: { id: number; name: string; email: string; role: number; status: number; plan_name: string; created_at: string }[];
	recent_subscriptions: { id: number; user_name: string; user_email: string; plan_name: string; amount: number; method: string; status: number; created_at: string; expires_at: string | null }[];
}

export function useAdminDashboard() {
	return useQuery({ queryKey: ["admin", "dashboard"], queryFn: () => apiClient.get<AdminDashboard>("/api/spa/admin/dashboard") });
}

export interface AdminUsersResponse {
	users: { id: number; name: string; email: string; role: number; status: number; plan_id: number; plan_name: string; credits: number | null; created_at: string }[];
	total: number; page: number; pages: number;
	free_users: number; paid_users: number; active_users: number; new_users: number;
}

export function useAdminUsers(page = 1, search = "", planId = "", status = "") {
	const p = new URLSearchParams({ page: String(page) });
	if (search) p.set("search", search);
	if (planId) p.set("plan_id", planId);
	if (status !== "") p.set("status", status);
	return useQuery({
		queryKey: ["admin", "users", page, search, planId, status],
		queryFn: () => apiClient.get<AdminUsersResponse>(`/api/spa/admin/users?${p.toString()}`),
	});
}

export function adminUsersExportUrl() {
	return "/api/spa/admin/users/export";
}

export function useAdminUserCreate() {
	return (body: { name: string; email: string; plan_id: number }) =>
		apiClient.post<{ message: string; user_id: number; password: string }>("/api/spa/admin/users/create", body);
}

export function useAdminPlans() {
	return useQuery({
		queryKey: ["admin", "plans"],
		queryFn: () => apiClient.get<{
			plans: { id: number; name: string; price: number; duration: string; status: number; credits: number }[];
		}>("/api/spa/admin/plans"),
	});
}

export function useAdminSubscriptions(page = 1) {
	return useQuery({
		queryKey: ["admin", "subscriptions", page],
		queryFn: () => apiClient.get<{
			subscriptions: { id: number; user_name: string; user_email: string; plan_name: string; status: number; created_at: string; expires_at: string | null }[];
			total: number; page: number; pages: number;
		}>(`/api/spa/admin/subscriptions?page=${page}`),
	});
}

export function useAdminTransactions(page = 1) {
	return useQuery({
		queryKey: ["admin", "transactions", page],
		queryFn: () => apiClient.get<{
			transactions: { id: number; user_name: string; user_email: string; amount: number; currency: string; status: string; description: string; created_at: string }[];
			total: number; page: number; pages: number;
		}>(`/api/spa/admin/transactions?page=${page}`),
	});
}

export function useAdminWhitelabel() {
	return useQuery({
		queryKey: ["admin", "whitelabel"],
		queryFn: () => apiClient.get<{
			tenants: { id: number; subdomain: string; custom_domain: string; site_name: string; status: string; license_active: boolean; ssl_status: string; domain_verified: boolean; owner_user_id: number; created_at: string }[];
		}>("/api/spa/admin/whitelabel"),
	});
}
