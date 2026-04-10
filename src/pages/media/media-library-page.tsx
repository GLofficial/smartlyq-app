import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Image, Video, AudioLines, FileText, FileSpreadsheet, FileIcon, LayoutGrid, List, Search,
	Upload, MoreHorizontal, Trash2, Pencil, Download, ChevronLeft, ChevronRight, X,
	ShoppingCart, FolderInput, FolderX, Eye,
} from "lucide-react";
import {
	useMediaList, useMediaUpload, useMediaDelete, useMediaRename, useMediaMove, useMediaQuota, useMediaFolders,
	type MediaFile,
} from "@/api/media-library";
import { MediaLibrarySidebar } from "./media-library-sidebar";
import { MediaPreviewModal } from "./media-preview-modal";
import { toast } from "sonner";

const TYPE_FILTERS = [
	{ value: "", label: "All", icon: LayoutGrid },
	{ value: "image", label: "Images", icon: Image },
	{ value: "video", label: "Videos", icon: Video },
	{ value: "audio", label: "Audio", icon: AudioLines },
	{ value: "document", label: "Docs", icon: FileText },
];

const DOC_ICONS: Record<string, React.ElementType> = {
	"application/pdf": FileText, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": FileSpreadsheet,
	"application/vnd.ms-excel": FileSpreadsheet, "text/csv": FileSpreadsheet,
};

export function MediaLibraryPage() {
	const [folder, setFolder] = useState(0);
	const [type, setType] = useState("");
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");
	const [page, setPage] = useState(1);
	const [view, setView] = useState<"grid" | "list">("grid");
	const [showUpload, setShowUpload] = useState(false);
	const [showBuyStorage, setShowBuyStorage] = useState(false);
	const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
	const { data, isLoading } = useMediaList(folder, type, search, page);
	const { data: quota } = useMediaQuota();
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
	const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }, [handleFiles]);

	const limitDisplay = quota?.limit_mb ? (quota.limit_mb >= 1024 ? `${(quota.limit_mb / 1024).toFixed(0)} GB` : `${quota.limit_mb} MB`) : "Unlimited";
	const usedDisplay = quota ? (quota.used_mb >= 1024 ? `${(quota.used_mb / 1024).toFixed(1)} GB` : `${quota.used_mb} MB`) : "0 MB";

	return (
		<div className="flex gap-6">
			<MediaLibrarySidebar activeFolder={folder} onFolderChange={handleFolderChange} />
			<div className="flex-1 min-w-0 space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Media Library</h1>
						<div className="mt-1">
							<p className="text-xs text-[var(--muted-foreground)]">{usedDisplay} / {limitDisplay} used</p>
							<div className="mt-0.5 h-1.5 w-40 rounded-full bg-[var(--muted)]"><div className="h-full rounded-full bg-[var(--sq-primary)] transition-all" style={{ width: `${Math.min(quota?.percentage ?? 0, 100)}%` }} /></div>
						</div>
					</div>
					<div className="flex gap-2">
						{quota?.extra_price_yearly ? <Button variant="outline" size="sm" onClick={() => setShowBuyStorage(true)}><ShoppingCart size={14} /> Add Storage</Button> : null}
						<Button onClick={() => setShowUpload(!showUpload)} disabled={uploadMut.isPending}><Upload size={16} /> {uploadMut.isPending ? "Uploading..." : "Upload"}</Button>
					</div>
				</div>
				{showBuyStorage && quota && <BuyStorageDialog quota={quota} onClose={() => setShowBuyStorage(false)} />}
				<div className="flex items-center justify-between gap-4">
					<div className="flex gap-1">{TYPE_FILTERS.map((f) => <Button key={f.value} variant={type === f.value ? "default" : "outline"} size="sm" onClick={() => handleTypeChange(f.value)}><f.icon size={14} /> {f.label}</Button>)}</div>
					<div className="flex items-center gap-2">
						<div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" /><Input placeholder="Search files..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="h-8 w-48 pl-8 text-xs" /></div>
						<Button variant={view === "grid" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setView("grid")}><LayoutGrid size={14} /></Button>
						<Button variant={view === "list" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setView("list")}><List size={14} /></Button>
					</div>
				</div>
				{showUpload && (
					<div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()}
						className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-8 transition-colors cursor-pointer ${dragOver ? "border-[var(--sq-primary)] bg-[color-mix(in_srgb,var(--sq-primary)_5%,transparent)]" : "border-[var(--border)] hover:border-[var(--sq-primary)]"}`}>
						<Upload size={24} className="text-[var(--muted-foreground)]" /><p className="text-sm text-[var(--muted-foreground)]">Drag & drop files here or <strong>click to browse</strong></p>
						<p className="text-xs text-[var(--muted-foreground)]">Images, videos, audio, documents · Max 100 MB per file</p>
					</div>
				)}
				<input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
				{isLoading ? <Spinner /> : !(data?.files ?? []).length ? (
					<Card><CardContent className="flex flex-col items-center gap-3 py-12"><Image size={48} className="text-[var(--muted-foreground)]" /><p className="text-[var(--muted-foreground)]">No media files found.</p></CardContent></Card>
				) : view === "grid" ? (
					<div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">{data!.files.map((f) => <FileCard key={f.id} file={f} onPreview={setPreviewFile} />)}</div>
				) : <FileListView files={data!.files} onPreview={setPreviewFile} />}
				{data && data.pages > 1 && (
					<div className="flex items-center justify-between">
						<p className="text-sm text-[var(--muted-foreground)]">Page {data.page} of {data.pages} · {data.total} files</p>
						<div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button><Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button></div>
					</div>
				)}
			</div>
			{previewFile && <MediaPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
		</div>
	);
}

function BuyStorageDialog({ quota, onClose }: { quota: { extra_price_yearly?: number; currency?: string }; onClose: () => void }) {
	const [gb, setGb] = useState(1);
	const [loading, setLoading] = useState(false);
	const price = quota.extra_price_yearly ?? 96;
	const cur = quota.currency ?? "EUR";

	const handlePurchase = async () => {
		setLoading(true);
		try {
			const res = await import("@/lib/api-client").then(m => m.apiClient.post<{ checkout_url: string }>("/api/spa/media/buy-storage", { gb }));
			if (res.checkout_url) window.location.href = res.checkout_url;
		} catch (e) {
			toast.error((e as { error?: string })?.error ?? "Purchase failed.");
			setLoading(false);
		}
	};

	return (
		<Card className="border-[var(--sq-primary)]/20"><CardContent className="py-6 space-y-4 max-w-sm mx-auto text-center">
			<div className="flex items-center justify-between"><h3 className="text-lg font-bold">Buy Extra Storage</h3><Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}><X size={16} /></Button></div>
			<p className="text-sm text-[var(--muted-foreground)]">Add storage in 1 GB increments. Billed annually.</p>
			<p className="text-sm text-[var(--muted-foreground)]">{cur} {price.toFixed(2)} per GB / year</p>
			<div className="flex items-center justify-center gap-3"><span className="text-sm font-medium">How many GB?</span><Input type="number" min={1} max={100} value={gb} onChange={(e) => setGb(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 text-center" /></div>
			<p className="text-lg font-bold">Total: {cur} {(gb * price).toFixed(2)} / yr</p>
			<Button className="w-full" onClick={handlePurchase} disabled={loading}>{loading ? "Redirecting to payment..." : "Purchase"}</Button>
		</CardContent></Card>
	);
}

function FileCard({ file, onPreview }: { file: MediaFile; onPreview: (f: MediaFile) => void }) {
	const deleteMut = useMediaDelete();
	const renameMut = useMediaRename();
	const moveMut = useMediaMove();
	const { data: foldersData } = useMediaFolders();
	const folders = foldersData?.folders ?? [];
	const [showMenu, setShowMenu] = useState(false);
	const [showMove, setShowMove] = useState(false);
	const [renaming, setRenaming] = useState(false);
	const [newName, setNewName] = useState(file.name);
	const isImage = file.type === "image" || file.mime_type?.startsWith("image/");
	const isVideo = file.type === "video" || file.mime_type?.startsWith("video/");
	const isAudio = file.type === "audio" || file.mime_type?.startsWith("audio/");
	const isDoc = file.type === "document";
	const isPdf = file.mime_type === "application/pdf" || file.file_name?.toLowerCase().endsWith(".pdf");
	const ext = file.file_name?.split(".").pop()?.toUpperCase() ?? "";
	const sizeStr = file.size > 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : file.size > 0 ? `${(file.size / 1024).toFixed(1)} KB` : "";
	const DocIcon = (isDoc && DOC_ICONS[file.mime_type]) || FileIcon;

	// Pollo.ai videos expire after 14 days
	let expiresIn: number | null = null;
	if (file.provider === "pollo" && file.created_at) {
		const created = new Date(file.created_at).getTime();
		const expireDate = created + 14 * 24 * 60 * 60 * 1000;
		const daysLeft = Math.ceil((expireDate - Date.now()) / (24 * 60 * 60 * 1000));
		expiresIn = daysLeft > 0 ? daysLeft : 0;
	}

	const handleDownload = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			const res = await fetch(file.url);
			const blob = await res.blob();
			const a = document.createElement("a");
			a.href = URL.createObjectURL(blob);
			a.download = file.file_name || file.name || "download";
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(a.href);
		} catch { window.open(file.url, "_blank"); }
	};

	return (
		<div className="group relative">
			<div className="relative cursor-pointer" onClick={() => onPreview(file)}>
				<div className="aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)] transition-all group-hover:border-[var(--sq-primary)]">
					{isImage ? <img src={file.preview_url || file.url} alt={file.name} className="h-full w-full object-cover" loading="lazy" />
					: isVideo && file.preview_url && !file.preview_url.endsWith(".mp4") && !file.preview_url.endsWith(".MP4") && file.preview_url !== file.url ? <img src={file.preview_url} alt={file.name} className="h-full w-full object-cover" loading="lazy" />
					: isVideo ? <video src={file.url} muted preload="metadata" className="h-full w-full object-cover" />
					: isPdf ? <div className="relative h-full w-full overflow-hidden bg-white"><object data={file.url + "#page=1&view=FitH"} type="application/pdf" className="pointer-events-none h-[200%] w-[200%] origin-top-left scale-50"><DocIcon size={28} className="text-blue-500" /></object></div>
					: <div className="flex h-full flex-col items-center justify-center gap-2">
						{isAudio ? <AudioLines size={28} className="text-purple-500" /> : <DocIcon size={28} className="text-blue-500" />}
						{ext && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{ext}</span>}
					</div>}
					{/* Hover overlay with Preview + Download buttons */}
					<div className="absolute inset-0 flex items-center justify-center gap-3 rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
						<button onClick={(e) => { e.stopPropagation(); onPreview(file); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition-colors" title="Preview">
							<Eye size={18} className="text-gray-700" />
						</button>
						<button onClick={handleDownload} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white transition-colors" title="Download">
							<Download size={18} className="text-gray-700" />
						</button>
					</div>
					<span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${isImage ? "bg-green-600" : isVideo ? "bg-red-600" : isAudio ? "bg-purple-600" : "bg-blue-600"}`}>{file.type.toUpperCase()}</span>
					{expiresIn !== null && (
						<span className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${expiresIn <= 3 ? "bg-red-600" : expiresIn <= 7 ? "bg-orange-500" : "bg-yellow-500"}`}>
							{expiresIn <= 0 ? "Expired" : `Expires in ${expiresIn}d`}
						</span>
					)}
				</div>
			</div>
			<div className="mt-1.5 flex items-start justify-between">
				<div className="min-w-0 flex-1">
					{renaming ? <Input value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={() => { if (newName.trim() && newName !== file.name) renameMut.mutate({ id: file.id, name: newName.trim() }, { onSuccess: () => { toast.success("Renamed."); setRenaming(false); } }); else setRenaming(false); }} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} className="h-6 text-xs" autoFocus />
					: <p className="truncate text-xs font-medium">{file.name || file.file_name || "Untitled"}</p>}
					<p className="text-[10px] text-[var(--muted-foreground)]">{sizeStr}{sizeStr && file.created_at ? " · " : ""}{file.created_at ? new Date(file.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</p>
				</div>
				<div className="relative">
					<button onClick={() => { setShowMenu(!showMenu); setShowMove(false); }} className="p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"><MoreHorizontal size={14} /></button>
					{showMenu && (
						<div className="absolute right-0 top-6 z-10 w-44 rounded-md border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg">
							<button onClick={() => { setRenaming(true); setShowMenu(false); }} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-[var(--accent)]"><Pencil size={12} /> Rename</button>
							<button onClick={() => setShowMove(!showMove)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-[var(--accent)]"><FolderInput size={12} /> Move to... {showMove ? "▴" : "▾"}</button>
							{showMove && <div className="ml-4 space-y-0.5 border-l border-[var(--border)] pl-2 py-1">
								<button onClick={() => { moveMut.mutate({ id: file.id, folder_id: "" }, { onSuccess: () => { toast.success("Moved."); setShowMenu(false); } }); }} className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-[var(--accent)]"><FolderX size={12} /> No Collection</button>
								{folders.map((f) => <button key={f.id} onClick={() => { moveMut.mutate({ id: file.id, folder_id: String(f.id) }, { onSuccess: () => { toast.success("Moved."); setShowMenu(false); } }); }} className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-[var(--accent)]">📁 {f.name}</button>)}
							</div>}
							<a href={file.url} download className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-[var(--accent)]"><Download size={12} /> Download</a>
							<button onClick={() => { if (confirm(`Delete "${file.name}"?`)) deleteMut.mutate(file.id, { onSuccess: () => toast.success("Deleted.") }); setShowMenu(false); }} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-red-500 hover:bg-[var(--accent)]"><Trash2 size={12} /> Delete</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function FileListView({ files, onPreview }: { files: MediaFile[]; onPreview: (f: MediaFile) => void }) {
	const deleteMut = useMediaDelete();
	return (
		<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-[var(--border)]">
			<th className="py-2 text-left font-medium">Name</th><th className="py-2 text-left font-medium">Type</th>
			<th className="py-2 text-left font-medium">Size</th><th className="py-2 text-left font-medium">Date</th>
			<th className="py-2 text-right font-medium">Actions</th>
		</tr></thead><tbody>{files.map((f) => (
			<tr key={f.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
				<td className="py-2"><button onClick={() => onPreview(f)} className="font-medium text-[var(--sq-link)] hover:underline">{f.name || f.file_name || "Untitled"}</button></td>
				<td className="py-2 capitalize">{f.type}</td>
				<td className="py-2 text-[var(--muted-foreground)]">{f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${(f.size / 1024).toFixed(1)} KB`}</td>
				<td className="py-2 text-[var(--muted-foreground)]">{f.created_at ? new Date(f.created_at).toLocaleDateString() : ""}</td>
				<td className="py-2 text-right"><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { if (confirm("Delete?")) deleteMut.mutate(f.id, { onSuccess: () => toast.success("Deleted.") }); }}><Trash2 size={14} /></Button></td>
			</tr>
		))}</tbody></table></div>
	);
}

function Spinner() { return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
