import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export function EditorPage() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [assisting, setAssisting] = useState(false);

	const handleAiAssist = async (action: string) => {
		if (!content.trim()) { toast.error("Write something first."); return; }
		setAssisting(true);
		try {
			const res = await apiClient.post<{ result: string }>("/api/spa/ai/editor-assist", { content, action });
			setContent(res.result);
			toast.success("AI applied.");
		} catch (err) { toast.error((err as { message?: string })?.message ?? "Failed."); }
		finally { setAssisting(false); }
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Editor</h1>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" disabled={assisting} onClick={() => handleAiAssist("improve")}><Sparkles size={14} /> Improve</Button>
					<Button variant="outline" size="sm" disabled={assisting} onClick={() => handleAiAssist("shorten")}>Shorten</Button>
					<Button variant="outline" size="sm" disabled={assisting} onClick={() => handleAiAssist("expand")}>Expand</Button>
					<Button variant="outline" size="sm" disabled={assisting} onClick={() => handleAiAssist("fix")}>Fix Grammar</Button>
					<Button onClick={() => toast.success("Saved.")}><Save size={16} /> Save</Button>
				</div>
			</div>
			<Card>
				<CardContent className="p-6 space-y-4">
					<Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" className="text-lg font-medium" />
					<textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start writing..." rows={20}
						className="flex w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] resize-none leading-relaxed" />
				</CardContent>
			</Card>
		</div>
	);
}
