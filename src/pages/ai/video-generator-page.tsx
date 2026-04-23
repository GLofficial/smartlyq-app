import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Video, Wand2, ChevronDown, Database } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiClient } from "@/lib/api-client";
import { useVideoConfig, useGenerateVideo, type VideoModel, type VideoPricingRow } from "@/api/video-gen";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtModelName(m: string): string {
	return m
		.replace(/-(?:text|image)$/, "")
		.replace(/[_-]/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtMode(m: string): string {
	const map: Record<string, string> = {
		std: "Standard", standard: "Standard", basic: "Basic",
		pro: "Pro", professional: "Pro",
		hq: "HQ", high: "HQ", quality: "HQ",
		turbo: "Turbo", fast: "Fast",
	};
	return map[m] ?? (m.charAt(0).toUpperCase() + m.slice(1));
}

function uniqueVals<T>(arr: T[]): T[] { return [...new Set(arr)]; }

function minCredits(pricing: VideoPricingRow[]): number {
	if (!pricing.length) return 0;
	return Math.min(...pricing.map((p) => p.credits));
}

function resolveCredits(pricing: VideoPricingRow[], opts: GenOptions): number {
	const exact = pricing.find(
		(p) => p.length === opts.length && p.resolution === opts.resolution && p.mode === opts.mode && p.audio === (opts.audio ? 1 : 0),
	);
	if (exact) return exact.credits;
	const noAudio = pricing.find(
		(p) => p.length === opts.length && p.resolution === opts.resolution && p.mode === opts.mode,
	);
	return noAudio?.credits ?? pricing[0]?.credits ?? 0;
}

function defaultOpts(pricing: VideoPricingRow[]): GenOptions {
	const p = pricing[0];
	if (!p) return { length: "5", resolution: "720p", mode: "std", audio: false };
	return { length: p.length, resolution: p.resolution, mode: p.mode, audio: p.audio === 1 };
}

function statusInfo(s: number): { label: string; cls: string } {
	if (s === 1) return { label: "Done",       cls: "bg-green-500/15 text-green-600 dark:text-green-400" };
	if (s === 3) return { label: "Failed",     cls: "bg-red-500/15   text-red-600   dark:text-red-400"   };
	return            { label: "Processing", cls: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface GenOptions { length: string; resolution: string; mode: string; audio: boolean; }

interface VideoListData {
	videos: { id: number; url: string; prompt: string; status: number; created: string }[];
	total: number; page: number; pages: number;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const TRIGGER_CLS = "w-full h-10 flex items-center gap-2 px-3 border border-border rounded-lg bg-background text-sm text-left hover:bg-muted/40 transition-colors disabled:opacity-50";

function ModelSelector({ models, value, onChange }: { models: VideoModel[]; value: string; onChange: (m: string) => void }) {
	const [open, setOpen] = useState(false);
	const active = models.find((m) => m.model === value) ?? models[0];

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button type="button" className={TRIGGER_CLS} disabled={!models.length}>
					<Video size={16} className="shrink-0 text-muted-foreground" />
					<span className="flex-1 truncate">
						{active ? fmtModelName(active.model) : "Select model"}
					</span>
					{active && active.pricing.length > 0 && (
						<span className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
							<Database size={10} /> {minCredits(active.pricing)}+
						</span>
					)}
					<ChevronDown size={14} className="text-muted-foreground shrink-0" />
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80 p-1 max-h-72 overflow-y-auto">
				{models.map((m) => (
					<button
						key={m.model}
						type="button"
						onClick={() => { onChange(m.model); setOpen(false); }}
						className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${m.model === value ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"}`}
					>
						<Video size={16} className="shrink-0 text-muted-foreground" />
						<span className="flex-1 truncate min-w-0">{fmtModelName(m.model)}</span>
						{m.pricing.length > 0 && (
							<span className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
								<Database size={10} /> {minCredits(m.pricing)}+
							</span>
						)}
					</button>
				))}
				{!models.length && <p className="px-3 py-2 text-sm text-muted-foreground">No models available.</p>}
			</PopoverContent>
		</Popover>
	);
}

function OptBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${active ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-background text-foreground hover:bg-muted/60"}`}
		>
			{children}
		</button>
	);
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}
		>
			<span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${on ? "left-[calc(100%-1.375rem)]" : "left-0.5"}`} />
		</button>
	);
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function VideoGeneratorPage() {
	const configQuery = useVideoConfig();
	const gen = useGenerateVideo();

	const models: VideoModel[] = configQuery.data?.models ?? [];
	const [selectedModel, setSelectedModel] = useState<string>("");
	const [opts, setOpts] = useState<GenOptions>({ length: "5", resolution: "720p", mode: "std", audio: false });
	const [prompt, setPrompt] = useState("");

	const model = selectedModel || models[0]?.model || "";
	const modelData = models.find((m) => m.model === model);
	const pricing = modelData?.pricing ?? [];

	const lengths     = useMemo(() => uniqueVals(pricing.map((p) => p.length)).sort(), [pricing]);
	const resolutions = useMemo(() => uniqueVals(pricing.map((p) => p.resolution)).filter(Boolean).sort(), [pricing]);
	const modes       = useMemo(() => uniqueVals(pricing.map((p) => p.mode)).filter(Boolean), [pricing]);
	const hasAudio    = useMemo(() => pricing.some((p) => p.audio === 1), [pricing]);
	const credits     = resolveCredits(pricing, opts);

	function handleModelChange(m: string) {
		setSelectedModel(m);
		const md = models.find((x) => x.model === m);
		if (md) setOpts(defaultOpts(md.pricing));
	}

	// Auto-reset opts when config first loads
	useEffect(() => {
		if (models.length > 0 && !selectedModel) {
			const md = models[0];
			if (md?.pricing.length) setOpts(defaultOpts(md.pricing));
		}
	}, [models.length]); // eslint-disable-line react-hooks/exhaustive-deps

	// Polled video list — refetch every 5s while any video is still processing
	const videosQuery = useQuery({
		queryKey: ["videos", 1],
		queryFn: () => apiClient.get<VideoListData>("/api/spa/videos?page=1"),
		refetchInterval: (query) => {
			const vids = (query.state.data as VideoListData | undefined)?.videos ?? [];
			return vids.some((v) => v.status !== 1 && v.status !== 3) ? 5000 : false;
		},
	});
	const videos = videosQuery.data?.videos ?? [];

	function handleGenerate() {
		if (!prompt.trim()) { toast.error("Enter a prompt."); return; }
		if (!model)         { toast.error("Select a model."); return; }
		gen.mutate(
			{ prompt, model, type: "text_video", length: opts.length, resolution: opts.resolution, mode: opts.mode, audio: opts.audio ? 1 : 0 },
			{
				onSuccess: () => {
					toast.success("Video generation started! It may take a few minutes.");
					setPrompt("");
					videosQuery.refetch();
				},
				onError: (e) => toast.error((e as { message?: string })?.message ?? "Failed to start generation."),
			},
		);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Video Generator</h1>

			<div className="grid gap-6 lg:grid-cols-5">
				{/* ── Left: settings ──────────────────────────────── */}
				<div className="lg:col-span-2 space-y-4">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base">Text to Video</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Model */}
							<div className="space-y-1.5">
								<label className="text-sm font-medium">Model</label>
								{configQuery.isLoading ? (
									<div className="h-10 rounded-lg bg-muted animate-pulse" />
								) : (
									<ModelSelector models={models} value={model} onChange={handleModelChange} />
								)}
							</div>

							{/* Prompt */}
							<div className="space-y-1.5">
								<label className="text-sm font-medium">Prompt</label>
								<Textarea
									placeholder="Describe your video in detail..."
									value={prompt}
									onChange={(e) => setPrompt(e.target.value)}
									className="min-h-[100px] resize-none"
								/>
							</div>

							{/* Options */}
							{pricing.length > 0 && (
								<div className="space-y-3 border-t border-border pt-3">
									{lengths.length > 1 && (
										<div className="space-y-1.5">
											<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Length</p>
											<div className="flex flex-wrap gap-2">
												{lengths.map((l) => (
													<OptBtn key={l} active={opts.length === l} onClick={() => setOpts((o) => ({ ...o, length: l }))}>
														{l}s
													</OptBtn>
												))}
											</div>
										</div>
									)}

									{resolutions.length > 1 && (
										<div className="space-y-1.5">
											<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Resolution</p>
											<div className="flex flex-wrap gap-2">
												{resolutions.map((r) => (
													<OptBtn key={r} active={opts.resolution === r} onClick={() => setOpts((o) => ({ ...o, resolution: r }))}>
														{r}
													</OptBtn>
												))}
											</div>
										</div>
									)}

									{modes.length > 1 && (
										<div className="space-y-1.5">
											<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mode</p>
											<div className="flex flex-wrap gap-2">
												{modes.map((m) => (
													<OptBtn key={m} active={opts.mode === m} onClick={() => setOpts((o) => ({ ...o, mode: m }))}>
														{fmtMode(m)}
													</OptBtn>
												))}
											</div>
										</div>
									)}

									{hasAudio && (
										<div className="flex items-center justify-between">
											<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Audio</p>
											<Toggle on={opts.audio} onToggle={() => setOpts((o) => ({ ...o, audio: !o.audio }))} />
										</div>
									)}
								</div>
							)}

							{/* Credits + Generate */}
							<div className="flex items-center gap-3 pt-1">
								{credits > 0 && (
									<span className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border rounded-lg px-3 py-2 shrink-0">
										<Database size={13} /> {credits} credits
									</span>
								)}
								<Button className="flex-1 gap-2" disabled={gen.isPending || !model} onClick={handleGenerate}>
									{gen.isPending
										? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
										: <Wand2 size={16} />}
									{gen.isPending ? "Generating..." : "Generate Video"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* ── Right: video gallery ────────────────────────── */}
				<div className="lg:col-span-3">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base flex items-center justify-between">
								Generated Videos
								{videos.some((v) => v.status !== 1 && v.status !== 3) && (
									<span className="text-xs text-muted-foreground font-normal flex items-center gap-1.5">
										<span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
										Processing
									</span>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{videosQuery.isLoading ? (
								<div className="flex h-40 items-center justify-center">
									<div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
								</div>
							) : !videos.length ? (
								<div className="flex flex-col items-center gap-3 py-16">
									<Video size={48} className="text-muted-foreground" />
									<p className="text-muted-foreground text-sm">No videos yet. Generate your first video!</p>
								</div>
							) : (
								<div className="grid gap-4 sm:grid-cols-2">
									{videos.map((v) => {
										const st = statusInfo(v.status);
										return (
											<div key={v.id} className="rounded-xl border border-border overflow-hidden bg-card">
												{v.url ? (
													<video src={v.url} controls className="w-full aspect-video bg-black" />
												) : (
													<div className="flex aspect-video items-center justify-center bg-muted">
														{v.status !== 1 && v.status !== 3 ? (
															<div className="flex flex-col items-center gap-2">
																<div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
																<span className="text-xs text-muted-foreground">Processing…</span>
															</div>
														) : (
															<Video size={32} className="text-muted-foreground" />
														)}
													</div>
												)}
												<div className="p-3 flex items-start justify-between gap-2">
													<p className="text-sm line-clamp-2 flex-1">{v.prompt || "Untitled"}</p>
													<span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${st.cls}`}>{st.label}</span>
												</div>
												<div className="px-3 pb-3">
													<p className="text-xs text-muted-foreground">
														{new Date(v.created).toLocaleDateString()}
													</p>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
