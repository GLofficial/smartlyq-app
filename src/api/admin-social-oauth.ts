import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface SocialOAuthProvider {
	name: string;
	app_id: string;
	app_secret: string;
	scopes: string;
	config_id: string;
	redirect_uri: string;
	is_active: number;
	api_environment: string;
}

export interface SocialOAuthProvidersResponse {
	providers: Record<string, SocialOAuthProvider>;
	api_versions: Record<string, string>;
}

export function useAdminSocialOAuthProviders() {
	return useQuery({
		queryKey: ["admin", "social-oauth"],
		queryFn: () =>
			apiClient.get<SocialOAuthProvidersResponse>(
				"/api/spa/admin/social-oauth/providers",
			),
	});
}

export function useSaveSocialOAuthProvider() {
	return useMutation({
		mutationFn: (data: Record<string, unknown>) =>
			apiClient.post<{ message: string }>(
				"/api/spa/admin/social-oauth/save",
				data,
			),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["admin", "social-oauth"] }),
	});
}
