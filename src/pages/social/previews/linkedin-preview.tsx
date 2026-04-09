import type { PreviewProps } from "./types";
import { Globe, ThumbsUp, MessageCircle, Repeat2, Send, MoreHorizontal } from "lucide-react";

export function LinkedinPreview({ content, media, account }: PreviewProps) {
	const name = account?.name || "Your Name";
	const avatar = account?.avatar || "";

	return (
		<div className="mx-auto max-w-[550px] rounded-lg border border-[#E0DFDC] bg-white shadow-sm">
			{/* Header */}
			<div className="flex items-start gap-2 p-3 pb-1">
				<Avatar src={avatar} name={name} size={48} />
				<div className="flex-1 min-w-0">
					<p className="text-[14px] font-semibold text-[#000000E6]">{name}</p>
					<p className="text-[12px] text-[#00000099] leading-tight">Software Engineer at Company</p>
					<div className="flex items-center gap-1 text-[12px] text-[#00000099]">
						<span>Just now</span>
						<span>·</span>
						<Globe size={12} />
					</div>
				</div>
				<button type="button" className="p-1 text-[#00000099]">
					<MoreHorizontal size={20} />
				</button>
			</div>

			{/* Content */}
			{content && (
				<div className="px-4 py-2">
					<p className="text-[14px] text-[#000000E6] whitespace-pre-wrap leading-[1.4]">
						{content.length > 300 ? (
							<>
								{content.slice(0, 300)}
								<span className="text-[#0A66C2] cursor-pointer font-medium">...see more</span>
							</>
						) : content}
					</p>
				</div>
			)}

			{/* Media */}
			{media.length > 0 && (
				<div className="mt-1">
					<img src={media[0]} alt="" className="w-full object-cover max-h-[400px]" />
				</div>
			)}

			{/* Reactions */}
			<div className="flex items-center justify-between px-4 py-2 text-[12px] text-[#00000099]">
				<div className="flex items-center gap-1">
					<div className="flex -space-x-1">
						<span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#0A66C2] text-[8px]">👍</span>
						<span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#DF704D] text-[8px]">❤️</span>
						<span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#7FC15E] text-[8px]">👏</span>
					</div>
					<span>42</span>
				</div>
				<span>5 comments · 2 reposts</span>
			</div>

			{/* Divider */}
			<div className="mx-4 border-t border-[#E0DFDC]" />

			{/* Actions */}
			<div className="flex items-center justify-around py-1 px-2">
				<LiAction icon={ThumbsUp} label="Like" />
				<LiAction icon={MessageCircle} label="Comment" />
				<LiAction icon={Repeat2} label="Repost" />
				<LiAction icon={Send} label="Send" />
			</div>
		</div>
	);
}

function LiAction({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
	return (
		<button type="button" className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2.5 text-[12px] font-semibold text-[#00000099] hover:bg-[#F3F2EF]">
			<Icon size={16} />
			<span>{label}</span>
		</button>
	);
}

function Avatar({ src, name, size }: { src: string; name: string; size: number }) {
	if (src) {
		return <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
	}
	return (
		<div className="flex items-center justify-center rounded-full bg-[#0A66C2] text-white font-bold" style={{ width: size, height: size, fontSize: size * 0.35 }}>
			{name.charAt(0).toUpperCase()}
		</div>
	);
}
