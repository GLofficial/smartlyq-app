import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useAgencyReports } from "@/api/agency/reports";

export function AgencyReportsPage() {
	const { data, isLoading } = useAgencyReports();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Agency Reports</h1>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						{data ? `${data?.reports.length} report${data?.reports.length !== 1 ? "s" : ""}` : "Loading..."}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-32 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !(data?.reports ?? []).length ? (
						<div className="flex flex-col items-center gap-3 py-12">
							<FileText size={48} className="text-[var(--muted-foreground)]" />
							<p className="text-[var(--muted-foreground)]">No reports generated yet.</p>
							<p className="text-sm text-[var(--muted-foreground)]">
								Agency reports summarize revenue, tenant activity, and performance across your white-label clients.
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)]">
										<th className="py-2 text-left font-medium">Report Name</th>
										<th className="py-2 text-left font-medium">Period</th>
										<th className="py-2 text-right font-medium">Tenants</th>
										<th className="py-2 text-right font-medium">Revenue</th>
										<th className="py-2 text-left font-medium">Generated</th>
									</tr>
								</thead>
								<tbody>
									{data?.reports.map((report) => (
										<tr key={report.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
											<td className="py-2 font-medium">{report.name}</td>
											<td className="py-2 text-[var(--muted-foreground)]">{report.period}</td>
											<td className="py-2 text-right">{report.tenant_count}</td>
											<td className="py-2 text-right font-medium">
												${report.revenue.toFixed(2)} {report.currency}
											</td>
											<td className="py-2 text-[var(--muted-foreground)]">
												{new Date(report.generated_at).toLocaleDateString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
