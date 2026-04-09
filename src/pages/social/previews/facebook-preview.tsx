import type { PreviewProps } from "./types";
import { Globe, ThumbsUp, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

export function FacebookPreview({ content, media, account }: PreviewProps) {
	const name = account?.name || "Your Name";
	const avatar = account?.avatar || "";

	return (
		<div className="mx-auto max-w-[500px] rounded-lg border border-gray-200 bg-white shadow-sm">
			{/* Header */}
			<div className="flex items-center gap-3 p-3 pb-2">
				<Avatar src={avatar} name={name} size={40} />
				<div className="flex-1 min-w-0">
					<p className="text-[14px] font-semibold text-[#050505]">{name}</p>
					<div className="flex items-center gap-1 text-[12px] text-[#65676B]">
						<span>Just now</span>
						<span>·</span>
						<Globe size={12} />
					</div>
				</div>
				<button type="button" className="p-1 text-[#65676B]">
					<MoreHorizontal size={20} />
				</button>
			</div>

			{/* Content */}
			{content && (
				<div className="px-4 pb-2">
					<p className="text-[15px] text-[#050505] whitespace-pre-wrap leading-[1.3333]">
						{content.length > 400 ? (
							<>
								{content.slice(0, 400)}...
								<span className="text-[#0064D1] cursor-pointer"> See more</span>
							</>
						) : content}
					</p>
				</div>
			)}

			{/* Media */}
			{media.length > 0 && (
				<div className="mt-1">
					{media.length === 1 ? (
						<img src={media[0]} alt="" className="w-full object-cover max-h-[500px]" />
					) : (
						<div className="grid grid-cols-2 gap-[2px]">
							{media.slice(0, 4).map((url, i) => (
								<div key={url} className="relative aspect-square overflow-hidden">
									<img src={url} alt="" className="h-full w-full object-cover" />
									{i === 3 && media.length > 4 && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-2xl font-bold">
											+{media.length - 4}
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Reactions */}
			<div className="flex items-center justify-between px-4 py-2 text-[13px] text-[#65676B]">
				<div className="flex items-center gap-1">
					<div className="flex -space-x-1">
						<span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#0866FF] text-[10px]">👍</span>
						<span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#F0284A] text-[10px]">❤️</span>
					</div>
					<span>24</span>
				</div>
				<div className="flex gap-3">
					<span>3 comments</span>
					<span>1 share</span>
				</div>
			</div>

			{/* Divider */}
			<div className="mx-4 border-t border-gray-200" />

			{/* Actions */}
			<div className="flex items-center justify-around py-1">
				<ActionButton icon={ThumbsUp} label="Like" />
				<ActionButton icon={MessageCircle} label="Comment" />
				<ActionButton icon={Share2} label="Share" />
			</div>
		</div>
	);
}

function ActionButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
	return (
		<button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-[14px] font-semibold text-[#65676B] hover:bg-gray-100">
			<Icon size={18} />
			<span>{label}</span>
		</button>
	);
}

function Avatar({ src, name, size }: { src: string; name: string; size: number }) {
	if (src) {
		return <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
	}
	return (
		<div className="flex items-center justify-center rounded-full bg-[#0866FF] text-white font-bold" style={{ width: size, height: size, fontSize: size * 0.4 }}>
			{name.charAt(0).toUpperCase()}
		</div>
	);
}
