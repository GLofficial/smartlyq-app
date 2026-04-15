import { Monitor, Smartphone, Tablet, HelpCircle } from "lucide-react";
import type { FbAdsRow } from "./fb-ads-types";

interface DeviceBreakdownProps {
	rows: FbAdsRow[];
	currency: string;
}

function fmtMoney(n: number, c: string): string {
	if (!c) c = "USD";
	try { return new Intl.NumberFormat(undefined, { style: "currency", currency: c, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); }
	catch { return n.toFixed(2); }
}
function fmtNum(n: number): string { return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }
function fmtPct(n: number): string { return `${(n * 100).toFixed(2)}%`; }

const DEVICE_CONFIG: Record<string, { label: string; icon: typeof Monitor; color: string; bg: string }> = {
	desktop: { label: "DESKTOP", icon: Monitor, color: "text-blue-600", bg: "bg-blue-50" },
	mobile_app: { label: "MOBILE APP", icon: Smartphone, color: "text-emerald-600", bg: "bg-emerald-50" },
	mobile_web: { label: "MOBILE WEB", icon: Tablet, color: "text-purple-600", bg: "bg-purple-50" },
	unknown: { label: "UNKNOWN", icon: HelpCircle, color: "text-gray-500", bg: "bg-gray-100" },
};

export function FbAdsDeviceBreakdown({ rows, currency }: DeviceBreakdownProps) {
	if (!rows.length) return null;

	// Normalize device keys
	const deviceMap = new Map<string, FbAdsRow>();
	for (const row of rows) {
		const k = row.key.toLowerCase().replace(/\s+/g, "_");
		const existing = deviceMap.get(k);
		if (existing) {
			existing.spend += row.spend;
			existing.impressions += row.impressions;
			existing.clicks += row.clicks;
			existing.conversions += row.conversions;
		} else {
			deviceMap.set(k, { ...row });
		}
	}

	const totalSpend = rows.reduce((s, r) => s + r.spend, 0);

	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
			<h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Device Breakdown</h3>
			<div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
				{["desktop", "mobile_app", "mobile_web", "unknown"].map((dk) => {
					const row = deviceMap.get(dk);
					const cfg = DEVICE_CONFIG[dk] || DEVICE_CONFIG.unknown!;
					if (!cfg) return null;
					const Icon = cfg.icon;
					const spend = row?.spend ?? 0;
					const pct = totalSpend > 0 ? (spend / totalSpend) * 100 : 0;

					return (
						<div key={dk} className="rounded-lg border border-[var(--border)] p-4">
							<div className="flex items-center gap-2 mb-3">
								<div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg.bg}`}>
									<Icon size={16} className={cfg.color} />
								</div>
								<div>
									<p className="text-[10px] font-semibold tracking-wider text-[var(--muted-foreground)]">{cfg.label}</p>
									<p className="text-[10px] text-[var(--muted-foreground)]">{pct.toFixed(1)}%</p>
								</div>
							</div>
							<div className="space-y-1.5">
								<div className="flex justify-between">
									<span className="text-[10px] text-[var(--muted-foreground)]">Spend</span>
									<span className="text-xs font-medium font-mono">{fmtMoney(spend, currency)}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-[10px] text-[var(--muted-foreground)]">Impr.</span>
									<span className="text-xs font-medium font-mono">{fmtNum(row?.impressions ?? 0)}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-[10px] text-[var(--muted-foreground)]">Clicks</span>
									<span className="text-xs font-medium font-mono">{fmtNum(row?.clicks ?? 0)}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-[10px] text-[var(--muted-foreground)]">CTR</span>
									<span className="text-xs font-medium font-mono">
										{(row?.impressions ?? 0) > 0 ? fmtPct((row?.clicks ?? 0) / (row?.impressions ?? 1)) : "—"}
									</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
