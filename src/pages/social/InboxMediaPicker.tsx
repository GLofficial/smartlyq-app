import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Upload, Check, Video } from "lucide-react";
import { useMediaList, useMediaUpload } from "@/api/media-library";
import { toast } from "sonner";

export interface MediaItem {
	url: string;
	previewUrl: string;
	type: "image" | "video";
}

// Per-item limits enforced at the platform level
// Images: max 8MB (JPEG/PNG/GIF/WebP)
// Videos: max 25MB, max ~60s recommended (MP4/MOV/WebM)
// Each media item is sent as a separate message (Messenger API limitation)
const MAX_ITEMS = 10;

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (items: MediaItem[]) => void;
}

export function InboxMediaPicker({ open, onOpenChange, onSelect }: Props) {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<Record<string, MediaItem>>({});
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { data, isLoading, refetch } = useMediaList(0, "", search, page);
	const uploadMut = useMediaUpload();

	const files = (data?.files ?? []).filter(f => f.type === "image" || f.type === "video");
	const selectedCount = Object.keys(selected).length;

	const toggleSelect = (f: typeof files[0]) => {
		setSelected(prev => {
			if (prev[f.id]) {
				const next = { ...prev };
				delete next[f.id];
				return next;
			}
			if (Object.keys(prev).length >= MAX_ITEMS) {
				toast.warning(`Max ${MAX_ITEMS} items per send.`);
				return prev;
			}
			return { ...prev, [f.id]: { url: f.url, previewUrl: f.preview_url || f.url, type: f.type as "image" | "video" } };
		});
	};

	const handleAttach = () => {
		const items = Object.values(selected);
		if (items.length === 0) return;
		onSelect(items);
		onOpenChange(false);
		setSelected({});
	};

	const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		e.target.value = "";
		uploadMut.mutate({ file }, {
			onSuccess: (res) => {
				refetch();
				if (Object.keys(selected).length < MAX_ITEMS) {
					const type: "image" | "video" = file.type.startsWith("video") ? "video" : "image";
					setSelected(prev => ({ ...prev, [String(res.id)]: { url: res.url, previewUrl: res.url, type } }));
				}
				toast.success("Uploaded.");
			},
			onError: () => toast.error("Upload failed."),
		});
	};

	const handleClose = (o: boolean) => {
		if (!o) setSelected({});
		onOpenChange(o);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Media Library</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					<div className="flex gap-2">
						<div className="relative flex-1">
							<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
							<Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search..." className="pl-9 h-9 text-sm" />
						</div>
						<Button variant="outline" size="sm" className="shrink-0" disabled={uploadMut.isPending} onClick={() => fileInputRef.current?.click()}>
							<Upload size={14} /> {uploadMut.isPending ? "Uploading…" : "Upload"}
						</Button>
						<input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm" className="hidden" onChange={handleUpload} />
					</div>
					{isLoading ? (
						<div className="flex h-48 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : files.length === 0 ? (
						<p className="py-12 text-center text-sm text-[var(--muted-foreground)]">No media in your library.</p>
					) : (
						<div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
							{files.map((f) => {
								const isSel = !!selected[f.id];
								return (
									<button key={f.id} onClick={() => toggleSelect(f)}
										className={`relative aspect-square rounded overflow-hidden border-2 transition-colors ${isSel ? "border-[var(--sq-primary)]" : "border-transparent hover:border-[var(--sq-primary)]/40"}`}>
										<img src={f.preview_url || f.url} alt={f.name} className="w-full h-full object-cover" />
										{f.type === "video" && !isSel && (
											<div className="absolute inset-0 flex items-center justify-center bg-black/30">
												<Video size={20} className="text-white" />
											</div>
										)}
										{isSel && (
											<div className="absolute inset-0 bg-[var(--sq-primary)]/20 flex items-center justify-center">
												<div className="h-6 w-6 rounded-full bg-[var(--sq-primary)] flex items-center justify-center">
													<Check size={14} className="text-white" />
												</div>
											</div>
										)}
									</button>
								);
							})}
						</div>
					)}
					<div className="flex items-center justify-between pt-1">
						<div className="flex gap-1">
							{data && data.pages > 1 && (
								<>
									<Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></Button>
									<Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></Button>
								</>
							)}
						</div>
						<p className="text-xs text-[var(--muted-foreground)] flex-1 px-2">
							{selectedCount > 0 ? `${selectedCount} selected — each sent as a separate message` : "Click to select · max 10 items"}
						</p>
						<Button disabled={selectedCount === 0} onClick={handleAttach}>
							{selectedCount > 0 ? `Attach ${selectedCount}` : "Attach"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
