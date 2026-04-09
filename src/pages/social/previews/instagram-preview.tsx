import type { PreviewProps } from "./types";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";

export function InstagramPreview({ content, media, account }: PreviewProps) {
	const username = account?.username || account?.name || "username";
	const avatar = account?.avatar || "";

	return (
		<div className="mx-auto max-w-[468px] rounded-lg border border-gray-200 bg-white">
			{/* Header */}
			<div className="flex items-center gap-3 px-3 py-2.5">
				<div className="rounded-full bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#C13584] p-[2px]">
					<div className="rounded-full bg-white p-[2px]">
						<Avatar src={avatar} name={username} size={32} />
					</div>
				</div>
				<p className="flex-1 text-[14px] font-semibold text-[#262626]">{username}</p>
				<button type="button" className="text-[#262626]">
					<MoreHorizontal size={20} />
				</button>
			</div>

			{/* Media */}
			<div className="aspect-square bg-gray-100">
				{media.length > 0 ? (
					<img src={media[0]} alt="" className="h-full w-full object-cover" />
				) : (
					<div className="flex h-full items-center justify-center text-gray-400 text-sm">
						No image
					</div>
				)}
			</div>

			{/* Actions */}
			<div className="flex items-center justify-between px-3 pt-3">
				<div className="flex items-center gap-4">
					<Heart size={24} className="text-[#262626] cursor-pointer hover:text-gray-500" />
					<MessageCircle size={24} className="text-[#262626] cursor-pointer hover:text-gray-500" />
					<Send size={24} className="text-[#262626] cursor-pointer hover:text-gray-500" />
				</div>
				<Bookmark size={24} className="text-[#262626] cursor-pointer hover:text-gray-500" />
			</div>

			{/* Likes */}
			<div className="px-3 pt-2">
				<p className="text-[14px] font-semibold text-[#262626]">128 likes</p>
			</div>

			{/* Caption */}
			{content && (
				<div className="px-3 pt-1 pb-1">
					<p className="text-[14px] text-[#262626] leading-[18px]">
						<span className="font-semibold">{username}</span>{" "}
						{content.length > 150 ? (
							<>
								{content.slice(0, 150)}
								<span className="text-[#8E8E8E] cursor-pointer">... more</span>
							</>
						) : content}
					</p>
				</div>
			)}

			{/* Comments link */}
			<div className="px-3 py-1">
				<p className="text-[14px] text-[#8E8E8E] cursor-pointer">View all 12 comments</p>
			</div>

			{/* Timestamp */}
			<div className="px-3 pb-3">
				<p className="text-[10px] uppercase tracking-wide text-[#8E8E8E]">2 hours ago</p>
			</div>
		</div>
	);
}

function Avatar({ src, name, size }: { src: string; name: string; size: number }) {
	if (src) {
		return <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
	}
	return (
		<div className="flex items-center justify-center rounded-full bg-gradient-to-tr from-[#FCAF45] to-[#C13584] text-white font-bold" style={{ width: size, height: size, fontSize: size * 0.4 }}>
			{name.charAt(0).toUpperCase()}
		</div>
	);
}
