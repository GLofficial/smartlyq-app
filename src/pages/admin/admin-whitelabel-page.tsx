import { Card, CardContent } from "@/components/ui/card";
import { Globe, CheckCircle, XCircle } from "lucide-react";
import { useAdminWhitelabel } from "@/api/admin";

export function AdminWhitelabelPage() {
	const { data, isLoading } = useAdminWhitelabel();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Whitelabel Tenants</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !(data?.tenants ?? []).length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12">
						<Globe size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No whitelabel tenants.</p>
					</CardContent>
				</Card>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead><tr className="border-b border-[var(--border)]">
							<th className="py-2 text-left font-medium">ID</th>
							<th className="py-2 text-left font-medium">Name</th>
							<th className="py-2 text-left font-medium">Domain</th>
							<th className="py-2 text-left font-medium">Status</th>
							<th className="py-2 text-left font-medium">SSL</th>
							<th className="py-2 text-left font-medium">License</th>
							<th className="py-2 text-left font-medium">Created</th>
						</tr></thead>
						<tbody>
							{data?.tenants.map((t) => (
								<tr key={t.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
									<td className="py-2">{t.id}</td>
									<td className="py-2 font-medium">{t.site_name || t.subdomain}</td>
									<td className="py-2 text-[var(--muted-foreground)]">{t.custom_domain || `${t.subdomain}.app.smartlyq.com`}</td>
									<td className="py-2">
										<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.status === "active" ? "bg-green-100 text-green-700" : t.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
											{t.status || "unknown"}
										</span>
									</td>
									<td className="py-2">{t.ssl_status === "active" ? <CheckCircle size={14} className="text-green-500" /> : <span className="text-xs text-[var(--muted-foreground)]">{t.ssl_status || "—"}</span>}</td>
									<td className="py-2">{t.license_active ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}</td>
									<td className="py-2 text-[var(--muted-foreground)]">{new Date(t.created_at).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
