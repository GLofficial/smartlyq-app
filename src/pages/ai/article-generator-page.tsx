import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2, RotateCcw, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import {
	useArticleConfig,
	useGenerateTitle,
	useCreateArticle,
	useStreamPrepare,
	useStreamComplete,
} from "@/api/articles";

type Step = "form" | "title" | "streaming" | "done";

function SelectBtn({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
	const [open, setOpen] = useState(false);
	return (
		<div className="space-y-1">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button type="button" className="w-full h-9 flex items-center justify-between gap-2 px-3 border border-border rounded-lg bg-background text-sm hover:bg-muted/40 transition-colors">
						<span className="truncate">{value || "Select..."}</span>
						<ChevronDown size={14} className="shrink-0 text-muted-foreground" />
					</button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-56 p-1 max-h-60 overflow-y-auto">
					{options.map((o) => (
						<button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }}
							className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${value === o ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
							{o}
						</button>
					))}
				</PopoverContent>
			</Popover>
		</div>
	);
}

function ModelSelect({ label, models, value, onChange }: { label: string; models: { model: string; name: string }[]; value: string; onChange: (v: string) => void }) {
	const [open, setOpen] = useState(false);
	const active = models.find((m) => m.model === value);
	return (
		<div className="space-y-1">
			<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<button type="button" className="w-full h-9 flex items-center justify-between gap-2 px-3 border border-border rounded-lg bg-background text-sm hover:bg-muted/40 transition-colors" disabled={!models.length}>
						<span className="truncate">{active?.name ?? "Select model..."}</span>
						<ChevronDown size={14} className="shrink-0 text-muted-foreground" />
					</button>
				</PopoverTrigger>
				<PopoverContent align="start" className="w-64 p-1 max-h-60 overflow-y-auto">
					{models.map((m) => (
						<button key={m.model} type="button" onClick={() => { onChange(m.model); setOpen(false); }}
							className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${value === m.model ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
							{m.name}
						</button>
					))}
					{!models.length && <p className="px-3 py-2 text-sm text-muted-foreground">No models available.</p>}
				</PopoverContent>
			</Popover>
		</div>
	);
}

export function ArticleGeneratorPage() {
	const navigate = useNavigate();
	const { data: cfg, isLoading: cfgLoading } = useArticleConfig();
	const generateTitle = useGenerateTitle();
	const createArticle = useCreateArticle();
	const streamPrepare = useStreamPrepare();
	const streamComplete = useStreamComplete();

	const [step, setStep] = useState<Step>("form");
	const [keywords, setKeywords] = useState("");
	const [language, setLanguage] = useState("English");
	const [tone, setTone] = useState("");
	const [audience, setAudience] = useState("");
	const [context, setContext] = useState("");
	const [textModel, setTextModel] = useState("");
	const [imageSource, setImageSource] = useState("");
	const [title, setTitle] = useState("");
	const [streamContent, setStreamContent] = useState("");
	const [streamProgress, setStreamProgress] = useState(0);
	const streamRef = useRef<EventSource | null>(null);
	const contentRef = useRef("");
	const tokenCountRef = useRef(0);

	useEffect(() => {
		if (cfg?.text_models?.length && !textModel) setTextModel(cfg.text_models[0]?.model ?? "");
		if (cfg?.languages?.length && !cfg.languages.includes(language)) setLanguage(cfg.languages[0] ?? "English");
	}, [cfg]);

	const handleGenerateTitle = useCallback(async () => {
		if (!keywords.trim()) { toast.error("Enter keywords first."); return; }
		setStep("title");
		setTitle("");
		try {
			const res = await generateTitle.mutateAsync({ keywords, language, tone });
			setTitle(res.title);
		} catch {
			toast.error("Failed to generate title.");
			setStep("form");
		}
	}, [keywords, language, tone]);

	const handleStartGeneration = useCallback(async () => {
		if (!title.trim()) { toast.error("Title is required."); return; }
		try {
			const created = await createArticle.mutateAsync({ keywords, language, tone, audience, context, title, text_model: textModel, image_source: imageSource });
			await startStream(created.id, textModel);
		} catch {
			toast.error("Failed to create article.");
			setStep("form");
		}
	}, [title, keywords, language, tone, audience, context, textModel, imageSource]);

	const startStream = useCallback(async (id: string, model: string) => {
		setStep("streaming");
		setStreamContent("");
		setStreamProgress(5);
		contentRef.current = "";
		tokenCountRef.current = 0;

		try {
			const prep = await streamPrepare.mutateAsync(id);
			if (prep.stream_url && prep.stream_token) {
				// Railway stream
				const es = new EventSource(`${prep.stream_url}?token=${encodeURIComponent(prep.stream_token)}`);
				streamRef.current = es;
				let settled = false;
				es.onmessage = (ev) => {
					if (ev.data === "[DONE]") {
						es.close();
						if (!settled) { settled = true; finishStream(id, model); }
						return;
					}
					try {
						const obj = JSON.parse(ev.data);
						const chunk = obj?.choices?.[0]?.delta?.content ?? "";
						if (chunk) { contentRef.current += chunk; tokenCountRef.current++; setStreamContent(contentRef.current); setStreamProgress(Math.min(95, 5 + tokenCountRef.current / 10)); }
					} catch {}
				};
				es.onerror = () => { es.close(); if (!settled) { settled = true; finishStream(id, model); } };
			} else {
				toast.error("Stream not available. Please try again.");
				setStep("form");
			}
		} catch {
			toast.error("Failed to prepare stream.");
			setStep("form");
		}
	}, []);

	const finishStream = useCallback(async (id: string, model: string) => {
		setStreamProgress(97);
		try {
			await streamComplete.mutateAsync({ id, content: contentRef.current, output_tokens: tokenCountRef.current, model });
			setStreamProgress(100);
			setStep("done");
			setTimeout(() => navigate(`/w/${encodeURIComponent(location.pathname.split("/")[2] ?? "")}/articles/${id}`), 800);
		} catch {
			toast.error("Failed to save article.");
			setStep("form");
		}
	}, [navigate]);

	useEffect(() => () => { streamRef.current?.close(); }, []);

	if (cfgLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;
	if (!cfg?.has_access) return <div className="flex h-64 items-center justify-center"><p className="text-muted-foreground">Article generator is not available on your current plan.</p></div>;

	const imageOptions = ["", "Google", ...(cfg.image_models ?? []).map((m) => m.model)];
	const imageLabels: Record<string, string> = { "": "No images", "Google": "Google Images" };
	(cfg.image_models ?? []).forEach((m) => { imageLabels[m.model] = m.name; });

	return (
		<div className="max-w-2xl mx-auto space-y-6 pb-20">
			<h1 className="text-2xl font-bold">Article Generator</h1>

			{/* Step: Form */}
			{(step === "form" || step === "title") && (
				<div className="space-y-5 rounded-xl border border-border bg-card p-6">
					<div className="space-y-1.5">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Keywords *</label>
						<Textarea placeholder="e.g. best SEO tools for startups" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="resize-none min-h-[70px]" />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<SelectBtn label="Language" options={cfg.languages} value={language} onChange={setLanguage} />
						<SelectBtn label="Tone" options={cfg.tones.map((t) => t)} value={tone} onChange={setTone} />
					</div>

					<div className="grid grid-cols-2 gap-4">
						<SelectBtn label="Audience" options={["Beginners", "Intermediate", "Experts", "Professionals", "General"]} value={audience} onChange={setAudience} />
						<ModelSelect label="Text Model" models={cfg.text_models} value={textModel} onChange={setTextModel} />
					</div>

					<div className="space-y-1">
						<label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Context (Optional)</label>
						<Textarea placeholder="Additional context about your business, product, or article focus..." value={context} onChange={(e) => setContext(e.target.value)} className="resize-none min-h-[60px]" />
					</div>

					<SelectBtn label="Image Source" options={imageOptions} value={imageSource} onChange={setImageSource} />

					{step === "form" && (
						<Button className="w-full gap-2" disabled={!keywords.trim() || generateTitle.isPending} onClick={handleGenerateTitle}>
							{generateTitle.isPending ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
							{generateTitle.isPending ? "Generating title..." : "Generate Title"}
						</Button>
					)}
				</div>
			)}

			{/* Step: Title confirm */}
			{step === "title" && (
				<div className="rounded-xl border border-border bg-card p-6 space-y-4">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Generated Title</p>
					{generateTitle.isPending ? (
						<div className="flex items-center gap-2 text-muted-foreground"><Loader2 size={16} className="animate-spin" /><span className="text-sm">Generating...</span></div>
					) : (
						<>
							<Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-base font-medium" />
							<div className="flex gap-2">
								<Button variant="outline" size="sm" className="gap-1.5 flex-1" onClick={handleGenerateTitle} disabled={generateTitle.isPending}>
									<RotateCcw size={14} /> Regenerate
								</Button>
								<Button size="sm" className="flex-1 gap-1.5" onClick={handleStartGeneration} disabled={!title.trim() || createArticle.isPending || streamPrepare.isPending}>
									{(createArticle.isPending || streamPrepare.isPending) ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
									Generate Article
								</Button>
							</div>
						</>
					)}
				</div>
			)}

			{/* Step: Streaming */}
			{step === "streaming" && (
				<div className="rounded-xl border border-border bg-card p-6 space-y-4">
					<div className="flex items-center gap-2 text-sm font-medium">
						<Loader2 size={16} className="animate-spin text-primary" />
						Writing article...
					</div>
					<div className="w-full bg-muted rounded-full h-2 overflow-hidden">
						<div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${streamProgress}%` }} />
					</div>
					{streamContent && (
						<div className="max-h-64 overflow-y-auto rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground whitespace-pre-wrap font-mono">
							{streamContent.slice(-800)}
						</div>
					)}
				</div>
			)}

			{/* Step: Done */}
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
