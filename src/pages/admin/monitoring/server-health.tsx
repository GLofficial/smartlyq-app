import { Server } from "lucide-react";
import { useServerHealth } from "@/api/admin-monitoring";
import { Section, SectionSkeleton, MetricRow } from "./section";
import { Gauge } from "./gauge";

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
