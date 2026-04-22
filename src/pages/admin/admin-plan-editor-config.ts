/** Plan editor field sections matching the Bootstrap admin plan form */

export interface FieldDef {
	key: string;
	label: string;
	type: "text" | "number" | "decimal" | "textarea" | "select" | "bool";
	options?: { value: string; label: string }[];
	placeholder?: string;
	help?: string;
	span?: 1 | 2 | 3;
}

export interface SectionDef {
	title: string;
	help?: string;
	fields: FieldDef[];
}

export const PLAN_EDITOR_SECTIONS: SectionDef[] = [
	{
		title: "Basic Plan Details",
		fields: [
			{ key: "name", label: "Plan name", type: "text", placeholder: "Enter plan name" },
			{ key: "title", label: "Plan title", type: "text", placeholder: "Enter plan title" },
			{ key: "duration", label: "Payment frequency", type: "select", options: [
				{ value: "month", label: "Monthly" }, { value: "year", label: "Yearly" },
				{ value: "lifetime", label: "Lifetime" }, { value: "prepaid", label: "Prepaid (one-time)" },
			]},
			{ key: "price", label: "Subscription fee (EUR)", type: "decimal", placeholder: "0" },
			{ key: "credits", label: "Workspace credits", type: "number", placeholder: "Enter workspace credits" },
			{ key: "status", label: "Status", type: "select", options: [{ value: "1", label: "Active" }, { value: "0", label: "Inactive" }] },
			{ key: "description", label: "Description (optional)", type: "textarea", placeholder: "Features list", span: 3 },
			{ key: "highlight", label: "Highlighted (Most Popular)", type: "bool" },
			{ key: "premium", label: "Premium plan", type: "bool" },
		],
	},
	{
		title: "Features",
		help: "Leave fields empty to allow unlimited generation.",
		fields: [
			{ key: "total_brands", label: "Total brand voice create", type: "number", placeholder: "Enter total brand voice create" },
			{ key: "documents", label: "Total documents create", type: "number", placeholder: "Enter total documents create" },
			{ key: "total_templates", label: "Total templates create", type: "number", placeholder: "Enter total templates to be created" },
			{ key: "total_assistants", label: "Total assistants create", type: "number", placeholder: "Enter total assistants create" },
			{ key: "total_campaign_create", label: "Total Campaigns create", type: "number", placeholder: "Enter campaigns create" },
			{ key: "total_articles", label: "Total article create", type: "number", placeholder: "Enter total articles create" },
			{ key: "assistant", label: "Assistant access", type: "bool" },
			{ key: "analyst", label: "Analyst access", type: "bool" },
			{ key: "brand", label: "Brand voice access", type: "bool" },
			{ key: "ai_captain", label: "AI Captain access", type: "bool" },
			{ key: "campaign", label: "Campaign access", type: "bool" },
			{ key: "webhook", label: "Webhook access", type: "bool" },
			{ key: "text_to_audio", label: "Text to Audio", type: "bool" },
			{ key: "text_to_video", label: "Text to Video", type: "bool" },
			{ key: "image_to_video", label: "Image to Video", type: "bool" },
			{ key: "presentations", label: "Presentations", type: "bool" },
			{ key: "media_library", label: "Media Library", type: "bool" },
			{ key: "seo_service", label: "SEO Service", type: "bool" },
		],
	},
	{
		title: "Paddle",
		fields: [
			{ key: "paddle_product_id", label: "Paddle product ID", type: "text", placeholder: "Enter paddle product ID" },
		],
	},
	{
		title: "WordPress",
		help: "Leave fields empty to allow unlimited generation.",
		fields: [
			{ key: "total_wordpress", label: "Total WordPress create", type: "number", placeholder: "Max WordPress sites" },
		],
	},
	{
		title: "GoHighLevel",
		help: "Leave fields empty to allow unlimited generation.",
		fields: [
			{ key: "ghl_subaccount_limit", label: "GoHighLevel: Subaccount creation limit", type: "number", placeholder: "Enter subaccount creation limit" },
			{ key: "ghl_monthly_blog_posts", label: "GoHighLevel: Monthly blog post limit", type: "number", placeholder: "Enter monthly blog post limit" },
		],
	},
	{
		title: "Shopify",
		help: "Leave fields empty to allow unlimited generation.",
		fields: [
			{ key: "shopify_account_limit", label: "Shopify: Account integration limit", type: "number", placeholder: "Enter Shopify account integration limit" },
			{ key: "shopify_monthly_blog_posts", label: "Shopify: Monthly blog post limit", type: "number", placeholder: "Enter Shopify monthly blog post limit" },
		],
	},
	{
		title: "Integrations",
		help: "Leave empty = unlimited · 0 = not allowed · 1+ = limit",
		fields: [
			{ key: "integrations_ga4", label: "GA4 Access", type: "bool" },
			{ key: "integrations_gsc", label: "Search Console Access", type: "bool" },
			{ key: "integrations_facebook_ads", label: "Facebook Ads Access", type: "bool" },
			{ key: "integrations_google_ads", label: "Google Ads Access", type: "bool" },
			{ key: "integrations_tiktok_ads", label: "TikTok Ads Access", type: "bool" },
			{ key: "integrations_linkedin_ads", label: "LinkedIn Ads Access", type: "bool" },
			{ key: "integrations_woocommerce", label: "WooCommerce Access", type: "bool" },
			{ key: "integrations_google", label: "Google Integration", type: "bool" },
			{ key: "slack_integration", label: "Slack Integration", type: "bool" },
			{ key: "max_integrations_ga4", label: "Max GA4 connected workspaces", type: "number", placeholder: "Unlimited" },
			{ key: "max_integrations_gsc", label: "Max Search Console workspaces", type: "number", placeholder: "Unlimited" },
			{ key: "max_integrations_facebook_ads", label: "Max Facebook Ads workspaces", type: "number", placeholder: "Unlimited" },
			{ key: "max_integrations_google_ads", label: "Max Google Ads workspaces", type: "number", placeholder: "Unlimited" },
			{ key: "max_integrations_tiktok_ads", label: "Max TikTok Ads workspaces", type: "number", placeholder: "Unlimited" },
			{ key: "max_integrations_linkedin_ads", label: "Max LinkedIn Ads workspaces", type: "number", placeholder: "Unlimited" },
			{ key: "max_integrations_slack", label: "Max Slack workspaces", type: "number", placeholder: "Unlimited" },
			{ key: "max_woocommerce_stores", label: "Max WooCommerce stores", type: "number", placeholder: "0" },
			{ key: "business_groups", label: "Business Groups", type: "bool" },
			{ key: "max_business_groups", label: "Max Business Groups", type: "number", placeholder: "Unlimited" },
		],
	},
	{
		title: "Ad Manager",
		help: "Control access to the Ad Manager feature and per-platform permissions.",
		fields: [
			{ key: "ad_manager", label: "Ad Manager Access", type: "bool" },
			{ key: "ad_manager_meta", label: "Meta / Instagram Ads", type: "bool" },
			{ key: "ad_manager_google", label: "Google Ads", type: "bool" },
			{ key: "ad_manager_tiktok", label: "TikTok Ads", type: "bool" },
			{ key: "ad_manager_linkedin", label: "LinkedIn Ads", type: "bool" },
			{ key: "max_ad_campaigns", label: "Max Ad Campaigns (per workspace)", type: "number", placeholder: "Unlimited" },
		],
	},
	{
		title: "Chatbot",
		help: "Leave fields empty to allow unlimited generation.",
		fields: [
			{ key: "chatbot_access", label: "Chatbot Access", type: "bool" },
			{ key: "chatbot_messages", label: "Chatbot: Messages", type: "number", placeholder: "Enter messages for chatbot" },
			{ key: "chatbot_number_allowed", label: "Chatbot: Number of allowed", type: "number", placeholder: "Enter number of allowed for chatbot" },
			{ key: "chatbot_memory_limit", label: "Chatbot: Knowledge Limit Per Bot (KBs)", type: "number", placeholder: "Enter knowledge limit" },
			{ key: "chatbot_file_upload_size", label: "Chatbot: File Upload Size Limit Per Bot (MBs)", type: "number", placeholder: "Enter file upload size limit" },
			{ key: "url_scraping_limit", label: "URL Scrapping Limit", type: "number", placeholder: "Enter URL scraping limit" },
			{ key: "chatbot_ghl_access", label: "Chatbot GHL Access", type: "bool" },
			{ key: "chatbot_woocommerce_access", label: "Chatbot WooCommerce Access", type: "bool" },
			{ key: "chatbot_shopify_access", label: "Chatbot Shopify Access", type: "bool" },
			{ key: "chatbot_remove_watermark", label: "Remove Watermark", type: "bool" },
		],
	},
	{
		title: "Video Editor",
		fields: [
			{ key: "video_editor", label: "Video Editor Access", type: "bool" },
			{ key: "video_editor_monthly_limit", label: "Video Editor: Monthly video limit", type: "number", placeholder: "Enter monthly video limit" },
		],
	},
	{
		title: "AI Captain: Code Execution",
		fields: [
			{ key: "ai_captain_code_exec", label: "Enable code execution (E2B sandbox)", type: "bool" },
			{ key: "ai_captain_code_exec_monthly_limit", label: "Monthly execution limit (leave blank for unlimited)", type: "number", placeholder: "e.g. 50" },
		],
	},
	{
		title: "AI Captain: Computer Use",
		fields: [
			{ key: "ai_captain_computer_use", label: "Enable computer use (E2B Desktop browser automation — Enterprise)", type: "bool" },
			{ key: "ai_captain_computer_use_monthly_limit", label: "Monthly steps limit (leave blank for unlimited)", type: "number", placeholder: "e.g. 200" },
		],
	},
	{
		title: "Video Editor: AI Providers",
		help: "Per-service feature gates and monthly caps for the video editor. Leave a limit blank for unlimited.",
		fields: [
			{ key: "video_editor_tts", label: "Enable text-to-speech (ElevenLabs)", type: "bool" },
			{ key: "video_editor_tts_monthly_chars", label: "TTS monthly character limit", type: "number", placeholder: "e.g. 100000" },
			{ key: "video_editor_stt", label: "Enable transcription (Deepgram / OpenAI)", type: "bool" },
			{ key: "video_editor_stt_monthly_minutes", label: "Transcription monthly minutes", type: "number", placeholder: "e.g. 120" },
			{ key: "video_editor_image_gen", label: "Enable image generation (Freepik)", type: "bool" },
			{ key: "video_editor_image_gen_monthly_count", label: "Image generations per month", type: "number", placeholder: "e.g. 100" },
			{ key: "video_editor_video_gen", label: "Enable video generation (Freepik Pixverse/Hailuo/Wan)", type: "bool" },
			{ key: "video_editor_video_gen_monthly_count", label: "Video generations per month", type: "number", placeholder: "e.g. 30" },
			{ key: "video_editor_stock_media", label: "Enable stock media search (Pexels)", type: "bool" },
			{ key: "video_editor_stock_media_monthly_count", label: "Stock media searches per month", type: "number", placeholder: "e.g. 500" },
			{ key: "video_editor_ai_text", label: "Enable AI text (schema/script/title/enhance — OpenAI)", type: "bool" },
			{ key: "video_editor_ai_text_monthly_count", label: "AI text calls per month", type: "number", placeholder: "e.g. 500" },
		],
	},
	{
		title: "Workspaces",
		fields: [
			{ key: "workspace_enabled", label: "Workspaces enabled", type: "bool" },
			{ key: "seats_included", label: "Workspaces: Seats included", type: "number", placeholder: "1" },
			{ key: "seats_max", label: "Workspaces: Max seats (hard cap)", type: "number", placeholder: "Enter max seats" },
			{ key: "workspaces_limit", label: "Workspaces: Max workspaces (per tenant)", type: "number", placeholder: "Enter max workspaces" },
			{ key: "seat_price_monthly", label: "Workspaces: Seat price monthly (EUR)", type: "decimal", placeholder: "0.00" },
			{ key: "seat_price_yearly", label: "Workspaces: Seat price yearly (EUR)", type: "decimal", placeholder: "0.00" },
			{ key: "storage_limit_mb", label: "Storage: Base quota (MB)", type: "number", placeholder: "e.g. 500" },
			{ key: "extra_storage_price_monthly", label: "Storage: Extra 1GB price monthly (EUR)", type: "decimal", placeholder: "e.g. 10.00" },
			{ key: "extra_storage_price_yearly", label: "Storage: Extra 1GB price yearly (EUR)", type: "decimal", placeholder: "e.g. 100.00" },
		],
	},
	{
		title: "Social Media",
		fields: [
			{ key: "social_media", label: "Social Media Access", type: "bool" },
			{ key: "social_account_limit", label: "Social account limit", type: "number", placeholder: "Enter social account limit" },
			{ key: "facebook_monthly_limit", label: "Facebook monthly post limit", type: "number", placeholder: "Enter Facebook monthly post limit" },
			{ key: "instagram_monthly_limit", label: "Instagram monthly post limit", type: "number", placeholder: "Enter Instagram monthly post limit" },
			{ key: "linkedin_monthly_limit", label: "LinkedIn monthly post limit", type: "number", placeholder: "Enter LinkedIn monthly post limit" },
			{ key: "tiktok_monthly_limit", label: "TikTok monthly post limit", type: "number", placeholder: "Enter TikTok monthly post limit" },
			{ key: "twitter_monthly_limit", label: "Twitter monthly post limit", type: "number", placeholder: "Enter Twitter monthly post limit" },
			{ key: "youtube_monthly_limit", label: "YouTube monthly post limit", type: "number", placeholder: "Enter YouTube monthly post limit" },
			{ key: "pinterest_monthly_limit", label: "Pinterest monthly post limit", type: "number", placeholder: "Enter Pinterest monthly post limit" },
			{ key: "threads_monthly_limit", label: "Threads monthly post limit", type: "number", placeholder: "Enter Threads monthly post limit" },
			{ key: "bluesky_monthly_limit", label: "Bluesky monthly post limit", type: "number", placeholder: "Enter Bluesky monthly post limit" },
			{ key: "reddit_monthly_limit", label: "Reddit monthly post limit", type: "number", placeholder: "Enter Reddit monthly post limit" },
			{ key: "telegram_monthly_limit", label: "Telegram monthly post limit", type: "number", placeholder: "Enter Telegram monthly post limit" },
			{ key: "google_business_monthly_limit", label: "Google Business monthly post limit", type: "number", placeholder: "Enter Google Business monthly post limit" },
			{ key: "bulk_scheduler", label: "Bulk Scheduler", type: "bool" },
			{ key: "inbox", label: "Inbox", type: "bool" },
			{ key: "comments_management", label: "Comments Management", type: "bool" },
			{ key: "social_reports", label: "Social Reports", type: "bool" },
			{ key: "custom_reports", label: "Custom Reports", type: "bool" },
			{ key: "scheduled_reports", label: "Scheduled Reports", type: "bool" },
			{ key: "post_queues", label: "Post Queues", type: "bool" },
			{ key: "post_labels", label: "Post Labels", type: "bool" },
			{ key: "url_shortener", label: "URL Shortener", type: "bool" },
			{ key: "canva_integration", label: "Canva Integration", type: "bool" },
		],
	},
	{
		title: "Access",
		fields: [
			{ key: "own_api", label: "Own API (BYOK)", type: "bool" },
			{ key: "whitelabel", label: "Whitelabel", type: "bool" },
			{ key: "api_access", label: "Developer API Access", type: "bool" },
			{ key: "gohighlevel", label: "GoHighLevel Integration", type: "bool" },
			{ key: "shopify", label: "Shopify Integration", type: "bool" },
		],
	},
	{
		title: "Developer API",
		fields: [
			{ key: "api_monthly_credits", label: "Monthly API Credits (EUR)", type: "decimal", placeholder: "0.0000" },
		],
	},
];
