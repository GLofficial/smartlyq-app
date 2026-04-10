import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutGrid, Plus, Trash2, FolderOpen, Check, X } from "lucide-react";
import { useMediaFolders, useMediaFolderCreate, useMediaFolderDelete, type MediaFolder } from "@/api/media-library";
import { toast } from "sonner";

interface Props {
	activeFolder: number;
	onFolderChange: (id: number) => void;
}

export function MediaLibrarySidebar({ activeFolder, onFolderChange }: Props) {
	const { data } = useMediaFolders();
	const createMut = useMediaFolderCreate();
	const deleteMut = useMediaFolderDelete();
	const [showNew, setShowNew] = useState(false);
	const [newName, setNewName] = useState("");
	const folders = data?.folders ?? [];

	const handleCreate = () => {
		if (!newName.trim()) return;
		createMut.mutate({ name: newName.trim() }, {
			onSuccess: () => { toast.success("Collection created."); setShowNew(false); setNewName(""); },
			onError: () => toast.error("Failed."),
		});
	};

	const handleDelete = (f: MediaFolder) => {
		if (!confirm(`Delete "${f.name}"? Files will be moved to All Files.`)) return;
		deleteMut.mutate(f.id, {
			onSuccess: () => { toast.success("Deleted."); if (activeFolder === f.id) onFolderChange(0); },
		});
	};

	return (
		<div className="w-56 shrink-0 space-y-4 border-r border-[var(--border)] pr-4">
			{/* Browse */}
			<div>
				<p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Browse</p>
				<button
					onClick={() => onFolderChange(0)}
					className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${activeFolder === 0 ? "bg-[var(--sq-primary)] text-white font-medium" : "hover:bg-[var(--accent)]"}`}
				>
					<LayoutGrid size={16} /> All Files
				</button>
			</div>

			{/* Collections */}
			<div>
				<div className="mb-2 flex items-center justify-between">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Collections</p>
					<button onClick={() => setShowNew(true)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"><Plus size={14} /></button>
				</div>

				{showNew && (
					<div className="mb-2 flex gap-1">
						<Input placeholder="e.g. Marketing Assets" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} className="h-8 text-xs" />
						<Button size="icon" className="h-8 w-8 shrink-0" onClick={handleCreate} disabled={createMut.isPending}><Check size={12} /></Button>
						<Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => setShowNew(false)}><X size={12} /></Button>
					</div>
				)}

				{folders.map((f) => (
					<div key={f.id} className="group flex items-center">
						<button
							onClick={() => onFolderChange(f.id)}
							className={`flex flex-1 items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${activeFolder === f.id ? "bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)] text-[var(--sq-primary)] font-medium" : "hover:bg-[var(--accent)]"}`}
						>
							<FolderOpen size={14} /> <span className="truncate">{f.name}</span>
						</button>
						<div className="hidden gap-0.5 group-hover:flex">
							<button onClick={() => handleDelete(f)} className="p-0.5 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
