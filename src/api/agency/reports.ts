import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface AgencyReport {
	id: number;
	name: string;
	period: string;
	tenant_count: number;
	revenue: number;
	currency: string;
	generated_at: string;
}

export function useAgencyReports() {
	return useQuery({
		queryKey: ["agency", "reports"],
		queryFn: () => apiClient.get<{ reports: AgencyReport[] }>("/api/spa/agency/reports"),
	});
}
