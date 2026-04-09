import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import { useAdminBlogs } from "@/api/admin-pages";

export function AdminBlogsPage() {
	const { data, isLoading } = useAdminBlogs();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Blogs</h1>
			<Card>
				<CardHeader><CardTitle className="text-lg">Blog Posts ({data?.blogs.length ?? 0})</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? <Spinner /> : !data?.blogs.length ? (
						<Empty icon={FileText} text="No blog posts." />
					) : (
						<Table headers={["ID", "Title", "Slug", "Status", "Created"]}>
							{data.blogs.map((b) => (
								<tr key={b.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
									<td className="py-2">{b.id}</td>
									<td className="py-2 font-medium">{b.title}</td>
									<td className="py-2 text-xs text-[var(--muted-foreground)]">{b.slug}</td>
									<td className="py-2">{b.status === 1 ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-400" />}</td>
									<td className="py-2 text-[var(--muted-foreground)] text-xs">{new Date(b.created_at).toLocaleDateString()}</td>
								</tr>
							))}
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function Spinner() { return <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
function Empty({ icon: Icon, text }: { icon: React.ElementType; text: string }) { return <div className="flex flex-col items-center gap-2 py-8"><Icon size={32} className="text-[var(--muted-foreground)]" /><p className="text-sm text-[var(--muted-foreground)]">{text}</p></div>; }
function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
	return <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-[var(--border)]">{headers.map(h => <th key={h} className="py-2 text-left font-medium">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
