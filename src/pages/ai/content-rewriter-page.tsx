import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Wand2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export function ContentRewriterPage() {
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");
	const [rewriting, setRewriting] = useState(false);

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
						<Button className="mt-3" disabled={rewriting} onClick={async () => {
							if (!input.trim()) { toast.error("Enter content."); return; }
							setRewriting(true);
							try {
								const res = await apiClient.post<{ rewritten: string }>("/api/spa/generate/rewrite", { content: input });
								setOutput(res.rewritten);
								toast.success("Rewritten!");
							} catch (err) { toast.error((err as { message?: string })?.message ?? "Failed."); }
							finally { setRewriting(false); }
						}}>
							<Wand2 size={16} /> {rewriting ? "Rewriting..." : "Rewrite"}
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
