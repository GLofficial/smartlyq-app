import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ReportOverview {
	period: string;
	total: number;
	published: number;
	failed: number;
	by_platform: Record<string, number>;
}

export interface ScheduledReport {
	id: number;
	title: string;
	frequency: string;
	is_active: boolean;
	last_sent_at: string | null;
	next_send_at: string | null;
}

export function useReportOverview(period = "30d") {
	return useQuery({
		queryKey: ["reports", period],
		queryFn: () => apiClient.get<ReportOverview>(`/api/spa/reports?period=${period}`),
	});
}

export function useScheduledReports() {
	return useQuery({
		queryKey: ["reports", "scheduled"],
		queryFn: () => apiClient.get<{ reports: ScheduledReport[] }>("/api/spa/reports/scheduled"),
	});
}
