import { PlatformIcon as BrandIcon, PLATFORM_BRANDS } from "./PlatformIcons";
import { Globe } from "lucide-react";

// Map account-page platform keys (which sometimes use legacy aliases) to the
// canonical PLATFORM_BRANDS keys in PlatformIcons.tsx.
const ALIAS: Record<string, string> = {
	gmb: "google",
	google_business: "google",
	google_my_business: "google",
	x: "twitter",
};

export function PlatformIcon({
	platform,
	size = 16,
}: {
	platform: string;
	size?: number;
}) {
	const key = (platform || "").toLowerCase();
	const mapped = ALIAS[key] ?? key;
	const brand = PLATFORM_BRANDS[mapped];
	if (!brand) return <Globe size={size} className="text-gray-500" />;
	return (
		<span style={{ color: brand.brandColor, display: "inline-flex", lineHeight: 0 }}>
			<BrandIcon platformId={mapped} size={size} />
		</span>
	);
}
