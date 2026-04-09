import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useAdminMonitoring() {
	return useQuery({
		queryKey: ["admin", "monitoring"],
		queryFn: () => apiClient.get<{
			db_size_mb: number; total_users: number; active_users_24h: number;
			pending_jobs: number; failed_jobs_24h: number;
			php_version: string; server_time: string;
		}>("/api/spa/admin/monitoring"),
	});
}

export function useAdminBillingDebug(userId: number) {
	return useQuery({
		queryKey: ["admin", "billing-debug", userId],
		enabled: userId > 0,
		queryFn: () => apiClient.get<{
			user: { id: number; name: string; email: string; plan_id: number; credits: number } | null;
			subscriptions: { id: number; plan_id: number; status: number; created_at: string; expires_at: string | null }[];
			transactions: { id: number; amount: number; currency: string; status: string; description: string; created_at: string }[];
			wallet: { id: number; balance: number; monthly_balance: number; monthly_reset_at: string } | null;
		}>(`/api/spa/admin/billing-debug?user_id=${userId}`),
	});
}
