import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Video, AudioLines, ChevronLeft, ChevronRight, FileIcon } from "lucide-react";
import { useMedia } from "@/api/general";

const FILTERS = [
	{ value: "", label: "All", icon: FileIcon },
	{ value: "image", label: "Images", icon: Image },
	{ value: "video", label: "Videos", icon: Video },
	{ value: "audio", label: "Audio", icon: AudioLines },
];

export function MediaLibraryPage() {
	const [type, setType] = useState("");
	const [page, setPage] = useState(1);
	const { data, isLoading } = useMedia(type || undefined, page);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Media Library</h1>
				<span className="text-sm text-[var(--muted-foreground)]">
					{data ? `${data.total} files` : ""}
				</span>
			</div>

			<div className="flex gap-2">
				{FILTERS.map((f) => (
					<Button
						key={f.value}
						variant={type === f.value ? "default" : "outline"}
						size="sm"
						onClick={() => { setType(f.value); setPage(1); }}
					>
						<f.icon size={14} /> {f.label}
					</Button>
				))}
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !data?.items.length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12">
						<Image size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No media files found.</p>
					</CardContent>
				</Card>
			) : (
				<>
					<div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
						{data.items.map((item) => (
							<a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="group">
								<div className="aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)] transition-all group-hover:border-[var(--sq-primary)]">
									{item.content_type.startsWith("image/") ? (
										<img src={item.thumb_url} alt={item.filename} className="h-full w-full object-cover" />
									) : item.content_type.startsWith("video/") ? (
										<div className="flex h-full items-center justify-center">
											<Video size={32} className="text-[var(--muted-foreground)]" />
										</div>
									) : (
										<div className="flex h-full items-center justify-center">
											<FileIcon size={32} className="text-[var(--muted-foreground)]" />
										</div>
									)}
								</div>
								<p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">{item.filename}</p>
							</a>
						))}
					</div>

					{data.pages > 1 && (
						<div className="flex items-center justify-between">
							<p className="text-sm text-[var(--muted-foreground)]">Page {data.page} of {data.pages}</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
									<ChevronLeft size={16} />
								</Button>
								<Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
									<ChevronRight size={16} />
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
