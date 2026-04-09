import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Globe, FileText, Video } from "lucide-react";
import { useAdminKnowledgeBase } from "@/api/admin-ai-captain";

const TYPE_ICONS: Record<string, React.ElementType> = { url: Globe, pdf: FileText, youtube: Video };

export function AdminKbPage() {
	const { data, isLoading } = useAdminKnowledgeBase();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">AI Captain Knowledge Base</h1>
			<Card>
				<CardHeader><CardTitle className="text-lg">Sources ({data?.sources.length ?? 0})</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? <Spinner /> : !data?.sources.length ? (
						<div className="flex flex-col items-center gap-2 py-8"><BookOpen size={32} className="text-[var(--muted-foreground)]" /><p className="text-sm text-[var(--muted-foreground)]">No knowledge sources.</p></div>
					) : (
						<div className="space-y-2">
							{data.sources.map((s) => {
								const Icon = TYPE_ICONS[s.type] ?? Globe;
								return (
									<div key={s.id} className="flex items-center gap-3 rounded border border-[var(--border)] p-3">
										<Icon size={16} className="text-[var(--sq-primary)] shrink-0" />
										<div className="min-w-0 flex-1">
											<p className="font-medium text-sm truncate">{s.title || s.url}</p>
											{s.url && <p className="text-xs text-[var(--muted-foreground)] truncate">{s.url}</p>}
										</div>
										<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs">{s.type}</span>
										<StatusDot status={s.status} />
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function StatusDot({ status }: { status: string }) {
	const color = status === "completed" ? "bg-green-500" : status === "processing" ? "bg-blue-500" : status === "failed" ? "bg-red-500" : "bg-gray-400";
	return <span className={`h-2.5 w-2.5 rounded-full ${color}`} title={status} />;
}

function Spinner() { return <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
