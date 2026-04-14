import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/** Monitoring section card with icon header and optional live indicator. */
export function Section({ icon: Icon, title, live, children, className }: {
	icon: LucideIcon; title: string; live?: boolean; children: ReactNode; className?: string;
}) {
	return (
		<div className={`rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm ${className ?? ""}`}>
			<div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-3">
				<Icon size={16} className="text-[var(--sq-primary)]" />
				<h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
				{live && (
					<span className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-600">
						<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
						LIVE
					</span>
				)}
			</div>
			<div className="p-5">{children}</div>
		</div>
	);
}

/** Metric value row for key-value pairs. */
export function MetricRow({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
	return (
		<div className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
			<span className="text-xs text-[var(--muted-foreground)]">{label}</span>
			<span className={`text-xs font-medium text-[var(--foreground)] ${mono ? "font-mono" : ""}`}>{value}</span>
		</div>
	);
}

/** Big stat number with label. */
export function BigStat({ value, label, color }: { value: string | number; label: string; color?: string }) {
	return (
		<div className="text-center">
			<div className={`text-2xl font-bold ${color ?? "text-[var(--foreground)]"}`}>{value}</div>
			<div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{label}</div>
		</div>
	);
}

/** Skeleton loader for sections still loading. */
export function SectionSkeleton() {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 animate-pulse">
			<div className="h-4 w-32 rounded bg-[var(--muted)] mb-4" />
			<div className="space-y-3">
				<div className="h-3 w-full rounded bg-[var(--muted)]" />
				<div className="h-3 w-3/4 rounded bg-[var(--muted)]" />
				<div className="h-3 w-1/2 rounded bg-[var(--muted)]" />
			</div>
		</div>
	);
}
