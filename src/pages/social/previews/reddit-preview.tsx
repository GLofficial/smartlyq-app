import type { PreviewProps } from "./types";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Award, MoreHorizontal } from "lucide-react";

export function RedditPreview({ content, media, account, title }: PreviewProps) {
	const username = account?.username || account?.name || "username";
	const postTitle = title || content?.slice(0, 100) || "Post Title";

	return (
		<div className="mx-auto max-w-[600px] rounded-md border border-[#EDEFF1] bg-white hover:border-[#898989] transition-colors">
			<div className="flex">
				{/* Vote sidebar */}
				<div className="flex w-10 shrink-0 flex-col items-center gap-1 rounded-l-md bg-[#F8F9FA] py-2">
					<ArrowBigUp size={22} className="text-[#878A8C] cursor-pointer hover:text-[#FF4500]" />
					<span className="text-[12px] font-bold text-[#1A1A1B]">42</span>
					<ArrowBigDown size={22} className="text-[#878A8C] cursor-pointer hover:text-[#7193FF]" />
				</div>

				{/* Content */}
				<div className="flex-1 p-2">
					{/* Meta */}
					<div className="flex items-center gap-1 text-[12px]">
						<div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF4500] text-[8px] text-white font-bold">r/</div>
						<span className="font-bold text-[#1C1C1C]">r/technology</span>
						<span className="text-[#787C7E]">·</span>
						<span className="text-[#787C7E]">Posted by u/{username}</span>
						<span className="text-[#787C7E]">· just now</span>
						<div className="ml-auto">
							<MoreHorizontal size={16} className="text-[#878A8C]" />
						</div>
					</div>

					{/* Title */}
					<h3 className="mt-2 text-[18px] font-medium text-[#1A1A1B] leading-tight">
						{postTitle}
					</h3>

					{/* Text content */}
					{content && !title && (
						<p className="mt-2 text-[14px] text-[#1A1A1B] leading-[1.5] line-clamp-4">
							{content}
						</p>
					)}
					{content && title && (
						<p className="mt-2 text-[14px] text-[#1A1A1B] leading-[1.5] line-clamp-4">
							{content}
						</p>
					)}

					{/* Media */}
					{media.length > 0 && (
						<div className="mt-2 overflow-hidden rounded">
							<img src={media[0]} alt="" className="w-full max-h-[512px] object-contain bg-black" />
						</div>
					)}

					{/* Actions */}
					<div className="mt-2 flex items-center gap-1">
						<RedditAction icon={MessageSquare} label="12 Comments" />
						<RedditAction icon={Share2} label="Share" />
						<RedditAction icon={Award} label="Award" />
					</div>
				</div>
			</div>
		</div>
	);
}

function RedditAction({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
	return (
		<button type="button" className="flex items-center gap-1 rounded-sm px-2 py-1.5 text-[12px] font-bold text-[#878A8C] hover:bg-[#F8F9FA]">
			<Icon size={16} />
			<span>{label}</span>
		</button>
	);
}
