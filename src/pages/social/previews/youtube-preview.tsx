import type { PreviewProps } from "./types";
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Play } from "lucide-react";

export function YoutubePreview({ content, media, account, title }: PreviewProps) {
	const channelName = account?.name || "Channel Name";
	const avatar = account?.avatar || "";
	const videoTitle = title || content?.slice(0, 80) || "Video Title";

	return (
		<div className="mx-auto max-w-[500px]">
			{/* Video thumbnail */}
			<div className="relative aspect-video rounded-xl overflow-hidden bg-black">
				{media.length > 0 ? (
					<img src={media[0]} alt="" className="h-full w-full object-cover" />
				) : (
					<div className="flex h-full items-center justify-center bg-gray-900" />
				)}
				{/* Play button overlay */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 hover:bg-[#FF0000] transition-colors">
						<Play size={24} className="text-white ml-1" fill="white" />
					</div>
				</div>
				{/* Duration */}
				<div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[12px] font-medium text-white">
					0:30
				</div>
			</div>

			{/* Info */}
			<div className="flex gap-3 pt-3">
				{avatar ? (
					<img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
				) : (
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF0000] text-white text-sm font-bold">
						{channelName.charAt(0).toUpperCase()}
					</div>
				)}
				<div className="min-w-0 flex-1">
					<p className="text-[16px] font-medium text-[#0F0F0F] leading-tight line-clamp-2">
						{videoTitle}
					</p>
					<div className="mt-1 flex items-center gap-1 text-[12px] text-[#606060]">
						<span>{channelName}</span>
						<span>·</span>
						<span>1 view</span>
						<span>·</span>
						<span>Just now</span>
					</div>
				</div>
				<MoreHorizontal size={20} className="shrink-0 text-[#606060] mt-1" />
			</div>

			{/* Actions bar */}
			<div className="mt-3 flex items-center gap-2">
				<div className="flex items-center rounded-full bg-[#F2F2F2]">
					<button type="button" className="flex items-center gap-1.5 rounded-l-full px-3 py-1.5 text-[13px] font-medium text-[#0F0F0F] hover:bg-[#E5E5E5]">
						<ThumbsUp size={16} /> 42
					</button>
					<div className="h-6 w-px bg-gray-300" />
					<button type="button" className="rounded-r-full px-3 py-1.5 hover:bg-[#E5E5E5]">
						<ThumbsDown size={16} className="text-[#0F0F0F]" />
					</button>
				</div>
				<button type="button" className="flex items-center gap-1.5 rounded-full bg-[#F2F2F2] px-3 py-1.5 text-[13px] font-medium text-[#0F0F0F] hover:bg-[#E5E5E5]">
					<Share2 size={16} /> Share
				</button>
				<button type="button" className="flex items-center gap-1.5 rounded-full bg-[#F2F2F2] px-3 py-1.5 text-[13px] font-medium text-[#0F0F0F] hover:bg-[#E5E5E5]">
					<Download size={16} /> Download
				</button>
			</div>

			{/* Description */}
			{content && (
				<div className="mt-3 rounded-xl bg-[#F2F2F2] p-3">
					<p className="text-[13px] text-[#0F0F0F] line-clamp-2">{content}</p>
				</div>
			)}
		</div>
	);
}
