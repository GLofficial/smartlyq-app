import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAdContext } from "@/pages/ad-manager/ad-context";

export interface AuditEntry {
	id: number; timestamp: string; user_name: string; user_email: string;
	action: string; entity_type: string; entity_name: string; entity: string;
	details: string; environment: string;
}

export interface AuditFilters {
	page: number;
	action: string;
	entity_type: string;
	environment: string;
	search: string;
}

export function useAdAuditLog(filters: AuditFilters) {
	const { queryString } = useAdContext();
	let qs = `?page=${filters.page}${queryString}`;
	if (filters.action) qs += `&action=${encodeURIComponent(filters.action)}`;
	if (filters.entity_type) qs += `&entity_type=${encodeURIComponent(filters.entity_type)}`;
	if (filters.environment) qs += `&environment=${encodeURIComponent(filters.environment)}`;
	if (filters.search) qs += `&search=${encodeURIComponent(filters.search)}`;

	return useQuery({
		queryKey: ["ad-manager", "audit-log", filters],
		queryFn: () => apiClient.get<{ entries: AuditEntry[]; total: number; page: number; pages: number }>(
			`/api/spa/ad-manager/audit-log${qs}`
		),
	});
}
