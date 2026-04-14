import { Activity } from "lucide-react";
import { useServices } from "@/api/admin-monitoring";
import { Section, SectionSkeleton } from "./section";
import { StatusBadge } from "./status-badge";

export function ServicesPanel() {
	const { data, isLoading } = useServices();
	if (isLoading || !data) return <SectionSkeleton />;

	const services = Array.isArray(data) ? data : [];

	return (
		<Section icon={Activity} title="Services" live>
			<div className="space-y-2">
				{services.map((s) => (
					<div key={s.name} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium text-[var(--foreground)]">{s.name}</span>
							{s.detail && <span className="text-[11px] text-[var(--muted-foreground)]">{s.detail}</span>}
						</div>
						<StatusBadge status={s.status} />
					</div>
				))}
				{services.length === 0 && (
					<p className="text-xs text-[var(--muted-foreground)] text-center py-4">No services data</p>
				)}
			</div>
		</Section>
	);
}
