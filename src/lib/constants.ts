/** API route prefixes */
export const API = {
	SPA: "/api/spa",
	REACT: "/api/react",
	V1: "/api/v1",
} as const;

/** SPA API endpoints */
export const ENDPOINTS = {
	BOOTSTRAP: `${API.SPA}/bootstrap`,
	LOGIN: `${API.SPA}/login`,
	SIGNUP: `${API.SPA}/signup`,
	RESET: `${API.SPA}/reset`,
	TOKEN_REFRESH: `${API.SPA}/token/refresh`,
	CSRF: `${API.SPA}/csrf`,
	BRIDGE_SESSION: `${API.SPA}/bridge-session`,
	WORKSPACES: `${API.SPA}/workspaces`,
	WORKSPACE_SWITCH: `${API.SPA}/workspace/switch`,
	DASHBOARD: `${API.SPA}/dashboard`,
} as const;

/** Client-side route paths (auth routes are absolute, workspace routes are relative segments) */
export const ROUTES = {
	LOGIN: "/login",
	SIGNUP: "/signup",
	RESET: "/reset",
} as const;

/** Workspace-relative path segments (use with useWorkspacePath hook) */
export const WS_PATHS = {
	DASHBOARD: "dashboard",
	SOCIAL: "social-media",
	CAPTAIN: "captain",
	CHATBOT: "chatbot",
	INTEGRATIONS: "integrations",
	AD_MANAGER: "ad-manager",
	BILLING: "billing",
	WORKSPACE: "workspace",
	ACCOUNT: "account",
	AGENCY: "agency",
	WHITELABEL: "whitelabel",
	MEDIA: "media",
	VIDEO_EDITOR: "video-editor",
	PRESENTATIONS: "presentations",
	TEMPLATES: "templates",
	HISTORY: "history",
	DOCUMENTS: "documents",
} as const;

/** Local storage keys */
export const STORAGE_KEYS = {
	ACCESS_TOKEN: "sq_access_token",
	SIDEBAR_COLLAPSED: "sq_sidebar_collapsed",
	THEME: "sq_theme",
} as const;
