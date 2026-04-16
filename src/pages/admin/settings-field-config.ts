export type FieldType = "text" | "textarea" | "password" | "select" | "toggle" | "heading";

export interface FieldDef {
	key: string;
	label: string;
	type: FieldType;
	options?: { value: string; label: string }[];
	placeholder?: string;
	half?: boolean;
	description?: string;
}

const LANGUAGE_OPTIONS = [
	{ value: "en", label: "English" },
	{ value: "es", label: "Spanish" },
	{ value: "fr", label: "French" },
	{ value: "de", label: "German" },
	{ value: "pt", label: "Portuguese" },
	{ value: "ar", label: "Arabic" },
	{ value: "el", label: "Greek" },
];

const THEME_OPTIONS = [
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
];

const DIRECTION_OPTIONS = [
	{ value: "ltr", label: "Left to Right" },
	{ value: "rtl", label: "Right to Left" },
];

const DATE_FORMAT_OPTIONS = [
	{ value: "d/m/Y", label: "DD/MM/YYYY" },
	{ value: "m/d/Y", label: "MM/DD/YYYY" },
	{ value: "Y-m-d", label: "YYYY-MM-DD" },
	{ value: "M d, Y", label: "Apr 09, 2026" },
	{ value: "d M, Y", label: "09 Apr, 2026" },
	{ value: "F d, Y", label: "April 09, 2026" },
];

const TIME_FORMAT_OPTIONS = [
	{ value: "g:i a", label: "6:52 pm" },
	{ value: "g:i A", label: "6:52 PM" },
	{ value: "H:i", label: "18:52" },
];

export const TAB_FIELDS: Record<string, FieldDef[]> = {
	general: [
		{ key: "site_name", label: "Website name", type: "text" },
		{ key: "site_title", label: "Website meta title", type: "text" },
		{ key: "site_description", label: "Website meta description", type: "textarea" },
		{ key: "site_url", label: "Website URL", type: "text" },
		{ key: "site_email", label: "Contact email", type: "text" },
		{ key: "language", label: "Default language", type: "select", options: LANGUAGE_OPTIONS, half: true },
		{ key: "theme_style", label: "Default theme", type: "select", options: THEME_OPTIONS, half: true },
		{ key: "direction", label: "Text direction", type: "select", options: DIRECTION_OPTIONS, half: true },
		{ key: "date_format", label: "Date format", type: "select", options: DATE_FORMAT_OPTIONS, half: true },
		{ key: "time_format", label: "Time format", type: "select", options: TIME_FORMAT_OPTIONS, half: true },
		{ key: "time_zone", label: "Time zone", type: "text", placeholder: "Europe/Athens" },
		{ key: "copyright", label: "Copyright information", type: "text" },
		{ key: "site_address", label: "Organization address", type: "textarea" },
		{ key: "footer_text", label: "Footer text", type: "textarea" },
		{ key: "phone_code", label: "Phone country code", type: "text", half: true },
	],
	finance: [
		{ key: "currency", label: "Currency code", type: "text", placeholder: "USD", half: true },
		{ key: "currency_symbol", label: "Currency symbol", type: "text", placeholder: "$", half: true },
		{ key: "currency_position", label: "Symbol position", type: "select", options: [
			{ value: "left", label: "Left ($100)" }, { value: "right", label: "Right (100$)" },
		], half: true },
		{ key: "tax", label: "Tax rate (%)", type: "text", placeholder: "0", half: true },
		{ key: "tax_label", label: "Tax label", type: "text", placeholder: "VAT" },
	],
	security: [
		{ key: "signup", label: "Allow registration", type: "select", options: [
			{ value: "1", label: "Enabled" }, { value: "0", label: "Disabled" },
		], half: true },
		{ key: "signup_verification", label: "Email verification on signup", type: "select", options: [
			{ value: "1", label: "Enabled" }, { value: "0", label: "Disabled" },
		], half: true },
		{ key: "device_verification", label: "Device verification on login", type: "select", options: [
			{ value: "1", label: "Enabled" }, { value: "0", label: "Disabled" },
		], half: true },
		{ key: "login_captcha", label: "Login CAPTCHA", type: "select", options: [
			{ value: "1", label: "Enabled" }, { value: "0", label: "Disabled" },
		], half: true },
		{ key: "cf_turnstile_site_key", label: "Cloudflare Turnstile Site Key", type: "text" },
		{ key: "cf_turnstile_secret_key", label: "Cloudflare Turnstile Secret Key", type: "password" },
		{ key: "allowed_file_extensions", label: "Allowed file extensions", type: "text", placeholder: "jpg,png,gif,pdf,doc" },
		{ key: "max_file_size", label: "Max file size (MB)", type: "text", placeholder: "10", half: true },
	],
	mail: [
		{ key: "smtp_connection", label: "Mail driver", type: "select", options: [
			{ value: "0", label: "PHP Mail" }, { value: "1", label: "SMTP" },
		] },
		{ key: "smtp_host", label: "SMTP host", type: "text", placeholder: "smtp.gmail.com" },
		{ key: "smtp_port", label: "SMTP port", type: "text", placeholder: "587", half: true },
		{ key: "smtp_encryption", label: "Encryption", type: "select", options: [
			{ value: "tls", label: "TLS" }, { value: "ssl", label: "SSL" }, { value: "", label: "None" },
		], half: true },
		{ key: "smtp_username", label: "SMTP username", type: "text" },
		{ key: "smtp_password", label: "SMTP password", type: "password" },
		{ key: "smtp_from_name", label: "From name", type: "text" },
	],
	payment: [
		{ key: "stripe_enabled", label: "Stripe enabled", type: "select", options: [
			{ value: "1", label: "Enabled" }, { value: "0", label: "Disabled" },
		], half: true },
		{ key: "stripe_mode", label: "Stripe mode", type: "select", options: [
			{ value: "test", label: "Test" }, { value: "live", label: "Live" },
		], half: true },
		{ key: "stripe_test_key", label: "Stripe test publishable key", type: "password" },
		{ key: "stripe_test_secret", label: "Stripe test secret key", type: "password" },
		{ key: "stripe_live_key", label: "Stripe live publishable key", type: "password" },
		{ key: "stripe_live_secret", label: "Stripe live secret key", type: "password" },
		{ key: "paddle_enabled", label: "Paddle enabled", type: "select", options: [
			{ value: "1", label: "Enabled" }, { value: "0", label: "Disabled" },
		], half: true },
		{ key: "paddle_vendor_id", label: "Paddle vendor ID", type: "text", half: true },
		{ key: "paddle_api_key", label: "Paddle API key", type: "password" },
		{ key: "paddle_sandbox", label: "Paddle sandbox", type: "select", options: [
			{ value: "1", label: "Sandbox" }, { value: "0", label: "Production" },
		], half: true },
	],
	openai: [
		{ key: "openai_apikey", label: "OpenAI API Key", type: "password" },
		{ key: "anthropic_apikey", label: "Anthropic API Key", type: "password" },
		{ key: "google_apikey", label: "Google Gemini API Key", type: "password" },
		{ key: "deepseek_apikey", label: "DeepSeek API Key", type: "password" },
		{ key: "xai_apikey", label: "xAI (Grok) API Key", type: "password" },
		{ key: "default_model", label: "Default generation model", type: "text", placeholder: "gpt-4o-mini" },
		{ key: "default_chat_model", label: "Default chat model", type: "text", placeholder: "gpt-4o" },
	],
	// social_oauth: handled by SocialOAuthTab component (reads social_oauth_providers table)
	storage: [
		{ key: "r2_accesskey", label: "Access key", type: "password" },
		{ key: "r2_secretkey", label: "Secret key", type: "password" },
		{ key: "r2_bucket", label: "Bucket name", type: "text" },
	],
	app: [
		{ key: "jwt_key", label: "JWT Secret Key", type: "password" },
		{ key: "react_app_url", label: "React App URL (Captain)", type: "text" },
		{ key: "presentations_url", label: "Presentations Editor URL", type: "text" },
		{ key: "e2b_apikey", label: "E2B API Key", type: "password" },
	],
	railway: [
		{ key: "chatbot_api_secret_key", label: "API Secret Key", type: "password", placeholder: "e.g. sk-sqai-...",
		  description: "This must match the API_SECRET_KEY environment variable set in Railway." },
		{ key: "chatbot_railway_url", label: "Railway Service URL", type: "text", placeholder: "https://smartlyq-ai-production.up.railway.app",
		  description: "The base URL of the AI chatbot service on Railway. Leave empty to use the default." },
		{ key: "_managed_section", label: "Managed API Keys", type: "heading",
		  description: "Provide platform-level AI keys so users can select \"Use SmartlyQ AI\" instead of bringing their own key. Usage is tracked per chatbot." },
		{ key: "managed_key_enabled", label: "Enable Managed AI Keys", type: "select", options: [
			{ value: "1", label: "Enabled" }, { value: "0", label: "Disabled" },
		] },
		{ key: "managed_openai_key", label: "Managed OpenAI API Key", type: "password", placeholder: "sk-...",
		  description: "Platform OpenAI key used when users select \"Use SmartlyQ AI\"." },
		{ key: "managed_anthropic_key", label: "Managed Anthropic API Key", type: "password", placeholder: "sk-ant-...",
		  description: "Platform Anthropic key used when users select \"Use SmartlyQ AI\"." },
	],
	marketing: [
		{ key: "google_analytics", label: "Google Analytics ID", type: "text", placeholder: "G-XXXXXXXXXX" },
		{ key: "google_tag_manager", label: "Google Tag Manager ID", type: "text", placeholder: "GTM-XXXXXXX" },
		{ key: "facebook_pixel", label: "Facebook Pixel ID", type: "text" },
		{ key: "gtranslate", label: "Google Translate widget", type: "select", options: [
			{ value: "1", label: "Enabled" }, { value: "0", label: "Disabled" },
		] },
	],
	theme: [
		{ key: "theme_style", label: "Default theme", type: "select", options: THEME_OPTIONS },
		{ key: "primary_color", label: "Primary color", type: "text", placeholder: "#377DEE" },
		{ key: "sidebar_color", label: "Sidebar color", type: "text", placeholder: "#1e293b" },
	],
};
