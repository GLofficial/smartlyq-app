import {
	Facebook,
	Instagram,
	Linkedin,
	Twitter,
	Youtube,
	Globe,
	Music2,
	Pin,
} from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
	facebook: Facebook,
	instagram: Instagram,
	linkedin: Linkedin,
	twitter: Twitter,
	x: Twitter,
	youtube: Youtube,
	tiktok: Music2,
	pinterest: Pin,
	threads: Globe,
	bluesky: Globe,
	reddit: Globe,
	tumblr: Globe,
	google_business: Globe,
};

const COLORS: Record<string, string> = {
	facebook: "text-blue-600",
	instagram: "text-pink-500",
	linkedin: "text-blue-700",
	twitter: "text-sky-500",
	x: "text-gray-900",
	youtube: "text-red-600",
	tiktok: "text-gray-900",
	pinterest: "text-red-500",
	threads: "text-gray-900",
	bluesky: "text-blue-400",
};

export function PlatformIcon({
	platform,
	size = 16,
}: {
	platform: string;
	size?: number;
}) {
	const Icon = ICONS[platform.toLowerCase()] ?? Globe;
	const color = COLORS[platform.toLowerCase()] ?? "text-gray-500";
	return <Icon size={size} className={color} />;
}
