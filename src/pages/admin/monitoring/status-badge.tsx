import { cn } from "@/lib/cn";

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
	running:  { dot: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400" },
	online:   { dot: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400" },
	ok:       { dot: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400" },
	healthy:  { dot: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400" },
	success:  { dot: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400" },
	degraded: { dot: "bg-amber-500",   bg: "bg-amber-500/10",   text: "text-amber-700 dark:text-amber-400" },
	warning:  { dot: "bg-amber-500",   bg: "bg-amber-500/10",   text: "text-amber-700 dark:text-amber-400" },
	down:     { dot: "bg-red-500",     bg: "bg-red-500/10",     text: "text-red-700 dark:text-red-400" },
	error:    { dot: "bg-red-500",     bg: "bg-red-500/10",     text: "text-red-700 dark:text-red-400" },
	failed:   { dot: "bg-red-500",     bg: "bg-red-500/10",     text: "text-red-700 dark:text-red-400" },
	offline:  { dot: "bg-gray-400",    bg: "bg-gray-400/10",    text: "text-gray-600 dark:text-gray-400" },
	unknown:  { dot: "bg-gray-400",    bg: "bg-gray-400/10",    text: "text-gray-600 dark:text-gray-400" },
};

export function StatusBadge({ status, pulse }: { status: string; pulse?: boolean }) {
	const s = STATUS_COLORS[status.toLowerCase()] || STATUS_COLORS.unknown;
	return (
		<span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", s!.bg, s!.text)}>
			<span className={cn("h-1.5 w-1.5 rounded-full", s!.dot, pulse && "animate-pulse")} />
			{status}
		</span>
	);
}

/** Simple colored dot for inline use. */
export function StatusDot({ status }: { status: string }) {
	const s = STATUS_COLORS[status.toLowerCase()] || STATUS_COLORS.unknown;
	return <span className={cn("inline-block h-2 w-2 rounded-full", s!.dot)} />;
}
