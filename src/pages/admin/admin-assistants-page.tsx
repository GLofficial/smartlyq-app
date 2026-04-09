import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, CheckCircle, XCircle } from "lucide-react";
import { useAdminAssistants } from "@/api/admin-pages";

export function AdminAssistantsPage() {
	const { data, isLoading } = useAdminAssistants();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Assistants</h1>
			<Card>
				<CardHeader><CardTitle className="text-lg">AI Assistants ({data?.assistants.length ?? 0})</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? <Spinner /> : !(data?.assistants ?? []).length ? (
						<div className="flex flex-col items-center gap-2 py-8"><Bot size={32} className="text-[var(--muted-foreground)]" /><p className="text-sm text-[var(--muted-foreground)]">No assistants configured.</p></div>
					) : (
						<div className="space-y-2">
							{data?.assistants.map((a) => (
								<div key={a.id} className="flex items-center gap-3 rounded border border-[var(--border)] p-3">
									<Bot size={18} className="text-[var(--sq-primary)]" />
									<div className="min-w-0 flex-1">
										<p className="font-medium">{a.name}</p>
										<p className="text-xs text-[var(--muted-foreground)]">{a.description}</p>
									</div>
									<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs">{a.model}</span>
									{a.status === 1 ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-400" />}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function Spinner() { return <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
