/** Plan feature columns organized by section for the admin plans matrix */

export interface ColumnGroup {
	label: string;
	columns: { key: string; label: string; type: "bool" | "number" | "text" | "price" }[];
}

export const PLAN_COLUMN_GROUPS: ColumnGroup[] = [
	{
		label: "Plan Info",
		columns: [
			{ key: "name", label: "Plan Name", type: "text" },
			{ key: "price", label: "Pricing", type: "price" },
			{ key: "credits", label: "Credits", type: "number" },
			{ key: "premium", label: "Premium", type: "bool" },
			{ key: "status", label: "Status", type: "bool" },
		],
	},
	{
		label: "AI Features",
		columns: [
			{ key: "assistant", label: "Assistant", type: "bool" },
			{ key: "analyst", label: "Analyst", type: "bool" },
			{ key: "ai_captain", label: "AI Captain", type: "bool" },
			{ key: "chatbot_access", label: "Chatbot", type: "bool" },
			{ key: "text_to_audio", label: "TTS", type: "bool" },
			{ key: "text_to_video", label: "T2V", type: "bool" },
			{ key: "image_to_video", label: "I2V", type: "bool" },
			{ key: "ai_captain_code_exec", label: "Code Exec", type: "bool" },
			{ key: "ai_captain_computer_use", label: "Computer Use", type: "bool" },
		],
	},
	{
		label: "Social Media",
		columns: [
			{ key: "social_media", label: "Social", type: "bool" },
			{ key: "social_account_limit", label: "Accounts", type: "number" },
			{ key: "bulk_scheduler", label: "Bulk Sched", type: "bool" },
			{ key: "inbox", label: "Inbox", type: "bool" },
			{ key: "comments_management", label: "Comments", type: "bool" },
			{ key: "post_queues", label: "Queues", type: "bool" },
			{ key: "post_labels", label: "Labels", type: "bool" },
			{ key: "url_shortener", label: "URL Short", type: "bool" },
		],
	},
	{
		label: "Content",
		columns: [
			{ key: "brand", label: "Brand", type: "bool" },
			{ key: "total_brands", label: "Max Brands", type: "number" },
			{ key: "campaign", label: "Campaign", type: "bool" },
			{ key: "total_articles", label: "Articles", type: "number" },
			{ key: "images", label: "Images", type: "number" },
			{ key: "documents", label: "Documents", type: "number" },
		],
	},
	{
		label: "Integrations",
		columns: [
			{ key: "api_access", label: "API", type: "bool" },
			{ key: "webhook", label: "Webhook", type: "bool" },
			{ key: "gohighlevel", label: "GHL", type: "bool" },
			{ key: "shopify", label: "Shopify", type: "bool" },
			{ key: "canva_integration", label: "Canva", type: "bool" },
			{ key: "slack_integration", label: "Slack", type: "bool" },
			{ key: "whitelabel", label: "Whitelabel", type: "bool" },
		],
	},
	{
		label: "Ad Manager",
		columns: [
			{ key: "ad_manager", label: "Enabled", type: "bool" },
			{ key: "ad_manager_meta", label: "Meta", type: "bool" },
			{ key: "ad_manager_google", label: "Google", type: "bool" },
			{ key: "ad_manager_tiktok", label: "TikTok", type: "bool" },
			{ key: "ad_manager_linkedin", label: "LinkedIn", type: "bool" },
		],
	},
	{
		label: "Workspace",
		columns: [
			{ key: "workspace_enabled", label: "Enabled", type: "bool" },
			{ key: "seats_included", label: "Seats", type: "number" },
			{ key: "storage_limit_mb", label: "Storage MB", type: "number" },
			{ key: "presentations", label: "Presentations", type: "bool" },
			{ key: "video_editor", label: "Video Editor", type: "bool" },
			{ key: "media_library", label: "Media Lib", type: "bool" },
		],
	},
];
