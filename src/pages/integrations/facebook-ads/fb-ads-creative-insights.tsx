import { Trophy, TrendingUp, Video, Image as ImageIcon, LayoutGrid } from "lucide-react";
import type { FbAdsRow } from "./fb-ads-types";

interface CreativeInsightsProps {
	rows: FbAdsRow[];
	currency: string;
}

function fmtMoney(n: number, c: string): string {
	if (!c) c = "USD";
	try { return new Intl.NumberFormat(undefined, { style: "currency", currency: c, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); }
	catch { return n.toFixed(2); }
}

export function FbAdsCreativeInsights({ rows, currency }: CreativeInsightsProps) {
	if (rows.length < 2) return null;

	// Format performance breakdown
	const formats: Record<string, { count: number; spend: number; conversions: number; roas: number }> = {};
	for (const r of rows) {
		const fmt = r.creative_format || "image";
		if (!formats[fmt]) formats[fmt] = { count: 0, spend: 0, conversions: 0, roas: 0 };
		formats[fmt].count++;
		formats[fmt].spend += r.spend;
		formats[fmt].conversions += r.conversions;
	}
	for (const f of Object.values(formats)) {
		f.roas = f.spend > 0 ? f.conversions / f.spend : 0; // simplified
	}

	// Top performers
	const byRoas = [...rows].filter((r) => r.spend > 0 && r.roas > 0).sort((a, b) => b.roas - a.roas);
	const byConversions = [...rows].sort((a, b) => b.conversions - a.conversions);
	const topRoas = byRoas[0];
	const topConv = byConversions[0];

	const FORMAT_ICONS: Record<string, typeof Video> = { video: Video, image: ImageIcon, carousel: LayoutGrid };

	return (
		<div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
			{/* Format Performance */}
			<div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-4">
				<p className="text-[10px] font-semibold tracking-wider text-amber-700 mb-2">FORMAT PERFORMANCE</p>
				<div className="space-y-2">
					{Object.entries(formats).sort(([, a], [, b]) => b.spend - a.spend).slice(0, 4).map(([fmt, data]) => {
						const Icon = FORMAT_ICONS[fmt] || ImageIcon;
						return (
							<div key={fmt} className="flex items-center gap-2">
								<Icon size={14} className="text-amber-600" />
								<span className="text-xs font-medium text-[var(--foreground)] capitalize">{fmt}</span>
								<span className="ml-auto text-[10px] text-[var(--muted-foreground)]">{data.count} ads · {fmtMoney(data.spend, currency)}</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Top Performers */}
			<div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-emerald-50/50 to-green-50/50 p-4">
				<p className="text-[10px] font-semibold tracking-wider text-emerald-700 mb-2">TOP PERFORMERS</p>
				<div className="space-y-3">
					{topRoas && (
						<div className="flex items-start gap-2">
							<Trophy size={14} className="text-emerald-600 mt-0.5" />
							<div className="min-w-0">
								<p className="text-xs font-medium text-[var(--foreground)] truncate">{topRoas.key}</p>
								<p className="text-[10px] text-[var(--muted-foreground)]">Best ROAS: {topRoas.roas.toFixed(2)}x</p>
							</div>
						</div>
					)}
					{topConv && topConv !== topRoas && (
						<div className="flex items-start gap-2">
							<TrendingUp size={14} className="text-emerald-600 mt-0.5" />
							<div className="min-w-0">
								<p className="text-xs font-medium text-[var(--foreground)] truncate">{topConv.key}</p>
								<p className="text-[10px] text-[var(--muted-foreground)]">Top conv: {topConv.conversions}</p>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Summary Stats */}
			<div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-4">
				<p className="text-[10px] font-semibold tracking-wider text-blue-700 mb-2">CREATIVE SUMMARY</p>
				<div className="space-y-2">
					<div className="flex justify-between">
						<span className="text-xs text-[var(--muted-foreground)]">Total Creatives</span>
						<span className="text-xs font-semibold text-[var(--foreground)]">{rows.length}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs text-[var(--muted-foreground)]">Total Spend</span>
						<span className="text-xs font-semibold text-[var(--foreground)]">{fmtMoney(rows.reduce((s, r) => s + r.spend, 0), currency)}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs text-[var(--muted-foreground)]">Avg ROAS</span>
						<span className="text-xs font-semibold text-[var(--foreground)]">
							{(() => { const totalSpend = rows.reduce((s, r) => s + r.spend, 0); const totalRev = rows.reduce((s, r) => s + r.revenue, 0); return totalSpend > 0 ? `${(totalRev / totalSpend).toFixed(2)}x` : "—"; })()}
						</span>
					</div>
					<div className="flex justify-between">
						<span className="text-xs text-[var(--muted-foreground)]">Total Conversions</span>
						<span className="text-xs font-semibold text-[var(--foreground)]">{rows.reduce((s, r) => s + r.conversions, 0).toLocaleString()}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
