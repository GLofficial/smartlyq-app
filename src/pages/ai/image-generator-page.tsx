import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, ChevronLeft, ChevronRight, Wand2 } from "lucide-react";
import { useImages } from "@/api/tools";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";

export function ImageGeneratorPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useImages(page);
	const [prompt, setPrompt] = useState("");
	const [generating, setGenerating] = useState(false);

	const handleGenerate = async () => {
		if (!prompt.trim()) { toast.error("Enter a prompt."); return; }
		setGenerating(true);
		try {
			const res = await apiClient.post<{ message: string; image_url: string }>("/api/spa/generate/image", { prompt });
			toast.success(res.message);
			setPrompt("");
			// Refresh gallery
			queryClient.invalidateQueries({ queryKey: ["images"] });
		} catch (err) {
			toast.error((err as { message?: string })?.message ?? "Generation failed.");
		} finally {
			setGenerating(false);
		}
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Image Generator</h1>

			<Card>
				<CardHeader><CardTitle className="text-base">Generate Image</CardTitle></CardHeader>
				<CardContent className="space-y-3">
					<div className="flex gap-3">
						<Input placeholder="Describe the image you want..." value={prompt} onChange={(e) => setPrompt(e.target.value)} className="flex-1" />
						<Button onClick={handleGenerate} disabled={generating}>
							<Wand2 size={16} /> {generating ? "Generating..." : "Generate"}
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle className="text-lg">Generated Images ({data?.total ?? 0})</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-40 items-center justify-center">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !data?.images.length ? (
						<div className="flex flex-col items-center gap-3 py-12">
							<ImagePlus size={48} className="text-[var(--muted-foreground)]" />
							<p className="text-[var(--muted-foreground)]">No images generated yet.</p>
						</div>
					) : (
						<>
							<div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
								{data.images.map((img) => (
									<a key={img.id} href={img.thumb} target="_blank" rel="noopener noreferrer" className="group">
										<div className="aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)] transition-all group-hover:border-[var(--sq-primary)]">
											<img src={img.thumb} alt={img.description} className="h-full w-full object-cover" />
										</div>
										<p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">{img.description}</p>
									</a>
								))}
							</div>
							{data.pages > 1 && (
								<div className="mt-4 flex items-center justify-between">
									<p className="text-sm text-[var(--muted-foreground)]">Page {data.page} of {data.pages}</p>
									<div className="flex gap-2">
										<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button>
										<Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
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
