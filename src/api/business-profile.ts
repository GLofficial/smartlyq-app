import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface BusinessProfile {
	id: number;
	location_id: string;
	friendly_business_name: string | null;
	legal_business_name: string | null;
	business_email: string | null;
	business_phone: string | null;
	branded_domain: string | null;
	business_website: string | null;
	business_niche: string | null;
	business_currency: string | null;
	business_logo_url: string | null;
	address_street: string | null;
	address_city: string | null;
	address_postal_code: string | null;
	address_region: string | null;
	address_country: string | null;
	time_zone: string | null;
	business_type: string | null;
	business_industry: string | null;
	business_registration_id_type: string | null;
	business_registration_type: string | null;
	business_registration_number: string | null;
	regions_json: string | null;
	rep_first_name: string | null;
	rep_last_name: string | null;
	rep_email: string | null;
	rep_job_position: string | null;
	rep_phone: string | null;
	updated_at: string | null;
}

export function useBusinessProfile() {
	return useQuery({
		queryKey: ["settings", "business-profile"],
		queryFn: () => apiClient.get<{ profile: BusinessProfile }>("/api/spa/settings/business-profile"),
	});
}

export function useSaveBusinessProfile() {
	return useMutation({
		mutationFn: (data: Record<string, unknown>) =>
			apiClient.post<{ message: string }>("/api/spa/settings/business-profile", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "business-profile"] }),
	});
}
