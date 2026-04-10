import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Image, Video, AudioLines, FileText, LayoutGrid, List, Search, Upload, MoreHorizontal,
	Trash2, Pencil, Download, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
	useMediaList, useMediaUpload, useMediaDelete, useMediaRename, useMediaQuota,
	type MediaFile,
} from "@/api/media-library";
import { MediaLibrarySidebar } from "./media-library-sidebar";
import { toast } from "sonner";

const TYPE_FILTERS = [
	{ value: "", label: "All", icon: LayoutGrid },
	{ value: "image", label: "Images", icon: Image },
	{ value: "video", label: "Videos", icon: Video },
	{ value: "audio", label: "Audio", icon: AudioLines },
	{ value: "document", label: "Docs", icon: FileText },
];

export function MediaLibraryPage() {
	const [folder, setFolder] = useState(0);
	const [type, setType] = useState("");
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [page, setPage] = useState(1);
	const [view, setView] = useState<"grid" | "list">("grid");
	const { data, isLoading, error } = useMediaList(folder, type, search, page);
	const { data: quota, error: quotaError } = useMediaQuota();
	console.log('[MediaLibrary]', { data, isLoading, error, quota, quotaError, folder, type, search, page });
	const uploadMut = useMediaUpload();
	const fileRef = useRef<HTMLInputElement>(null);
	const [dragOver, setDragOver] = useState(false);

	const handleSearch = () => { setSearch(searchInput); setPage(1); };
	const handleTypeChange = (v: string) => { setType(v); setPage(1); };
	const handleFolderChange = (id: number) => { setFolder(id); setType(""); setSearch(""); setSearchInput(""); setPage(1); };

	const handleFiles = useCallback((files: FileList | null) => {
		if (!files) return;
		Array.from(files).forEach((file) => {
			uploadMut.mutate({ file, folder_id: folder || undefined }, {
				onSuccess: () => toast.success(`${file.name} uploaded.`),
				onError: () => toast.error(`Failed to upload ${file.name}`),
			});
		});
	}, [folder, uploadMut]);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		handleFiles(e.dataTransfer.files);
	}, [handleFiles]);

	const quotaPercent = quota?.percentage ?? 0;
	const limitDisplay = quota?.limit_mb ? (quota.limit_mb >= 1024 ? `${(quota.limit_mb / 1024).toFixed(0)} GB` : `${quota.limit_mb} MB`) : "Unlimited";
	const usedDisplay = quota ? (quota.used_mb >= 1024 ? `${(quota.used_mb / 1024).toFixed(1)} GB` : `${quota.used_mb} MB`) : "0 MB";
	const quotaText = quota ? `${usedDisplay} / ${limitDisplay} used` : "";

	return (
		<div className="flex gap-6">
			<MediaLibrarySidebar activeFolder={folder} onFolderChange={handleFolderChange} />

			<div className="flex-1 min-w-0 space-y-4">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Media Library</h1>
						{quotaText && (
							<div className="mt-1">
								<p className="text-xs text-[var(--muted-foreground)]">{quotaText} used</p>
								<div className="mt-0.5 h-1.5 w-40 rounded-full bg-[var(--muted)]">
									<div className="h-full rounded-full bg-[var(--sq-primary)] transition-all" style={{ width: `${Math.min(quotaPercent, 100)}%` }} />
								</div>
							</div>
						)}
					</div>
					<Button onClick={() => fileRef.current?.click()} disabled={uploadMut.isPending}>
						<Upload size={16} /> {uploadMut.isPending ? "Uploading..." : "Upload"}
					</Button>
				</div>

				{/* Filters + Search */}
				<div className="flex items-center justify-between gap-4">
					<div className="flex gap-1">
						{TYPE_FILTERS.map((f) => (
							<Button key={f.value} variant={type === f.value ? "default" : "outline"} size="sm" onClick={() => handleTypeChange(f.value)}>
								<f.icon size={14} /> {f.label}
							</Button>
						))}
					</div>
					<div className="flex items-center gap-2">
						<div className="relative">
							<Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
							<Input placeholder="Search files..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="h-8 w-48 pl-8 text-xs" />
						</div>
						<Button variant={view === "grid" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setView("grid")}><LayoutGrid size={14} /></Button>
						<Button variant={view === "list" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setView("list")}><List size={14} /></Button>
					</div>
				</div>

				{/* Drop zone */}
				<div
					onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
					onDragLeave={() => setDragOver(false)}
					onDrop={handleDrop}
					onClick={() => fileRef.current?.click()}
					className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 transition-colors cursor-pointer ${
						dragOver ? "border-[var(--sq-primary)] bg-[color-mix(in_srgb,var(--sq-primary)_5%,transparent)]" : "border-[var(--border)] hover:border-[var(--sq-primary)]"
					}`}
				>
					<Upload size={24} className="text-[var(--muted-foreground)]" />
					<p className="text-sm text-[var(--muted-foreground)]">Drag & drop files here or <strong>click to browse</strong></p>
					<p className="text-xs text-[var(--muted-foreground)]">Images, videos, audio, documents · Max 100 MB per file</p>
				</div>
				<input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

				{/* Files */}
				{isLoading ? <Spinner /> : !(data?.files ?? []).length ? (
					<Card><CardContent className="flex flex-col items-center gap-3 py-12">
						<Image size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No media files found.</p>
					</CardContent></Card>
				) : view === "grid" ? (
					<div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
						{data!.files.map((f) => <FileCard key={f.id} file={f} />)}
					</div>
				) : (
					<FileListView files={data!.files} />
				)}

				{/* Pagination */}
				{data && data.pages > 1 && (
					<div className="flex items-center justify-between">
						<p className="text-sm text-[var(--muted-foreground)]">Page {data.page} of {data.pages} · {data.total} files</p>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button>
							<Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function FileCard({ file }: { file: MediaFile }) {
	const deleteMut = useMediaDelete();
	const renameMut = useMediaRename();
	const [showMenu, setShowMenu] = useState(false);
	const [renaming, setRenaming] = useState(false);
	const [newName, setNewName] = useState(file.name);

	const isImage = file.type === "image" || file.mime_type?.startsWith("image/");
	const isVideo = file.type === "video" || file.mime_type?.startsWith("video/");
	const isAudio = file.type === "audio" || file.mime_type?.startsWith("audio/");
	const sizeStr = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : file.size > 0 ? `${(file.size / 1024).toFixed(1)} KB` : "";

	const handleRename = () => {
		if (!newName.trim() || newName === file.name) { setRenaming(false); return; }
		renameMut.mutate({ id: file.id, name: newName.trim() }, {
			onSuccess: () => { toast.success("Renamed."); setRenaming(false); },
		});
	};

	const handleDelete = () => {
		if (!confirm(`Delete "${file.name}"?`)) return;
		deleteMut.mutate(file.id, { onSuccess: () => toast.success("Deleted.") });
	};

	return (
		<div className="group relative">
			<a href={file.url} target="_blank" rel="noopener noreferrer">
				<div className="aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)] transition-all group-hover:border-[var(--sq-primary)]">
					{isImage ? (
						<img src={file.preview_url || file.url} alt={file.name} className="h-full w-full object-cover" loading="lazy" />
					) : isVideo && file.preview_url ? (
						<img src={file.preview_url} alt={file.name} className="h-full w-full object-cover" loading="lazy" />
					) : (
						<div className="flex h-full flex-col items-center justify-center gap-1">
							{isVideo ? <Video size={28} className="text-red-500" /> : isAudio ? <AudioLines size={28} className="text-purple-500" /> : <FileText size={28} className="text-blue-500" />}
						</div>
					)}
					{/* Type badge */}
					<span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${isImage ? "bg-green-600" : isVideo ? "bg-red-600" : "bg-blue-600"}`}>
						{file.type.toUpperCase()}
					</span>
				</div>
			</a>
			{/* Info */}
			<div className="mt-1.5 flex items-start justify-between">
				<div className="min-w-0 flex-1">
					{renaming ? (
						<Input value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={handleRename} onKeyDown={(e) => e.key === "Enter" && handleRename()} className="h-6 text-xs" autoFocus />
					) : (
						<p className="truncate text-xs font-medium">{file.name}</p>
					)}
					<p className="text-[10px] text-[var(--muted-foreground)]">{sizeStr} · {file.created_at ? new Date(file.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</p>
				</div>
				<div className="relative">
					<button onClick={() => setShowMenu(!showMenu)} className="p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"><MoreHorizontal size={14} /></button>
					{showMenu && (
						<div className="absolute right-0 top-6 z-10 w-32 rounded-md border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg">
							<button onClick={() => { setRenaming(true); setShowMenu(false); }} className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-[var(--accent)]"><Pencil size={12} /> Rename</button>
							<a href={file.url} download className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-[var(--accent)]"><Download size={12} /> Download</a>
							<button onClick={() => { handleDelete(); setShowMenu(false); }} className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-red-500 hover:bg-[var(--accent)]"><Trash2 size={12} /> Delete</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function FileListView({ files }: { files: MediaFile[] }) {
	const deleteMut = useMediaDelete();

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead><tr className="border-b border-[var(--border)]">
					<th className="py-2 text-left font-medium">Name</th>
					<th className="py-2 text-left font-medium">Type</th>
					<th className="py-2 text-left font-medium">Size</th>
					<th className="py-2 text-left font-medium">Date</th>
					<th className="py-2 text-right font-medium">Actions</th>
				</tr></thead>
				<tbody>
					{files.map((f) => (
						<tr key={f.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
							<td className="py-2"><a href={f.url} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--sq-link)] hover:underline">{f.name}</a></td>
							<td className="py-2 capitalize">{f.type}</td>
							<td className="py-2 text-[var(--muted-foreground)]">{f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${(f.size / 1024).toFixed(1)} KB`}</td>
							<td className="py-2 text-[var(--muted-foreground)]">{f.created_at ? new Date(f.created_at).toLocaleDateString() : ""}</td>
							<td className="py-2 text-right">
								<Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { if (confirm("Delete?")) deleteMut.mutate(f.id, { onSuccess: () => toast.success("Deleted.") }); }}><Trash2 size={14} /></Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function Spinner() { return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
