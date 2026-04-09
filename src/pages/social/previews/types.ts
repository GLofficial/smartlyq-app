export interface PreviewProps {
	/** Post text content */
	content: string;
	/** URLs of attached images/videos */
	media: string[];
	/** Selected social account info */
	account: {
		name: string;
		username: string;
		avatar: string;
		platform: string;
	} | null;
	/** Post title (used by YouTube, Reddit, Pinterest) */
	title?: string;
}

/** Character limits per platform */
export const CHAR_LIMITS: Record<string, number> = {
	twitter: 280,
	x: 280,
	instagram: 2200,
	facebook: 63206,
	linkedin: 3000,
	tiktok: 2200,
	youtube: 5000,
	pinterest: 500,
	threads: 500,
	bluesky: 300,
	reddit: 40000,
	google_business: 1500,
	telegram: 4096,
};
