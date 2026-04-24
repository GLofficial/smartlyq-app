import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useArticleDetail, useSaveArticle, useDeleteArticle, usePollArticle } from "@/api/articles";

function SeoField({ label, value, onChange, placeholder, rows = 1 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
	return (
		<div className="space-y-1">
			<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
			{rows > 1 ? (
				<Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="resize-none text-sm" />
			) : (
				<Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="text-sm" />
			)}
		</div>
	);
}

export function ArticleEditorPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const articleId = id ?? "";

	const { data, isLoading, refetch } = useArticleDetail(articleId);
	const saveArticle = useSaveArticle();
	const deleteArticle = useDeleteArticle();

	const article = data?.article;

	const [title, setTitle]           = useState("");
	const [slug, setSlug]             = useState("");
	const [tags, setTags]             = useState("");
	const [meta, setMeta]             = useState("");
	const [content, setContent]       = useState("");
	const [editMode, setEditMode]     = useState(false);
	const [dirty, setDirty]           = useState(false);
	const [pollDone, setPollDone]     = useState(false);

	// Poll for SEO completion
	const { data: pollData } = usePollArticle(articleId, !pollDone);
	useEffect(() => {
		if (pollData?.ready) {
			setPollDone(true);
			refetch();
		}
	}, [pollData?.ready]);

	// Populate fields from loaded article
	useEffect(() => {
		if (!article) return;
		setTitle(article.title);
		setSlug(article.slug);
		setTags(article.tags);
		setMeta(article.meta_description);
		setContent(article.content);
		setDirty(false);
		if (article.slug || article.tags || article.meta_description) setPollDone(true);
	}, [article]);

	const markDirty = (setter: (v: string) => void) => (v: string) => { setter(v); setDirty(true); };

	const handleSave = async () => {
		if (!articleId) return;
		try {
			await saveArticle.mutateAsync({ id: articleId, title, content: editMode ? content : article?.content ?? content, tags, meta_description: meta, slug });
			toast.success("Article saved.");
			setDirty(false);
		} catch {
			toast.error("Failed to save.");
		}
	};

	const handleDelete = async () => {
		if (!confirm("Delete this article? This cannot be undone.")) return;
		try {
			await deleteArticle.mutateAsync(articleId);
			toast.success("Article deleted.");
			navigate("../articles", { relative: "path" });
		} catch {
			toast.error("Failed to delete.");
		}
	};

	const goBack = () => navigate("../articles", { relative: "path" });

	if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;
	if (!article) return <div className="flex h-64 items-center justify-center"><p className="text-muted-foreground">Article not found.</p></div>;

	return (
		<div className="max-w-5xl mx-auto space-y-0 pb-20">
			{/* Header */}
			<div className="flex items-center gap-3 py-4 border-b border-border mb-6">
				<button type="button" onClick={goBack} className="text-muted-foreground hover:text-foreground transition-colors">
					<ArrowLeft size={20} />
				</button>
				<h1 className="text-lg font-semibold flex-1 truncate">{title || "Article Editor"}</h1>
				<div className="flex items-center gap-2">
					{dirty && (
						<Button size="sm" className="gap-1.5" disabled={saveArticle.isPending} onClick={handleSave}>
							{saveArticle.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
							Save
						</Button>
					)}
					<Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={handleDelete} disabled={deleteArticle.isPending}>
						<Trash2 size={14} />
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main content */}
				<div className="lg:col-span-2 space-y-4">
					<SeoField label="Title" value={title} onChange={markDirty(setTitle)} placeholder="Article title" />

					{/* SEO polling indicator */}
					{!pollDone && (
						<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
							<Loader2 size={12} className="animate-spin" />
							Generating SEO fields in background...
						</div>
					)}

					{/* Content area */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Content</label>
							<div className="flex gap-1">
								<button type="button" onClick={() => setEditMode(false)}
									className={`px-2 py-0.5 rounded text-xs transition-colors ${!editMode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
									Preview
								</button>
								<button type="button" onClick={() => setEditMode(true)}
									className={`px-2 py-0.5 rounded text-xs transition-colors ${editMode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
									Edit HTML
								</button>
							</div>
						</div>

						{editMode ? (
							<Textarea value={content} onChange={(e) => { setContent(e.target.value); setDirty(true); }} rows={25} className="font-mono text-xs resize-y" />
						) : (
							<div className="rounded-lg border border-border bg-background p-5 prose prose-sm max-w-none min-h-[400px] overflow-auto"
								dangerouslySetInnerHTML={{ __html: content || "<p class='text-muted-foreground'>No content yet.</p>" }}
							/>
						)}
					</div>
				</div>

				{/* SEO Sidebar */}
				<div className="space-y-4">
					<div className="rounded-xl border border-border bg-card p-4 space-y-4">
						<p className="text-sm font-semibold">SEO & Meta</p>

						{article.featured_media && (
							<div className="space-y-1">
								<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Featured Image</p>
								<img src={article.featured_media} alt="" className="w-full rounded-lg object-cover max-h-40" />
								<a href={article.featured_media} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
									<ExternalLink size={10} /> View image
								</a>
							</div>
						)}

						<SeoField label="Slug" value={slug} onChange={markDirty(setSlug)} placeholder="article-slug-here" />
						<SeoField label="Tags (comma-separated)" value={tags} onChange={markDirty(setTags)} placeholder="tag1, tag2, tag3" />
						<SeoField label="Meta Description" value={meta} onChange={markDirty(setMeta)} placeholder="~160 character description..." rows={3} />

						{dirty && (
							<Button size="sm" className="w-full gap-1.5" disabled={saveArticle.isPending} onClick={handleSave}>
								{saveArticle.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
								Save Changes
							</Button>
						)}
					</div>

					<div className="rounded-xl border border-border bg-card p-4 space-y-2">
						<p className="text-sm font-semibold">Details</p>
						<div className="space-y-1 text-xs text-muted-foreground">
							<div className="flex justify-between"><span>Status</span><span className="capitalize">{article.status === 2 ? "Ready" : article.status === 3 ? "Processing" : "Pending"}</span></div>
							<div className="flex justify-between"><span>Language</span><span>{article.language || "—"}</span></div>
							<div className="flex justify-between"><span>Tone</span><span>{article.tone || "—"}</span></div>
							<div className="flex justify-between"><span>Model</span><span className="truncate max-w-[120px]">{article.text_model || "—"}</span></div>
							<div className="flex justify-between"><span>Created</span><span>{new Date(article.created).toLocaleDateString()}</span></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
