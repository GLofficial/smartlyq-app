import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export function useUploadAvatar() {
	return useMutation({
		mutationFn: (file: File) => {
			const fd = new FormData();
			fd.append("avatar", file);
			return apiClient.upload<{ avatar_url: string }>("/api/spa/account/avatar", fd);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bootstrap"] });
			queryClient.invalidateQueries({ queryKey: ["account"] });
		},
	});
}

export function useDeleteAvatar() {
	return useMutation({
		mutationFn: () => apiClient.post<{ message: string }>("/api/spa/account/avatar/delete"),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bootstrap"] });
			queryClient.invalidateQueries({ queryKey: ["account"] });
		},
	});
}

export function useDeleteAccount() {
	return useMutation({
		mutationFn: (password: string) =>
			apiClient.post<{ message: string }>("/api/spa/account/delete", { password }),
	});
}

export function useUpdateAccount() {
	return useMutation({
		mutationFn: (data: { name: string }) =>
			apiClient.post<{ message: string }>("/api/spa/account/update", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bootstrap"] }),
	});
}

export function useChangePassword() {
	return useMutation({
		mutationFn: (data: { current_password: string; new_password: string }) =>
			apiClient.post<{ message: string }>("/api/spa/account/password", data),
	});
}

export interface ApiKey {
	id: number; name: string; prefix: string; scopes: string;
	status: string; rate_limit: number; is_test: boolean;
	created_at: string; last_used_at: string | null;
}

export function useApiKeys() {
	return useQuery({
		queryKey: ["account", "api-keys"],
		queryFn: () => apiClient.get<{ keys: ApiKey[] }>("/api/spa/account/api-keys"),
	});
}

export function useApiKeyCreate() {
	return useMutation({
		mutationFn: (data: { name: string; scopes?: string }) =>
			apiClient.post<{ message: string; key: string; prefix: string }>("/api/spa/account/api-keys/create", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["account", "api-keys"] }),
	});
}

export function useApiKeyRevoke() {
	return useMutation({
		mutationFn: (keyId: number) =>
			apiClient.post<{ message: string }>("/api/spa/account/api-keys/revoke", { key_id: keyId }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["account", "api-keys"] }),
	});
}

export function useAutomationWebhooks() {
	return useQuery({
		queryKey: ["account", "automation-webhooks"],
		queryFn: () => apiClient.get<{ zapier_webhook: string | null; has_zapier: boolean; pabbly_webhook: string | null; has_pabbly: boolean }>("/api/spa/account/automation-webhooks"),
	});
}

export function useSaveAutomationWebhook() {
	return useMutation({
		mutationFn: (data: { zapier_webhook?: string; pabbly_webhook?: string }) =>
			apiClient.post<{ message: string }>("/api/spa/account/automation-webhooks/save", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["account", "automation-webhooks"] }),
	});
}
