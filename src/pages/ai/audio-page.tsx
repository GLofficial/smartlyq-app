import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioLines, Wand2 } from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export function AudioPage() {
	const [text, setText] = useState("");
	const [generating, setGenerating] = useState(false);
	const [audioUrl, setAudioUrl] = useState("");

	const handleGenerate = async () => {
		if (!text.trim()) { toast.error("Enter text."); return; }
		setGenerating(true);
		try {
			const res = await apiClient.post<{ message: string; url: string }>("/api/spa/generate/tts", { text });
			toast.success(res.message);
			setAudioUrl(res.url);
		} catch (err) {
			toast.error((err as { message?: string })?.message ?? "TTS failed.");
		} finally { setGenerating(false); }
	};

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<h1 className="text-2xl font-bold">Text to Audio</h1>

			<Card>
				<CardHeader><CardTitle className="text-base">Convert Text to Speech</CardTitle></CardHeader>
				<CardContent className="space-y-4">
					<textarea
						className="flex min-h-[150px] w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] resize-none"
						placeholder="Enter text to convert to speech..."
						value={text}
						onChange={(e) => setText(e.target.value)}
					/>
					<Button onClick={handleGenerate} disabled={generating}>
						<Wand2 size={16} /> {generating ? "Generating..." : "Generate Audio"}
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle className="text-lg">Generated Audio</CardTitle></CardHeader>
				<CardContent>
					{audioUrl ? (
						<audio controls src={audioUrl} className="w-full" />
					) : (
						<div className="flex flex-col items-center gap-3 py-12">
							<AudioLines size={48} className="text-[var(--muted-foreground)]" />
							<p className="text-[var(--muted-foreground)]">Generated audio will appear here.</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
