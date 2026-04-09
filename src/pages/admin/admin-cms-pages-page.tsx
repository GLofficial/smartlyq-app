import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import { useAdminPages } from "@/api/admin-pages";

export function AdminCmsPagesPage() {
	const { data, isLoading } = useAdminPages();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">CMS Pages</h1>
			<Card>
				<CardHeader><CardTitle className="text-lg">Pages ({data?.pages.length ?? 0})</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? <Spinner /> : !data?.pages.length ? (
						<div className="flex flex-col items-center gap-2 py-8"><FileText size={32} className="text-[var(--muted-foreground)]" /><p className="text-sm text-[var(--muted-foreground)]">No CMS pages.</p></div>
					) : (
						<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-[var(--border)]"><th className="py-2 text-left font-medium">ID</th><th className="py-2 text-left font-medium">Title</th><th className="py-2 text-left font-medium">Slug</th><th className="py-2 text-left font-medium">Status</th><th className="py-2 text-left font-medium">Created</th></tr></thead><tbody>
							{data.pages.map((p) => (
								<tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
									<td className="py-2">{p.id}</td><td className="py-2 font-medium">{p.title}</td><td className="py-2 text-xs text-[var(--muted-foreground)]">{p.slug}</td>
									<td className="py-2">{p.status === 1 ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-400" />}</td>
									<td className="py-2 text-xs text-[var(--muted-foreground)]">{new Date(p.created_at).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody></table></div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function Spinner() { return <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
