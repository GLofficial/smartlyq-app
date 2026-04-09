import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, Save } from "lucide-react";
import { toast } from "sonner";

export function EditorPage() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Editor</h1>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => toast.info("AI assist coming soon.")}><Wand2 size={16} /> AI Assist</Button>
					<Button onClick={() => toast.success("Document saved.")}><Save size={16} /> Save</Button>
				</div>
			</div>

			<Card>
				<CardContent className="p-6 space-y-4">
					<Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" className="text-lg font-medium" />
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="Start writing..."
						rows={20}
						className="flex w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] resize-none leading-relaxed"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
