import { Activity } from "lucide-react";
import { useServices } from "@/api/admin-monitoring";
import { Section, SectionSkeleton } from "./section";
import { StatusBadge } from "./status-badge";

export function ServicesPanel() {
	const { data, isLoading } = useServices();
	if (isLoading || !data) return <SectionSkeleton />;

	// API returns object {mariadb: {status, label, count?}, ...}
	const entries = typeof data === "object" && !Array.isArray(data)
		? Object.entries(data as Record<string, { status: string; label: string; count?: number }>)
		: [];

	return (
		<Section icon={Activity} title="Services" live>
			<div className="space-y-2">
				{entries.map(([key, svc]) => (
					<div key={key} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium text-[var(--foreground)]">{svc.label ?? key}</span>
							{svc.count != null && <span className="text-[11px] text-[var(--muted-foreground)]">({svc.count})</span>}
						</div>
						<StatusBadge status={svc.status ?? "unknown"} />
					</div>
				))}
				{entries.length === 0 && (
					<p className="text-xs text-[var(--muted-foreground)] text-center py-4">No services data</p>
				)}
			</div>
		</Section>
	);
}
