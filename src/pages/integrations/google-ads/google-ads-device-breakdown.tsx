import { Smartphone, Monitor, Tablet, Tv, Cpu } from "lucide-react";
import type { GoogleAdsRow } from "./google-ads-types";

function fmtMoney(n: number, c: string): string {
	if (!c) c = "USD";
	try { return new Intl.NumberFormat(undefined, { style: "currency", currency: c, notation: "compact" }).format(n); }
	catch { return n.toFixed(0); }
}
function fmtNum(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return (n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function fmtPct(n: number): string { return `${(n * 100).toFixed(2)}%`; }

function deviceIcon(raw: string) {
	const s = raw.toLowerCase().replace(/_/g, " ");
	if (s.includes("mobile")) return Smartphone;
	if (s.includes("tablet")) return Tablet;
	if (s.includes("desktop") || s.includes("computer")) return Monitor;
	if (s.includes("tv")) return Tv;
	return Cpu;
}

function deviceLabel(raw: string): string {
	const s = (raw || "Unknown").toLowerCase().replace(/_/g, " ");
	const map: Record<string, string> = {
		"mobile devices with full browsers": "Mobile",
		"tablets with full browsers": "Tablet",
		"connected tv": "Connected TV",
		desktop: "Desktop", computers: "Desktop", mobile: "Mobile", tablet: "Tablet", tv: "TV",
	};
	if (map[s]) return map[s]!;
	return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function GoogleAdsDeviceBreakdown({ rows, currency }: { rows: GoogleAdsRow[]; currency: string }) {
	if (!rows.length) return null;
	const total = rows.reduce((sum, r) => sum + (r.spend || 0), 0);
	if (total <= 0) return null;

	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
			<div className="flex items-center gap-2 mb-4">
				<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700">
					<Smartphone size={18} className="text-white" />
				</div>
				<div>
					<h3 className="text-sm font-semibold text-[var(--foreground)]">Device Breakdown</h3>
					<p className="text-xs text-[var(--muted-foreground)]">{rows.length} device type{rows.length === 1 ? "" : "s"}</p>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-2">
				{[...rows].sort((a, b) => b.spend - a.spend).slice(0, 4).map((r, i) => {
					const label = deviceLabel(r.key || "Unknown");
					const Icon = deviceIcon(r.key || "");
					const share = total > 0 ? (r.spend / total) : 0;
					const ctr = r.impressions > 0 ? r.clicks / r.impressions : 0;

					return (
						<div key={`${r.key}-${i}`} className="rounded-lg border border-[var(--border)] p-4">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
										<Icon size={16} className="text-violet-600" />
									</div>
									<span className="font-semibold text-sm">{label}</span>
								</div>
								<span className="text-xs font-bold text-[var(--foreground)]">{(share * 100).toFixed(0)}%</span>
							</div>

							<div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden mb-3">
								<div className="h-full bg-gradient-to-r from-violet-500 to-violet-600" style={{ width: `${(share * 100).toFixed(1)}%` }} />
							</div>

							<div className="grid grid-cols-4 gap-2 mb-3">
								<Metric label="Impr." value={fmtNum(r.impressions)} />
								<Metric label="Clicks" value={fmtNum(r.clicks)} />
								<Metric label="CTR" value={fmtPct(ctr)} />
								<Metric label="Conv." value={fmtNum(r.conversions)} />
							</div>

							<div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
								<span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Spend</span>
								<span className="text-sm font-bold font-mono text-[var(--foreground)]">{fmtMoney(r.spend, currency)}</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function Metric({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-[9px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
			<p className="text-[12px] font-semibold text-[var(--foreground)] font-mono">{value}</p>
		</div>
	);
}
