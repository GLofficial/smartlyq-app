/** Brand colors, logos and descriptions for integrations.
 * Uses jsdelivr CDN for simple-icons SVGs (reliable).
 */

const SI = (slug: string) => `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`;

export const INTEGRATION_BRANDS: Record<string, { logo: string; color: string; description: string }> = {
	google_analytics: {
		logo: SI("googleanalytics"),
		color: "#E37400",
		description: "Track website traffic, user behavior, and conversion data",
	},
	google_ads: {
		logo: SI("googleads"),
		color: "#4285F4",
		description: "Manage and monitor your Google Ads campaigns",
	},
	facebook_ads: {
		logo: SI("meta"),
		color: "#0082FB",
		description: "Connect your Meta Ads account for campaign insights",
	},
	tiktok_ads: {
		logo: SI("tiktok"),
		color: "#000000",
		description: "Monitor TikTok ad performance and spending",
	},
	linkedin_ads: {
		logo: SI("linkedin"),
		color: "#0A66C2",
		description: "Track LinkedIn advertising campaigns and leads",
	},
	slack: {
		logo: SI("slack"),
		color: "#4A154B",
		description: "Get notifications and alerts in your Slack workspace",
	},
	woocommerce: {
		logo: SI("woocommerce"),
		color: "#96588A",
		description: "Sync products, orders, and customer data from WooCommerce",
	},
	shopify: {
		logo: SI("shopify"),
		color: "#7AB55C",
		description: "Connect your Shopify store for product and order sync",
	},
	ghl: {
		logo: "https://app.gohighlevel.com/favicon.ico",
		color: "#29B473",
		description: "Sync contacts, calendars, and workflows with LeadConnector",
	},
	canva: {
		logo: SI("canva"),
		color: "#00C4CC",
		description: "Import designs directly from your Canva account",
	},
	stripe: {
		logo: SI("stripe"),
		color: "#635BFF",
		description: "Payment processing and subscription billing",
	},
};
