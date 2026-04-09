import type { PreviewProps } from "./types";
import { CHAR_LIMITS } from "./types";
import { MessageCircle, Repeat2, Heart, BarChart3, Share, MoreHorizontal, Bookmark } from "lucide-react";

export function TwitterPreview({ content, media, account }: PreviewProps) {
	const name = account?.name || "Display Name";
	const handle = account?.username || "username";
	const avatar = account?.avatar || "";
	const limit = CHAR_LIMITS.twitter ?? 280;
	const overLimit = content.length > limit;

	return (
		<div className="mx-auto max-w-[598px] border-b border-[#EFF3F4] bg-white px-4 py-3">
			<div className="flex gap-3">
				{/* Avatar */}
				<div className="shrink-0">
					<Avatar src={avatar} name={name} size={40} />
				</div>

				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex items-center gap-1 text-[15px]">
						<span className="font-bold text-[#0F1419] truncate">{name}</span>
						<span className="text-[#536471] truncate">@{handle}</span>
						<span className="text-[#536471]">·</span>
						<span className="text-[#536471]">now</span>
						<div className="ml-auto">
							<MoreHorizontal size={18} className="text-[#536471]" />
						</div>
					</div>

					{/* Content */}
					{content && (
						<div className="mt-0.5">
							<p className="text-[15px] text-[#0F1419] whitespace-pre-wrap leading-[1.3125]">
								{overLimit ? (
									<>
										{content.slice(0, limit)}
										<span className="bg-red-100 text-red-600">{content.slice(limit)}</span>
									</>
								) : content}
							</p>
						</div>
					)}

					{/* Character counter */}
					<div className="mt-1 text-right">
						<span className={`text-[13px] ${overLimit ? "text-red-500 font-medium" : "text-[#536471]"}`}>
							{content.length}/{limit}
						</span>
					</div>

					{/* Media */}
					{media.length > 0 && (
						<div className="mt-3 overflow-hidden rounded-2xl border border-[#EFF3F4]">
							{media.length === 1 ? (
								<img src={media[0]} alt="" className="w-full max-h-[286px] object-cover" />
							) : (
								<div className="grid grid-cols-2 gap-[2px]">
									{media.slice(0, 4).map((url, i) => (
										<div key={url} className="relative aspect-[4/3] overflow-hidden">
											<img src={url} alt="" className="h-full w-full object-cover" />
											{i === 3 && media.length > 4 && (
												<div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-lg font-bold">
													+{media.length - 4}
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{/* Actions */}
					<div className="mt-3 flex items-center justify-between max-w-[425px]">
						<TwAction icon={MessageCircle} count="2" />
						<TwAction icon={Repeat2} count="5" />
						<TwAction icon={Heart} count="18" />
						<TwAction icon={BarChart3} count="1.2K" />
						<div className="flex items-center gap-3">
							<Bookmark size={16} className="text-[#536471] cursor-pointer hover:text-[#1D9BF0]" />
							<Share size={16} className="text-[#536471] cursor-pointer hover:text-[#1D9BF0]" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function TwAction({ icon: Icon, count }: { icon: React.ElementType; count: string }) {
	return (
		<button type="button" className="group flex items-center gap-1.5 text-[#536471] hover:text-[#1D9BF0]">
			<div className="rounded-full p-1.5 group-hover:bg-[#1D9BF01A]">
				<Icon size={16} />
			</div>
			<span className="text-[13px]">{count}</span>
		</button>
	);
}

function Avatar({ src, name, size }: { src: string; name: string; size: number }) {
	if (src) {
		return <img src={src} alt={name} className="rounded-full object-cover" style={{ width: size, height: size }} />;
	}
	return (
		<div className="flex items-center justify-center rounded-full bg-[#1D9BF0] text-white font-bold" style={{ width: size, height: size, fontSize: size * 0.4 }}>
			{name.charAt(0).toUpperCase()}
		</div>
	);
}
