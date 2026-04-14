import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

/* eslint-disable @typescript-eslint/no-explicit-any */

function useFeed<T = any>(feed: string, refetchInterval = 30000) {
	return useQuery({
		queryKey: ["admin", "monitoring", feed],
		queryFn: () => apiClient.get<T>(`/api/spa/admin/monitoring?feed=${feed}`),
		refetchInterval,
	});
}

// All feeds return dynamic shapes from MonitoringService — use `any` and
// validate in the component with null checks rather than guessing types.

export function useServerHealth() { return useFeed("health", 15000); }
export function useServices() { return useFeed("services", 15000); }
export function useDbMetrics() { return useFeed("db"); }
export function useEndpoints() { return useFeed("endpoints", 60000); }
export function useSSL() { return useFeed("ssl", 120000); }
export function useRedis() { return useFeed("redis"); }
export function useFpm() { return useFeed("fpm"); }
export function useNginx() { return useFeed("nginx"); }
export function useSocialApi() { return useFeed("social_api", 60000); }
export function useR2() { return useFeed("r2", 120000); }
export function useCron() { return useFeed("cron"); }
export function useAiQueue() { return useFeed("ai_queue"); }

export function useErrorLogs(page = 1, search = "", severity = "") {
	return useQuery({
		queryKey: ["admin", "monitoring", "errors", page, search, severity],
		queryFn: () => apiClient.get<any>(
			`/api/spa/admin/monitoring?feed=errors&page=${page}&search=${encodeURIComponent(search)}&severity=${encodeURIComponent(severity)}`
		),
	});
}

export function useAuthAudit() { return useFeed("auth"); }
export function useBgTasks() { return useFeed("bg_tasks"); }

export function useAdminBillingDebug(userId: number) {
	return useQuery({
		queryKey: ["admin", "billing-debug", userId],
		enabled: userId > 0,
		queryFn: () => apiClient.get<any>(`/api/spa/admin/billing-debug?user_id=${userId}`),
	});
}
