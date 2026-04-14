import { Database, Globe, Shield, Box, Timer, Cloud } from "lucide-react";
import { useDbMetrics, useEndpoints, useSSL, useRedis, useFpm, useR2 } from "@/api/admin-monitoring";
import { Section, SectionSkeleton, MetricRow, BigStat } from "./section";
import { StatusBadge, StatusDot } from "./status-badge";

export function DatabasePanel() {
	const { data, isLoading } = useDbMetrics();
	if (isLoading || !data) return <SectionSkeleton />;
	const m = data.mariadb ?? {};
	return (
		<Section icon={Database} title="Database Metrics">
			<div className="grid grid-cols-3 gap-4 mb-4">
				<BigStat value={m.Threads_running ?? 0} label="Active Threads" />
				<BigStat value={Number(m.Queries ?? 0).toLocaleString()} label="Total Queries" />
				<BigStat value={m.Slow_queries ?? 0} label="Slow Queries" color={Number(m.Slow_queries ?? 0) > 0 ? "text-amber-600" : undefined} />
			</div>
			<MetricRow label="Uptime" value={`${Math.floor(Number(m.Uptime ?? 0) / 86400)}d`} />
			<MetricRow label="Connections" value={m.Threads_connected?.toString() ?? "0"} mono />
			<MetricRow label="Open Tables" value={m.Open_tables?.toString() ?? "0"} mono />
			{(data.tables?.length ?? 0) > 0 && (
				<div className="mt-4">
					<p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">Top Tables</p>
					<div className="space-y-1">
						{data.tables.slice(0, 8).map((t) => (
							<div key={t.name} className="flex items-center justify-between text-xs py-1 border-b border-[var(--border)] last:border-0">
								<span className="font-mono text-[var(--foreground)]">{t.name}</span>
								<span className="text-[var(--muted-foreground)]">{t.rows.toLocaleString()} rows / {t.data_mb.toFixed(1)} MB</span>
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
				{endpoints.map((e) => (
					<div key={e.url} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
						<div>
							<span className="text-sm font-medium text-[var(--foreground)]">{e.label}</span>
							<span className="text-[11px] text-[var(--muted-foreground)] ml-2">{e.latency_ms}ms</span>
						</div>
						<StatusBadge status={e.status >= 200 && e.status < 400 ? "ok" : "error"} />
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
				{certs.map((c) => (
					<div key={c.domain} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
						<span className="text-sm font-medium text-[var(--foreground)]">{c.domain}</span>
						<div className="flex items-center gap-2">
							<StatusDot status={c.days_left > 14 ? "ok" : c.days_left > 0 ? "warning" : "error"} />
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
	return (
		<Section icon={Box} title="Redis">
			<StatusBadge status={data.reachable ? "online" : "down"} pulse />
			<div className="mt-3 space-y-0">
				<MetricRow label="Used Memory" value={data.memory?.used_memory_human ?? "--"} mono />
				<MetricRow label="Peak Memory" value={data.memory?.used_memory_peak_human ?? "--"} mono />
				<MetricRow label="Connected Clients" value={data.clients?.connected_clients ?? "--"} mono />
				<MetricRow label="Total Commands" value={Number(data.stats?.total_commands_processed ?? 0).toLocaleString()} mono />
				<MetricRow label="Keyspace Hits" value={Number(data.stats?.keyspace_hits ?? 0).toLocaleString()} mono />
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
				<BigStat value={data.active_processes ?? 0} label="Active" color="text-blue-600" />
				<BigStat value={data.idle_processes ?? 0} label="Idle" color="text-emerald-600" />
				<BigStat value={data.total_processes ?? 0} label="Total" />
			</div>
			<MetricRow label="Pool" value={data.pool ?? "--"} />
			<MetricRow label="Manager" value={data.process_manager ?? "--"} />
			<MetricRow label="Max Active" value={data.max_active_processes ?? 0} mono />
			<MetricRow label="Listen Queue" value={data.listen_queue ?? 0} mono />
		</Section>
	);
}

export function R2Panel() {
	const { data, isLoading } = useR2();
	if (isLoading || !data) return <SectionSkeleton />;
	return (
		<Section icon={Cloud} title="Cloudflare R2 Storage">
			<StatusBadge status={data.status === "online" ? "ok" : "down"} />
			<div className="grid grid-cols-3 gap-4 my-4">
				<BigStat value={data.total_objects?.toLocaleString() ?? 0} label="Objects" color="text-blue-600" />
				<BigStat value={`${data.total_size_gb?.toFixed(2) ?? 0} GB`} label="Storage" color="text-purple-600" />
				<BigStat value={data.folders ?? 0} label="Folders" />
			</div>
			{(data.breakdown?.length ?? 0) > 0 && (
				<div className="space-y-1 mt-3">
					<p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">By Folder</p>
					{data.breakdown.slice(0, 8).map((b) => (
						<div key={b.prefix} className="flex items-center justify-between text-xs py-1 border-b border-[var(--border)] last:border-0">
							<span className="font-mono text-[var(--foreground)]">{b.prefix || "/"}</span>
							<span className="text-[var(--muted-foreground)]">{b.objects} obj / {b.size}</span>
						</div>
					))}
				</div>
			)}
		</Section>
	);
}
