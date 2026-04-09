import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, Plus, Send } from "lucide-react";
import { useAnalysisList, useCreateAnalysis, useAskAnalyst } from "@/api/analyst";
import { toast } from "sonner";

export function AnalystPage() {
	const { data, isLoading } = useAnalysisList();
	const createMutation = useCreateAnalysis();
	const askMutation = useAskAnalyst();
	const [selectedId, setSelectedId] = useState(0);
	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Data Analyst</h1>
				<Button disabled={createMutation.isPending} onClick={() => createMutation.mutate("New Analysis", {
					onSuccess: (d) => { toast.success(d.message); setSelectedId(d.id); },
					onError: (e) => toast.error((e as { message?: string })?.message ?? "Failed."),
				})}><Plus size={16} /> {createMutation.isPending ? "Creating..." : "New Analysis"}</Button>
			</div>
			<div className="grid gap-6 lg:grid-cols-3">
				<Card className="lg:col-span-1">
					<CardHeader><CardTitle className="text-base">Analyses</CardTitle></CardHeader>
					<CardContent>
						{isLoading ? <Spinner /> : !data?.analyses.length ? (
							<p className="text-sm text-[var(--muted-foreground)]">No analyses yet.</p>
						) : (
							<div className="space-y-1">
								{data.analyses.map((a) => (
									<button key={a.id} type="button" onClick={() => { setSelectedId(a.id); setAnswer(""); }}
										className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors ${selectedId === a.id ? "bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)] font-medium" : "hover:bg-[var(--accent)]"}`}>
										<BarChart3 size={14} /><span className="truncate">{a.title}</span>
									</button>
								))}
							</div>
						)}
					</CardContent>
				</Card>
				<Card className="lg:col-span-2">
					<CardHeader><CardTitle className="text-base">{selectedId > 0 ? "Ask" : "Select an Analysis"}</CardTitle></CardHeader>
					<CardContent className="space-y-4">
						{selectedId > 0 ? (<>
							<div className="flex gap-2">
								<Input placeholder="What insights do you want?" value={question} onChange={(e) => setQuestion(e.target.value)}
									onKeyDown={(e) => { if (e.key === "Enter" && question.trim()) askMutation.mutate({ analysis_id: selectedId, question }, { onSuccess: (d) => { setAnswer(d.answer); setQuestion(""); }, onError: (e2) => toast.error((e2 as { message?: string })?.message ?? "Failed.") }); }}
									className="flex-1" />
								<Button disabled={askMutation.isPending} onClick={() => {
									if (!question.trim()) return;
									askMutation.mutate({ analysis_id: selectedId, question }, { onSuccess: (d) => { setAnswer(d.answer); setQuestion(""); }, onError: (e) => toast.error((e as { message?: string })?.message ?? "Failed.") });
								}}><Send size={16} /> {askMutation.isPending ? "..." : "Ask"}</Button>
							</div>
							{answer && <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4"><p className="text-sm whitespace-pre-wrap">{answer}</p></div>}
						</>) : <p className="text-sm text-[var(--muted-foreground)]">Select or create an analysis.</p>}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function Spinner() { return <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
