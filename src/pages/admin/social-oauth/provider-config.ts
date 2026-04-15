/** Static config for all 14 social OAuth providers — drives the ProviderCard UI. */

export interface ProviderFieldMeta {
	key: "app_id" | "app_secret" | "scopes" | "config_id";
	label: string;
	sensitive?: boolean;
	hint?: string;
}

export interface ProviderMeta {
	name: string;
	label: string;
	idLabel: string;
	secretLabel: string;
	fields: ProviderFieldMeta[];
	apiVersionKey?: string;
	apiVersionPlaceholder?: string;
	apiVersionHint?: string;
	hint?: string;
	hasEnvironment?: boolean;
}

const PROVIDERS: ProviderMeta[] = [
	{
		name: "facebook",
		label: "Facebook",
		idLabel: "App ID",
		secretLabel: "App Secret",
		fields: [
			{ key: "app_id", label: "App ID" },
			{ key: "app_secret", label: "App Secret", sensitive: true },
			{ key: "config_id", label: "Configuration ID (optional)", hint: "Meta Login Configuration config_id (if configured, SmartlyQ will omit the explicit scope parameter)." },
			{ key: "scopes", label: "Scopes (space separated)" },
		],
		apiVersionKey: "facebook_graph_api_version",
		apiVersionPlaceholder: "v24.0",
		apiVersionHint: "Used for graph.facebook.com Facebook endpoints. Defaults to v24.0 if empty.",
	},
	{
		name: "instagram",
		label: "Instagram",
		idLabel: "App ID",
		secretLabel: "App Secret",
		fields: [
			{ key: "app_id", label: "App ID" },
			{ key: "app_secret", label: "App Secret", sensitive: true },
			{ key: "config_id", label: "Configuration ID (optional)", hint: "Meta Login Configuration config_id (if configured, SmartlyQ will omit the explicit scope parameter)." },
			{ key: "scopes", label: "Scopes (space separated)" },
		],
		apiVersionKey: "instagram_facebook_api_version",
		apiVersionPlaceholder: "v24.0",
		apiVersionHint: "For graph.facebook.com Instagram endpoints (Business accounts via Facebook Login). Defaults to v24.0 if empty.",
	},
	{
		name: "instagram_direct",
		label: "Instagram (Direct)",
		idLabel: "App ID",
		secretLabel: "App Secret",
		fields: [
			{ key: "app_id", label: "App ID", hint: "Instagram App ID from Meta App Dashboard (Instagram API with Instagram Login setup)." },
			{ key: "app_secret", label: "App Secret", sensitive: true, hint: "Instagram App Secret from Meta App Dashboard." },
			{ key: "scopes", label: "Scopes (comma separated)", hint: "Default: instagram_business_basic,instagram_business_content_publish" },
		],
		apiVersionKey: "instagram_graph_api_version",
		apiVersionPlaceholder: "v24.0",
		apiVersionHint: "For graph.instagram.com (Instagram Login). Defaults to v24.0 if empty.",
	},
	{
		name: "linkedin",
		label: "LinkedIn",
		idLabel: "Client ID",
		secretLabel: "Client Secret",
		fields: [
			{ key: "app_id", label: "Client ID" },
			{ key: "app_secret", label: "Client Secret", sensitive: true },
			{ key: "scopes", label: "Scopes (space separated)" },
		],
		apiVersionKey: "linkedin_api_version",
		apiVersionPlaceholder: "v2",
		apiVersionHint: "Check versioning docs. Defaults to v2 if empty.",
	},
	{
		name: "x",
		label: "X (Twitter)",
		idLabel: "Client ID",
		secretLabel: "Client Secret",
		fields: [
			{ key: "app_id", label: "Client ID" },
			{ key: "app_secret", label: "Client Secret", sensitive: true },
			{ key: "scopes", label: "Scopes (space separated)" },
		],
		apiVersionKey: "twitter_api_version",
		apiVersionPlaceholder: "2",
		apiVersionHint: "No v prefix. Defaults to 2 if empty.",
	},
	{
		name: "youtube",
		label: "YouTube",
		idLabel: "Client ID",
		secretLabel: "Client Secret",
		fields: [
			{ key: "app_id", label: "Client ID" },
			{ key: "app_secret", label: "Client Secret", sensitive: true },
			{ key: "scopes", label: "Scopes (space separated)" },
		],
		apiVersionKey: "youtube_api_version",
		apiVersionPlaceholder: "v3",
		apiVersionHint: "Defaults to v3 if empty.",
	},
	{
		name: "tiktok",
		label: "TikTok",
		idLabel: "Client Key",
		secretLabel: "Client Secret",
		fields: [
			{ key: "app_id", label: "Client Key" },
			{ key: "app_secret", label: "Client Secret", sensitive: true },
			{ key: "scopes", label: "Scopes (space separated)" },
		],
		apiVersionKey: "tiktok_api_version",
		apiVersionPlaceholder: "v2",
		apiVersionHint: "Defaults to v2 if empty.",
	},
	{
		name: "canva",
		label: "Canva",
		idLabel: "Client ID",
		secretLabel: "Client Secret",
		fields: [
			{ key: "app_id", label: "Client ID" },
			{ key: "app_secret", label: "Client Secret", sensitive: true },
		],
		hint: "Set up at canva.com/developers/integrations. Enable scopes: design:content (R+W), design:meta (R), asset (R+W), profile (R).",
	},
	{
		name: "gmb",
		label: "Google My Business",
		idLabel: "Client ID",
		secretLabel: "Client Secret",
		fields: [
			{ key: "app_id", label: "Client ID" },
			{ key: "app_secret", label: "Client Secret", sensitive: true },
		],
		hint: "Set up at Google Cloud Console. Enable the Business Profile API and add the redirect URI above to your OAuth client's Authorized redirect URIs.",
		apiVersionKey: "gmb_api_version",
		apiVersionPlaceholder: "v4",
		apiVersionHint: "Defaults to v4 if empty.",
	},
	{
		name: "pinterest",
		label: "Pinterest",
		idLabel: "App ID",
		secretLabel: "App Secret",
		fields: [
			{ key: "app_id", label: "App ID" },
			{ key: "app_secret", label: "App Secret", sensitive: true },
			{ key: "scopes", label: "Scopes (comma separated)", hint: "Default: boards:read,boards:write,pins:read,pins:write,user_accounts:read" },
		],
		hint: "Set up at developers.pinterest.com. Add the redirect URI above to your Pinterest app.",
		apiVersionKey: "pinterest_api_version",
		apiVersionPlaceholder: "v5",
		apiVersionHint: "Defaults to v5 if empty.",
		hasEnvironment: true,
	},
	{
		name: "reddit",
		label: "Reddit",
		idLabel: "Client ID",
		secretLabel: "Client Secret",
		fields: [
			{ key: "app_id", label: "Client ID" },
			{ key: "app_secret", label: "Client Secret", sensitive: true },
			{ key: "scopes", label: "Scopes (comma separated)", hint: "Default: identity,submit,read,mysubreddits" },
		],
		hint: "Create a \"web app\" at reddit.com/prefs/apps and add the redirect URI above.",
		apiVersionKey: "reddit_api_version",
		apiVersionPlaceholder: "v1",
		apiVersionHint: "Defaults to v1 if empty.",
	},
	{
		name: "tumblr",
		label: "Tumblr",
		idLabel: "Consumer Key (OAuth2 Client ID)",
		secretLabel: "Consumer Secret (OAuth2 Client Secret)",
		fields: [
			{ key: "app_id", label: "Consumer Key (OAuth2 Client ID)" },
			{ key: "app_secret", label: "Consumer Secret (OAuth2 Client Secret)", sensitive: true },
		],
		hint: "Set up at tumblr.com/oauth/apps. Add the URL above as both \"Default callback URL\" and \"OAuth2 redirect URLs\".",
		apiVersionKey: "tumblr_api_version",
		apiVersionPlaceholder: "v2",
		apiVersionHint: "Defaults to v2 if empty.",
	},
	{
		name: "bluesky",
		label: "Bluesky",
		idLabel: "Client ID (Metadata URL)",
		secretLabel: "Client Secret (optional for public clients)",
		fields: [
			{ key: "app_id", label: "Client ID (Metadata URL)" },
			{ key: "app_secret", label: "Client Secret (optional for public clients)", sensitive: true },
		],
		hint: "Bluesky uses AT Protocol OAuth 2.0. The Client ID is typically your app's metadata URL. Configure your client metadata document to include the redirect URI above.",
	},
	{
		name: "threads",
		label: "Threads",
		idLabel: "Threads App ID",
		secretLabel: "Threads App Secret",
		fields: [
			{ key: "app_id", label: "Threads App ID" },
			{ key: "app_secret", label: "Threads App Secret", sensitive: true },
			{ key: "scopes", label: "Scopes (comma separated)", hint: "Default: threads_basic,threads_content_publish,threads_manage_replies,threads_read_replies,threads_manage_insights,threads_manage_mentions,threads_delete" },
		],
		hint: "Uses the Threads App ID and Threads App Secret from your Meta App Dashboard > Use Cases > Threads API > Settings. These are different from your main Facebook/Instagram App credentials.",
		apiVersionKey: "threads_api_version",
		apiVersionPlaceholder: "v1.0",
		apiVersionHint: "Defaults to v1.0 if empty.",
	},
];

export default PROVIDERS;
