import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import type { MediaFile } from "@/api/media-library";

interface Props {
	file: MediaFile;
	onClose: () => void;
}

export function MediaPreviewModal({ file, onClose }: Props) {
	const isImage = file.type === "image" || file.mime_type?.startsWith("image/");
	const isVideo = file.type === "video" || file.mime_type?.startsWith("video/");
	const isAudio = file.type === "audio" || file.mime_type?.startsWith("audio/");
	const isPdf = file.mime_type === "application/pdf" || file.file_name?.endsWith(".pdf");
	const sizeStr = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : file.size > 0 ? `${(file.size / 1024).toFixed(1)} KB` : "";
	const dateStr = file.created_at ? new Date(file.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
			<div className="relative max-h-[90vh] max-w-[90vw] w-full max-w-4xl rounded-xl bg-[var(--card)] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
					<p className="truncate text-sm font-medium">{file.name || file.file_name || "Untitled"}</p>
					<div className="flex items-center gap-2">
						<a href={file.url} download>
							<Button variant="ghost" size="icon" className="h-8 w-8"><Download size={16} /></Button>
						</a>
						<Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X size={16} /></Button>
					</div>
				</div>

				{/* Content */}
				<div className="flex items-center justify-center bg-black/5 min-h-[300px] max-h-[70vh] overflow-auto">
					{isVideo ? (
						<video src={file.url} controls autoPlay className="max-h-[70vh] max-w-full" />
					) : isImage ? (
						<img src={file.url} alt={file.name} className="max-h-[70vh] max-w-full object-contain" />
					) : isAudio ? (
						<div className="flex flex-col items-center gap-4 py-12">
							<div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
								<span className="text-2xl">🎵</span>
							</div>
							<audio src={file.url} controls autoPlay className="w-80" />
						</div>
					) : isPdf ? (
						<iframe src={file.url} className="h-[70vh] w-full" title={file.name} />
					) : (
						<div className="flex flex-col items-center gap-3 py-12">
							<p className="text-sm text-[var(--muted-foreground)]">Preview not available for this file type.</p>
							<a href={file.url} download><Button size="sm"><Download size={14} /> Download</Button></a>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-center gap-3 border-t border-[var(--border)] px-5 py-2 text-xs text-[var(--muted-foreground)]">
					<span>{file.type.toUpperCase()}</span>
					{sizeStr && <><span>·</span><span>{sizeStr}</span></>}
					{dateStr && <><span>·</span><span>{dateStr}</span></>}
				</div>
			</div>
		</div>
	);
}
