import { useState } from "react";
import { ChevronLeft, ChevronRight, Database, Download, Image, Megaphone, PlusCircle, ThumbsDown, ThumbsUp, Trash2, Wand2, X, ZoomIn } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import { useImages, useImageConfig } from "@/api/tools";
import { useConfirm } from "@/components/ui/confirm-dialog";
import type { AdOption } from "@/api/tools";
import { StyleSelector, AspectSelector, ModelSelector } from "./image-selector-inputs";

type Tab = "image" | "ad";
type Aspect = "Square" | "Portrait" | "Landscape";

interface AdBrief {
	use_case: string; objective: string; audience_temp: string; visual_angle: string;
	product_name: string; offer: string; audience: string; placement: string;
}

function SelectField({ label, value, onChange, options, hint }: { label: string; value: string; onChange: (v: string) => void; options: AdOption[]; hint?: string }) {
	return (
		<div className="space-y-1">
			<label className="text-sm font-medium">{label}</label>
			<select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
				{options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
			</select>
			{hint && <p className="text-xs text-muted-foreground">{hint}</p>}
		</div>
	);
}

export function ImageGeneratorPage() {
	const confirm = useConfirm();
	const [sheetOpen, setSheetOpen] = useState(false);
	const [tab, setTab] = useState<Tab>("image");
	const [aspect, setAspect] = useState<Aspect>("Square");
	const [model, setModel] = useState("");
	const [style, setStyle] = useState("None");
	const [stylePrompt, setStylePrompt] = useState("");
	const [prompt, setPrompt] = useState("");
	const [generating, setGenerating] = useState(false);
	const [lastImageUrl, setLastImageUrl] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [zoomImg, setZoomImg] = useState<{ id: string; thumb: string; description: string } | null>(null);
	const [ratings, setRatings] = useState<Record<string, 1 | -1>>({});
	const [ad, setAd] = useState<AdBrief>({
		use_case: "saas", objective: "scroll_stopper", audience_temp: "cold",
		visual_angle: "auto", product_name: "", offer: "", audience: "", placement: "linkedin_feed",
	});
	const setAdField = (k: keyof AdBrief) => (v: string) => setAd((p) => ({ ...p, [k]: v }));

	const { data: config, isLoading: configLoading } = useImageConfig(aspect);
	const { data: gallery, isLoading: galleryLoading } = useImages(page);

	const models = config?.models ?? [];
	const styles = config?.styles ?? [];
	const activeModel = model || models[0]?.model || "";
	const activeModelData = models.find((m) => m.model === activeModel);
	const credits = activeModelData?.credits ?? null;

	const handleGenerate = async () => {
		if (tab === "image" && !prompt.trim()) { toast.error("Enter a prompt."); return; }
		if (!activeModel) { toast.error("No model available for your plan."); return; }
		setGenerating(true);
		try {
			const body: Record<string, unknown> = { model: activeModel, aspect_ratio: aspect, style_prompt: stylePrompt };
			if (tab === "image") {
				body.prompt = prompt;
			} else {
				body.ad_image = true;
				body.prompt = ad.product_name ? `${ad.product_name} ad creative` : "premium ad creative";
				Object.assign(body, {
					ad_use_case: ad.use_case, ad_objective: ad.objective, ad_audience_temp: ad.audience_temp,
					ad_visual_angle: ad.visual_angle, ad_product_name: ad.product_name, ad_offer: ad.offer,
					ad_audience: ad.audience, ad_placement: ad.placement,
				});
			}
			const res = await apiClient.post<{ image_url: string }>("/api/spa/ai/image", body);
			setLastImageUrl(res.image_url ?? null);
			toast.success("Image generated!");
			if (tab === "image") setPrompt("");
			queryClient.invalidateQueries({ queryKey: ["images"] });
		} catch (err) {
			toast.error((err as { message?: string })?.message ?? "Generation failed.");
		} finally {
			setGenerating(false);
		}
	};

	const handleDelete = async (id: string) => {
		const ok = await confirm({ title: "Delete image", message: "This image will be permanently deleted.", confirmLabel: "Delete", variant: "destructive" });
		if (!ok) return;
		try {
			await apiClient.post("/api/spa/images/delete", { id });
			queryClient.invalidateQueries({ queryKey: ["images"] });
			toast.success("Image deleted.");
		} catch (err) {
			toast.error((err as { message?: string })?.message ?? "Delete failed.");
		}
	};

	const handleRate = async (id: string, rating: 1 | -1) => {
		const current = ratings[id];
		const newRating = current === rating ? undefined : rating;
		setRatings((prev) => {
			const next = { ...prev };
			if (newRating === undefined) delete next[id]; else next[id] = newRating;
			return next;
		});
		if (newRating !== undefined) {
			try {
				await apiClient.post("/api/spa/images/rate", { id, rating: newRating });
			} catch {}
		}
	};

	const handleDownload = async (thumb: string, description: string) => {
		try {
			const res = await fetch(thumb);
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = (description.slice(0, 40).replace(/[^a-z0-9]/gi, "-") || "ai-image") + ".png";
			a.click();
			URL.revokeObjectURL(url);
		} catch {
			window.open(thumb, "_blank");
		}
	};

	const generateButton = (
		<Button className="w-full mt-4" onClick={handleGenerate} disabled={generating || !activeModel}>
			{generating ? (
				<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
			) : (
				<Wand2 size={16} />
			)}
			{generating ? "Generating..." : "Generate image"}
			{credits !== null && !generating && (
				<span className="ml-2 flex items-center gap-1 opacity-90 text-sm">
					<Database size={14} /> {credits}
				</span>
			)}
		</Button>
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Image Generator</h1>
				<Button onClick={() => setSheetOpen(true)}>
					<PlusCircle size={16} />
					Generate new image
				</Button>
			</div>

			<Sheet open={sheetOpen} onOpenChange={(o) => { setSheetOpen(o); if (!o) setLastImageUrl(null); }}>
				<SheetContent side="right" className="sm:max-w-[620px] flex flex-col gap-0 p-0">
					<SheetHeader className="px-6 py-4 border-b border-border shrink-0">
						<SheetTitle>AI Images</SheetTitle>
					</SheetHeader>

					<div className="flex-1 overflow-y-auto flex flex-col min-h-0">
						{lastImageUrl && (
							<div className="shrink-0 bg-muted">
								<img src={lastImageUrl} alt="Generated image" className="w-full object-cover max-h-80" />
							</div>
						)}
						<div className="flex flex-col gap-4 px-6 py-4">
						{/* Image / Ad Image tabs */}
						<div className="flex gap-1 p-1 bg-muted rounded-xl">
							<button onClick={() => setTab("image")} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${tab === "image" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
								<Image size={15} /> Image
							</button>
							<button onClick={() => setTab("ad")} className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${tab === "ad" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
								<Megaphone size={15} /> Ad Image
							</button>
						</div>

						{tab === "image" ? (
							<>
								<div className="space-y-1.5">
									<label className="text-sm font-medium">Prompt</label>
									<Textarea placeholder="Describe the image you want to generate..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className="resize-none" />
									<p className="text-xs text-muted-foreground">Enter your image description and use options below to adjust style and size.</p>
								</div>

								<div className="space-y-1.5">
									<label className="text-sm font-medium">Style</label>
									<StyleSelector styles={styles} value={style} onChange={(v, p) => { setStyle(v); setStylePrompt(p); }} />
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1.5">
										<label className="text-sm font-medium">Aspect ratio</label>
										<AspectSelector value={aspect} onChange={setAspect} />
									</div>
									<div className="space-y-1.5">
										<label className="text-sm font-medium">Model</label>
										<ModelSelector models={models} value={activeModel} onChange={setModel} disabled={configLoading} />
									</div>
								</div>

								{generateButton}
							</>
						) : (
							<>
								<div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
									<p className="font-semibold text-base">Ad Creative Brief (SaaS)</p>
									<p className="text-sm text-white/80 mt-0.5">Fill in the brief — we'll craft an optimized ad image prompt.</p>
								</div>

								<div className="grid grid-cols-1 gap-3">
									<SelectField label="Use case" value={ad.use_case} onChange={setAdField("use_case")} options={config?.ad_use_cases ?? [{ key: "saas", label: "SaaS (default)" }]} hint="Applies a proven prompt recipe for this use case." />
									<SelectField label="Ad objective" value={ad.objective} onChange={setAdField("objective")} options={config?.ad_objectives ?? []} />
									<SelectField label="Audience temperature" value={ad.audience_temp} onChange={setAdField("audience_temp")} options={config?.ad_audience_temps ?? []} />
									<SelectField label="Visual angle" value={ad.visual_angle} onChange={setAdField("visual_angle")} options={config?.ad_visual_angles ?? []} />

									<div className="space-y-1">
										<label className="text-sm font-medium">Product name</label>
										<input type="text" value={ad.product_name} onChange={(e) => setAdField("product_name")(e.target.value)} maxLength={120} placeholder="e.g. SmartlyQ" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
									</div>

									<div className="space-y-1">
										<label className="text-sm font-medium">Headline / offer</label>
										<input type="text" value={ad.offer} onChange={(e) => setAdField("offer")(e.target.value)} maxLength={80} placeholder="e.g. 14 DAYS FREE TRIAL" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
									</div>

									<div className="space-y-1">
										<label className="text-sm font-medium">Target audience</label>
										<input type="text" value={ad.audience} onChange={(e) => setAdField("audience")(e.target.value)} maxLength={180} placeholder="e.g. founders, growth marketers" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
									</div>

									<SelectField label="Placement" value={ad.placement} onChange={setAdField("placement")} options={config?.ad_placements ?? []} />
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1.5">
										<label className="text-sm font-medium">Aspect ratio</label>
										<AspectSelector value={aspect} onChange={setAspect} />
									</div>
									<div className="space-y-1.5">
										<label className="text-sm font-medium">Model</label>
										<ModelSelector models={models} value={activeModel} onChange={setModel} disabled={configLoading} />
									</div>
								</div>

								{generateButton}
							</>
						)}
						</div>
					</div>
				</SheetContent>
			</Sheet>

			{/* Zoom lightbox */}
			<Dialog open={!!zoomImg} onOpenChange={(o) => { if (!o) setZoomImg(null); }}>
				<DialogContent className="max-w-3xl p-0 bg-black border-0 overflow-hidden [&>button:last-of-type]:hidden">
					{zoomImg && (
						<div className="flex flex-col">
							<div className="flex items-center justify-end px-3 pt-3 pb-2">
								<button type="button" onClick={() => setZoomImg(null)} className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors">
									<X size={16} />
								</button>
							</div>
							<img src={zoomImg.thumb} alt={zoomImg.description} className="w-full max-h-[75vh] object-contain px-4 pb-2" />
							{zoomImg.description && (
								<p className="text-white/90 text-sm text-center px-6 py-3">{zoomImg.description}</p>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Generated Images ({gallery?.total ?? 0})</h2>
				</CardHeader>
				<CardContent>
					{galleryLoading ? (
						<div className="flex h-40 items-center justify-center">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						</div>
					) : !(gallery?.images ?? []).length ? (
						<div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
							<Image size={48} strokeWidth={1} />
							<p>No images generated yet.</p>
						</div>
					) : (
						<>
							<div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
								{gallery?.images.map((img) => (
									<div key={img.id} className="group relative">
										<div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted transition-all group-hover:border-primary">
											<img src={img.thumb} alt={img.description} className="h-full w-full object-cover" />
											{/* Hover overlay — clicking background opens side panel */}
											<div
												className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-1.5 cursor-pointer"
												onClick={() => { setLastImageUrl(img.thumb); setSheetOpen(true); }}
											>
												<button
													type="button"
													title="Zoom"
													onClick={(e) => { e.stopPropagation(); setZoomImg(img); }}
													className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
												>
													<ZoomIn size={15} />
												</button>
												<button
													type="button"
													title="Download"
													onClick={(e) => { e.stopPropagation(); handleDownload(img.thumb, img.description); }}
													className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
												>
													<Download size={15} />
												</button>
												<button
													type="button"
													title="Thumbs up"
													onClick={(e) => { e.stopPropagation(); handleRate(img.id, 1); }}
													className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${ratings[img.id] === 1 ? "bg-green-500 text-white" : "bg-white/20 hover:bg-white/40 text-white"}`}
												>
													<ThumbsUp size={15} />
												</button>
												<button
													type="button"
													title="Thumbs down"
													onClick={(e) => { e.stopPropagation(); handleRate(img.id, -1); }}
													className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${ratings[img.id] === -1 ? "bg-red-500 text-white" : "bg-white/20 hover:bg-white/40 text-white"}`}
												>
													<ThumbsDown size={15} />
												</button>
												<button
													type="button"
													title="Delete"
													onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
													className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-red-500 text-white transition-colors"
												>
													<Trash2 size={15} />
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
							{(gallery?.pages ?? 0) > 1 && (
								<div className="mt-4 flex items-center justify-between">
									<p className="text-sm text-muted-foreground">Page {gallery?.page} of {gallery?.pages}</p>
									<div className="flex gap-2">
										<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /></Button>
										<Button variant="outline" size="sm" disabled={page >= (gallery?.pages ?? 1)} onClick={() => setPage((p) => p + 1)}><ChevronRight size={16} /></Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
