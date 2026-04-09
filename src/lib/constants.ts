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

/** Client-side route paths */
export const ROUTES = {
	LOGIN: "/login",
	SIGNUP: "/signup",
	RESET: "/reset",
	DASHBOARD: "/my",
	SOCIAL: "/my/social-media",
	CAPTAIN: "/my/captain",
	CHATBOT: "/my/chatbot",
	INTEGRATIONS: "/my/integrations",
	AD_MANAGER: "/my/ad-manager",
	BILLING: "/my/billing",
	WORKSPACE: "/my/workspace",
	ACCOUNT: "/my/account",
	AGENCY: "/my/agency",
	WHITELABEL: "/my/whitelabel",
	MEDIA: "/my/media",
	VIDEO_EDITOR: "/my/video-editor",
	PRESENTATIONS: "/my/presentations",
	TEMPLATES: "/my/templates",
	HISTORY: "/my/history",
	DOCUMENTS: "/my/documents",
} as const;

/** Local storage keys */
export const STORAGE_KEYS = {
	ACCESS_TOKEN: "sq_access_token",
	SIDEBAR_COLLAPSED: "sq_sidebar_collapsed",
	THEME: "sq_theme",
} as const;
