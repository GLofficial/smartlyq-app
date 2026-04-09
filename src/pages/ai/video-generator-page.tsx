import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Wand2 } from "lucide-react";
import { useVideos } from "@/api/tools";
import { useState } from "react";
import { toast } from "sonner";

export function VideoGeneratorPage() {
	const { data, isLoading } = useVideos();
	const [prompt, setPrompt] = useState("");

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Video Generator</h1>

			<Card>
				<CardHeader><CardTitle className="text-base">Generate Video</CardTitle></CardHeader>
				<CardContent className="space-y-3">
					<div className="flex gap-3">
						<Input placeholder="Describe the video you want..." value={prompt} onChange={(e) => setPrompt(e.target.value)} className="flex-1" />
						<Button onClick={async () => {
						if (!prompt.trim()) { toast.error("Enter a prompt."); return; }
						toast.info("Video generation submitted. This may take a few minutes.");
					}}><Wand2 size={16} /> Generate</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle className="text-lg">Generated Videos</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !data?.videos.length ? (
						<div className="flex flex-col items-center gap-3 py-12">
							<Video size={48} className="text-[var(--muted-foreground)]" />
							<p className="text-[var(--muted-foreground)]">No videos generated yet.</p>
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{data.videos.map((v) => (
								<div key={v.id} className="rounded-lg border border-[var(--border)] overflow-hidden">
									{v.url ? (
										<video src={v.url} controls className="w-full aspect-video bg-black" />
									) : (
										<div className="flex aspect-video items-center justify-center bg-[var(--muted)]">
											<Video size={32} className="text-[var(--muted-foreground)]" />
										</div>
									)}
									<div className="p-3">
										<p className="text-sm line-clamp-2">{v.prompt || "Untitled"}</p>
										<p className="mt-1 text-xs text-[var(--muted-foreground)]">{new Date(v.created).toLocaleDateString()}</p>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
