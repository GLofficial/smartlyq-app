import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Wand2, RotateCcw, ChevronDown, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import {
	useArticleConfig, useGenerateTitle, useCreateArticle,
	useStreamPrepare, useStreamComplete, useBrandPresets,
	type ArticleModel, type BrandPreset,
} from "@/api/articles";

type Step = "form" | "title" | "streaming" | "done";

// ── Simple string dropdown ────────────────────────────────────────────────────
function SelectBtn({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
	const [open, setOpen] = useState(false);
	return (
		<div className="space-y-1">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button type="button" className="w-full h-9 flex items-center justify-between gap-2 px-3 border border-border rounded-lg bg-background text-sm hover:bg-muted/40 transition-colors">
						<span className="truncate">{value || "Default"}</span>
						<ChevronDown size={14} className="shrink-0 text-muted-foreground" />
					</button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-56 p-1 max-h-60 overflow-y-auto">
					{options.map((o) => (
						<button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }}
							className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${value === o ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
							{o || "Default"}
						</button>
					))}
				</PopoverContent>
			</Popover>
		</div>
	);
}

// ── Brand voice dropdown ──────────────────────────────────────────────────────
function BrandSelect({ brands, value, onChange }: { brands: { id: number; name: string }[]; value: number; onChange: (v: number) => void }) {
	const [open, setOpen] = useState(false);
	const brand = brands.find((b) => b.id === value);
	return (
		<div className="space-y-1">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Brand Voice (optional)</p>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button type="button" className="w-full h-9 flex items-center justify-between gap-2 px-3 border border-border rounded-lg bg-background text-sm hover:bg-muted/40 transition-colors">
						<span className="truncate">{brand?.name ?? "None"}</span>
						<ChevronDown size={14} className="shrink-0 text-muted-foreground" />
					</button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-56 p-1">
					<button type="button" onClick={() => { onChange(0); setOpen(false); }} className={`w-full text-left px-3 py-1.5 rounded text-sm ${value === 0 ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>None</button>
					{brands.map((b) => (
						<button key={b.id} type="button" onClick={() => { onChange(b.id); setOpen(false); }} className={`w-full text-left px-3 py-1.5 rounded text-sm ${value === b.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>{b.name}</button>
					))}
				</PopoverContent>
			</Popover>
		</div>
	);
}

// ── Model dropdown with icons + optional disabled group ───────────────────────
function ModelSelect({ label, hint, models, disabledModels, value, onChange, defaultLabel = "Default model", allowEmpty = true }: {
	label: string; hint?: string; defaultLabel?: string; allowEmpty?: boolean;
	models: ArticleModel[]; disabledModels?: ArticleModel[];
	value: string; onChange: (v: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const active = models.find((m) => m.model === value);
	return (
		<div className="space-y-1">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button type="button" className="w-full h-9 flex items-center justify-between gap-2 px-3 border border-border rounded-lg bg-background text-sm hover:bg-muted/40 transition-colors">
						<span className="flex items-center gap-2 min-w-0">
							{active?.icon_url && <img src={active.icon_url} alt="" className="h-4 w-4 object-contain shrink-0" />}
							<span className="truncate">{active?.name ?? defaultLabel}</span>
						</span>
						<ChevronDown size={14} className="shrink-0 text-muted-foreground" />
					</button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-64 p-1 max-h-72 overflow-y-auto">
					{allowEmpty && (
						<button type="button" onClick={() => { onChange(""); setOpen(false); }}
							className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${value === "" ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
							{defaultLabel}
						</button>
					)}
					{models.map((m) => (
						<button key={m.model} type="button" onClick={() => { onChange(m.model); setOpen(false); }}
							className={`w-full text-left px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${value === m.model ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
							{m.icon_url && <img src={m.icon_url} alt="" className="h-4 w-4 object-contain shrink-0" />}
							<span className="truncate">{m.name}</span>
						</button>
					))}
					{disabledModels && disabledModels.length > 0 && (
						<>
							<div className="px-3 py-1 mt-1 border-t border-border text-xs font-medium text-muted-foreground">Upgrade required</div>
							{disabledModels.map((m) => (
								<div key={m.model} className="w-full px-3 py-1.5 rounded text-sm flex items-center gap-2 text-muted-foreground opacity-50 cursor-not-allowed">
									{m.icon_url && <img src={m.icon_url} alt="" className="h-4 w-4 object-contain shrink-0" />}
									<span className="truncate">{m.name}</span>
								</div>
							))}
						</>
					)}
				</PopoverContent>
			</Popover>
			{hint && <p className="text-xs text-muted-foreground">{hint}</p>}
		</div>
	);
}

// ── Keywords text input with comma chips ──────────────────────────────────────
function ChipInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
	const chips = value.split(",").map((s) => s.trim()).filter(Boolean);
	const remove = (i: number) => onChange(chips.filter((_, j) => j !== i).join(", "));
	return (
		<div className="space-y-2">
			<Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="E.g Book writing, science and fiction, creativity" className="text-sm" />
			{chips.length > 0 && (
				<div className="flex flex-wrap gap-1.5">
					{chips.map((k, i) => (
						<span key={i} className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
							{k}
							<button type="button" onClick={() => remove(i)} className="hover:text-destructive"><X size={10} /></button>
						</span>
					))}
				</div>
			)}
			<p className="text-xs text-muted-foreground">You can separate multiple keywords or phrases with a comma</p>
		</div>
	);
}

// ── Brand preset single dropdown ──────────────────────────────────────────────
function PresetSelect({ label, items, value, onChange }: { label: string; items: BrandPreset[]; value: number; onChange: (v: number) => void }) {
	const [open, setOpen] = useState(false);
	const active = items.find((p) => p.id === value);
	const display = active ? (active.title || active.content.slice(0, 40) + "…") : "None";
	return (
		<div className="space-y-1">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Brand: {label}</p>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button type="button" className="w-full h-9 flex items-center justify-between gap-2 px-3 border border-border rounded-lg bg-background text-sm hover:bg-muted/40 transition-colors">
						<span className="truncate">{display}</span>
						<ChevronDown size={14} className="shrink-0 text-muted-foreground" />
					</button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-64 p-1 max-h-60 overflow-y-auto">
					<button type="button" onClick={() => { onChange(0); setOpen(false); }} className={`w-full text-left px-3 py-1.5 rounded text-sm ${value === 0 ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>None</button>
					{items.map((p) => (
						<button key={p.id} type="button" onClick={() => { onChange(p.id); setOpen(false); }}
							className={`w-full text-left px-3 py-1.5 rounded text-sm ${value === p.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
							{(p.title || p.content.slice(0, 50) + "…")}{p.is_default ? " (default)" : ""}
						</button>
					))}
				</PopoverContent>
			</Popover>
		</div>
	);
}

// ── Main page ─────────────────────────────────────────────────────────────────
const PRESET_TYPES = ["tone", "audience", "cta", "rules", "tagline", "usp", "about"] as const;
const PRESET_LABELS: Record<string, string> = { tone: "Tone", audience: "Audience", cta: "CTA", rules: "Rules", tagline: "Tagline", usp: "USP", about: "About" };

export function ArticleGeneratorPage() {
	const navigate = useNavigate();
	const { hashId } = useParams<{ hashId: string }>();
	const { data: cfg, isLoading: cfgLoading } = useArticleConfig();
	const generateTitle  = useGenerateTitle();
	const createArticle  = useCreateArticle();
	const streamPrepare  = useStreamPrepare();
	const streamComplete = useStreamComplete();

	const [step, setStep]               = useState<Step>("form");
	const [keywords, setKeywords]       = useState("");
	const [language, setLanguage]       = useState("English");
	const [tone, setTone]               = useState("");
	const [textModel, setTextModel]     = useState("");
	const [brandId, setBrandId]         = useState(0);
	const [brandPresets, setBrandPresets] = useState<Record<string, number>>({});
	const [audience, setAudience]       = useState("");
	const [context, setContext]         = useState("");
	const [addVideo, setAddVideo]       = useState(true);
	const [addImages, setAddImages]     = useState(true);
	const [imageSource, setImageSource] = useState("Google");
	const [title, setTitle]             = useState("");
	const [streamContent, setStreamContent] = useState("");
	const [streamProgress, setStreamProgress] = useState(0);

	const streamRef     = useRef<EventSource | null>(null);
	const contentRef    = useRef("");
	const tokenCountRef = useRef(0);

	const { data: presetsData } = useBrandPresets(brandId);

	useEffect(() => {
		if (cfg?.text_models?.length && !textModel) setTextModel(cfg.text_models[0]?.model ?? "");
		if (cfg?.languages?.length && !cfg.languages.includes(language)) setLanguage(cfg.languages[0] ?? "English");
	}, [cfg]);

	useEffect(() => { setBrandPresets({}); }, [brandId]);

	const handleGenerateTitle = useCallback(async () => {
		if (!keywords.trim()) { toast.error("Enter keywords first."); return; }
		setStep("title"); setTitle("");
		try {
			const res = await generateTitle.mutateAsync({ keywords, language, tone });
			setTitle(res.title);
		} catch { toast.error("Failed to generate title."); setStep("form"); }
	}, [keywords, language, tone]);

	const handleStartGeneration = useCallback(async () => {
		if (!title.trim()) { toast.error("Title is required."); return; }
		try {
			const created = await createArticle.mutateAsync({
				keywords, language, tone, audience, context, title,
				text_model: textModel, brand_id: brandId || undefined,
				image_source: addImages ? imageSource : "",
				video_source: addVideo ? "youtube" : "",
				brand_preset_tone_id:     brandPresets["tone"]     ?? 0,
				brand_preset_audience_id: brandPresets["audience"] ?? 0,
				brand_preset_cta_id:      brandPresets["cta"]      ?? 0,
				brand_preset_rules_id:    brandPresets["rules"]    ?? 0,
				brand_preset_tagline_id:  brandPresets["tagline"]  ?? 0,
				brand_preset_usp_id:      brandPresets["usp"]      ?? 0,
				brand_preset_about_id:    brandPresets["about"]    ?? 0,
			});
			await startStream(created.id, textModel);
		} catch { toast.error("Failed to create article."); setStep("form"); }
	}, [title, keywords, language, tone, audience, context, textModel, imageSource, addImages, addVideo, brandId, brandPresets]);

	const startStream = useCallback(async (id: string, model: string) => {
		setStep("streaming"); setStreamContent(""); setStreamProgress(5);
		contentRef.current = ""; tokenCountRef.current = 0;
		try {
			const prep = await streamPrepare.mutateAsync(id);
			if (prep.stream_url && prep.stream_token) {
				const es = new EventSource(`${prep.stream_url}?token=${encodeURIComponent(prep.stream_token)}`);
				streamRef.current = es;
				let settled = false;
				es.onmessage = (ev) => {
					if (ev.data === "[DONE]") { es.close(); if (!settled) { settled = true; finishStream(id, model); } return; }
					try {
						const chunk = JSON.parse(ev.data)?.choices?.[0]?.delta?.content ?? "";
						if (chunk) { contentRef.current += chunk; tokenCountRef.current++; setStreamContent(contentRef.current); setStreamProgress(Math.min(95, 5 + tokenCountRef.current / 10)); }
					} catch {}
				};
				es.onerror = () => { es.close(); if (!settled) { settled = true; finishStream(id, model); } };
			} else { toast.error("Stream not available."); setStep("form"); }
		} catch { toast.error("Failed to prepare stream."); setStep("form"); }
	}, []);

	const finishStream = useCallback(async (id: string, model: string) => {
		setStreamProgress(97);
		try {
			await streamComplete.mutateAsync({ id, content: contentRef.current, output_tokens: tokenCountRef.current, model });
			setStreamProgress(100); setStep("done");
			setTimeout(() => navigate(`/w/${hashId}/articles/${id}`), 800);
		} catch { toast.error("Failed to save article."); setStep("form"); }
	}, [navigate]);

	useEffect(() => () => { streamRef.current?.close(); }, []);

	if (cfgLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;
	if (!cfg?.has_access) return <div className="flex h-64 items-center justify-center"><p className="text-muted-foreground">Article generator is not available on your current plan.</p></div>;

	const presets = presetsData?.presets ?? {};
	const visiblePresetTypes = PRESET_TYPES.filter((t) => (presets[t]?.length ?? 0) > 0);
	const googleIcon: ArticleModel = { model: "Google", name: "Google Images", provider: "Google", icon_url: "/assets/img/icon/google-logo.png" };
	const imageModels: ArticleModel[] = [googleIcon, ...cfg.image_models];

	return (
		<div className="max-w-2xl mx-auto space-y-6 pb-20">
			<h1 className="text-2xl font-bold">Article Generator</h1>

			{/* ── Step 1: Basic Info (shown in both form + title states) ── */}
			{(step === "form" || step === "title") && (
				<div className="space-y-5 rounded-xl border border-border bg-card p-6">
					<h2 className="text-base font-semibold">Basic Information</h2>

					<div className="grid grid-cols-2 gap-4">
						<SelectBtn label="Language" options={cfg.languages} value={language} onChange={setLanguage} />
						<SelectBtn label="Tone of Voice" options={["", ...cfg.tones]} value={tone} onChange={setTone} />
					</div>

					<ModelSelect
						label="AI Model"
						hint="Pick which AI model generates the article content (e.g. Claude, GPT, Gemini)."
						models={cfg.text_models} disabledModels={cfg.disabled_text_models}
						value={textModel} onChange={setTextModel}
					/>

					{cfg.brands.length > 0 && (
						<BrandSelect brands={cfg.brands} value={brandId} onChange={setBrandId} />
					)}

					{brandId > 0 && visiblePresetTypes.length > 0 && (
						<div className="grid grid-cols-2 gap-4">
							{visiblePresetTypes.map((t) => (
								<PresetSelect key={t} label={PRESET_LABELS[t] ?? t} items={presets[t] ?? []} value={brandPresets[t] ?? 0} onChange={(v) => setBrandPresets((p) => ({ ...p, [t]: v }))} />
							))}
						</div>
					)}

					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Keywords *</label>
						<ChipInput value={keywords} onChange={setKeywords} />
					</div>

					{step === "form" && (
						<Button className="w-full gap-2" disabled={!keywords.trim() || generateTitle.isPending} onClick={handleGenerateTitle}>
							{generateTitle.isPending ? <><Loader2 size={16} className="animate-spin" /> Generating title...</> : "Next"}
						</Button>
					)}
				</div>
			)}

			{/* ── Step 2: Title & Context (shown only in title state) ── */}
			{step === "title" && (
				<div className="rounded-xl border border-border bg-card p-6 space-y-5">
					<h2 className="text-base font-semibold">Title &amp; Context</h2>

					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
							Article Title
							<button type="button" onClick={handleGenerateTitle} disabled={generateTitle.isPending} title="Regenerate title" className="text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">
								<RotateCcw size={14} />
							</button>
						</label>
						{generateTitle.isPending ? (
							<div className="flex items-center gap-2 text-muted-foreground h-9 px-3"><Loader2 size={14} className="animate-spin" /><span className="text-sm">Generating...</span></div>
						) : (
							<Textarea value={title} onChange={(e) => setTitle(e.target.value)} className="resize-none text-sm font-medium" rows={2} />
						)}
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Context (optional)</label>
						<Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. This article is for a digital marketing blog targeting small business owners" className="resize-none text-sm" rows={3} />
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Audience (optional)</label>
						<Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. Small business owners, entrepreneurs, marketing professionals" className="text-sm" />
					</div>

					<div className="space-y-3 pt-1">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Embeds</p>
						<label className="flex items-start gap-3 cursor-pointer">
							<input type="checkbox" checked={addVideo} onChange={(e) => setAddVideo(e.target.checked)} className="mt-0.5 rounded" />
							<div>
								<p className="text-sm font-medium">Add Video Embeds</p>
								<p className="text-xs text-muted-foreground">Include YouTube video embeds related to the keywords.</p>
							</div>
						</label>
						<label className="flex items-start gap-3 cursor-pointer">
							<input type="checkbox" checked={addImages} onChange={(e) => setAddImages(e.target.checked)} className="mt-0.5 rounded" />
							<div>
								<p className="text-sm font-medium">Add Images</p>
								<p className="text-xs text-muted-foreground">Include images in the article related to the keyword.</p>
							</div>
						</label>
						{addImages && (
							<ModelSelect label="Image Source" models={imageModels} disabledModels={cfg.disabled_image_models} value={imageSource} onChange={setImageSource} allowEmpty={false} defaultLabel="Google Images" />
						)}
					</div>

					<div className="flex gap-2 pt-1">
						<Button variant="outline" className="flex-1" onClick={() => setStep("form")}>Back</Button>
						<Button className="flex-1 gap-2" disabled={!title.trim() || createArticle.isPending || streamPrepare.isPending} onClick={handleStartGeneration}>
							{(createArticle.isPending || streamPrepare.isPending) ? <><Loader2 size={14} className="animate-spin" /> Starting...</> : <><Wand2 size={14} /> Generate Article</>}
						</Button>
					</div>
				</div>
			)}

			{/* ── Streaming ── */}
			{step === "streaming" && (
				<div className="rounded-xl border border-border bg-card p-6 space-y-4">
					<div className="flex items-center gap-2 text-sm font-medium"><Loader2 size={16} className="animate-spin text-primary" /> Writing article...</div>
					<div className="w-full bg-muted rounded-full h-2 overflow-hidden">
						<div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${streamProgress}%` }} />
					</div>
					{streamContent && (
						<div className="max-h-64 overflow-y-auto rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground whitespace-pre-wrap font-mono">{streamContent.slice(-800)}</div>
					)}
				</div>
			)}

			{/* ── Done ── */}
			{step === "done" && (
				<div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-3 text-center">
					<p className="text-lg font-semibold text-primary">Article generated!</p>
					<p className="text-sm text-muted-foreground">Redirecting to editor...</p>
					<Loader2 size={20} className="animate-spin text-primary mx-auto" />
				</div>
			)}
		</div>
	);
}
