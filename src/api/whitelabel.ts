import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

/* ── Types ── */

export interface WhitelabelSettings {
	branding: {
		site_name: string;
		logo_url: string;
		favicon_url: string;
		colors: {
			primary: string;
			secondary: string;
			accent: string;
			bg: string;
			surface: string;
			text: string;
			muted: string;
			link: string;
		};
		terms_url: string;
		privacy_url: string;
		cookie_url: string;
		support_email: string;
		support_url: string;
	};
	domain: {
		subdomain: string;
		custom_domain: string;
		domain_verified: boolean;
		ssl_active: boolean;
	};
	smtp: {
		enabled: boolean;
		host: string;
		username: string;
		password: string;
		port: number;
		encryption: string;
		from_email: string;
		from_name: string;
		reply_to: string;
	};
	modules: Record<string, boolean>;
	ai_keys: Record<string, string>;
}

export interface AgencyWorkspace {
	id: number;
	name: string;
	status: string;
	created_at: string;
}

export interface AgencyTeamMember {
	id: number;
	name: string;
	email: string;
	role: string;
	status: string;
}

export interface AgencyBillingData {
	wallet_balance: number;
	total_packages: number;
	active_subscriptions: number;
	currency: string;
	packages: {
		id: number;
		name: string;
		price: number;
		duration: string;
		status: string;
	}[];
	topups: {
		id: number;
		date: string;
		amount: number;
		credits: number;
		status: string;
	}[];
}

export interface AgencyReportsData {
	total_credits: number;
	daily_usage: {
		date: string;
		credits: number;
	}[];
}

/* ── Whitelabel Settings ── */

export function useWhitelabelSettings() {
	return useQuery({
		queryKey: ["whitelabel", "settings"],
		queryFn: () =>
			apiClient.get<WhitelabelSettings>("/api/spa/whitelabel/settings"),
	});
}

export function useSaveBranding() {
	return useMutation({
		mutationFn: (data: WhitelabelSettings["branding"]) =>
			apiClient.post<{ message: string }>("/api/spa/whitelabel/branding/save", data),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["whitelabel", "settings"] }),
	});
}

export function useSaveSmtp() {
	return useMutation({
		mutationFn: (data: WhitelabelSettings["smtp"]) =>
			apiClient.post<{ message: string }>("/api/spa/whitelabel/smtp/save", data),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["whitelabel", "settings"] }),
	});
}

export function useSaveModules() {
	return useMutation({
		mutationFn: (data: Record<string, boolean>) =>
			apiClient.post<{ message: string }>("/api/spa/whitelabel/modules/save", data),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["whitelabel", "settings"] }),
	});
}

export function useSaveAiKeys() {
	return useMutation({
		mutationFn: (data: Record<string, string>) =>
			apiClient.post<{ message: string }>("/api/spa/whitelabel/keys/save", data),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["whitelabel", "settings"] }),
	});
}

/* ── Agency Workspaces & Team ── */

export function useAgencyWorkspaces() {
	return useQuery({
		queryKey: ["agency", "workspaces"],
		queryFn: () =>
			apiClient.get<{ workspaces: AgencyWorkspace[] }>("/api/spa/agency/workspaces"),
	});
}

export function useAgencyTeam() {
	return useQuery({
		queryKey: ["agency", "team"],
		queryFn: () =>
			apiClient.get<{ members: AgencyTeamMember[] }>("/api/spa/agency/team"),
	});
}

export function useAddTeamMember() {
	return useMutation({
		mutationFn: (data: { email: string; role: string }) =>
			apiClient.post<{ message: string }>("/api/spa/agency/team/add", data),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["agency", "team"] }),
	});
}

export function useRemoveTeamMember() {
	return useMutation({
		mutationFn: (data: { member_id: number }) =>
			apiClient.post<{ message: string }>("/api/spa/agency/team/remove", data),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["agency", "team"] }),
	});
}

/* ── Agency Billing ── */

export function useAgencyBilling() {
	return useQuery({
		queryKey: ["agency", "billing"],
		queryFn: () =>
			apiClient.get<AgencyBillingData>("/api/spa/agency/billing"),
	});
}

/* ── Agency Reports ── */

export function useAgencyReports(from?: string, to?: string) {
	return useQuery({
		queryKey: ["agency", "reports", from, to],
		queryFn: () => {
			const params = new URLSearchParams();
			if (from) params.set("from", from);
			if (to) params.set("to", to);
			const qs = params.toString();
			return apiClient.get<AgencyReportsData>(
				`/api/spa/agency/reports${qs ? `?${qs}` : ""}`,
			);
		},
	});
}
