import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Upload } from "lucide-react";
import { useMediaList, useMediaUpload } from "@/api/media-library";
import { toast } from "sonner";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (url: string, previewUrl: string) => void;
}

export function InboxMediaPicker({ open, onOpenChange, onSelect }: Props) {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { data, isLoading, refetch } = useMediaList(0, "image", search, page);
	const uploadMut = useMediaUpload();

	const files = data?.files ?? [];

	const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		e.target.value = "";
		uploadMut.mutate({ file }, {
			onSuccess: (res) => {
				refetch();
				onSelect(res.url, res.url);
				onOpenChange(false);
				toast.success("Image uploaded and selected.");
			},
			onError: () => toast.error("Upload failed."),
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Choose from Media Library</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					<div className="flex gap-2">
						<div className="relative flex-1">
							<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
							<Input
								value={search}
								onChange={(e) => { setSearch(e.target.value); setPage(1); }}
								placeholder="Search images..."
								className="pl-9 h-9 text-sm"
							/>
						</div>
						<Button variant="outline" size="sm" className="shrink-0" disabled={uploadMut.isPending} onClick={() => fileInputRef.current?.click()}>
							<Upload size={14} /> {uploadMut.isPending ? "Uploading…" : "Upload"}
						</Button>
						<input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={handleUpload} />
					</div>
					{isLoading ? (
						<div className="flex h-48 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : files.length === 0 ? (
						<p className="py-12 text-center text-sm text-[var(--muted-foreground)]">No images in your media library.</p>
					) : (
						<div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
							{files.map((f) => (
								<button
									key={f.id}
									onClick={() => { onSelect(f.url, f.preview_url || f.url); onOpenChange(false); }}
									className="aspect-square rounded overflow-hidden border-2 border-transparent hover:border-[var(--sq-primary)] transition-colors"
								>
									<img src={f.preview_url || f.url} alt={f.name} className="w-full h-full object-cover" />
								</button>
							))}
						</div>
					)}
					{data && data.pages > 1 && (
						<div className="flex items-center justify-between pt-1">
							<span className="text-xs text-[var(--muted-foreground)]">Page {page} of {data.pages}</span>
							<div className="flex gap-1">
								<Button variant="ghost" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
									<ChevronLeft size={14} />
								</Button>
								<Button variant="ghost" size="icon" className="h-7 w-7" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>
									<ChevronRight size={14} />
								</Button>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
