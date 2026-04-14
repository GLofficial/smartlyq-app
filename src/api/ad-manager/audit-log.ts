import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAdContext } from "@/pages/ad-manager/ad-context";

export interface AuditEntry {
	id: number; timestamp: string; user_name: string; user_email: string;
	action: string; entity_type: string; entity_name: string; entity: string;
	details: string; environment: string;
}

export function useAdAuditLog(page = 1) {
	const { queryString } = useAdContext();
	return useQuery({
		queryKey: ["ad-manager", "audit-log", page, queryString],
		queryFn: () => apiClient.get<{ entries: AuditEntry[]; total: number; page: number; pages: number }>(
			`/api/spa/ad-manager/audit-log?page=${page}${queryString}`
		),
	});
}
