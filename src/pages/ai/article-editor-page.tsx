import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Trash2, Globe, RefreshCw, Share2, Download, Pencil, Copy, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { RichEditor } from "@/components/ui/rich-editor";
import { useArticleDetail, useSaveArticle, useDeleteArticle, useArticleConfig, useShareArticle } from "@/api/articles";

// ── Share modal ────────────────────────────────────────────────────────────────
function ShareModal({ articleId, hasWebhook, hasZapierUrl, hasPabblyUrl, integrationsPath, onClose }: {
	articleId: string;
	hasWebhook: boolean;
	hasZapierUrl: boolean;
	hasPabblyUrl: boolean;
	integrationsPath: string;
	onClose: () => void;
}) {
	const [zapier, setZapier] = useState(false);
	const [pabbly, setPabbly] = useState(false);
	const shareArticle = useShareArticle();

	const missingUrls = [
		...(!hasZapierUrl ? ["Zapier"] : []),
		...(!hasPabblyUrl ? ["Pabbly"] : []),
	];

	const handleShare = async () => {
		try {
			const res = await shareArticle.mutateAsync({ id: articleId, zapier, pabbly });
			toast.success(`Article sent to ${res.sent} destination${res.sent !== 1 ? "s" : ""}.`);
			onClose();
		} catch (e) {
			toast.error((e as { error?: string })?.error ?? "Failed to send.");
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
			<div className="bg-background rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">Share</h3>
					<button type="button" onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground"><X size={16} /></button>
				</div>
				{!hasWebhook ? (
					<div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
						To access this feature, please <a href="/plans" className="underline font-medium">upgrade</a> your current plan.
					</div>
				) : missingUrls.length > 0 && (
					<div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
						{missingUrls.join(" and ")} webhook URL{missingUrls.length > 1 ? "s are" : " is"} not configured.{" "}
						<Link to={integrationsPath} target="_blank" className="underline font-medium inline-flex items-center gap-0.5">
							Set up in Integrations <ExternalLink size={11} />
						</Link>
					</div>
				)}
				<label className={`flex items-center gap-3 text-sm ${hasWebhook && hasZapierUrl ? "cursor-pointer" : "text-muted-foreground cursor-not-allowed"}`}>
					<input type="checkbox" disabled={!hasWebhook || !hasZapierUrl} checked={zapier} onChange={(e) => setZapier(e.target.checked)} className="rounded" /> Share to Zapier
				</label>
				<label className={`flex items-center gap-3 text-sm ${hasWebhook && hasPabblyUrl ? "cursor-pointer" : "text-muted-foreground cursor-not-allowed"}`}>
					<input type="checkbox" disabled={!hasWebhook || !hasPabblyUrl} checked={pabbly} onChange={(e) => setPabbly(e.target.checked)} className="rounded" /> Share to Pabbly
				</label>
				<div className="flex justify-end gap-2 pt-2">
					<Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
					<Button size="sm" disabled={!hasWebhook || (!zapier && !pabbly) || shareArticle.isPending} onClick={handleShare}>
						{shareArticle.isPending ? <><Loader2 size={13} className="animate-spin" /> Sending...</> : "Share"}
					</Button>
				</div>
			</div>
		</div>
	);
}

// ── Keyword tag input ──────────────────────────────────────────────────────────
function KeywordInput({ keywords, onChange }: { keywords: string[]; onChange: (kw: string[]) => void }) {
	const [input, setInput] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const add = (val: string) => {
		const trimmed = val.trim().replace(/,$/, "").trim();
		if (trimmed && !keywords.includes(trimmed)) onChange([...keywords, trimmed]);
		setInput("");
	};

	const remove = (kw: string) => onChange(keywords.filter((k) => k !== kw));

	const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); }
		if (e.key === "Backspace" && input === "" && keywords.length > 0) { const last = keywords[keywords.length - 1]; if (last) remove(last); }
	};

	return (
		<div className="flex flex-wrap gap-1.5 min-h-10 px-3 py-2 border border-border rounded-lg bg-background cursor-text" onClick={() => inputRef.current?.focus()}>
			{keywords.map((k) => (
				<span key={k} className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
					{k}
					<button type="button" onClick={(e) => { e.stopPropagation(); remove(k); }} className="hover:text-destructive"><X size={10} /></button>
				</span>
			))}
			<input
				ref={inputRef}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={handleKey}
				onBlur={() => input.trim() && add(input)}
				placeholder={keywords.length === 0 ? "Type a keyword and press Enter..." : ""}
				className="flex-1 min-w-24 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
			/>
		</div>
	);
}

// ── Main editor page ───────────────────────────────────────────────────────────
export function ArticleEditorPage() {
	const { id, hashId } = useParams<{ id: string; hashId: string }>();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const confirm = useConfirm();
	const articleId = id ?? "";
	const isEditMode = searchParams.has("edit");

	const { data, isLoading } = useArticleDetail(articleId);
	const { data: cfg } = useArticleConfig();
	const saveArticle = useSaveArticle();
	const deleteArticle = useDeleteArticle();
	const hasWebhook   = cfg?.has_webhook    ?? false;
	const hasZapierUrl = cfg?.has_zapier_url ?? false;
	const hasPabblyUrl = cfg?.has_pabbly_url ?? false;

	const article = data?.article;

	const [title, setTitle]         = useState("");
	const [tags, setTags]           = useState("");
	const [meta, setMeta]           = useState("");
	const [slug, setSlug]           = useState("");
	const [content, setContent]     = useState("");
	const [keywords, setKeywords]   = useState<string[]>([]);
	const [dirty, setDirty]         = useState(false);
	const [shareOpen, setShareOpen] = useState(false);

	useEffect(() => {
		if (!article) return;
		setTitle(article.title);
		setSlug(article.slug);
		setTags(article.tags);
		setMeta(article.meta_description);
		setContent(article.content);
		setKeywords((article.keywords || "").split(",").map((k) => k.trim()).filter(Boolean));
		setDirty(false);
	}, [article]);

	const mark = (setter: (v: string) => void) => (v: string) => { setter(v); setDirty(true); };
	const markKw = (kw: string[]) => { setKeywords(kw); setDirty(true); };

	const handleSave = async () => {
		if (!articleId) return;
		try {
			await saveArticle.mutateAsync({
				id: articleId, title,
				content: content,
				tags, meta_description: meta, slug,
				keywords: keywords.join(", "),
			});
			toast.success("Article saved.");
			setDirty(false);
		} catch { toast.error("Failed to save."); }
	};

	const handleDelete = async () => {
		const ok = await confirm({ title: "Delete article", message: "This article will be permanently deleted. This cannot be undone.", confirmLabel: "Delete", variant: "destructive" });
		if (!ok) return;
		try {
			await deleteArticle.mutateAsync(articleId);
			toast.success("Article deleted.");
			navigate(`/w/${hashId}/articles`);
		} catch { toast.error("Failed to delete."); }
	};

	const handleCopyContent = async () => {
		const text = article?.content ?? content;
		try { await navigator.clipboard.writeText(text); toast.success("Content copied to clipboard."); }
		catch { toast.error("Failed to copy content."); }
	};

	const handleDownload = () => {
		const html = article?.content ?? content;
		const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${html}</body></html>`], { type: "text/html" });
		const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
		a.download = `${slug || title || "article"}.html`; a.click();
	};

	if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;
	if (!article) return <div className="flex h-64 items-center justify-center"><p className="text-muted-foreground">Article not found.</p></div>;

	return (
		<>
			{shareOpen && <ShareModal articleId={articleId} hasWebhook={hasWebhook} hasZapierUrl={hasZapierUrl} hasPabblyUrl={hasPabblyUrl} integrationsPath={`/w/${hashId}/integrations`} onClose={() => setShareOpen(false)} />}

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
						<Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" disabled>
							<Globe size={14} /> Publish
						</Button>

						{isEditMode ? (
							<>
								<Button size="sm" className="gap-1.5" disabled={saveArticle.isPending || !dirty} onClick={handleSave}>
									{saveArticle.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
									Save
								</Button>
								<Button size="sm" variant="outline" onClick={() => navigate(`/w/${hashId}/article-generator`)} title="Regenerate">
									<RefreshCw size={14} />
								</Button>
								<Button size="sm" variant="outline" onClick={() => setShareOpen(true)} title="Share">
									<Share2 size={14} />
								</Button>
								<Button size="sm" variant="outline" onClick={handleCopyContent} title="Copy content">
									<Copy size={14} />
								</Button>
								<Button size="sm" variant="outline" onClick={handleDownload} title="Download HTML">
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

					{/* Title */}
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</label>
						{isEditMode
							? <Input value={title} onChange={(e) => mark(setTitle)(e.target.value)} placeholder="Article title" className="text-sm" />
							: <div className="px-3 py-2 border border-border rounded-lg bg-muted/20 text-sm">{title || "—"}</div>
						}
					</div>

					{/* Keywords */}
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Keywords</label>
						{isEditMode ? (
							<KeywordInput keywords={keywords} onChange={markKw} />
						) : (
							<div className="flex flex-wrap gap-1.5 min-h-9 px-3 py-2 border border-border rounded-lg bg-muted/20">
								{keywords.length > 0
									? keywords.map((k) => <span key={k} className="inline-flex items-center bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">{k}</span>)
									: <span className="text-xs text-muted-foreground">—</span>
								}
							</div>
						)}
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
							? <Input value={tags} onChange={(e) => mark(setTags)(e.target.value)} placeholder="E.g Book writing, science and fiction, creativity" className="text-sm" />
							: <div className="px-3 py-2 border border-border rounded-lg bg-muted/20 text-sm">{tags || "—"}</div>
						}
					</div>


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
					<h2 className="text-base font-semibold">Article Content</h2>

					{isEditMode ? (
						<RichEditor
							value={content}
							onChange={(html) => { setContent(html); setDirty(true); }}
							minHeight="400px"
						/>
					) : (
						<div
							className="article-content rounded-lg border border-border bg-muted/20 p-4 overflow-y-auto"
							style={{ minHeight: 180, maxHeight: 500 }}
							dangerouslySetInnerHTML={{ __html: content || "<p style='color:var(--muted-foreground);font-size:0.875rem'>No content yet.</p>" }}
						/>
					)}
				</div>
			</div>
		</>
	);
}
