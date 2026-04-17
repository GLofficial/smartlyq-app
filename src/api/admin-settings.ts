import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export function useAdminSettings(tab: string) {
	return useQuery({
		queryKey: ["admin", "settings", tab],
		queryFn: () =>
			apiClient.get<{ settings: Record<string, string>; tab: string }>(
				`/api/spa/admin/settings?tab=${tab}`,
			),
	});
}

export function useAdminModels() {
	return useQuery({
		queryKey: ["admin", "models"],
		queryFn: () =>
			apiClient.get<{ models: { model: string; name: string; type: string; provider: string }[] }>("/api/spa/admin/models"),
		staleTime: 5 * 60 * 1000,
	});
}

export function useSendTestMail() {
	return useMutation({
		mutationFn: (to: string) =>
			apiClient.post<{ message: string }>("/api/spa/admin/settings/test-mail", { to }),
	});
}

export function useSaveAdminSettings() {
	return useMutation({
		mutationFn: (data: { tab: string; values: Record<string, string> }) =>
			apiClient.post<{ message: string }>("/api/spa/admin/settings/save", data),
		onSuccess: (_d, vars) =>
			queryClient.invalidateQueries({ queryKey: ["admin", "settings", vars.tab] }),
	});
}
