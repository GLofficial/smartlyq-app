import type { PreviewProps } from "./types";
import { Eye, Check } from "lucide-react";

export function TelegramPreview({ content, media, account }: PreviewProps) {
	const channelName = account?.name || "Channel Name";
	const avatar = account?.avatar || "";

	return (
		<div className="mx-auto max-w-[420px] rounded-lg bg-[#E8F5E9] p-2">
			{/* Channel header */}
			<div className="flex items-center gap-2 rounded-t-lg bg-white px-3 py-2 shadow-sm">
				{avatar ? (
					<img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
				) : (
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2AABEE] text-white text-xs font-bold">
						{channelName.charAt(0).toUpperCase()}
					</div>
				)}
				<div>
					<p className="text-[14px] font-semibold text-[#000]">{channelName}</p>
					<p className="text-[11px] text-[#999]">1,234 subscribers</p>
				</div>
			</div>

			{/* Message bubble */}
			<div className="mt-1 rounded-lg bg-white px-3 py-2 shadow-sm">
				{/* Media */}
				{media.length > 0 && (
					<div className="mb-2 -mx-3 -mt-2">
						<img src={media[0]} alt="" className="w-full rounded-t-lg object-cover max-h-[300px]" />
					</div>
				)}

				{/* Content */}
				{content && (
					<p className="text-[14px] text-[#000] leading-[1.5] whitespace-pre-wrap">{content}</p>
				)}

				{/* Footer */}
				<div className="mt-1.5 flex items-center justify-end gap-1.5">
					<div className="flex items-center gap-1 text-[11px] text-[#999]">
						<Eye size={12} />
						<span>2.4K</span>
					</div>
					<span className="text-[11px] text-[#999]">
						{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
					</span>
					<div className="flex">
						<Check size={12} className="text-[#4DCA5C] -mr-1.5" />
						<Check size={12} className="text-[#4DCA5C]" />
					</div>
				</div>
			</div>
		</div>
	);
}
