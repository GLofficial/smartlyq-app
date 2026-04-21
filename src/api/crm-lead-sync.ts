import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface FbLeadPage {
	page_id: string;
	page_name: string;
	profile_picture: string;
	has_lead_retrieval: boolean;
}

export interface FbLeadFormQuestion {
	key?: string;
	label?: string;
	type?: string;
}

export interface FbLeadForm {
	form_id: string;
	form_name: string;
	status: string;
	created_time: string;
	questions: FbLeadFormQuestion[];
	enabled: boolean;
	form_pk: number | null;
	last_synced_at: string | null;
}

export interface FbLeadMappingRow {
	fb_field_name: string;
	crm_field: string;
}

export interface FbLeadMappingPayload {
	form: { form_pk: number; form_id: string; form_name: string };
	questions: FbLeadFormQuestion[];
	mappings: FbLeadMappingRow[];
	auto_mapping: FbLeadMappingRow[];
}

export interface FbLeadEvent {
	id: number;
	leadgen_id: string;
	form_id: string;
	form_name: string;
	contact_id: number | null;
	contact_name: string;
	contact_email: string;
	status: "pending" | "ingested" | "error" | "duplicate";
	error_message: string;
	created_at: string;
}

const inv = () => queryClient.invalidateQueries({ queryKey: ["crm-lead-sync"] });

export function useFbLeadPages() {
	return useQuery({
		queryKey: ["crm-lead-sync", "pages"],
		queryFn: () => apiClient.get<{ pages: FbLeadPage[] }>("/api/spa/crm/lead-sync/pages"),
	});
}

export function useFbLeadForms(pageId: string, enabled = true) {
	return useQuery({
		queryKey: ["crm-lead-sync", "forms", pageId],
		queryFn: () => apiClient.get<{ forms: FbLeadForm[] }>(`/api/spa/crm/lead-sync/forms?page_id=${encodeURIComponent(pageId)}`),
		enabled: enabled && !!pageId,
	});
}

export function useFbLeadEnable() {
	return useMutation({
		mutationFn: (body: { page_id: string; page_name: string; form_id: string; form_name: string }) =>
			apiClient.post<{ ok: number; form_pk: number }>("/api/spa/crm/lead-sync/enable", body),
		onSuccess: inv,
	});
}

export function useFbLeadDisable() {
	return useMutation({
		mutationFn: (body: { form_id: string }) =>
			apiClient.post<{ ok: number }>("/api/spa/crm/lead-sync/disable", body),
		onSuccess: inv,
	});
}

export function useFbLeadMapping(formPk: number) {
	return useQuery({
		queryKey: ["crm-lead-sync", "mapping", formPk],
		queryFn: () => apiClient.get<FbLeadMappingPayload>(`/api/spa/crm/lead-sync/mapping?form_pk=${formPk}`),
		enabled: formPk > 0,
	});
}

export function useFbLeadMappingSave() {
	return useMutation({
		mutationFn: (body: { form_pk: number; mappings: FbLeadMappingRow[] }) =>
			apiClient.post<{ ok: number }>("/api/spa/crm/lead-sync/mapping/save", body),
		onSuccess: inv,
	});
}

export function useFbLeadRun() {
	return useMutation({
		mutationFn: () => apiClient.post<{ ok: number; stats: { forms: number; leads_seen: number; new: number; errors: number } }>("/api/spa/crm/lead-sync/run", {}),
		onSuccess: inv,
	});
}

export function useFbLeadEvents(limit = 50) {
	return useQuery({
		queryKey: ["crm-lead-sync", "events", limit],
		queryFn: () => apiClient.get<{ events: FbLeadEvent[] }>(`/api/spa/crm/lead-sync/events?limit=${limit}`),
		refetchInterval: 30_000,
	});
}
