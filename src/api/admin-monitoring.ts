import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

function useFeed<T>(feed: string, refetchInterval = 30000) {
	return useQuery({
		queryKey: ["admin", "monitoring", feed],
		queryFn: () => apiClient.get<T>(`/api/spa/admin/monitoring?feed=${feed}`),
		refetchInterval,
	});
}

export function useServerHealth() {
	return useFeed<{
		uptime: string; load: number[]; cpu: { usage: number; cores: number };
		ram: { used_mb: number; total_mb: number; percent: number };
		disk: { used_gb: number; total_gb: number; percent: number };
		hostname: string; os: string; status: string;
	}>("health", 15000);
}

export function useServices() {
	return useFeed<{ name: string; status: string; detail?: string }[]>("services", 15000);
}

export function useDbMetrics() {
	return useFeed<{
		mariadb: Record<string, string | number>;
		slow: { query: string; time: number; rows: number }[];
		tables: { name: string; rows: number; data_mb: number }[];
		clickhouse: Record<string, string | number>;
	}>("db");
}

export function useEndpoints() {
	return useFeed<{ url: string; label: string; status: number; latency_ms: number; error?: string }[]>("endpoints", 60000);
}

export function useSSL() {
	return useFeed<{ domain: string; issuer: string; expires: string; days_left: number }[]>("ssl", 120000);
}

export function useRedis() {
	return useFeed<{
		reachable: boolean; memory: Record<string, string>; stats: Record<string, string>;
		clients: Record<string, string>; keyspace: Record<string, string>;
	}>("redis");
}

export function useFpm() {
	return useFeed<{
		available: boolean; pool?: string; process_manager?: string;
		active_processes?: number; idle_processes?: number; total_processes?: number;
		max_active_processes?: number; listen_queue?: number;
	}>("fpm");
}

export function useNginx() {
	return useFeed<{
		total: number; status: Record<string, number>; top_errors: { path: string; count: number }[];
	}>("nginx");
}

export function useSocialApi() {
	return useFeed<{ platform: string; label: string; status: string; source: string; description?: string }[]>("social_api", 60000);
}

export function useR2() {
	return useFeed<{
		status: string; bucket: string; total_size_gb: number;
		total_objects: number; folders: number;
		breakdown: { prefix: string; objects: number; size: string }[];
	}>("r2", 120000);
}

export function useCron() {
	return useFeed<{
		name: string; label: string; schedule: string; status: string;
		last_run: string; duration: string; exit_code: number;
	}[]>("cron");
}

export function useAiQueue() {
	return useFeed<{
		available: boolean;
		counts: Record<string, number>;
		timing: Record<string, string | number>;
		recent_failures: { id: number; type: string; error: string; at: string }[];
	}>("ai_queue");
}

export function useErrorLogs(page = 1, search = "", severity = "") {
	return useQuery({
		queryKey: ["admin", "monitoring", "errors", page, search, severity],
		queryFn: () => apiClient.get<{
			rows: { time: string; level: string; message: string; source: string }[];
			total: number; page: number; pages: number;
		}>(`/api/spa/admin/monitoring?feed=errors&page=${page}&search=${encodeURIComponent(search)}&severity=${encodeURIComponent(severity)}`),
	});
}

export function useAuthAudit() {
	return useFeed<{ time: string; event: string; user: string; ip: string }[]>("auth");
}

export function useBgTasks() {
	return useFeed<{
		pending: number; stale: number; recent: { id: number; status: string; created: string }[];
		stats: { total_today: number; completed: number; failed: number };
	}>("bg_tasks");
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
