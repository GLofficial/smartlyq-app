import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Trash2, Globe, RefreshCw, Share2, Download, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useArticleDetail, useSaveArticle, useDeleteArticle, usePollArticle } from "@/api/articles";

export function ArticleEditorPage() {
	const { id, hashId } = useParams<{ id: string; hashId: string }>();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const articleId = id ?? "";
	const isEditMode = searchParams.has("edit");

	const { data, isLoading, refetch } = useArticleDetail(articleId);
	const saveArticle = useSaveArticle();
	const deleteArticle = useDeleteArticle();

	const article = data?.article;

	const [title, setTitle]     = useState("");
	const [tags, setTags]       = useState("");
	const [meta, setMeta]       = useState("");
	const [slug, setSlug]       = useState("");
	const [content, setContent] = useState("");
	const [htmlMode, setHtmlMode] = useState(false);
	const [dirty, setDirty]     = useState(false);
	const [pollDone, setPollDone] = useState(false);

	const { data: pollData } = usePollArticle(articleId, !pollDone);
	useEffect(() => {
		if (pollData?.ready) { setPollDone(true); refetch(); }
	}, [pollData?.ready]);

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

	const mark = (setter: (v: string) => void) => (v: string) => { setter(v); setDirty(true); };

	const handleSave = async () => {
		if (!articleId) return;
		try {
			await saveArticle.mutateAsync({ id: articleId, title, content: htmlMode ? content : article?.content ?? content, tags, meta_description: meta, slug });
			toast.success("Article saved.");
			setDirty(false);
		} catch { toast.error("Failed to save."); }
	};

	const handleDelete = async () => {
		if (!confirm("Delete this article? This cannot be undone.")) return;
		try {
			await deleteArticle.mutateAsync(articleId);
			toast.success("Article deleted.");
			navigate(`/w/${hashId}/articles`);
		} catch { toast.error("Failed to delete."); }
	};

	const handleDownload = () => {
		const html = article?.content ?? content;
		const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${html}</body></html>`], { type: "text/html" });
		const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
		a.download = `${slug || title || "article"}.html`; a.click();
	};

	const handleShare = async () => {
		try { await navigator.clipboard.writeText(window.location.href); toast.success("Link copied."); }
		catch { toast.error("Failed to copy link."); }
	};

	if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;
	if (!article) return <div className="flex h-64 items-center justify-center"><p className="text-muted-foreground">Article not found.</p></div>;

	const keywordPills = (article.keywords || "").split(",").map((k) => k.trim()).filter(Boolean);

	return (
		<div className="max-w-6xl mx-auto pb-20 space-y-6">
			{/* ── Header ── */}
			<div className="flex items-center justify-between gap-3 py-4 border-b border-border">
				<div className="flex items-center gap-3 min-w-0">
					<button type="button" onClick={() => navigate(`/w/${hashId}/articles`)}
						className="shrink-0 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-lg px-3 py-1.5">
						<ArrowLeft size={14} /> Back
					</button>
					<h1 className="text-lg font-semibold truncate">Article Information</h1>
				</div>

				<div className="flex items-center gap-2 shrink-0">
					{/* Publish — always visible */}
					<Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" disabled>
						<Globe size={14} /> Publish
					</Button>

					{isEditMode ? (
						<>
							<Button size="sm" className="gap-1.5" disabled={saveArticle.isPending || !dirty} onClick={handleSave}>
								{saveArticle.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
								Save
							</Button>
							<Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(`/w/${hashId}/article-generator`)} title="Regenerate">
								<RefreshCw size={14} />
							</Button>
							<Button size="sm" variant="outline" className="gap-1.5" onClick={handleShare} title="Copy link">
								<Share2 size={14} />
							</Button>
							<Button size="sm" variant="outline" className="gap-1.5" onClick={handleDownload} title="Download HTML">
								<Download size={14} />
							</Button>
						</>
					) : (
						<Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(`/w/${hashId}/articles/${articleId}?edit`)}>
							<Pencil size={14} /> Edit
						</Button>
					)}

					<Button size="sm" variant="destructive" className="gap-1.5" onClick={handleDelete} disabled={deleteArticle.isPending}>
						{deleteArticle.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
						Delete
					</Button>
				</div>
			</div>

			{/* ── Article Information ── */}
			<div className="rounded-xl border border-border bg-card p-6 space-y-5">
				<h2 className="text-base font-semibold">Article Information</h2>

				{isEditMode && !pollDone && (
					<div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
						<Loader2 size={12} className="animate-spin" /> Generating SEO fields in background...
					</div>
				)}

				{/* Title */}
				<div className="space-y-1.5">
					<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</label>
					{isEditMode
						? <Input value={title} onChange={(e) => mark(setTitle)(e.target.value)} placeholder="Article title" className="text-sm" />
						: <div className="px-3 py-2 border border-border rounded-lg bg-muted/20 text-sm">{title || "—"}</div>
					}
				</div>

				{/* Keywords (always read-only pills) */}
				<div className="space-y-1.5">
					<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Keywords</label>
					<div className="flex flex-wrap gap-1.5 min-h-9 px-3 py-2 border border-border rounded-lg bg-muted/20">
						{keywordPills.length > 0
							? keywordPills.map((k) => <span key={k} className="inline-flex items-center bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">{k}</span>)
							: <span className="text-xs text-muted-foreground">—</span>
						}
					</div>
				</div>

				{/* Meta Description */}
				<div className="space-y-1.5">
					<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Meta Description</label>
					{isEditMode
						? <Textarea value={meta} onChange={(e) => mark(setMeta)(e.target.value)} placeholder="~160 character description..." rows={3} className="text-sm resize-none" />
						: <div className="px-3 py-2 border border-border rounded-lg bg-muted/20 text-sm min-h-[70px] whitespace-pre-wrap">{meta || "—"}</div>
					}
				</div>

				{/* Tags */}
				<div className="space-y-1.5">
					<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</label>
					{isEditMode
						? <Input value={tags} onChange={(e) => mark(setTags)(e.target.value)} placeholder="tag1, tag2, tag3" className="text-sm" />
						: <div className="px-3 py-2 border border-border rounded-lg bg-muted/20 text-sm">{tags || "—"}</div>
					}
				</div>

				{/* Slug — edit mode only */}
				{isEditMode && (
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Slug</label>
						<Input value={slug} onChange={(e) => mark(setSlug)(e.target.value)} placeholder="article-slug-here" className="text-sm" />
					</div>
				)}

				{/* Featured image */}
				{article.featured_media && (
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Featured Image</label>
						<img src={article.featured_media} alt="" className="w-full max-h-52 object-cover rounded-lg" />
					</div>
				)}

				{isEditMode && dirty && (
					<Button size="sm" className="gap-1.5" disabled={saveArticle.isPending} onClick={handleSave}>
						{saveArticle.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
						Save Changes
					</Button>
				)}
			</div>

			{/* ── Article Content ── */}
			<div className="rounded-xl border border-border bg-card p-6 space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold">Article Content</h2>
					{isEditMode && (
						<div className="flex gap-1">
							<button type="button" onClick={() => setHtmlMode(false)}
								className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${!htmlMode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
								Preview
							</button>
							<button type="button" onClick={() => setHtmlMode(true)}
								className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${htmlMode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
								Edit HTML
							</button>
						</div>
					)}
				</div>

				{isEditMode && htmlMode ? (
					<Textarea value={content} onChange={(e) => { setContent(e.target.value); setDirty(true); }} rows={30} className="font-mono text-xs resize-y" />
				) : (
					<div
						className="article-content rounded-lg border border-border bg-muted/20 p-4 overflow-y-auto"
						style={{ minHeight: 180, maxHeight: 500 }}
						dangerouslySetInnerHTML={{ __html: content || "<p style='color:var(--muted-foreground);font-size:0.875rem'>No content yet.</p>" }}
					/>
				)}
			</div>
		</div>
	);
}
