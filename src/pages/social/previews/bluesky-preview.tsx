import type { PreviewProps } from "./types";
import { CHAR_LIMITS } from "./types";
import { Heart, MessageCircle, Repeat2, MoreHorizontal } from "lucide-react";

export function BlueskyPreview({ content, media, account }: PreviewProps) {
	const name = account?.name || "Display Name";
	const handle = account?.username || "handle.bsky.social";
	const avatar = account?.avatar || "";
	const limit = CHAR_LIMITS.bluesky ?? 300;
	const overLimit = content.length > limit;

	return (
		<div className="mx-auto max-w-[500px] border-b border-[#E4E6EB] bg-white px-4 py-3">
			<div className="flex gap-2.5">
				{avatar ? (
					<img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
				) : (
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0085FF] text-white text-sm font-bold">
						{name.charAt(0).toUpperCase()}
					</div>
				)}

				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex items-center gap-1 text-[14px]">
						<span className="font-bold text-[#1B1B1B] truncate">{name}</span>
						<span className="text-[#787C7E] truncate">@{handle}</span>
						<span className="text-[#787C7E]">·</span>
						<span className="text-[#787C7E]">now</span>
						<div className="ml-auto">
							<MoreHorizontal size={16} className="text-[#787C7E]" />
						</div>
					</div>

					{/* Content */}
					{content && (
						<p className="mt-1 text-[15px] text-[#1B1B1B] whitespace-pre-wrap leading-[1.4]">
							{overLimit ? (
								<>
									{content.slice(0, limit)}
									<span className="bg-red-100 text-red-600">{content.slice(limit)}</span>
								</>
							) : content}
						</p>
					)}

					{/* Character counter */}
					{content && (
						<p className={`mt-0.5 text-right text-[12px] ${overLimit ? "text-red-500" : "text-[#787C7E]"}`}>
							{content.length}/{limit}
						</p>
					)}

					{/* Media */}
					{media.length > 0 && (
						<div className="mt-2 overflow-hidden rounded-xl border border-[#E4E6EB]">
							<img src={media[0]} alt="" className="w-full max-h-[300px] object-cover" />
						</div>
					)}

					{/* Actions */}
					<div className="mt-2 flex items-center gap-6 text-[#787C7E]">
						<BsAction icon={MessageCircle} count="2" />
						<BsAction icon={Repeat2} count="5" />
						<BsAction icon={Heart} count="12" />
						<MoreHorizontal size={16} className="cursor-pointer hover:text-[#0085FF]" />
					</div>
				</div>
			</div>
		</div>
	);
}

function BsAction({ icon: Icon, count }: { icon: React.ElementType; count: string }) {
	return (
		<button type="button" className="flex items-center gap-1 text-[13px] text-[#787C7E] hover:text-[#0085FF]">
			<Icon size={16} />
			<span>{count}</span>
		</button>
	);
}
