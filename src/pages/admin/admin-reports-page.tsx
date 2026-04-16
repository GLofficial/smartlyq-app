import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, FileText, DollarSign, UserPlus, RefreshCw } from "lucide-react";
import { useAdminReports, useAdminReportFeed, useAdminReportsBackfill } from "@/api/admin-pages";
import { toast } from "sonner";

const fmt2 = (n: unknown) => Number(n ?? 0).toFixed(2);
const fmtN = (n: unknown) => Number(n ?? 0).toLocaleString();
const pct  = (n: unknown) => (Number(n ?? 0) * 100).toFixed(1) + "%";

const today = () => new Date().toISOString().slice(0, 10);
const ago30 = () => { const d = new Date(); d.setDate(d.getDate() - 29); return d.toISOString().slice(0, 10); };

export function AdminReportsPage() {
	const [from, setFrom] = useState(ago30);
	const [to, setTo]     = useState(today);
	const [applied, setApplied] = useState({ from: ago30(), to: today() });
	const apply = () => setApplied({ from, to });

	const { data: stats, isLoading: statsLoading } = useAdminReports();
	const summary    = useAdminReportFeed("summary",         applied.from, applied.to);
	const providers  = useAdminReportFeed("providers",       applied.from, applied.to);
	const errors     = useAdminReportFeed("errors",          applied.from, applied.to);
	const surface    = useAdminReportFeed("surface",         applied.from, applied.to);
	const top        = useAdminReportFeed("top",             applied.from, applied.to);
	const models     = useAdminReportFeed("models",          applied.from, applied.to);
	const tenantsAi  = useAdminReportFeed("tenants_ai",      applied.from, applied.to);
	const security   = useAdminReportFeed("security_events", applied.from, applied.to);
	const aiCharges  = useAdminReportFeed("ai_charges",      applied.from, applied.to);
	const backfillMut = useAdminReportsBackfill();

	const v = (n?: number) => statsLoading ? "..." : (n ?? 0).toLocaleString();
	const s = summary.data?.data?.[0] ?? {};

	const handleBackfill = () => {
		backfillMut.mutate({ from: applied.from, to: applied.to }, {
			onSuccess: (r) => toast.success(`Backfill done: ${r.updated}/${r.days} days updated`),
			onError: () => toast.error("Backfill failed"),
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-bold">Reports</h1>
				<div className="flex items-center gap-2">
					<Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-36 text-sm" />
					<span className="text-sm text-[var(--muted-foreground)]">to</span>
					<Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-36 text-sm" />
					<Button size="sm" onClick={apply}>Apply</Button>
					<Button size="sm" variant="outline" onClick={handleBackfill} disabled={backfillMut.isPending} title="Recompute daily aggregates for selected range">
						<RefreshCw size={14} className={backfillMut.isPending ? "animate-spin" : ""} /> Backfill
					</Button>
				</div>
			</div>

			{/* Stat cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Stat icon={Users}     label="Total Users"     value={v(stats?.total_users)}   color="text-blue-600" />
				<Stat icon={UserPlus}  label="New Users (30d)" value={v(stats?.new_users_30d)} color="text-green-600" />
				<Stat icon={FileText}  label="Total Posts"     value={v(stats?.total_posts)}   color="text-purple-600" />
				<Stat icon={DollarSign} label="Total Revenue"  value={statsLoading ? "..." : `$${(stats?.total_revenue ?? 0).toFixed(2)}`} color="text-orange-600" />
			</div>

			{/* Summary metrics */}
			<Section title="Summary" loading={summary.isLoading}>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{[
						["Revenue",          `$${fmt2(s.revenue_usd)}`],
						["AI Revenue",       `$${fmt2(s.ai_revenue_usd)}`],
						["AI Vendor Cost",   `$${fmt2(s.ai_vendor_cost_usd)}`],
						["AI Margin",        `$${fmt2(s.ai_margin_usd)}`],
						["AI Margin %",      pct(s.ai_margin_pct_avg ?? s.ai_margin_pct)],
						["AI Calls OK",      fmtN(s.ai_success_count)],
						["AI Errors",        fmtN(s.ai_error_count)],
						["AI Success Rate",  pct(s.ai_success_rate_avg ?? s.ai_success_rate)],
						["Credits Burned",   fmtN(s.credits_burn_sqc)],
						["Credits Purchased",fmtN(s.credits_purchased_sqc)],
						["Net MRR Change",   `$${fmt2(s.net_mrr_change_usd)}`],
						["Active Tenants",   fmtN(s.active_tenants)],
					].map(([label, val]) => (
						<div key={label as string} className="rounded-lg border border-[var(--border)] p-3">
							<p className="text-xs text-[var(--muted-foreground)]">{label}</p>
							<p className="mt-1 text-lg font-bold">{val}</p>
						</div>
					))}
				</div>
			</Section>

			{/* AI Providers */}
			<Section title="AI Providers" loading={providers.isLoading}>
				<DataTable
					headers={["Provider", "Calls OK", "Errors", "Credits", "Revenue", "Cost", "Margin"]}
					rows={providers.data?.data ?? []}
					render={(r) => [r.provider, fmtN(r.success_count), fmtN(r.error_count),
						fmtN(r.credits_burn_sqc), `$${fmt2(r.revenue_usd)}`, `$${fmt2(r.vendor_cost_usd)}`, `$${fmt2(r.margin_usd)}`]}
				/>
			</Section>

			{/* AI Error Categories */}
			<Section title="AI Error Categories" loading={errors.isLoading}>
				<DataTable
					headers={["Error Category", "Count"]}
					rows={errors.data?.data ?? []}
					render={(r) => [r.error_category, fmtN(r.count)]}
				/>
			</Section>

			{/* Feature Surface */}
			<Section title="Feature Surface" loading={surface.isLoading}>
				<DataTable
					headers={["Feature", "Calls OK", "Errors", "Credits", "Revenue", "Cost", "Margin"]}
					rows={surface.data?.data ?? []}
					render={(r) => [r.feature, fmtN(r.success_count), fmtN(r.error_count),
						fmtN(r.credits_net_sqc), `$${fmt2(r.revenue_usd)}`, `$${fmt2(r.vendor_cost_usd)}`, `$${fmt2(r.margin_usd)}`]}
				/>
			</Section>

			{/* Top Accounts */}
			<Section title="Top Accounts by Credit Burn" loading={top.isLoading}>
				<DataTable
					headers={["User ID", "Name", "Email", "Credits Burned", "Calls"]}
					rows={top.data?.data ?? []}
					render={(r) => [r.user_id, r.user_name, r.user_email, fmtN(r.credits_burn_sqc), fmtN(r.success_count)]}
				/>
			</Section>

			{/* AI Models */}
			<Section title="AI Models" loading={models.isLoading}>
				<DataTable
					headers={["Provider", "Model", "Calls OK", "Errors", "Credits", "Revenue", "Cost", "Margin"]}
					rows={models.data?.data ?? []}
					render={(r) => [r.provider, r.model, fmtN(r.success_count), fmtN(r.error_count),
						fmtN(r.credits_net_sqc), `$${fmt2(r.revenue_usd)}`, `$${fmt2(r.vendor_cost_usd)}`, `$${fmt2(r.margin_usd)}`]}
				/>
			</Section>

			{/* Tenant AI Usage */}
			<Section title="Tenant AI Usage" loading={tenantsAi.isLoading}>
				<DataTable
					headers={["Tenant ID", "Tenant Name", "Calls OK", "Errors", "Credits", "Revenue", "Cost"]}
					rows={tenantsAi.data?.data ?? []}
					render={(r) => [r.tenant_id, r.tenant_name, fmtN(r.success_count), fmtN(r.error_count),
						fmtN(r.credits_net_sqc), `$${fmt2(r.revenue_usd)}`, `$${fmt2(r.vendor_cost_usd)}`]}
				/>
			</Section>

			{/* Security Events */}
			<Section title="Security Events" loading={security.isLoading}>
				{(security.data?.data ?? []).length === 0
					? <p className="text-sm text-[var(--muted-foreground)]">No security events in this period.</p>
					: <DataTable
						headers={["Event", "Workspace", "Actor", "Date"]}
						rows={security.data?.data ?? []}
						render={(r) => [r.event, r.workspace_id, r.actor_user_id, String(r.created_at ?? "").slice(0, 10)]}
					/>}
			</Section>

			{/* Live AI Charges */}
			<Section title="Live AI Charges" loading={aiCharges.isLoading}>
				<DataTable
					headers={["Date", "Provider", "Model", "Type", "Status", "Credits", "Cost", "Revenue"]}
					rows={aiCharges.data?.data ?? []}
					render={(r) => [String(r.created_at ?? "").slice(0, 10), r.provider, r.model, r.type,
						r.status, fmtN(r.charged_credits_sqc), `$${fmt2(r.vendor_cost_usd)}`, `$${fmt2(r.revenue_usd)}`]}
				/>
			</Section>
		</div>
	);
}

function Stat({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
	return (
		<Card><CardContent className="flex items-center gap-4 p-6">
			<Icon size={24} className={color} />
			<div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-[var(--muted-foreground)]">{label}</p></div>
		</CardContent></Card>
	);
}

function Section({ title, loading, children }: { title: string; loading: boolean; children: React.ReactNode }) {
	return (
		<Card>
			<CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
			<CardContent>{loading ? <Spinner /> : children}</CardContent>
		</Card>
	);
}

function DataTable({ headers, rows, render }: { headers: string[]; rows: Record<string, unknown>[]; render: (r: Record<string, unknown>) => unknown[] }) {
	if (!rows.length) return <p className="text-sm text-[var(--muted-foreground)]">No data for this period.</p>;
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead><tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)]">
					{headers.map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
				</tr></thead>
				<tbody>
					{rows.map((r, i) => (
						<tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent)]">
							{render(r).map((cell, j) => <td key={j} className="px-3 py-2 text-xs">{String(cell ?? "—")}</td>)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function Spinner() {
	return <div className="flex h-16 items-center justify-center"><div className="h-5 w-5 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;
}
