import { Database, Globe, Shield, Box, Timer, Cloud } from "lucide-react";
import { useDbMetrics, useEndpoints, useSSL, useRedis, useFpm, useR2 } from "@/api/admin-monitoring";
import { Section, SectionSkeleton, MetricRow, BigStat } from "./section";
import { StatusBadge, StatusDot } from "./status-badge";

export function DatabasePanel() {
	const { data, isLoading } = useDbMetrics();
	if (isLoading || !data) return <SectionSkeleton />;
	const m = (data.mariadb ?? {}) as Record<string, string>;
	const tables = (data.tables ?? []) as Record<string, unknown>[];
	return (
		<Section icon={Database} title="Database Metrics">
			<div className="grid grid-cols-3 gap-4 mb-4">
				<BigStat value={String(m.Threads_running ?? 0)} label="Active Threads" />
				<BigStat value={Number(m.Questions ?? 0).toLocaleString()} label="Total Queries" />
				<BigStat value={String(m.Slow_queries ?? 0)} label="Slow Queries"
					color={Number(m.Slow_queries ?? 0) > 0 ? "text-amber-600" : undefined} />
			</div>
			<MetricRow label="Uptime" value={`${Math.floor(Number(m.Uptime ?? 0) / 86400)}d`} />
			<MetricRow label="Connections" value={String(m.Threads_connected ?? 0)} mono />
			<MetricRow label="Open Tables" value={String(m.Open_tables ?? 0)} mono />
			{tables.length > 0 && (
				<div className="mt-4">
					<p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">Top Tables</p>
					<div className="space-y-1">
						{tables.slice(0, 8).map((t, i) => (
							<div key={i} className="flex items-center justify-between text-xs py-1 border-b border-[var(--border)] last:border-0">
								<span className="font-mono text-[var(--foreground)]">{String(t.TABLE_NAME ?? t.name ?? "--")}</span>
								<span className="text-[var(--muted-foreground)]">
									{Number(t.TABLE_ROWS ?? t.rows ?? 0).toLocaleString()} rows / {Number(t.data_mb ?? 0).toFixed(1)} MB
								</span>
							</div>
						))}
					</div>
				</div>
			)}
		</Section>
	);
}

export function EndpointsPanel() {
	const { data, isLoading } = useEndpoints();
	if (isLoading || !data) return <SectionSkeleton />;
	const endpoints = Array.isArray(data) ? data : [];
	return (
		<Section icon={Globe} title="Endpoint Health">
			<div className="space-y-2">
				{endpoints.map((e, i) => (
					<div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
						<div>
							<span className="text-sm font-medium text-[var(--foreground)]">{e.label}</span>
							<span className="text-[11px] text-[var(--muted-foreground)] ml-2">{e.response_ms ?? e.latency_ms ?? 0}ms</span>
						</div>
						<StatusBadge status={e.status ?? "unknown"} />
					</div>
				))}
			</div>
		</Section>
	);
}

export function SSLPanel() {
	const { data, isLoading } = useSSL();
	if (isLoading || !data) return <SectionSkeleton />;
	const certs = Array.isArray(data) ? data : [];
	return (
		<Section icon={Shield} title="SSL Certificates">
			<div className="space-y-2">
				{certs.map((c, i) => (
					<div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
						<div>
							<span className="text-sm font-medium text-[var(--foreground)]">{c.domain}</span>
							<span className="text-[11px] text-[var(--muted-foreground)] ml-2">{c.issuer}</span>
						</div>
						<div className="flex items-center gap-2">
							<StatusDot status={Number(c.days_left) > 14 ? "ok" : Number(c.days_left) > 0 ? "warning" : "error"} />
							<span className="text-xs text-[var(--muted-foreground)]">{c.days_left}d left</span>
						</div>
					</div>
				))}
			</div>
		</Section>
	);
}

export function RedisPanel() {
	const { data, isLoading } = useRedis();
	if (isLoading || !data) return <SectionSkeleton />;
	const mem = (data.memory ?? {}) as Record<string, string>;
	const stats = (data.stats ?? {}) as Record<string, string>;
	const clients = (data.clients ?? {}) as Record<string, string>;
	return (
		<Section icon={Box} title="Redis">
			<StatusBadge status={data.reachable ? "online" : "down"} pulse />
			<div className="mt-3 space-y-0">
				<MetricRow label="Used Memory" value={mem.used_memory_human ?? "--"} mono />
				<MetricRow label="Peak Memory" value={mem.used_memory_peak_human ?? "--"} mono />
				<MetricRow label="Connected Clients" value={clients.connected_clients ?? "--"} mono />
				<MetricRow label="Total Commands" value={Number(stats.total_commands_processed ?? 0).toLocaleString()} mono />
				<MetricRow label="Keyspace Hits" value={Number(stats.keyspace_hits ?? 0).toLocaleString()} mono />
			</div>
		</Section>
	);
}

export function FpmPanel() {
	const { data, isLoading } = useFpm();
	if (isLoading || !data) return <SectionSkeleton />;
	if (!data.available) return null;
	return (
		<Section icon={Timer} title="PHP-FPM Pool">
			<div className="grid grid-cols-3 gap-4 mb-3">
				<BigStat value={String(data.active_processes ?? 0)} label="Active" color="text-blue-600" />
				<BigStat value={String(data.idle_processes ?? 0)} label="Idle" color="text-emerald-600" />
				<BigStat value={String(data.total_processes ?? 0)} label="Total" />
			</div>
			<MetricRow label="Pool" value={String(data.pool ?? "--")} />
			<MetricRow label="Manager" value={String(data.process_manager ?? "--")} />
			<MetricRow label="Max Active" value={String(data.max_active_processes ?? 0)} mono />
			<MetricRow label="Listen Queue" value={String(data.listen_queue ?? 0)} mono />
		</Section>
	);
}

export function R2Panel() {
	const { data, isLoading } = useR2();
	if (isLoading || !data) return <SectionSkeleton />;
	const breakdown = (data.breakdown ?? []) as { prefix: string; objects: number; size: string }[];
	return (
		<Section icon={Cloud} title="Cloudflare R2 Storage">
			<StatusBadge status={data.status === "online" ? "ok" : data.status ?? "unknown"} />
			<div className="grid grid-cols-3 gap-4 my-4">
				<BigStat value={Number(data.total_objects ?? 0).toLocaleString()} label="Objects" color="text-blue-600" />
				<BigStat value={`${Number(data.total_size_gb ?? 0).toFixed(2)} GB`} label="Storage" color="text-purple-600" />
				<BigStat value={String(data.folders ?? 0)} label="Folders" />
			</div>
			{breakdown.length > 0 && (
				<div className="space-y-1 mt-3">
					<p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">By Folder</p>
					{breakdown.slice(0, 8).map((b, i) => (
						<div key={i} className="flex items-center justify-between text-xs py-1 border-b border-[var(--border)] last:border-0">
							<span className="font-mono text-[var(--foreground)]">{b.prefix || "/"}</span>
							<span className="text-[var(--muted-foreground)]">{b.objects} obj / {b.size}</span>
						</div>
					))}
				</div>
			)}
		</Section>
	);
}
