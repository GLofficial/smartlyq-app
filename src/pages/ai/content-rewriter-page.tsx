import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Wand2 } from "lucide-react";
import { toast } from "sonner";

export function ContentRewriterPage() {
	const [input, setInput] = useState("");
	const [output, _setOutput] = useState("");

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Content Rewriter</h1>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader><CardTitle className="text-base">Original Content</CardTitle></CardHeader>
					<CardContent>
						<textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Paste content to rewrite..."
							rows={10}
							className="flex w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] resize-none"
						/>
						<Button className="mt-3" onClick={() => toast.info("AI rewriting coming soon.")}>
							<Wand2 size={16} /> Rewrite
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader><CardTitle className="text-base">Rewritten Content</CardTitle></CardHeader>
					<CardContent>
						{output ? (
							<div className="rounded border border-[var(--border)] p-3 text-sm whitespace-pre-wrap">{output}</div>
						) : (
							<div className="flex flex-col items-center gap-2 py-12">
								<PenLine size={32} className="text-[var(--muted-foreground)]" />
								<p className="text-sm text-[var(--muted-foreground)]">Rewritten content will appear here.</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
