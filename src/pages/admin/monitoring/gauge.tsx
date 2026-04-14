/** Radial gauge with animated arc — used for CPU, RAM, Disk. */
export function Gauge({ value, label, detail, size = 120 }: {
	value: number; label: string; detail?: string; size?: number;
}) {
	const r = (size - 12) / 2;
	const circ = 2 * Math.PI * r;
	const pct = Math.min(100, Math.max(0, value));
	const offset = circ - (pct / 100) * circ;
	const color = pct > 85 ? "var(--destructive)" : pct > 65 ? "#f59e0b" : "var(--sq-primary)";

	return (
		<div className="flex flex-col items-center gap-1">
			<div className="relative" style={{ width: size, height: size }}>
				<svg width={size} height={size} className="-rotate-90">
					<circle cx={size / 2} cy={size / 2} r={r} fill="none"
						stroke="var(--border)" strokeWidth={8} opacity={0.3} />
					<circle cx={size / 2} cy={size / 2} r={r} fill="none"
						stroke={color} strokeWidth={8} strokeLinecap="round"
						strokeDasharray={circ} strokeDashoffset={offset}
						className="transition-all duration-1000 ease-out" />
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className="text-xl font-bold" style={{ color }}>{pct.toFixed(1)}%</span>
				</div>
			</div>
			<span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</span>
			{detail && <span className="text-[11px] text-[var(--muted-foreground)]">{detail}</span>}
		</div>
	);
}
