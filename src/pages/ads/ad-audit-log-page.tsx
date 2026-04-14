import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ClipboardList, Search, Shield } from "lucide-react";
import { useAdAuditLog } from "@/api/ad-manager/audit-log";
import { AdToolbar } from "@/pages/ad-manager/ad-toolbar";

const ENTITY_TYPES = ["", "campaign", "ad_set", "ad", "audience", "creative", "integration", "workspace"] as const;
const ENVIRONMENTS = ["", "production", "sandbox"] as const;
const ACTIONS = ["", "create", "pause", "resume", "delete", "duplicate", "update_budget", "update_name", "sync", "disconnect"] as const;

export function AdAuditLogPage() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [entityType, setEntityType] = useState("");
	const [environment, setEnvironment] = useState("");
	const [action, setAction] = useState("");

	const { data, isLoading } = useAdAuditLog({ page, search, action, entity_type: entityType, environment });

	return (
		<div className="space-y-5">
			<AdToolbar />
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Shield size={24} className="text-[var(--sq-primary)]" />
					<div>
						<h1 className="text-2xl font-bold text-[var(--foreground)]">Audit Log</h1>
						<p className="text-sm text-[var(--muted-foreground)]">Track all changes and actions across your Ad Manager</p>
					</div>
				</div>
				<span className="text-sm text-[var(--muted-foreground)]">{data?.total ?? 0} entries</span>
			</div>

			{/* Filters */}
			<div className="flex items-center gap-3 flex-wrap">
				<FilterSelect value={entityType} onChange={(v) => { setEntityType(v); setPage(1); }}
					options={ENTITY_TYPES.map((e) => ({ value: e, label: e ? e.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "All Entities" }))} />
				<FilterSelect value={environment} onChange={(v) => { setEnvironment(v); setPage(1); }}
					options={ENVIRONMENTS.map((e) => ({ value: e, label: e ? e.charAt(0).toUpperCase() + e.slice(1) : "All Environments" }))} />
				<FilterSelect value={action} onChange={(v) => { setAction(v); setPage(1); }}
					options={ACTIONS.map((a) => ({ value: a, label: a ? a.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "All Actions" }))} />
				<div className="relative w-64">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
					<Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search entries..." className="pl-9 h-9 text-sm" />
				</div>
			</div>

			<Card>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
					) : (data?.entries ?? []).length === 0 ? (
						<div className="flex flex-col items-center gap-3 py-16">
							<ClipboardList size={40} className="text-[var(--muted-foreground)]" />
							<p className="text-sm text-[var(--muted-foreground)]">No audit log entries found.</p>
						</div>
					) : (
						<>
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
										<th className="px-5 py-3 font-medium">Timestamp</th>
										<th className="px-4 py-3 font-medium">Action</th>
										<th className="px-4 py-3 font-medium">Entity Type</th>
										<th className="px-4 py-3 font-medium">Entity Name</th>
										<th className="px-4 py-3 font-medium">Details</th>
										<th className="px-4 py-3 font-medium">Environment</th>
										<th className="px-4 py-3 font-medium">User</th>
									</tr>
								</thead>
								<tbody>
									{data?.entries.map((e) => (
										<tr key={e.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors">
											<td className="px-5 py-3">
												<p className="text-sm font-medium text-[var(--foreground)]">{new Date(e.timestamp).toLocaleDateString()}</p>
												<p className="text-[11px] text-[var(--muted-foreground)]">{new Date(e.timestamp).toLocaleTimeString()}</p>
											</td>
											<td className="px-4 py-3"><ActionBadge action={e.action} /></td>
											<td className="px-4 py-3">
												<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs capitalize">{e.entity_type?.replace("_", " ") || "—"}</span>
											</td>
											<td className="px-4 py-3 font-medium text-[var(--foreground)]">{e.entity_name || "—"}</td>
											<td className="px-4 py-3 text-[var(--muted-foreground)] max-w-xs truncate">{e.details || "—"}</td>
											<td className="px-4 py-3">
												<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
													e.environment === "production" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
												}`}>{e.environment || "Production"}</span>
											</td>
											<td className="px-4 py-3">
												<p className="text-sm text-[var(--foreground)]">{e.user_name}</p>
												{e.user_email && <p className="text-[11px] text-[var(--muted-foreground)]">{e.user_email}</p>}
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{(data?.pages ?? 0) > 1 && (
								<div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)]">
									<p className="text-sm text-[var(--muted-foreground)]">
										Showing {((data?.page ?? 1) - 1) * 20 + 1}–{Math.min((data?.page ?? 1) * 20, data?.total ?? 0)} of {data?.total}
									</p>
									<div className="flex gap-2">
										<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /></Button>
										<Button variant="outline" size="sm" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage((p) => p + 1)}><ChevronRight size={16} /></Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function FilterSelect({ value, onChange, options }: {
	value: string; onChange: (v: string) => void;
	options: { value: string; label: string }[];
}) {
	return (
		<select value={value} onChange={(e) => onChange(e.target.value)}
			className="h-9 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--sq-primary)]">
			{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
		</select>
	);
}

function ActionBadge({ action }: { action: string }) {
	const styles: Record<string, string> = {
		create: "bg-emerald-100 text-emerald-700", sync: "bg-blue-100 text-blue-700",
		update_budget: "bg-blue-100 text-blue-700", update_name: "bg-blue-100 text-blue-700",
		delete: "bg-red-100 text-red-700", deleted: "bg-red-100 text-red-700",
		pause: "bg-amber-100 text-amber-700", paused: "bg-amber-100 text-amber-700",
		resume: "bg-emerald-100 text-emerald-700", activated: "bg-emerald-100 text-emerald-700",
		duplicate: "bg-purple-100 text-purple-700", disconnect: "bg-red-100 text-red-700",
	};
	return (
		<span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[action.toLowerCase()] ?? "bg-gray-100 text-gray-600"}`}>
			<span className="text-xs">&#9679;</span> {action.replace("_", " ")}
		</span>
	);
}
