import { useState } from "react";
import { Share2, Clock, Zap, AlertTriangle, Search, ShieldCheck, Globe } from "lucide-react";
import { useSocialApi, useCron, useAiQueue, useErrorLogs, useAuthAudit, useNginx } from "@/api/admin-monitoring";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { Section, SectionSkeleton, BigStat } from "./section";
import { StatusBadge } from "./status-badge";
import { Input } from "@/components/ui/input";

export function SocialApiPanel() {
	const { data, isLoading } = useSocialApi();
	if (isLoading || !data) return <SectionSkeleton />;
	// API returns object {facebook: {label, status, source, description}, ...}
	const entries = typeof data === "object" && !Array.isArray(data)
		? Object.entries(data as Record<string, { label: string; status: string; source: string; description?: string }>)
		: [];
	return (
		<Section icon={Share2} title="Social Media APIs">
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
				{entries.map(([key, a]) => (
					<div key={key} className="flex items-center gap-2 rounded-lg border border-[var(--border)] p-3">
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-[var(--foreground)] truncate">{a.label ?? key}</p>
							<p className="text-[11px] text-[var(--muted-foreground)] truncate">{a.description ?? a.source ?? ""}</p>
						</div>
						<StatusBadge status={a.status ?? "unknown"} />
					</div>
				))}
			</div>
		</Section>
	);
}

export function CronPanel() {
	const { data, isLoading } = useCron();
	if (isLoading || !data) return <SectionSkeleton />;
	// API returns array [{script, label, schedule, status, at, duration_ms, exit_code}, ...]
	const jobs = Array.isArray(data) ? data : [];
	return (
		<Section icon={Clock} title="Cron Jobs Health">
			<div className="overflow-x-auto">
				<table className="w-full text-xs">
					<thead>
						<tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
							<th className="py-2 pr-4 font-medium">Job</th>
							<th className="py-2 pr-4 font-medium">Schedule</th>
							<th className="py-2 pr-4 font-medium">Status</th>
							<th className="py-2 pr-4 font-medium">Last Run</th>
							<th className="py-2 pr-4 font-medium">Duration</th>
						</tr>
					</thead>
					<tbody>
						{jobs.map((j: Record<string, unknown>, i: number) => (
							<tr key={i} className="border-b border-[var(--border)] last:border-0">
								<td className="py-2 pr-4 font-medium text-[var(--foreground)]">{String(j.label ?? j.script ?? "--")}</td>
								<td className="py-2 pr-4 font-mono text-[var(--muted-foreground)]">{String(j.schedule ?? "--")}</td>
								<td className="py-2 pr-4"><StatusBadge status={String(j.status ?? "unknown")} /></td>
								<td className="py-2 pr-4 text-[var(--muted-foreground)]">{String(j.at ?? j.last_run ?? "--")}</td>
								<td className="py-2 pr-4 font-mono text-[var(--muted-foreground)]">
									{j.duration_ms != null ? `${Number(j.duration_ms)}ms` : String(j.duration ?? "--")}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Section>
	);
}

export function AiQueuePanel() {
	const { data, isLoading } = useAiQueue();
	if (isLoading || !data) return <SectionSkeleton />;
	if (!data.available) return null;
	const c = (data.counts ?? {}) as Record<string, number>;
	return (
		<Section icon={Zap} title="AI Captain Queue" live>
			<div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-4">
				<BigStat value={String(c.queued ?? 0)} label="Queued" color="text-blue-600" />
				<BigStat value={String(c.running ?? 0)} label="Running" color="text-emerald-600" />
				<BigStat value={String(c.completed_24h ?? 0)} label="Done (24h)" />
				<BigStat value={String(c.failed_24h ?? 0)} label="Failed (24h)"
					color={(c.failed_24h ?? 0) > 0 ? "text-red-600" : undefined} />
				<BigStat value={String(c.retrying ?? 0)} label="Retrying" color="text-amber-600" />
			</div>
			{Array.isArray(data.recent_failures) && data.recent_failures.length > 0 && (
				<div className="mt-3">
					<p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">Recent Failures</p>
					{data.recent_failures.slice(0, 5).map((f: Record<string, unknown>, i: number) => (
						<div key={i} className="flex items-center justify-between text-xs py-1 border-b border-[var(--border)] last:border-0">
							<span className="font-mono text-red-600 truncate max-w-[60%]">{String(f.error ?? f.message ?? "--")}</span>
							<span className="text-[var(--muted-foreground)]">{String(f.at ?? f.time ?? "--")}</span>
						</div>
					))}
				</div>
			)}
		</Section>
	);
}

export function ErrorLogsPanel() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const { data, isLoading } = useErrorLogs(page, search);
	return (
		<Section icon={AlertTriangle} title="Error Logs">
			<div className="flex items-center gap-2 mb-4">
				<div className="relative flex-1">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
					<Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
						placeholder="Search errors..." className="pl-9 h-8 text-xs" />
				</div>
				<span className="text-xs text-[var(--muted-foreground)]">{data?.total ?? 0} entries</span>
			</div>
			<div className="overflow-x-auto max-h-80 overflow-y-auto">
				{isLoading ? <SectionSkeleton /> : (
					<table className="w-full text-xs">
						<thead className="sticky top-0 bg-[var(--card)]">
							<tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
								<th className="py-2 pr-3 font-medium w-36">Time</th>
								<th className="py-2 pr-3 font-medium w-16">Level</th>
								<th className="py-2 font-medium">Message</th>
							</tr>
						</thead>
						<tbody>
							{(data?.rows ?? []).map((r: Record<string, string>, i: number) => (
								<tr key={i} className="border-b border-[var(--border)] last:border-0 align-top">
									<td className="py-1.5 pr-3 font-mono text-[var(--muted-foreground)] whitespace-nowrap">{r.time ?? ""}</td>
									<td className="py-1.5 pr-3"><StatusBadge status={r.level ?? "info"} /></td>
									<td className="py-1.5 text-[var(--foreground)] break-all max-w-md">{r.message ?? ""}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
			{(data?.pages ?? 0) > 1 && (
				<div className="flex items-center justify-center gap-2 mt-3">
					<button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
						className="px-2 py-1 text-xs rounded border border-[var(--border)] disabled:opacity-40">Prev</button>
					<span className="text-xs text-[var(--muted-foreground)]">{page} / {data?.pages}</span>
					<button onClick={() => setPage(page + 1)} disabled={page >= (data?.pages ?? 1)}
						className="px-2 py-1 text-xs rounded border border-[var(--border)] disabled:opacity-40">Next</button>
				</div>
			)}
		</Section>
	);
}

export function NginxPanel() {
	const { data, isLoading } = useNginx();
	if (isLoading || !data) return <SectionSkeleton />;
	const s = (data.status ?? {}) as Record<string, number>;
	return (
		<Section icon={Globe} title="Nginx Traffic (1h)">
			<div className="grid grid-cols-4 gap-3 mb-3">
				<BigStat value={Number(data.total ?? 0).toLocaleString()} label="Total" />
				<BigStat value={String(s["2xx"] ?? 0)} label="2xx" color="text-emerald-600" />
				<BigStat value={String(s["4xx"] ?? 0)} label="4xx" color="text-amber-600" />
				<BigStat value={String(s["5xx"] ?? 0)} label="5xx"
					color={(s["5xx"] ?? 0) > 0 ? "text-red-600" : undefined} />
			</div>
		</Section>
	);
}

export function AuthAuditPanel() {
	const { data, isLoading } = useAuthAudit();
	if (isLoading || !data) return <SectionSkeleton />;
	const rows = Array.isArray(data) ? data : [];
	return (
		<Section icon={ShieldCheck} title="Auth Audit Trail">
			<div className="overflow-x-auto max-h-64 overflow-y-auto">
				<table className="w-full text-xs">
					<thead className="sticky top-0 bg-[var(--card)]">
						<tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
							<th className="py-2 pr-3 font-medium">Time</th>
							<th className="py-2 pr-3 font-medium">Event</th>
							<th className="py-2 pr-3 font-medium">User</th>
							<th className="py-2 font-medium">IP</th>
						</tr>
					</thead>
					<tbody>
						{rows.slice(0, 20).map((r: Record<string, string>, i: number) => (
							<tr key={i} className="border-b border-[var(--border)] last:border-0">
								<td className="py-1.5 pr-3 font-mono text-[var(--muted-foreground)] whitespace-nowrap">{r.time ?? ""}</td>
								<td className="py-1.5 pr-3 text-[var(--foreground)]">{r.event ?? ""}</td>
								<td className="py-1.5 pr-3 text-[var(--foreground)]">{r.user ?? ""}</td>
								<td className="py-1.5 font-mono text-[var(--muted-foreground)]">{r.ip ?? ""}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Section>
	);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function ApiQueuePanel() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin", "monitoring", "api_queue"],
		queryFn: () => apiClient.get<any>("/api/spa/admin/monitoring?feed=api_queue"),
		refetchInterval: 30000,
	});
	if (isLoading || !data) return <SectionSkeleton />;
	if (!data.available) return null;
	const c = (data.counts ?? {}) as Record<string, number>;
	const wh = (data.webhook_stats ?? {}) as Record<string, number>;
	const recent = (data.recent_completed ?? []) as any[];
	const failures = (data.recent_failures ?? []) as any[];
	return (
		<Section icon={Zap} title="API Job Queue" live>
			<div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-4">
				<BigStat value={String(c.queued ?? 0)} label="Queued" color="text-blue-600" />
				<BigStat value={String(c.processing ?? 0)} label="Processing" color="text-emerald-600" />
				<BigStat value={String(c.completed_24h ?? 0)} label="Done (24h)" />
				<BigStat value={String(c.failed_24h ?? 0)} label="Failed (24h)"
					color={(c.failed_24h ?? 0) > 0 ? "text-red-600" : undefined} />
				<BigStat value={String(wh.pending ?? 0)} label="Webhooks" />
			</div>
			{(recent.length > 0 || failures.length > 0) && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
					{recent.length > 0 && (<div>
						<p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">Recent Completed</p>
						<table className="w-full text-xs"><tbody>
							{recent.slice(0, 10).map((j: any, i: number) => (
								<tr key={i} className="border-b border-[var(--border)] last:border-0">
									<td className="py-1 pr-2 font-mono text-blue-600 text-[11px]">{String(j.job_uid ?? "--").slice(0, 15)}</td>
									<td className="py-1 pr-2">{String(j.type ?? "--")}</td>
									<td className="py-1 pr-2 font-mono">{String(j.duration_sec ?? 0)}s</td>
									<td className="py-1 text-[var(--muted-foreground)] text-[11px]">{String(j.completed_at ?? "--")}</td>
								</tr>))}
						</tbody></table>
					</div>)}
					{failures.length > 0 && (<div>
						<p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wider">Recent Failures</p>
						<table className="w-full text-xs"><tbody>
							{failures.slice(0, 10).map((j: any, i: number) => (
								<tr key={i} className="border-b border-[var(--border)] last:border-0">
									<td className="py-1 pr-2 font-mono text-red-600 text-[11px]">{String(j.job_uid ?? "--").slice(0, 15)}</td>
									<td className="py-1 pr-2">{String(j.type ?? "--")}</td>
									<td className="py-1 pr-2 font-mono text-red-600">{String(j.error_message ?? "--")}</td>
									<td className="py-1 text-[var(--muted-foreground)] text-[11px]">{String(j.completed_at ?? "--")}</td>
								</tr>))}
						</tbody></table>
					</div>)}
				</div>
			)}
		</Section>
	);
}
