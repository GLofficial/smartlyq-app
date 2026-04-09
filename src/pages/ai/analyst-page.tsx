import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";

export function AnalystPage() {
	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<h1 className="text-2xl font-bold">Data Analyst</h1>

			<Card>
				<CardHeader><CardTitle className="text-base">Upload Data</CardTitle></CardHeader>
				<CardContent>
					<div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-[var(--border)] p-8">
						<Upload size={32} className="text-[var(--muted-foreground)]" />
						<p className="text-sm text-[var(--muted-foreground)]">Upload CSV, XLSX, or PDF files for AI analysis</p>
						<Button variant="outline" onClick={() => toast.info("File upload coming soon.")}><Upload size={16} /> Choose File</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle className="text-base">Ask a Question</CardTitle></CardHeader>
				<CardContent className="space-y-3">
					<textarea
						placeholder="What insights do you want from your data?"
						rows={3}
						className="flex w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] resize-none"
					/>
					<Button onClick={() => toast.info("Analysis coming soon.")}><Wand2 size={16} /> Analyze</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle className="text-lg">Results</CardTitle></CardHeader>
				<CardContent>
					<div className="flex flex-col items-center gap-2 py-8">
						<BarChart3 size={32} className="text-[var(--muted-foreground)]" />
						<p className="text-sm text-[var(--muted-foreground)]">Analysis results will appear here.</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
