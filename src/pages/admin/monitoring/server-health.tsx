import { Server } from "lucide-react";
import { useServerHealth } from "@/api/admin-monitoring";
import { Section, SectionSkeleton, MetricRow } from "./section";
import { Gauge } from "./gauge";
import { StatusBadge } from "./status-badge";

export function ServerHealth() {
	const { data, isLoading } = useServerHealth();
	if (isLoading || !data) return <SectionSkeleton />;

	return (
		<Section icon={Server} title="Server Health" live>
			<div className="flex items-center gap-2 mb-4">
				<StatusBadge status={data.status || "online"} pulse />
				<span className="text-xs text-[var(--muted-foreground)]">{data.hostname}</span>
			</div>
			<div className="flex justify-around mb-5">
				<Gauge value={data.cpu?.usage ?? 0} label="CPU"
					detail={`${data.cpu?.cores ?? 0} cores`} />
				<Gauge value={data.ram?.percent ?? 0} label="Memory"
					detail={`${((data.ram?.used_mb ?? 0) / 1024).toFixed(1)} / ${((data.ram?.total_mb ?? 0) / 1024).toFixed(1)} GB`} />
				<Gauge value={data.disk?.percent ?? 0} label="Disk"
					detail={`${data.disk?.used_gb?.toFixed(1) ?? 0} / ${data.disk?.total_gb?.toFixed(1) ?? 0} GB`} />
			</div>
			<div className="space-y-0">
				<MetricRow label="Uptime" value={data.uptime || "--"} />
				<MetricRow label="Load Average" value={data.load?.join(", ") ?? "--"} mono />
				<MetricRow label="OS" value={data.os || "--"} />
			</div>
		</Section>
	);
}

