import type { PreviewProps } from "./types";
import { Heart, MessageCircle, Bookmark, Share2, Music, Plus } from "lucide-react";

export function TiktokPreview({ content, media, account }: PreviewProps) {
	const username = account?.username || account?.name || "username";
	const avatar = account?.avatar || "";

	return (
		<div className="mx-auto w-[270px] rounded-2xl bg-black overflow-hidden" style={{ aspectRatio: "9/16" }}>
			<div className="relative h-full">
				{/* Background media */}
				{media.length > 0 ? (
					<img src={media[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
				) : (
					<div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
				)}

				{/* Overlay gradient */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

				{/* Right sidebar — engagement */}
				<div className="absolute right-2 bottom-[120px] flex flex-col items-center gap-5">
					{/* Avatar */}
					<div className="relative">
						{avatar ? (
							<img src={avatar} alt="" className="h-10 w-10 rounded-full border-2 border-white object-cover" />
						) : (
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 border-2 border-white text-white text-sm font-bold">
								{username.charAt(0).toUpperCase()}
							</div>
						)}
						<div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FE2C55]">
							<Plus size={10} className="text-white" />
						</div>
					</div>

					<EngagementBtn icon={Heart} count="1.3M" />
					<EngagementBtn icon={MessageCircle} count="10.7K" />
					<EngagementBtn icon={Bookmark} count="1.2M" />
					<EngagementBtn icon={Share2} count="54.2K" />

					{/* Music disc */}
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-500 bg-gray-800" style={{ animationDuration: "3s" }} />
				</div>

				{/* Bottom info */}
				<div className="absolute bottom-3 left-3 right-14 text-white">
					<p className="text-[14px] font-bold">@{username}</p>
					{content && (
						<p className="mt-1 text-[13px] leading-tight line-clamp-3">{content}</p>
					)}
					<div className="mt-2 flex items-center gap-1.5">
						<Music size={12} />
						<p className="text-[12px] truncate">Original Sound - {username}</p>
					</div>
				</div>
			</div>
		</div>
	);
}

function EngagementBtn({ icon: Icon, count }: { icon: React.ElementType; count: string }) {
	return (
		<div className="flex flex-col items-center gap-0.5">
			<Icon size={26} className="text-white drop-shadow-md" />
			<span className="text-[11px] font-semibold text-white drop-shadow-md">{count}</span>
		</div>
	);
}
