import type { GoogleAdsKeyword, GoogleAdsAdGroup } from "./google-ads-types";

function fmtMoney(n: number, c: string): string {
	if (!c) c = "USD";
	try { return new Intl.NumberFormat(undefined, { style: "currency", currency: c, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); }
	catch { return n.toFixed(2); }
}
function fmtNum(n: number): string { return (n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }
function fmtPct(n: number): string { return `${(n * 100).toFixed(2)}%`; }

const MATCH_COLORS: Record<string, { bg: string; text: string }> = {
	EXACT: { bg: "bg-emerald-50", text: "text-emerald-700" },
	PHRASE: { bg: "bg-amber-50", text: "text-amber-700" },
	BROAD: { bg: "bg-blue-50", text: "text-blue-700" },
};

function MatchBadge({ type }: { type: string }) {
	const upper = (type || "").toUpperCase();
	const cfg = MATCH_COLORS[upper] || { bg: "bg-gray-100", text: "text-gray-600" };
	return <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>{upper || "—"}</span>;
}

function QualityScoreBars({ score }: { score: number | null | undefined }) {
	if (score === null || score === undefined || score < 1) return <span className="text-[var(--muted-foreground)]">—</span>;
	const n = Math.max(1, Math.min(10, Math.round(score)));
	const color = n >= 7 ? "bg-emerald-500" : n >= 4 ? "bg-amber-500" : "bg-red-500";
	return (
		<span className="inline-flex items-center gap-0.5">
			{Array.from({ length: 10 }, (_, i) => (
				<span key={i} className={`inline-block h-3 w-1 rounded-sm ${i < n ? color : "bg-gray-200"}`} />
			))}
			<span className="ml-1 text-[10px] font-medium text-[var(--muted-foreground)]">{n}/10</span>
		</span>
	);
}

function OverviewCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
			<div className="px-5 py-3 border-b border-[var(--border)]">
				<h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
			</div>
			{children}
		</div>
	);
}

export function OverviewAdGroupsTable({ rows, currency }: { rows: GoogleAdsAdGroup[]; currency: string }) {
	if (!rows?.length) return null;
	return (
		<OverviewCard title="Top Ad Groups">
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead className="bg-[var(--muted)]/30">
						<tr className="border-b border-[var(--border)]">
							<Th>Ad Group</Th>
							<Th>Campaign</Th>
							<Th align="right">Spend</Th>
							<Th align="right">Clicks</Th>
							<Th align="right">Conv.</Th>
						</tr>
					</thead>
					<tbody>
						{rows.map((r, i) => (
							<tr key={`${r.entity_id}-${i}`} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/20">
								<td className="px-4 py-2.5"><p className="font-medium text-sm">{r.key || "—"}</p></td>
								<td className="px-4 py-2.5 text-xs text-[var(--muted-foreground)]">{r.campaign_name}</td>
								<td className="px-4 py-2.5 text-right font-mono text-xs">{fmtMoney(r.spend, currency)}</td>
								<td className="px-4 py-2.5 text-right font-mono text-xs">{fmtNum(r.clicks)}</td>
								<td className="px-4 py-2.5 text-right font-mono text-xs">{fmtNum(r.conversions)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</OverviewCard>
	);
}

export function OverviewKeywordsTable({ rows, currency }: { rows: GoogleAdsKeyword[]; currency: string }) {
	if (!rows?.length) return null;
	return (
		<OverviewCard title="Top Keywords">
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead className="bg-[var(--muted)]/30">
						<tr className="border-b border-[var(--border)]">
							<Th>Keyword</Th>
							<Th>Match</Th>
							<Th>Quality Score</Th>
							<Th align="right">Impr.</Th>
							<Th align="right">Clicks</Th>
							<Th align="right">CTR</Th>
							<Th align="right">Avg. CPC</Th>
							<Th align="right">Conv.</Th>
							<Th align="right">CPA</Th>
						</tr>
					</thead>
					<tbody>
						{rows.map((r, i) => {
							const ctr = r.impressions > 0 ? r.clicks / r.impressions : 0;
							const cpc = r.clicks > 0 ? r.spend / r.clicks : 0;
							const cpa = r.conversions > 0 ? r.spend / r.conversions : 0;
							const ctrHi = ctr > 0.02;
							return (
								<tr key={`${r.keyword}-${i}`} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/20">
									<td className="px-4 py-2.5"><p className="font-medium text-sm">{r.keyword || "—"}</p></td>
									<td className="px-4 py-2.5"><MatchBadge type={r.match_type} /></td>
									<td className="px-4 py-2.5"><QualityScoreBars score={r.quality_score} /></td>
									<td className="px-4 py-2.5 text-right font-mono text-xs">{fmtNum(r.impressions)}</td>
									<td className="px-4 py-2.5 text-right font-mono text-xs">{fmtNum(r.clicks)}</td>
									<td className={`px-4 py-2.5 text-right font-mono text-xs ${ctrHi ? "text-emerald-600 font-semibold" : ""}`}>{ctr > 0 ? fmtPct(ctr) : "—"}</td>
									<td className="px-4 py-2.5 text-right font-mono text-xs">{cpc > 0 ? fmtMoney(cpc, currency) : "—"}</td>
									<td className="px-4 py-2.5 text-right font-mono text-xs">{fmtNum(r.conversions)}</td>
									<td className="px-4 py-2.5 text-right font-mono text-xs">{cpa > 0 ? fmtMoney(cpa, currency) : "—"}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</OverviewCard>
	);
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
	return (
		<th className={`px-4 py-2.5 text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase ${align === "right" ? "text-right" : "text-left"}`}>
			{children}
		</th>
	);
}
