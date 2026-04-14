import { useAdminSocialOAuthProviders } from "@/api/admin-social-oauth";
import { ProviderCard } from "./provider-card";
import PROVIDERS from "./provider-config";

export function SocialOAuthTab() {
	const { data, isLoading } = useAdminSocialOAuthProviders();

	if (isLoading) {
		return (
			<div className="flex h-32 items-center justify-center">
				<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
			</div>
		);
	}

	const providers = data?.providers ?? {};
	const apiVersions = data?.api_versions ?? {};

	const emptyProvider = {
		name: "",
		app_id: "",
		app_secret: "",
		scopes: "",
		config_id: "",
		redirect_uri: "",
		is_active: 0,
		api_environment: "production",
	};

	return (
		<div className="space-y-4">
			{PROVIDERS.map((cfg) => (
				<ProviderCard
					key={cfg.name}
					config={cfg}
					data={providers[cfg.name] ?? { ...emptyProvider, name: cfg.name }}
					apiVersion={cfg.apiVersionKey ? (apiVersions[cfg.apiVersionKey] ?? "") : ""}
				/>
			))}
		</div>
	);
}
