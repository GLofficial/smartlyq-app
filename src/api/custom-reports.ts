import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

const invReports = () => queryClient.invalidateQueries({ queryKey: ["reports"] });

export function useCustomReports() {
	return useQuery({ queryKey: ["reports", "custom"], queryFn: () => apiClient.get<{ reports: { id: number; title: string; description: string; updated_at: string | null }[] }>("/api/spa/reports/custom") });
}

export function useCustomReportGet(id: number) {
	return useQuery({ queryKey: ["reports", "custom", id], queryFn: () => apiClient.get<{ report: Record<string, unknown> }>(`/api/spa/reports/custom/get?id=${id}`), enabled: id > 0 });
}

export function useCustomReportSave() {
	return useMutation({ mutationFn: (data: { id?: number; title: string; description?: string; widgets?: unknown[]; filters?: Record<string, unknown> }) => apiClient.post<{ message: string; id: number }>("/api/spa/reports/custom/save", data), onSuccess: invReports });
}

export function useCustomReportDelete() {
	return useMutation({ mutationFn: (id: number) => apiClient.post<{ message: string }>("/api/spa/reports/custom/delete", { id }), onSuccess: invReports });
}

export function useScheduledReports() {
	return useQuery({ queryKey: ["reports", "scheduled"], queryFn: () => apiClient.get<{ schedules: { id: number; report_id: number; recipients: string; frequency: string; send_time: string; is_active: boolean }[] }>("/api/spa/reports/scheduled") });
}

export function useScheduledReportSave() {
	return useMutation({ mutationFn: (data: { id?: number; report_id: number; email_recipients: string; frequency: string; send_time: string; is_active: number }) => apiClient.post<{ message: string; id?: number }>("/api/spa/reports/scheduled/save", data), onSuccess: invReports });
}

export function useScheduledReportDelete() {
	return useMutation({ mutationFn: (id: number) => apiClient.post<{ message: string }>("/api/spa/reports/scheduled/delete", { id }), onSuccess: invReports });
}
