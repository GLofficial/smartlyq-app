import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, TextSelect, Palette } from "lucide-react";
import type { GoogleAdsRow } from "./google-ads-types";

interface GalleryProps {
	rows: GoogleAdsRow[];
	currency: string;
}

function fmtMoney(n: number, c: string): string {
	if (!c) c = "USD";
	try { return new Intl.NumberFormat(undefined, { style: "currency", currency: c, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); }
	catch { return n.toFixed(2); }
}
function fmtNum(n: number): string { return (n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 }); }
function fmtPct(n: number): string { return `${(n * 100).toFixed(2)}%`; }

function domainOf(url: string): string {
	try { return url ? new URL(url).hostname : ""; }
	catch { return (url || "").replace(/https?:\/\//, "").split("/")[0] ?? ""; }
}

function roasTier(roas: number, spend: number): "good" | "ok" | "low" | "none" {
	if (spend <= 0) return "none";
	if (roas >= 2) return "good";
	if (roas >= 1) return "ok";
	return "low";
}

const TIER_BORDER: Record<string, string> = {
	good: "border-emerald-300",
	ok: "border-amber-300",
	low: "border-red-300",
	none: "border-[var(--border)]",
};

function StatusBadge({ status }: { status?: string }) {
	if (!status) return null;
	const up = status.toUpperCase();
	const cls = up === "ENABLED" ? "bg-emerald-50 text-emerald-700" : up === "PAUSED" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-700";
	const dot = up === "ENABLED" ? "bg-emerald-500" : up === "PAUSED" ? "bg-amber-500" : "bg-gray-400";
	return (
		<span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>
			<span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
			{status.toLowerCase()}
		</span>
	);
}

export function GoogleAdsCreativeGallery({ rows, currency }: GalleryProps) {
	const [search, setSearch] = useState("");
	const [minSpend, setMinSpend] = useState("");
	const [sortBy, setSortBy] = useState<"spend" | "conversions" | "roas" | "cpa">("spend");

	const filtered = useMemo(() => {
		let out = rows;
		if (search) {
			const q = search.toLowerCase();
			out = out.filter((r) =>
				(r.key || "").toLowerCase().includes(q) ||
				(r.campaign_name || "").toLowerCase().includes(q) ||
				(r.adgroup_name || "").toLowerCase().includes(q) ||
				(r.headlines || []).some((h) => h.toLowerCase().includes(q))
			);
		}
		if (minSpend && !isNaN(Number(minSpend))) {
			const m = Number(minSpend);
			out = out.filter((r) => r.spend >= m);
		}
		return [...out].sort((a, b) => {
			if (sortBy === "cpa") {
				const ac = a.conversions > 0 ? a.spend / a.conversions : Infinity;
				const bc = b.conversions > 0 ? b.spend / b.conversions : Infinity;
				return ac - bc;
			}
			return (b[sortBy] as number) - (a[sortBy] as number);
		});
	}, [rows, search, minSpend, sortBy]);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-2">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
						<Palette size={18} className="text-white" />
					</div>
					<div>
						<h3 className="text-sm font-semibold text-[var(--foreground)]">Creative Gallery</h3>
						<p className="text-xs text-[var(--muted-foreground)]">{filtered.length} ads</p>
					</div>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<div className="relative">
						<Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
						<input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
							className="h-8 w-40 rounded-lg border border-[var(--border)] bg-transparent pl-7 pr-2 text-xs" />
					</div>
					<div className="relative">
						<SlidersHorizontal size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
						<input type="number" placeholder="Min spend" value={minSpend} onChange={(e) => setMinSpend(e.target.value)}
							className="h-8 w-28 rounded-lg border border-[var(--border)] bg-transparent pl-7 pr-2 text-xs" />
					</div>
					<select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
						className="h-8 rounded-lg border border-[var(--border)] bg-transparent px-2 text-xs">
						<option value="spend">Spend ↓</option>
						<option value="conversions">Conv. ↓</option>
						<option value="roas">ROAS ↓</option>
						<option value="cpa">CPA ↑</option>
					</select>
				</div>
			</div>

			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{filtered.map((row, i) => (
					<CreativeCard key={`${row.ad_id || row.key}-${i}`} row={row} currency={currency} />
				))}
			</div>
			{filtered.length === 0 && (
				<p className="text-center text-sm text-[var(--muted-foreground)] py-8">No creatives match your filters</p>
			)}
		</div>
	);
}

function CreativeCard({ row, currency }: { row: GoogleAdsRow; currency: string }) {
	const [showAll, setShowAll] = useState(false);
	const headlines = row.headlines ?? [];
	const descs = row.descriptions ?? [];
	const adType = (row.ad_type || "").replace(/_/g, " ");
	const domain = domainOf(row.final_url || "");

	const ctr = row.impressions > 0 ? row.clicks / row.impressions : 0;
	const cpc = row.clicks > 0 ? row.spend / row.clicks : 0;
	const roas = row.roas ?? 0;
	const tier = roasTier(roas, row.spend);

	const roasColor = tier === "good" ? "text-emerald-600" : tier === "ok" ? "text-amber-600" : tier === "low" ? "text-red-500" : "text-[var(--foreground)]";
	const ctrColor = ctr > 0.02 ? "text-emerald-600" : "text-[var(--foreground)]";

	return (
		<div className={`rounded-2xl border-2 bg-[var(--card)] overflow-hidden ${TIER_BORDER[tier]}`}>
			{/* Ad type + status */}
			<div className="flex items-center justify-between px-5 pt-4">
				<span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
					<TextSelect size={13} />
					{adType || "Ad"}
				</span>
				<StatusBadge status={row.ad_status || row.effective_status} />
			</div>

			{/* Google Search Ad Preview */}
			<div className="px-5 pt-4">
				<div className="rounded-xl border border-gray-200 bg-slate-50 p-4 mb-3">
					<div className="flex items-center gap-2 mb-2">
						{domain ? (
							<>
								<div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
									{domain.charAt(0).toUpperCase()}
								</div>
								<div>
									<div className="text-xs text-blue-600">{domain}</div>
									<div className="text-[11px] text-gray-500">Sponsored</div>
								</div>
							</>
						) : (
							<div className="text-[11px] text-gray-500">Sponsored</div>
						)}
					</div>
					{headlines.length > 0 && (
						<div className="text-base font-semibold leading-snug mb-1.5" style={{ color: "#1a0dab" }}>
							{headlines.slice(0, 3).join(" | ")}
						</div>
					)}
					{descs.length > 0 && (
						<div className="text-[13px] leading-snug" style={{ color: "#4d5156" }}>
							{descs.slice(0, 2).join(" ")}
						</div>
					)}
				</div>
			</div>

			{/* Campaign / Ad Group chips */}
			{(row.campaign_name || row.adgroup_name) && (
				<div className="px-5 flex flex-wrap gap-2 mb-2">
					{row.campaign_name && (
						<span className="inline-flex items-center gap-1 rounded-md bg-[var(--muted)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]" title={row.campaign_name}>
							<span className="truncate max-w-[140px]">{row.campaign_name}</span>
						</span>
					)}
					{row.adgroup_name && (
						<span className="inline-flex items-center gap-1 rounded-md bg-[var(--muted)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]" title={row.adgroup_name}>
							<span className="truncate max-w-[140px]">{row.adgroup_name}</span>
						</span>
					)}
				</div>
			)}

			{/* Metrics row 1 */}
			<div className="px-5 grid grid-cols-3 gap-2">
				<MetricTile label="SPEND" value={fmtMoney(row.spend, currency)} />
				<MetricTile label="CTR" value={fmtPct(ctr)} valueClass={ctrColor} />
				<MetricTile label="ROAS" value={roas > 0 ? `${roas.toFixed(2)}x` : "—"} valueClass={roasColor} />
			</div>

			{/* Metrics row 2 */}
			<div className="px-5 pt-2 grid grid-cols-3 gap-2">
				<MetricTileMini label="CLICKS" value={fmtNum(row.clicks)} />
				<MetricTileMini label="CONV." value={fmtNum(row.conversions)} />
				<MetricTileMini label="CPC" value={fmtMoney(cpc, currency)} />
			</div>

			{/* All headlines expandable */}
			{headlines.length > 3 && (
				<div className="px-5 py-3 mt-1">
					<button onClick={() => setShowAll((v) => !v)}
						className="text-xs font-medium text-[var(--sq-primary)] hover:underline">
						{showAll ? "▾ Hide headlines" : `▸ All ${headlines.length} headlines`}
					</button>
					{showAll && (
						<div className="mt-2 space-y-0.5">
							{headlines.map((h, idx) => (
								<div key={idx} className="text-[12px] text-[var(--muted-foreground)]">
									{idx + 1}. {h}
								</div>
							))}
							{descs.length > 0 && (
								<>
									<div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mt-2">
										All {descs.length} descriptions
									</div>
									{descs.map((d, idx) => (
										<div key={`d-${idx}`} className="text-[12px] text-[var(--muted-foreground)]">
											{idx + 1}. {d}
										</div>
									))}
								</>
							)}
						</div>
					)}
				</div>
			)}
			{headlines.length <= 3 && <div className="pb-4" />}
		</div>
	);
}

function MetricTile({ label, value, valueClass = "text-[var(--foreground)]" }: { label: string; value: string; valueClass?: string }) {
	return (
		<div className="rounded-lg bg-slate-50 text-center py-2 px-1">
			<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
			<p className={`text-sm font-bold font-mono ${valueClass}`}>{value}</p>
		</div>
	);
}

function MetricTileMini({ label, value }: { label: string; value: string }) {
	return (
		<div className="text-center py-1">
			<p className="text-[9px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
			<p className="text-[13px] font-semibold text-[var(--foreground)] font-mono">{value}</p>
		</div>
	);
}
