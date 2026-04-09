import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface AuditEntry {
	id: number;
	timestamp: string;
	user_name: string;
	action: string;
	entity: string;
	details: string;
}

export function useAdAuditLog(page = 1) {
	return useQuery({
		queryKey: ["ad-manager", "audit-log", page],
		queryFn: () =>
			apiClient.get<{ entries: AuditEntry[]; total: number; page: number; pages: number }>(
				`/api/spa/ad-manager/audit-log?page=${page}`
			),
	});
}
