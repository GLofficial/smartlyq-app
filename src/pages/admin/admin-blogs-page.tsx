import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichEditor } from "@/components/ui/rich-editor";
import { FileText, Plus, Pencil, Trash2, CheckCircle, XCircle, X } from "lucide-react";
import {
	useAdminBlogs,
	useAdminBlogGet,
	useAdminBlogSave,
	useAdminBlogDelete,
	type AdminBlog,
} from "@/api/admin-pages";

export function AdminBlogsPage() {
	const { data, isLoading } = useAdminBlogs();
	const [editingId, setEditingId] = useState<number | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState<AdminBlog | null>(null);

	const openNew = () => { setEditingId(null); setShowForm(true); };
	const openEdit = (id: number) => { setEditingId(id); setShowForm(true); };
	const close = () => { setEditingId(null); setShowForm(false); setConfirmDelete(null); };

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Blogs</h1>
				<Button size="sm" onClick={openNew}><Plus size={16} /> Add Blog Post</Button>
			</div>

			{showForm && <BlogForm id={editingId} onClose={close} />}

			{confirmDelete && (
				<DeleteConfirm blog={confirmDelete} onClose={() => setConfirmDelete(null)} />
			)}

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Blog Posts ({(data?.blogs ?? []).length})</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? <Spinner /> : !(data?.blogs ?? []).length ? (
						<Empty icon={FileText} text="No blog posts yet." />
					) : (
						<Table headers={["ID", "Title", "Slug", "Category", "Status", "Created", ""]}>
							{data!.blogs.map((b) => (
								<tr key={b.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
									<td className="py-2">{b.id}</td>
									<td className="py-2 font-medium">{b.title}</td>
									<td className="py-2 text-xs text-[var(--muted-foreground)]">{b.slug}</td>
									<td className="py-2 text-xs">{b.category || "—"}</td>
									<td className="py-2">
										{b.status === 1
											? <CheckCircle size={14} className="text-green-500" />
											: <XCircle size={14} className="text-gray-400" />}
									</td>
									<td className="py-2 text-xs text-[var(--muted-foreground)]">
										{b.created ? new Date(b.created).toLocaleDateString() : "—"}
									</td>
									<td className="py-2 text-right">
										<div className="flex justify-end gap-1">
											<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(b.id)}>
												<Pencil size={14} />
											</Button>
											<Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => setConfirmDelete(b)}>
												<Trash2 size={14} />
											</Button>
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

function BlogForm({ id, onClose }: { id: number | null; onClose: () => void }) {
	const { data, isLoading } = useAdminBlogGet(id ?? 0);
	const saveMutation = useAdminBlogSave();
	const isEdit = id !== null && id > 0;
	const blog = data?.blog;

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [categoryName, setCategoryName] = useState("");
	const [status, setStatus] = useState(1);
	const [initialized, setInitialized] = useState(false);

	if (isEdit && blog && !initialized) {
		setTitle(blog.title);
		setDescription(blog.description);
		setCategoryName(blog.category_name);
		setStatus(blog.status);
		setInitialized(true);
	}
	if (!isEdit && !initialized) setInitialized(true);

	const handleSave = () => {
		saveMutation.mutate(
			{ id: isEdit ? id! : undefined, title, description, category_name: categoryName, status },
			{ onSuccess: onClose },
		);
	};

	if (isEdit && isLoading) return <Card><CardContent className="py-6"><Spinner /></CardContent></Card>;

	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between">
				<CardTitle className="text-lg">{isEdit ? "Edit Blog Post" : "New Blog Post"}</CardTitle>
				<Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}><X size={16} /></Button>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<label className="mb-1 block text-sm font-medium">Title</label>
					<Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Blog post title" />
				</div>
				<div>
					<label className="mb-1 block text-sm font-medium">Category</label>
					<Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g. Marketing, Tips" />
				</div>
				<div>
					<label className="mb-1 block text-sm font-medium">Content</label>
					<RichEditor value={description} onChange={setDescription} />
				</div>
				<div className="flex items-center gap-2">
					<input type="checkbox" id="blog-status" checked={status === 1} onChange={(e) => setStatus(e.target.checked ? 1 : 0)} />
					<label htmlFor="blog-status" className="text-sm">Published</label>
				</div>
				<div className="flex gap-2">
					<Button onClick={handleSave} disabled={saveMutation.isPending}>
						{saveMutation.isPending ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
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

function DeleteConfirm({ blog, onClose }: { blog: AdminBlog; onClose: () => void }) {
	const deleteMutation = useAdminBlogDelete();

	const handleDelete = () => {
		deleteMutation.mutate(blog.id, { onSuccess: onClose });
	};

	return (
		<Card className="border-red-200">
			<CardContent className="flex items-center justify-between py-4">
				<p className="text-sm">Delete <strong>{blog.title}</strong>? This cannot be undone.</p>
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
