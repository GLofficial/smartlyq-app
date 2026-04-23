import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Database, Sparkles, Wand2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useVideoConfig, useGenerateVideo, type VideoModel, type VideoPricingRow } from "@/api/video-gen";
import { ModelSelector, OptionGroup, Toggle, AiPromptDialog, SeedInput } from "./video-generator-options";
import { toast } from "sonner";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parse(s: string): string[] {
	return s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

const MODE_MAP: Record<string, string> = {
	std: "Standard", standard: "Standard", normal: "Normal",
	pro: "Pro", professional: "Pro", hq: "HQ",
	fast: "Fast", turbo: "Turbo",
};
function fmtMode(m: string) { return MODE_MAP[m] ?? (m.charAt(0).toUpperCase() + m.slice(1)); }
function fmtStyle(s: string) {
	return s.replace(/_/g, " ").replace(/\b(\w)/g, (c) => c.toUpperCase()).replace(/^3d /i, "3D ");
}
function fmtMovement(m: string) { return m.charAt(0).toUpperCase() + m.slice(1); }
function fmtLength(v: string) { return `${v}s`; }
function fmtResolution(r: string) { return r.toUpperCase(); }
function arMaxWidth(ar: string): string {
	if (ar === "9:16") return "45%";
	if (ar === "1:1")  return "65%";
	if (ar === "4:3" || ar === "3:4") return "80%";
	return "100%";
}

function resolveCredits(pricing: VideoPricingRow[], opts: FullOpts): number {
	const exact = pricing.find(
		(p) => p.length === opts.length && p.resolution === opts.resolution && p.mode === opts.mode && p.audio === (opts.audio ? 1 : 0),
	);
	if (exact) return exact.credits;
	const partial = pricing.find(
		(p) => p.length === opts.length && p.resolution === opts.resolution && p.mode === opts.mode,
	);
	return partial?.credits ?? pricing[0]?.credits ?? 0;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface FullOpts {
	length: string; resolution: string; mode: string; style: string;
	aspect_ratio: string; movement: string; audio: boolean;
	fixed_camera: boolean; sound_effects: boolean; director_mode: boolean;
	prompt_strength: number; seed: string;
}

function randomSeed() { return String(Math.floor(Math.random() * 2147483648)); }

interface VideoItem { id: string; url: string; status: number; aspect_ratio?: string; }

function defaultFullOpts(md: VideoModel): FullOpts {
	const p = md.pricing[0];
	return {
		length:          p?.length         ?? parse(md.length)[0]       ?? "5",
		resolution:      p?.resolution     ?? parse(md.resolution)[0]   ?? "720p",
		mode:            p?.mode           ?? parse(md.mode)[0]         ?? "std",
		style:           parse(md.style)[0]         ?? "",
		aspect_ratio:    parse(md.aspect_ratio)[0]  ?? "16:9",
		movement:        parse(md.movement)[0]       ?? "",
		audio:           false,
		fixed_camera:    false,
		sound_effects:   false,
		director_mode:   false,
		prompt_strength: md.prompt_strength ?? 50,
		seed:            randomSeed(),
	};
}

// ── Inline toggle button (label-free, for inline placement) ───────────────────

function TglBtn({ on, onToggle }: { on: boolean; onToggle: () => void }) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${on ? "bg-primary" : "bg-muted"}`}
		>
			<span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${on ? "left-[calc(100%-1.375rem)]" : "left-0.5"}`} />
		</button>
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function VideoGeneratorPage() {
	const configQuery = useVideoConfig();
	const gen         = useGenerateVideo();
	const models      = configQuery.data?.models ?? [];

	const [selectedModel,   setSelectedModel]   = useState("");
	const [prompt,          setPrompt]          = useState("");
	const [translatePrompt, setTranslatePrompt] = useState(false);
	const [aiPromptOpen,    setAiPromptOpen]    = useState(false);
	const [negativePrompt,  setNegativePrompt]  = useState("");
	const [translateNeg,    setTranslateNeg]    = useState(false);
	const [outputs,         setOutputs]         = useState(1);
	const [pendingIds,           setPendingIds]           = useState<string[]>([]);
	const [completedUrl,         setCompletedUrl]         = useState<string | null>(null);
	const [completedAspectRatio, setCompletedAspectRatio] = useState<string>("16:9");
	const [progress,             setProgress]             = useState(0);
	const [opts, setOpts] = useState<FullOpts>({
		length: "5", resolution: "720p", mode: "std", style: "", aspect_ratio: "16:9",
		movement: "", audio: false, fixed_camera: false, sound_effects: false,
		director_mode: false, prompt_strength: 50, seed: randomSeed(),
	});

	const modelId = selectedModel || models[0]?.model || "";
	const md      = models.find((m) => m.model === modelId);

	useEffect(() => {
		if (models.length > 0 && !selectedModel) {
			const preferred = models.find((m) => m.model === "pollo-v1-6") ?? models[0];
			if (preferred) { setSelectedModel(preferred.model); setOpts(defaultFullOpts(preferred)); }
		}
	}, [models.length]); // eslint-disable-line react-hooks/exhaustive-deps

	function handleModelChange(m: VideoModel) {
		setSelectedModel(m.model);
		setOpts(defaultFullOpts(m));
	}

	const isGenerating = pendingIds.length > 0 && completedUrl === null;

	// Animate progress bar from 0 → 90 over 90s while generating
	useEffect(() => {
		if (!isGenerating) return;
		setProgress(0);
		const iv = setInterval(() => setProgress((p) => (p >= 90 ? (clearInterval(iv), 90) : p + 1)), 1000);
		return () => clearInterval(iv);
	}, [isGenerating]);

	// Poll videos every 5s while pending, stop when one of our IDs is done
	const pollQuery = useQuery({
		queryKey: ["videos-poll", pendingIds],
		queryFn: () => apiClient.get<{ videos: VideoItem[] }>("/api/spa/videos?page=1"),
		enabled: isGenerating,
		refetchInterval: 30000,
	});
	useEffect(() => {
		if (!isGenerating) return;
		const done = (pollQuery.data?.videos ?? []).find((v) => pendingIds.includes(v.id) && v.status === 1 && v.url);
		if (done) { setProgress(100); setCompletedUrl(done.url); setCompletedAspectRatio(done.aspect_ratio ?? "16:9"); setPendingIds([]); }
	}, [pollQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

	const pricing     = md?.pricing ?? [];
	const lengths     = md ? parse(md.length) : [];
	const resolutions = md ? parse(md.resolution) : [];
	const modes       = md ? parse(md.mode) : [];
	const styles      = md ? parse(md.style) : [];
	const arRatios    = md ? parse(md.aspect_ratio) : [];
	const movements   = md ? parse(md.movement) : [];
	const credits     = resolveCredits(pricing, opts);
	const total       = credits * outputs;

	function handleGenerate() {
		if (!prompt.trim()) { toast.error("Enter a prompt."); return; }
		if (!modelId)       { toast.error("Select a model."); return; }
		gen.mutate(
			{
				prompt, model: modelId,
				length: opts.length, resolution: opts.resolution, mode: opts.mode,
				style: opts.style || undefined,
				audio: opts.audio ? 1 : 0, aspect_ratio: opts.aspect_ratio,
				negative_prompt: negativePrompt || undefined,
				movement: opts.movement || undefined,
				camera_fixed: opts.fixed_camera || undefined,
				director_mode: opts.director_mode || undefined,
				sound_effects: opts.sound_effects || undefined,
				prompt_strength: md?.prompt_strength !== null ? opts.prompt_strength : null,
				seed: opts.seed ? parseInt(opts.seed, 10) : null,
				outputs,
			},
			{
				onSuccess: (data) => { setPrompt(""); setCompletedUrl(null); setCompletedAspectRatio("16:9"); setPendingIds(data.ids ?? []); },
				onError: (e) => toast.error((e as { message?: string })?.message ?? "Generation failed."),
			},
		);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Video Generator</h1>

			<div className="grid gap-6 lg:grid-cols-5">

				{/* ── Left: options ──────────────────────────────── */}
				<div className="lg:col-span-2 h-[calc(100vh-120px)] flex flex-col">
					<Card className="flex flex-col h-full">
						<CardHeader className="shrink-0 pb-3">
							<CardTitle className="text-base">Text to Video</CardTitle>
						</CardHeader>

						{/* Scrollable options body */}
						<CardContent className="flex-1 overflow-y-auto min-h-0 px-6 pt-0 pb-4 space-y-5">

							{/* Model */}
							<div className="space-y-1.5">
								<p className="text-sm font-medium">Model</p>
								{configQuery.isLoading
									? <div className="h-14 rounded-lg bg-muted animate-pulse" />
									: <ModelSelector models={models} value={modelId} onChange={handleModelChange} />
								}
							</div>

							{/* Prompt + translate toggle */}
							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<p className="text-sm font-medium">Prompt</p>
									<div className="flex items-center gap-1.5">
										<span className="text-xs text-muted-foreground">Translate Prompt</span>
										<TglBtn on={translatePrompt} onToggle={() => setTranslatePrompt((t) => !t)} />
									</div>
								</div>
								<Textarea
									placeholder="Describe your video in detail..."
									value={prompt}
									onChange={(e) => setPrompt(e.target.value)}
									className="min-h-[100px]"
									maxLength={md?.prompt_max_length ?? 2000}
								/>
								<button
									type="button"
									onClick={() => setAiPromptOpen(true)}
									className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-0.5"
								>
									<Sparkles size={12} /> Generate with AI
								</button>
							</div>

							{/* Video Length — radio style */}
							{lengths.length > 0 && (
								<div className="flex items-center gap-4 flex-wrap">
									<p className="text-sm font-medium shrink-0">Video Length</p>
									{lengths.map((l) => (
										<label key={l} className="flex items-center gap-1.5 cursor-pointer text-sm">
											<input
												type="radio"
												name="vlen"
												checked={opts.length === l}
												onChange={() => setOpts((o) => ({ ...o, length: l }))}
												className="accent-primary"
											/>
											{fmtLength(l)}
										</label>
									))}
								</div>
							)}

							{modes.length > 0 && (
								<OptionGroup label="Mode" options={modes} value={opts.mode}
									onChange={(v) => setOpts((o) => ({ ...o, mode: v }))} fmt={fmtMode} />
							)}

							{styles.length > 0 && (
								<OptionGroup label="Style" options={styles} value={opts.style}
									onChange={(v) => setOpts((o) => ({ ...o, style: v }))} fmt={fmtStyle} />
							)}

							{resolutions.length > 0 && (
								<OptionGroup label="Resolution" options={resolutions} value={opts.resolution}
									onChange={(v) => setOpts((o) => ({ ...o, resolution: v }))} fmt={fmtResolution} />
							)}

							{arRatios.length > 0 && (
								<OptionGroup label="Aspect Ratio" options={arRatios} value={opts.aspect_ratio}
									onChange={(v) => setOpts((o) => ({ ...o, aspect_ratio: v }))} />
							)}

							{movements.length > 0 && (
								<OptionGroup label="Motion Range" options={movements} value={opts.movement}
									onChange={(v) => setOpts((o) => ({ ...o, movement: v }))} fmt={fmtMovement} />
							)}

							{md?.generate_audio && (
								<Toggle on={opts.audio} onToggle={() => setOpts((o) => ({ ...o, audio: !o.audio }))} label="Generate Audio" />
							)}

							{md?.fixed_camera && (
								<Toggle on={opts.fixed_camera} onToggle={() => setOpts((o) => ({ ...o, fixed_camera: !o.fixed_camera }))} label="Fixed Camera" />
							)}

							{md?.sound_effects && (
								<Toggle on={opts.sound_effects} onToggle={() => setOpts((o) => ({ ...o, sound_effects: !o.sound_effects }))} label="Sound Effects" />
							)}

							{md?.director_mode && (
								<Toggle on={opts.director_mode} onToggle={() => setOpts((o) => ({ ...o, director_mode: !o.director_mode }))} label="Director Mode" />
							)}

							{/* Negative Prompt */}
							{md?.negative_prompt && (
								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium">
											Negative Prompt{" "}
											<span className="text-muted-foreground font-normal text-xs">(Optional)</span>
										</p>
										<div className="flex items-center gap-1.5">
											<span className="text-xs text-muted-foreground">Translate</span>
											<TglBtn on={translateNeg} onToggle={() => setTranslateNeg((t) => !t)} />
										</div>
									</div>
									<Textarea
										placeholder="List all elements and effects you don't want to see in the generated video, for example, cartoonish characters, dark colors, explosions, animals, blurring, slow motion, distortion, animation, etc."
										value={negativePrompt}
										onChange={(e) => setNegativePrompt(e.target.value)}
										className="min-h-[80px] text-sm"
									/>
								</div>
							)}

							{/* Prompt Strength */}
							{md !== undefined && md.prompt_strength !== null && (
								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Prompt Strength</p>
										<span className="text-sm tabular-nums">{opts.prompt_strength}</span>
									</div>
									<input
										type="range" min={0} max={100}
										value={opts.prompt_strength}
										onChange={(e) => setOpts((o) => ({ ...o, prompt_strength: parseInt(e.target.value, 10) }))}
										className="w-full accent-primary"
									/>
								</div>
							)}

							{md?.seed && (
								<SeedInput value={opts.seed} onChange={(v) => setOpts((o) => ({ ...o, seed: v }))} />
							)}

							{/* Output Video Number */}
							<div className="space-y-1.5">
								<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Output Video Number</p>
								<div className="grid grid-cols-4 gap-2">
									{[1, 2, 3, 4].map((n) => (
										<button
											key={n} type="button" onClick={() => setOutputs(n)}
											className={`py-1.5 rounded-lg text-sm border transition-all ${outputs === n ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-background hover:bg-muted/60"}`}
										>
											{n}
										</button>
									))}
								</div>
							</div>
						</CardContent>

						{/* Sticky footer — credits + button */}
						<div className="shrink-0 border-t border-border px-6 py-4 space-y-3">
							{total > 0 && (
								<p className="flex items-center gap-1.5 text-sm text-muted-foreground">
									<Database size={13} /> Credits required: {total}
								</p>
							)}
							<Button className="w-full gap-2" disabled={gen.isPending || !modelId} onClick={handleGenerate}>
								{gen.isPending
									? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
									: <Wand2 size={16} />
								}
								{gen.isPending ? "Generating..." : "Create"}
							</Button>
						</div>
					</Card>
				</div>

				{/* ── Right: sample / loader / result ─────────────── */}
				<div className="lg:col-span-3 h-[calc(100vh-120px)]">
					{isGenerating ? (
						<Card className="h-full flex flex-col items-center justify-center p-8 text-center gap-6">
							<p className="text-lg font-semibold max-w-sm">
								SmartlyQ is generating your video, which may take 90 seconds.
							</p>
							<div className="w-full max-w-sm">
								<div className="w-full bg-muted rounded-full h-4 overflow-hidden">
									<div
										className="h-4 bg-primary rounded-full transition-all duration-1000 flex items-center justify-center text-[10px] text-primary-foreground font-medium"
										style={{ width: `${Math.max(progress, 4)}%` }}
									>
										{progress >= 10 ? `${progress}%` : ""}
									</div>
								</div>
							</div>
							<p className="text-sm text-muted-foreground max-w-sm">
								Once finished, the video will be saved in the{" "}
							<a href="/my/media" className="underline hover:opacity-80">Media Library</a>.{" "}
							You can leave this page and check it later, or stay here.
							</p>
						</Card>
					) : completedUrl ? (
						<Card className="h-full flex flex-col overflow-hidden">
							<CardHeader className="shrink-0 pb-3">
								<CardTitle className="text-base flex items-center justify-between">
									Generated Video
									<button type="button" onClick={() => setCompletedUrl(null)} className="text-xs text-muted-foreground hover:text-foreground font-normal">
										← Back to sample
									</button>
								</CardTitle>
							</CardHeader>
							<CardContent className="flex-1 min-h-0 p-0">
								<video
									src={completedUrl}
									controls autoPlay
									style={{ width: arMaxWidth(completedAspectRatio), height: "100%", objectFit: "contain", display: "block", background: "#000", margin: "0 auto" }}
								/>
							</CardContent>
						</Card>
					) : (
						<Card className="h-full flex flex-col overflow-hidden">
							<CardHeader className="shrink-0 pb-3">
								<CardTitle className="text-base">Sample Video</CardTitle>
							</CardHeader>
							<CardContent className="flex-1 min-h-0 p-0">
								<video
									src="https://cdn.smartlyq.com/video-sample.mp4"
									autoPlay muted loop playsInline
									style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", background: "#000" }}
								/>
							</CardContent>
						</Card>
					)}
				</div>

			</div>

			<AiPromptDialog open={aiPromptOpen} onClose={() => setAiPromptOpen(false)} onSelect={(p) => setPrompt(p)} />
		</div>
	);
}
