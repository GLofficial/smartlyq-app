import type { PreviewProps } from "./types";
import { Upload, MoreHorizontal } from "lucide-react";

export function PinterestPreview({ content, media, account, title }: PreviewProps) {
	const name = account?.name || "Your Name";

	return (
		<div className="mx-auto max-w-[340px]">
			{/* Pin card */}
			<div className="overflow-hidden rounded-2xl bg-white shadow-md">
				{/* Image */}
				<div className="relative">
					{media.length > 0 ? (
						<img src={media[0]} alt="" className="w-full object-cover" style={{ minHeight: 200, maxHeight: 400 }} />
					) : (
						<div className="flex h-[250px] items-center justify-center bg-gray-100 text-gray-400 text-sm">
							Add an image
						</div>
					)}
					{/* Overlay actions */}
					<div className="absolute top-3 right-3 flex gap-2">
						<button type="button" className="rounded-full bg-[#E60023] px-5 py-2.5 text-[16px] font-bold text-white shadow-md hover:bg-[#AD081B]">
							Save
						</button>
					</div>
					<div className="absolute bottom-3 right-3 flex gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow">
							<Upload size={16} className="text-[#111]" />
						</div>
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow">
							<MoreHorizontal size={16} className="text-[#111]" />
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="p-3">
					{title && (
						<p className="text-[16px] font-semibold text-[#111] leading-tight">{title}</p>
					)}
					{content && (
						<p className="mt-1 text-[13px] text-[#767676] line-clamp-2">{content}</p>
					)}
					{/* Author */}
					<div className="mt-3 flex items-center gap-2">
						{account?.avatar ? (
							<img src={account.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
						) : (
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFEFEF] text-[12px] font-bold text-[#111]">
								{name.charAt(0).toUpperCase()}
							</div>
						)}
						<p className="text-[13px] font-semibold text-[#111]">{name}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
