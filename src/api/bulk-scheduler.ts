import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface BulkAccount {
	id: number;
	platform: string;
	name: string;
	username: string;
	avatar: string;
}

export function useBulkAccounts() {
	return useQuery({
		queryKey: ["bulk-scheduler", "accounts"],
		queryFn: () => apiClient.get<{ accounts: BulkAccount[] }>("/api/spa/bulk-scheduler/accounts"),
	});
}

export function useBulkImport() {
	return useMutation({
		mutationFn: (file: File) => {
			const formData = new FormData();
			formData.append("csv", file);
			return apiClient.upload<{ headers: string[]; rows: string[][]; total_rows: number }>("/api/spa/bulk-scheduler/import", formData);
		},
	});
}

export function useBulkCreate() {
	return useMutation({
		mutationFn: (data: { rows: string[][]; account_ids: number[]; timezone: string }) =>
			apiClient.post<{ message: string; created: number; errors: string[] }>("/api/spa/bulk-scheduler/create", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bulk-scheduler"] }),
	});
}

export function useBulkScheduled() {
	return useQuery({
		queryKey: ["bulk-scheduler", "scheduled"],
		queryFn: () => apiClient.get<{ posts: { id: number; content: string; status: string; scheduled_time: string; platforms: string[] }[] }>("/api/spa/bulk-scheduler/scheduled"),
	});
}
