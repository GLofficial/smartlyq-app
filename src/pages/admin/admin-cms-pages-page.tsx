import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Pencil, Trash2, CheckCircle, XCircle, X } from "lucide-react";
import {
	useAdminPages,
	useAdminPageGet,
	useAdminPageSave,
	useAdminPageDelete,
	type AdminPage,
} from "@/api/admin-pages";

export function AdminCmsPagesPage() {
	const { data, isLoading } = useAdminPages();
	const [editingId, setEditingId] = useState<number | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState<AdminPage | null>(null);

	const openNew = () => { setEditingId(null); setShowForm(true); };
	const openEdit = (id: number) => { setEditingId(id); setShowForm(true); };
	const close = () => { setEditingId(null); setShowForm(false); setConfirmDelete(null); };

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">CMS Pages</h1>
				<Button size="sm" onClick={openNew}><Plus size={16} /> Add Page</Button>
			</div>

			{showForm && <PageForm id={editingId} onClose={close} />}

			{confirmDelete && (
				<DeleteConfirm page={confirmDelete} onClose={() => setConfirmDelete(null)} />
			)}

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Pages ({(data?.pages ?? []).length})</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? <Spinner /> : !(data?.pages ?? []).length ? (
						<Empty icon={FileText} text="No CMS pages yet." />
					) : (
						<Table headers={["ID", "Title", "Slug", "Status", "Created", ""]}>
							{data!.pages.map((p) => (
								<tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
									<td className="py-2">{p.id}</td>
									<td className="py-2 font-medium">{p.title}</td>
									<td className="py-2 text-xs text-[var(--muted-foreground)]">{p.slug}</td>
									<td className="py-2">
										{p.status === 1
											? <CheckCircle size={14} className="text-green-500" />
											: <XCircle size={14} className="text-gray-400" />}
									</td>
									<td className="py-2 text-xs text-[var(--muted-foreground)]">
										{p.created ? new Date(p.created).toLocaleDateString() : "—"}
									</td>
									<td className="py-2 text-right">
										<div className="flex justify-end gap-1">
											<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p.id)}>
												<Pencil size={14} />
											</Button>
											{p.deletable && (
												<Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setConfirmDelete(p)}>
													<Trash2 size={14} />
												</Button>
											)}
										</div>
									</td>
								</tr>
							))}
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function PageForm({ id, onClose }: { id: number | null; onClose: () => void }) {
	const { data, isLoading } = useAdminPageGet(id ?? 0);
	const saveMutation = useAdminPageSave();
	const isEdit = id !== null && id > 0;
	const page = data?.page;

	const [name, setName] = useState("");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState(1);
	const [initialized, setInitialized] = useState(false);

	if (isEdit && page && !initialized) {
		setName(page.name);
		setTitle(page.title);
		setDescription(page.description);
		setStatus(page.status);
		setInitialized(true);
	}
	if (!isEdit && !initialized) setInitialized(true);

	const handleSave = () => {
		saveMutation.mutate(
			{ id: isEdit ? id! : undefined, name, title, description, status },
			{ onSuccess: onClose },
		);
	};

	if (isEdit && isLoading) return <Card><CardContent className="py-6"><Spinner /></CardContent></Card>;

	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between">
				<CardTitle className="text-lg">{isEdit ? "Edit Page" : "New Page"}</CardTitle>
				<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}><X size={16} /></Button>
			</CardHeader>
			<CardContent className="space-y-4">
				{!isEdit && (
					<div>
						<label className="mb-1 block text-sm font-medium">Name (used for slug)</label>
						<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. About Us" />
					</div>
				)}
				<div>
					<label className="mb-1 block text-sm font-medium">Title</label>
					<Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title" />
				</div>
				<div>
					<label className="mb-1 block text-sm font-medium">Content (HTML)</label>
					<textarea
						className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm min-h-[160px] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Page content..."
					/>
				</div>
				<div className="flex items-center gap-2">
					<input type="checkbox" id="page-status" checked={status === 1} onChange={(e) => setStatus(e.target.checked ? 1 : 0)} />
					<label htmlFor="page-status" className="text-sm">Active</label>
				</div>
				<div className="flex gap-2">
					<Button onClick={handleSave} disabled={saveMutation.isPending}>
						{saveMutation.isPending ? "Saving..." : isEdit ? "Update Page" : "Create Page"}
					</Button>
					<Button variant="outline" onClick={onClose}>Cancel</Button>
				</div>
				{saveMutation.isError && (
					<p className="text-sm text-red-500">{(saveMutation.error as { message?: string })?.message ?? "Save failed"}</p>
				)}
			</CardContent>
		</Card>
	);
}

function DeleteConfirm({ page, onClose }: { page: AdminPage; onClose: () => void }) {
	const deleteMutation = useAdminPageDelete();

	const handleDelete = () => {
		deleteMutation.mutate(page.id, { onSuccess: onClose });
	};

	return (
		<Card className="border-red-200">
			<CardContent className="flex items-center justify-between py-4">
				<p className="text-sm">Delete <strong>{page.title}</strong>? This cannot be undone.</p>
				<div className="flex gap-2">
					<Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
						{deleteMutation.isPending ? "Deleting..." : "Delete"}
					</Button>
					<Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function Spinner() {
	return <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;
}

function Empty({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
	return <div className="flex flex-col items-center gap-2 py-8"><Icon size={32} className="text-[var(--muted-foreground)]" /><p className="text-sm text-[var(--muted-foreground)]">{text}</p></div>;
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead><tr className="border-b border-[var(--border)]">{headers.map(h => <th key={h} className="py-2 text-left font-medium">{h}</th>)}</tr></thead>
				<tbody>{children}</tbody>
			</table>
		</div>
	);
}
