import type { PreviewProps } from "./types";
import { Heart, MessageCircle, Repeat2, Send, MoreHorizontal } from "lucide-react";

export function ThreadsPreview({ content, media, account }: PreviewProps) {
	const username = account?.username || account?.name || "username";
	const avatar = account?.avatar || "";

	return (
		<div className="mx-auto max-w-[500px] border-b border-[#E0E0E0] bg-white px-4 py-3">
			<div className="flex gap-3">
				{/* Avatar + thread line */}
				<div className="flex flex-col items-center">
					{avatar ? (
						<img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
					) : (
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
							{username.charAt(0).toUpperCase()}
						</div>
					)}
					<div className="mt-2 flex-1 w-px bg-[#E0E0E0]" />
				</div>

				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex items-center gap-2">
						<span className="text-[15px] font-semibold text-[#000]">{username}</span>
						<span className="text-[14px] text-[#999]">now</span>
						<div className="ml-auto">
							<MoreHorizontal size={18} className="text-[#999]" />
						</div>
					</div>

					{/* Content */}
					{content && (
						<p className="mt-1 text-[15px] text-[#000] whitespace-pre-wrap leading-[1.4]">
							{content}
						</p>
					)}

					{/* Media */}
					{media.length > 0 && (
						<div className="mt-2 overflow-hidden rounded-lg border border-[#E0E0E0]">
							<img src={media[0]} alt="" className="w-full max-h-[350px] object-cover" />
						</div>
					)}

					{/* Actions */}
					<div className="mt-3 flex items-center gap-4">
						<Heart size={20} className="text-[#999] cursor-pointer hover:text-[#000]" />
						<MessageCircle size={20} className="text-[#999] cursor-pointer hover:text-[#000]" />
						<Repeat2 size={20} className="text-[#999] cursor-pointer hover:text-[#000]" />
						<Send size={20} className="text-[#999] cursor-pointer hover:text-[#000]" />
					</div>

					{/* Stats */}
					<p className="mt-2 text-[14px] text-[#999]">3 replies · 18 likes</p>
				</div>
			</div>
		</div>
	);
}
