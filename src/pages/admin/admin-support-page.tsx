import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { useAdminSupport } from "@/api/admin-pages";

export function AdminSupportPage() {
	const { data, isLoading } = useAdminSupport();

	const statusColors: Record<string, string> = {
		open: "bg-blue-100 text-blue-700",
		pending: "bg-yellow-100 text-yellow-700",
		resolved: "bg-green-100 text-green-700",
		closed: "bg-gray-100 text-gray-600",
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Support</h1>
			<Card>
				<CardHeader><CardTitle className="text-lg">Support Tickets</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? <Spinner /> : !(data?.tickets ?? []).length ? (
						<div className="flex flex-col items-center gap-2 py-8"><HelpCircle size={32} className="text-[var(--muted-foreground)]" /><p className="text-sm text-[var(--muted-foreground)]">No support tickets.</p></div>
					) : (
						<div className="space-y-2">
							{data?.tickets.map((t) => (
								<div key={t.id} className="flex items-center gap-3 rounded border border-[var(--border)] p-3">
									<div className="min-w-0 flex-1">
										<p className="font-medium">#{t.id} — {t.subject || "No subject"}</p>
										<p className="text-xs text-[var(--muted-foreground)]">User #{t.user_id} · {new Date(t.created_at).toLocaleDateString()}</p>
									</div>
									<span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[t.status] ?? "bg-gray-100 text-gray-600"}`}>
										{t.status}
									</span>
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
