import { Server, Database } from "lucide-react";
import { useServerHealth } from "@/api/admin-monitoring";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Section, SectionSkeleton, MetricRow } from "./section";
import { Gauge } from "./gauge";
import { StatusBadge } from "./status-badge";

export function ServerHealth() {
	const { data, isLoading } = useServerHealth();
	if (isLoading || !data) return <SectionSkeleton />;

	const cpu = data.cpu ?? {};
	const mem = data.memory ?? {};
	const disk = data.disk ?? {};
	const sys = data.system ?? {};

	return (
		<Section icon={Server} title="Server Health" live>
			<div className="flex justify-around mb-5">
				<Gauge value={Number(cpu.used_pct ?? 0)} label="CPU"
					detail={`${cpu.cores ?? 0} cores`} />
				<Gauge value={Number(mem.pct ?? 0)} label="Memory"
					detail={`${((Number(mem.used_mb ?? 0)) / 1024).toFixed(1)} / ${((Number(mem.total_mb ?? 0)) / 1024).toFixed(1)} GB`} />
				<Gauge value={Number(disk.pct ?? 0)} label="Disk"
					detail={`${Number(disk.used_gb ?? 0).toFixed(1)} / ${Number(disk.total_gb ?? 0).toFixed(1)} GB`} />
			</div>
			<div className="space-y-0">
				<MetricRow label="Uptime" value={String(data.uptime ?? "--")} />
				<MetricRow label="Load Average" value={data.load ? `${data.load["1m"] ?? 0}, ${data.load["5m"] ?? 0}, ${data.load["15m"] ?? 0}` : "--"} mono />
				<MetricRow label="Instance" value={String(sys.instance ?? sys.os ?? "--")} />
				<MetricRow label="PHP" value={String(sys.php ?? "--")} />
			</div>
		</Section>
	);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function ClickHouseServerHealth() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin", "monitoring", "ch_health"],
		queryFn: () => apiClient.get<any>("/api/spa/admin/monitoring?feed=ch_health"),
		refetchInterval: 15000,
	});
	if (isLoading || !data) return <SectionSkeleton />;
	if (!data.reachable) {
		return (
			<Section icon={Database} title="ClickHouse Server">
				<StatusBadge status="down" />
				<p className="text-xs text-[var(--muted-foreground)] mt-2">ClickHouse server is unreachable</p>
			</Section>
		);
	}

	const cpu = data.cpu ?? {};
	const mem = data.memory ?? {};
	const disk = data.disk ?? {};
	const tables = (data.tables ?? []) as any[];

	return (
		<Section icon={Database} title="ClickHouse Server" live>
			<div className="flex justify-around mb-5">
				<Gauge value={Number(cpu.used_pct ?? 0)} label="CPU"
					detail={`${cpu.cores ?? 0} cores`} />
				<Gauge value={Number(mem.pct ?? 0)} label="Memory"
					detail={`${((Number(mem.used_mb ?? 0)) / 1024).toFixed(1)} / ${((Number(mem.total_mb ?? 0)) / 1024).toFixed(1)} GB`} />
				<Gauge value={Number(disk.pct ?? 0)} label="Disk"
					detail={`${Number(disk.used_gb ?? 0).toFixed(1)} / ${Number(disk.total_gb ?? 0).toFixed(1)} GB`} />
			</div>
			<MetricRow label="Uptime" value={String(data.uptime ?? "--")} />
			{mem.ch_rss_mb != null && <MetricRow label="CH RSS" value={`${Number(mem.ch_rss_mb).toFixed(0)} MB`} mono />}
			{tables.length > 0 && (
				<div className="mt-4">
					<p className="text-xs font-semibold text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">ClickHouse Tables</p>
					<div className="space-y-1">
						{tables.map((t: any, i: number) => (
							<div key={i} className="flex items-center justify-between text-xs py-1 border-b border-[var(--border)] last:border-0">
								<span className="font-mono text-[var(--foreground)]">{String(t.table ?? "--")}</span>
								<span className="text-[var(--muted-foreground)]">{Number(t.total_rows ?? 0).toLocaleString()} rows / {String(t.disk_size ?? "--")}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</Section>
	);
}
