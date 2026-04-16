import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ImagePlus, Video, X, GripVertical, Play } from "lucide-react";

export interface MediaItem {
	id: string;
	url: string;
	type: "image" | "video";
	name?: string;
}

interface MediaManagerProps {
	media: MediaItem[];
	onMediaChange: (media: MediaItem[]) => void;
	maxFiles?: number;
}

export function PostMediaManager({ media, onMediaChange, maxFiles = 10 }: MediaManagerProps) {
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [uploadType, setUploadType] = useState<"image" | "video">("image");
	const fileRef = useRef<HTMLInputElement>(null);

	function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const files = e.target.files;
		if (!files) return;
		const newMedia: MediaItem[] = [];
		for (let i = 0; i < files.length && media.length + newMedia.length < maxFiles; i++) {
			const file = files[i]!;
			const url = URL.createObjectURL(file);
			const type = file.type.startsWith("video") ? "video" : "image";
			newMedia.push({ id: `${Date.now()}-${i}`, url, type, name: file.name });
		}
		onMediaChange([...media, ...newMedia]);
		setUploadDialogOpen(false);
		if (fileRef.current) fileRef.current.value = "";
	}

	function removeMedia(id: string) {
		onMediaChange(media.filter((m) => m.id !== id));
	}

	if (media.length === 0) return null;

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
					Media ({media.length}/{maxFiles})
				</p>
				{media.length < maxFiles && (
					<div className="flex gap-1">
						<Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => { setUploadType("image"); setUploadDialogOpen(true); }}>
							<ImagePlus size={12} /> Add Image
						</Button>
						<Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => { setUploadType("video"); setUploadDialogOpen(true); }}>
							<Video size={12} /> Add Video
						</Button>
					</div>
				)}
			</div>

			{/* Media grid */}
			<div className="flex gap-2 overflow-x-auto pb-1">
				{media.map((item) => (
					<div key={item.id} className="relative shrink-0 group">
						<div className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--muted)]">
							{item.type === "video" ? (
								<div className="w-full h-full flex items-center justify-center bg-black/80">
									<Play size={20} className="text-white" />
								</div>
							) : (
								<img src={item.url} alt={item.name || ""} className="w-full h-full object-cover" />
							)}
						</div>
						{/* Remove button */}
						<button onClick={() => removeMedia(item.id)}
							className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
							<X size={10} />
						</button>
						{/* Drag handle */}
						<div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-70 transition-opacity">
							<GripVertical size={12} className="text-white drop-shadow" />
						</div>
						{/* Type badge */}
						{item.type === "video" && (
							<span className="absolute top-1 left-1 bg-black/60 text-white text-[8px] px-1 rounded">VIDEO</span>
						)}
					</div>
				))}
			</div>

			{/* Upload dialog */}
			<Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
				<DialogContent className="max-w-sm">
					<DialogHeader><DialogTitle>Upload {uploadType === "image" ? "Image" : "Video"}</DialogTitle></DialogHeader>
					<div className="space-y-4">
						<div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center cursor-pointer hover:bg-[var(--muted)]/30 transition-colors"
							onClick={() => fileRef.current?.click()}>
							{uploadType === "image" ? <ImagePlus size={32} className="mx-auto text-[var(--muted-foreground)] mb-2" /> : <Video size={32} className="mx-auto text-[var(--muted-foreground)] mb-2" />}
							<p className="text-sm text-[var(--foreground)]">Click to select {uploadType === "image" ? "images" : "a video"}</p>
							<p className="text-xs text-[var(--muted-foreground)] mt-1">
								{uploadType === "image" ? "JPG, PNG, GIF, WebP (max 10MB)" : "MP4, MOV, WebM (max 100MB)"}
							</p>
						</div>
						<input ref={fileRef} type="file" accept={uploadType === "image" ? "image/*" : "video/*"}
							multiple={uploadType === "image"} onChange={handleFileSelect} className="hidden" />
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

/* ── Toolbar Media Buttons (used in content editor toolbar) ─────── */

interface MediaToolbarProps {
	onImageClick: () => void;
	onVideoClick: () => void;
}

export function MediaToolbarButtons({ onImageClick, onVideoClick }: MediaToolbarProps) {
	return (
		<>
			<button onClick={onImageClick} className="p-1.5 rounded hover:bg-[var(--muted)] transition-colors" title="Upload Image">
				<ImagePlus size={16} className="text-[var(--muted-foreground)]" />
			</button>
			<button onClick={onVideoClick} className="p-1.5 rounded hover:bg-[var(--muted)] transition-colors" title="Upload Video">
				<Video size={16} className="text-[var(--muted-foreground)]" />
			</button>
		</>
	);
}
