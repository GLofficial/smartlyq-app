import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useSaveSocialOAuthProvider, type SocialOAuthProvider } from "@/api/admin-social-oauth";
import type { ProviderMeta } from "./provider-config";

interface Props {
	config: ProviderMeta;
	data: SocialOAuthProvider;
	apiVersion: string;
}

export function ProviderCard({ config, data, apiVersion }: Props) {
	const saveMutation = useSaveSocialOAuthProvider();
	const [copied, setCopied] = useState(false);

	// Local form state
	const [appId, setAppId] = useState(data.app_id);
	const [appSecret, setAppSecret] = useState(data.app_secret);
	const [scopes, setScopes] = useState(data.scopes);
	const [configId, setConfigId] = useState(data.config_id);
	const [isActive, setIsActive] = useState(data.is_active === 1);
	const [apiVer, setApiVer] = useState(apiVersion);
	const [apiEnv, setApiEnv] = useState(data.api_environment || "production");

	// Sync when data changes from server
	useEffect(() => {
		setAppId(data.app_id);
		setAppSecret(data.app_secret);
		setScopes(data.scopes);
		setConfigId(data.config_id);
		setIsActive(data.is_active === 1);
		setApiEnv(data.api_environment || "production");
	}, [data]);

	useEffect(() => {
		setApiVer(apiVersion);
	}, [apiVersion]);

	const handleCopy = () => {
		navigator.clipboard.writeText(data.redirect_uri);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleSave = () => {
		const payload: Record<string, unknown> = {
			provider: config.name,
			app_id: appId,
			app_secret: appSecret,
			is_active: isActive ? 1 : 0,
		};

		// Only include scopes if this provider has a scopes field
		const hasScopes = config.fields.some((f) => f.key === "scopes");
		if (hasScopes) payload.scopes = scopes;

		// Only include config_id for facebook/instagram
		const hasConfigId = config.fields.some((f) => f.key === "config_id");
		if (hasConfigId) payload.config_id = configId;

		// API environment for pinterest
		if (config.hasEnvironment) payload.api_environment = apiEnv;

		// API version
		if (config.apiVersionKey && apiVer) {
			payload.api_version_key = config.apiVersionKey;
			payload.api_version_value = apiVer;
		}

		saveMutation.mutate(payload, {
			onSuccess: (d) => toast.success(d.message),
			onError: () => toast.error("Failed to save."),
		});
	};

	return (
		<Card>
			<CardContent className="p-5 space-y-4">
				<h3 className="text-base font-semibold text-[var(--foreground)]">
					{config.label}
				</h3>

				{/* Redirect URI */}
				<div className="flex items-center gap-2">
					<span className="text-sm text-[var(--muted-foreground)]">
						Redirect URI:
					</span>
					<code className="text-sm bg-[var(--muted)] px-2 py-0.5 rounded">
						{data.redirect_uri}
					</code>
					<button
						type="button"
						onClick={handleCopy}
						className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
						title="Copy redirect URI"
					>
						{copied ? <Check size={14} /> : <Copy size={14} />}
					</button>
				</div>

				{/* Provider-level hint */}
				{config.hint && (
					<p className="text-xs text-[var(--muted-foreground)]">
						{config.hint}
					</p>
				)}

				{/* Dynamic fields */}
				{config.fields.map((field) => (
					<div key={field.key} className="space-y-1.5">
						<label className="text-sm font-medium text-[var(--foreground)]">
							{field.label}
						</label>
						{field.key === "app_id" && (
							<Input
								value={appId}
								onChange={(e) => setAppId(e.target.value)}
							/>
						)}
						{field.key === "app_secret" && (
							<Input
								value={appSecret}
								onChange={(e) => setAppSecret(e.target.value)}
							/>
						)}
						{field.key === "scopes" && (
							<Input
								value={scopes}
								onChange={(e) => setScopes(e.target.value)}
							/>
						)}
						{field.key === "config_id" && (
							<Input
								value={configId}
								onChange={(e) => setConfigId(e.target.value)}
							/>
						)}
						{field.hint && (
							<p className="text-xs text-[var(--muted-foreground)]">
								{field.hint}
							</p>
						)}
					</div>
				))}

				{/* API Version */}
				{config.apiVersionKey && (
					<div className="space-y-1.5">
						<label className="text-sm font-medium text-[var(--foreground)]">
							API version
						</label>
						<Input
							value={apiVer}
							onChange={(e) => setApiVer(e.target.value)}
							placeholder={config.apiVersionPlaceholder}
							className="max-w-[180px]"
						/>
						{config.apiVersionHint && (
							<p className="text-xs text-[var(--muted-foreground)]">
								{config.apiVersionHint}
							</p>
						)}
					</div>
				)}

				{/* API Environment (Pinterest) */}
				{config.hasEnvironment && (
					<div className="space-y-1.5">
						<label className="text-sm font-medium text-[var(--foreground)]">
							API Environment
						</label>
						<div className="flex items-center gap-4">
							<label className="flex items-center gap-1.5 text-sm">
								<input
									type="radio"
									name={`env-${config.name}`}
									value="production"
									checked={apiEnv === "production"}
									onChange={() => setApiEnv("production")}
									className="accent-[var(--sq-primary)]"
								/>
								Production
							</label>
							<label className="flex items-center gap-1.5 text-sm">
								<input
									type="radio"
									name={`env-${config.name}`}
									value="sandbox"
									checked={apiEnv === "sandbox"}
									onChange={() => setApiEnv("sandbox")}
									className="accent-[var(--sq-primary)]"
								/>
								Sandbox
							</label>
						</div>
						<p className="text-xs text-[var(--muted-foreground)]">
							<strong>Production:</strong> api.pinterest.com — requires
							Standard access approval.
							<br />
							<strong>Sandbox:</strong> api-sandbox.pinterest.com — for
							testing. Pins won't appear publicly.
						</p>
					</div>
				)}

				{/* Enable */}
				<div className="flex items-center gap-2">
					<Checkbox
						id={`enable-${config.name}`}
						checked={isActive}
						onCheckedChange={(v) => setIsActive(v === true)}
					/>
					<label
						htmlFor={`enable-${config.name}`}
						className="text-sm font-medium text-[var(--foreground)] cursor-pointer"
					>
						Enable
					</label>
				</div>

				{/* Save */}
				<Button
					onClick={handleSave}
					disabled={saveMutation.isPending}
					size="sm"
				>
					<Save size={14} />
					{saveMutation.isPending ? "Saving..." : "Update details"}
				</Button>
			</CardContent>
		</Card>
	);
}
