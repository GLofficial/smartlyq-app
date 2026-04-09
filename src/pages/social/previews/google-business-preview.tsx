import type { PreviewProps } from "./types";
import { ThumbsUp, Share2 } from "lucide-react";

export function GoogleBusinessPreview({ content, media, account }: PreviewProps) {
	const businessName = account?.name || "Business Name";
	const avatar = account?.avatar || "";

	return (
		<div className="mx-auto max-w-[400px] rounded-lg border border-[#DADCE0] bg-white shadow-sm">
			{/* Header */}
			<div className="flex items-center gap-3 p-4 pb-2">
				{avatar ? (
					<img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
				) : (
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4285F4] text-white font-bold text-sm">
						{businessName.charAt(0).toUpperCase()}
					</div>
				)}
				<div className="flex-1">
					<p className="text-[14px] font-medium text-[#202124]">{businessName}</p>
					<p className="text-[12px] text-[#5F6368]">Just now</p>
				</div>
			</div>

			{/* Content */}
			{content && (
				<div className="px-4 py-2">
					<p className="text-[14px] text-[#202124] leading-[1.5] whitespace-pre-wrap">
						{content.length > 250 ? `${content.slice(0, 250)}...` : content}
					</p>
				</div>
			)}

			{/* Media */}
			{media.length > 0 && (
				<div className="px-4 pb-2">
					<img src={media[0]} alt="" className="w-full rounded-lg object-cover max-h-[250px]" />
				</div>
			)}

			{/* CTA Button */}
			<div className="px-4 pb-3">
				<button type="button" className="w-full rounded-md bg-[#1A73E8] py-2.5 text-[14px] font-medium text-white hover:bg-[#1765CC]">
					Learn more
				</button>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-4 border-t border-[#DADCE0] px-4 py-2.5">
				<button type="button" className="flex items-center gap-1.5 text-[13px] text-[#5F6368] hover:text-[#1A73E8]">
					<ThumbsUp size={16} /> Like
				</button>
				<button type="button" className="flex items-center gap-1.5 text-[13px] text-[#5F6368] hover:text-[#1A73E8]">
					<Share2 size={16} /> Share
				</button>
			</div>
		</div>
	);
}
