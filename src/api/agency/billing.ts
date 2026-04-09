import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface AgencyInvoice {
	id: number;
	tenant_name: string;
	amount: number;
	currency: string;
	status: string;
	period: string;
	created_at: string;
}

export interface AgencyBilling {
	total_revenue: number;
	active_subscriptions: number;
	total_tenants: number;
	currency: string;
	invoices: AgencyInvoice[];
}

export function useAgencyBilling() {
	return useQuery({
		queryKey: ["agency", "billing"],
		queryFn: () => apiClient.get<AgencyBilling>("/api/spa/agency/billing"),
	});
}
