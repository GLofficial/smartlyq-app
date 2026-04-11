/** Brand colors, logos and descriptions for integrations.
 * Uses devicon CDN (colored SVGs) where available, Wikipedia for others.
 * All URLs tested and returning 200.
 */

const DEVICON = (name: string) => `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${name}/${name}-original.svg`;

export const INTEGRATION_BRANDS: Record<string, { logo: string; color: string; description: string }> = {
	google_analytics: {
		logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Logo_Google_Analytics.svg",
		color: "#E37400",
		description: "Track website traffic, user behavior, and conversion data",
	},
	google_search_console: {
		logo: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/googlesearchconsole.svg",
		color: "#458CF5",
		description: "Monitor search performance, indexing, and site health",
	},
	google_ads: {
		logo: DEVICON("google"),
		color: "#4285F4",
		description: "Manage and monitor your Google Ads campaigns",
	},
	facebook_ads: {
		logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
		color: "#0082FB",
		description: "Connect your Meta Ads account for campaign insights",
	},
	tiktok_ads: {
		logo: "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
		color: "#000000",
		description: "Monitor TikTok ad performance and spending",
	},
	linkedin_ads: {
		logo: DEVICON("linkedin"),
		color: "#0A66C2",
		description: "Track LinkedIn advertising campaigns and leads",
	},
	slack: {
		logo: DEVICON("slack"),
		color: "#4A154B",
		description: "Get notifications and alerts in your Slack workspace",
	},
	woocommerce: {
		logo: DEVICON("woocommerce"),
		color: "#96588A",
		description: "Sync products, orders, and customer data from WooCommerce",
	},
	shopify: {
		logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Shopify_logo.svg",
		color: "#7AB55C",
		description: "Connect your Shopify store for product and order sync",
	},
	ghl: {
		logo: "",
		color: "#29B473",
		description: "Sync contacts, calendars, and workflows with LeadConnector",
	},
	canva: {
		logo: DEVICON("canva"),
		color: "#00C4CC",
		description: "Import designs directly from your Canva account",
	},
	stripe: {
		logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
		color: "#635BFF",
		description: "Payment processing and subscription billing",
	},
};
