import { Card, CardContent } from "@/components/ui/card";
import { Building2, CheckCircle, XCircle } from "lucide-react";
import { useAgency } from "@/api/tools";

export function AgencyPage() {
	const { data, isLoading } = useAgency();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Agency</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !data?.tenants.length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12">
						<Building2 size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No whitelabel tenants yet.</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{data.tenants.map((t) => (
						<Card key={t.id}>
							<CardContent className="p-4 space-y-3">
								<div className="flex items-center gap-3">
									<Building2 size={20} className="text-[var(--sq-primary)]" />
									<div className="min-w-0 flex-1">
										<p className="font-medium truncate">{t.site_name || t.subdomain}</p>
										<p className="text-xs text-[var(--muted-foreground)]">
											{t.custom_domain || `${t.subdomain}.app.smartlyq.com`}
										</p>
									</div>
									{t.license_active ? (
										<CheckCircle size={16} className="text-green-500" />
									) : (
										<XCircle size={16} className="text-red-500" />
									)}
								</div>
								<div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
									<StatusBadge status={t.status} />
									<span>{new Date(t.created_at).toLocaleDateString()}</span>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const c: Record<string, string> = { active: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700", suspended: "bg-red-100 text-red-700" };
	return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c[status] ?? "bg-gray-100 text-gray-600"}`}>{status || "unknown"}</span>;
}
