export type FieldType = "text" | "textarea" | "password" | "select" | "toggle" | "heading";

export interface FieldDef {
	key: string;
	label: string;
	type: FieldType;
	options?: { value: string; label: string }[];
	placeholder?: string;
	half?: boolean;
	description?: string;
	link?: { label: string; url: string };
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
		{ key: "decimal_places", label: "Decimal places", type: "select", options: [
			{ value: "0", label: "0" }, { value: "1", label: "1" }, { value: "2", label: "2" },
		], half: true },
		{ key: "currency_position", label: "Symbol position", type: "select", options: [
			{ value: "left", label: "Left side of price" }, { value: "right", label: "Right side of price" },
		], half: true },
		{ key: "tax", label: "Tax rate (%)", type: "text", placeholder: "0", half: true },
		{ key: "welcome_credits", label: "Welcome credits", type: "text", placeholder: "0", half: true },
		{ key: "free_plan", label: "Free plan", type: "select", options: [] },
		{ key: "_credits_section", label: "Credit Behaviour", type: "heading" },
		{ key: "credits_extended", label: "Carry forward unused credits on plan renewal (excludes free plans)", type: "select", options: [
			{ value: "1", label: "Enabled" }, { value: "0", label: "Disabled" },
		] },
		{ key: "credits_reset", label: "Unused credits reset when the subscription expires", type: "select", options: [
			{ value: "1", label: "Enabled" }, { value: "0", label: "Disabled" },
		] },
		{ key: "extended_status", label: "Prepaid plans are available for paid subscribers only", type: "select", options: [
			{ value: "1", label: "Enabled" }, { value: "0", label: "Disabled" },
		] },
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
		{ key: "_turnstile_section", label: "Cloudflare Turnstile (Bot Protection)", type: "heading",
		  description: "Protects login, signup, and password reset forms from bots and abuse.",
		  link: { label: "Documentation", url: "https://developers.cloudflare.com/turnstile/" } },
		{ key: "turnstile_status", label: "Turnstile bot protection", type: "select", options: [
			{ value: "1", label: "Enabled" }, { value: "0", label: "Disabled" },
		], half: true },
		{ key: "turnstile_site_key", label: "Site Key", type: "text", half: true },
		{ key: "turnstile_secret_key", label: "Secret Key", type: "password",
		  description: "Stored encrypted. Leave unchanged to keep current key." },
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
		// Per-provider sections with console links
		{ key: "_openai", label: "OpenAI", type: "heading",
		  description: "Get your API key from", link: { label: "platform.openai.com", url: "https://platform.openai.com/api-keys" } },
		{ key: "openai_apikey", label: "API Key", type: "password" },

		{ key: "_anthropic", label: "Anthropic", type: "heading",
		  description: "Get your API key from", link: { label: "console.anthropic.com", url: "https://console.anthropic.com/" } },
		{ key: "anthropic_apikey", label: "API Key", type: "password", half: true },
		{ key: "anthropic_api_version", label: "API Version (header)", type: "text", placeholder: "2023-06-01", half: true },

		{ key: "_gemini", label: "Google Gemini", type: "heading",
		  description: "Get your API key from", link: { label: "aistudio.google.com", url: "https://aistudio.google.com/app/apikey" } },
		{ key: "gemini_apikey", label: "API Key", type: "password" },

		{ key: "_deepseek", label: "DeepSeek", type: "heading",
		  description: "Get your API key from", link: { label: "platform.deepseek.com", url: "https://platform.deepseek.com/api_keys" } },
		{ key: "deepseek_apikey", label: "API Key", type: "password", half: true },

		{ key: "_xai", label: "xAI / Grok", type: "heading",
		  description: "Get your API key from", link: { label: "console.x.ai", url: "https://console.x.ai/" } },
		{ key: "xai_apikey", label: "API Key", type: "password", half: true },

		// Image generation
		{ key: "_image_gen", label: "Image Generation", type: "heading" },
		{ key: "bfl_apikey", label: "BFL (Flux) API Key", type: "password", half: true },
		{ key: "recraft_apikey", label: "Recraft API Key", type: "password", half: true },
		{ key: "unsplash_apikey", label: "Unsplash API Key", type: "password", half: true,
		  description: "Stock photo integration for image search." },
		{ key: "pixabay_apikey", label: "Pixabay API Key", type: "password", half: true,
		  description: "Stock photo integration for image search." },

		// Video
		{ key: "_video", label: "Video", type: "heading" },
		{ key: "pollo_apikey", label: "Pollo AI API Key", type: "password", half: true },

		// Research & Web
		{ key: "_research", label: "Research & Web", type: "heading" },
		{ key: "youtube_apikey", label: "YouTube API Key", type: "password", half: true },
		{ key: "search_engine_apikey", label: "Google Search API Key", type: "password", half: true },
		{ key: "search_engine_id", label: "Google Search Engine ID", type: "text", half: true },
		{ key: "scrappingbee_apikey", label: "ScrapingBee API Key", type: "password", half: true },
		{ key: "tavily_apikey", label: "Tavily API Key", type: "password", half: true },
		{ key: "apify_token", label: "Apify Token", type: "password", half: true },

		// Audio
		{ key: "_audio", label: "Audio / Transcription", type: "heading" },
		{ key: "deepgram_apikey", label: "Deepgram API Key", type: "password", half: true },
		{ key: "deepgram_model", label: "Deepgram Model", type: "text", placeholder: "nova-2", half: true },

		// SEO
		{ key: "_seo", label: "SEO / Analytics", type: "heading" },
		{ key: "dataforseo_login", label: "DataForSEO Login", type: "text", half: true },
		{ key: "dataforseo_password", label: "DataForSEO Password", type: "password", half: true },

		// Default models — options injected dynamically from models table
		{ key: "_default_models", label: "Default Models", type: "heading",
		  description: "Select which model is used by default for each feature." },
		{ key: "default_template_model", label: "Templates", type: "select", options: [], half: true },
		{ key: "default_chat_model", label: "Assistant (Chat)", type: "select", options: [], half: true },
		{ key: "default_analyst_model", label: "Data Analyst", type: "select", options: [], half: true },
		{ key: "default_article_model", label: "Article Generator", type: "select", options: [], half: true },
		{ key: "default_image_model", label: "Image Generator", type: "select", options: [], half: true },
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
