import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Tag, Trash2, Pencil } from "lucide-react";
import { useLabels, useLabelSave, useLabelDelete } from "@/api/labels";
import { toast } from "sonner";

export function LabelsPage() {
	const { data, isLoading } = useLabels();
	const saveMutation = useLabelSave();
	const deleteMutation = useLabelDelete();
	const [name, setName] = useState("");
	const [color, setColor] = useState("#6B7280");
	const [editId, setEditId] = useState<number | null>(null);

	const handleSave = () => {
		if (!name.trim()) { toast.error("Name required."); return; }
		saveMutation.mutate(
			{ id: editId ?? undefined, name, color },
			{
				onSuccess: (d) => { toast.success(d.message); setName(""); setColor("#6B7280"); setEditId(null); },
				onError: () => toast.error("Failed to save label."),
			},
		);
	};

	const handleDelete = (id: number) => {
		deleteMutation.mutate(id, {
			onSuccess: (d) => toast.success(d.message),
			onError: () => toast.error("Failed to delete."),
		});
	};

	const handleEdit = (label: { id: number; name: string; color: string }) => {
		setEditId(label.id);
		setName(label.name);
		setColor(label.color);
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Labels</h1>

			{/* Create/Edit form */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base">{editId ? "Edit Label" : "Create Label"}</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-3">
						<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded border" />
						<Input placeholder="Label name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
						<Button onClick={handleSave} disabled={saveMutation.isPending}>
							{editId ? "Update" : <><Plus size={16} /> Add</>}
						</Button>
						{editId && (
							<Button variant="outline" onClick={() => { setEditId(null); setName(""); setColor("#6B7280"); }}>Cancel</Button>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Labels list */}
			<Card>
				<CardHeader><CardTitle className="text-lg">Your Labels ({(data?.labels ?? []).length ?? 0})</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-20 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !(data?.labels ?? []).length ? (
						<div className="flex flex-col items-center gap-2 py-8">
							<Tag size={32} className="text-[var(--muted-foreground)]" />
							<p className="text-sm text-[var(--muted-foreground)]">No labels yet.</p>
						</div>
					) : (
						<div className="space-y-2">
							{data?.labels.map((label) => (
								<div key={label.id} className="flex items-center gap-3 rounded-md border border-[var(--border)] p-3">
									<div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
									<span className="flex-1 font-medium text-sm">{label.name}</span>
									<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(label)}><Pencil size={14} /></Button>
									<Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(label.id)}><Trash2 size={14} /></Button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
