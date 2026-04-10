/** User returned from /api/spa/bootstrap */
export interface User {
	id: number;
	name: string;
	email: string;
	role: number;
	avatar_url: string | null;
}

/** Plan / feature flags */
export interface Plan {
	id: number;
	name: string;
	price: number;
	features: PlanFeatures;
}

export interface PlanFeatures {
	chatbot_access: boolean;
	chatbot_ghl_access: boolean;
	chatbot_woocommerce_access: boolean;
	chatbot_shopify_access: boolean;
	chatbot_remove_watermark: boolean;
	chatbot_number_allowed: number | null;
	social_media_access: boolean;
	ai_captain_access: boolean;
	ad_manager_access: boolean;
	video_editor_access: boolean;
	presentations_access: boolean;
	whitelabel_access: boolean;
	crm_access: boolean;
	[key: string]: boolean | number | null | string;
}

/** Workspace */
export interface Workspace {
	id: number;
	name: string;
	slug: string;
	is_active: boolean;
}

/** White-label tenant branding */
export interface TenantBranding {
	site_name: string;
	primary_color: string;
	secondary_color: string;
	accent_color: string;
	bg_color: string;
	surface_color: string;
	text_color: string;
	muted_color: string;
	link_color: string;
	logo_url: string | null;
	logo_dark_url: string | null;
	logo_light_url: string | null;
	favicon_url: string | null;
	remove_watermark: boolean;
}

/** Bootstrap response from /api/spa/bootstrap */
export interface BootstrapResponse {
	tenant: TenantBranding | null;
	user: User | null;
	plan: Plan | null;
	credits: number;
	workspaces: Workspace[];
	active_workspace_id: number | null;
	is_whitelabel: boolean;
	csrf_token: string;
}

/** Standard API error response */
export interface ApiError {
	message: string;
	type?: "error" | "warning" | "info";
	errors?: Record<string, string[]>;
}

/** Standard API success with redirect (from wantsJson) */
export interface ApiRedirectResponse {
	redirect: string;
	message: string | null;
	type: string;
}

/** Login request / response */
export interface LoginRequest {
	email: string;
	password: string;
}

export interface AuthResponse {
	access_token: string;
	user: User;
	plan: Plan;
	workspaces: Workspace[];
	active_workspace_id: number;
}

/** Navigation item for sidebar */
export interface NavItem {
	label: string;
	path: string;
	icon: string;
	feature_gate?: string;
	children?: NavItem[];
}
