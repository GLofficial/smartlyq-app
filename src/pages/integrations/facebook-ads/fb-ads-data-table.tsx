import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Loader2, Image as ImageIcon, Search, SlidersHorizontal, Check, X, FlaskConical } from "lucide-react";
import type { FbAdsRow, FbAdsTab } from "./fb-ads-types";

interface DataTableProps {
	rows: FbAdsRow[];
	tab: FbAdsTab;
	currency: string;
	nextCursor: string;
	onLoadMore: () => void;
	isLoadingMore: boolean;
	onRowClick?: (row: FbAdsRow) => void;
	onTriageChange?: (entityId: string, level: string, decision: string) => void;
}

type SortDir = "asc" | "desc";

function fmtMoney(n: number, c: string): string {
	if (!c) c = "USD";
	try { return new Intl.NumberFormat(undefined, { style: "currency", currency: c, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); }
	catch { return n.toFixed(2); }
}
function fmtNum(n: number): string { return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }
function fmtPct(n: number): string { return `${(n * 100).toFixed(2)}%`; }

function roasColor(roas: number): string {
	if (roas >= 3) return "text-emerald-600 font-semibold";
	if (roas >= 1.5) return "text-amber-600";
	if (roas > 0) return "text-red-500";
	return "";
}
function ctrColor(ctr: number): string {
	if (ctr >= 0.02) return "text-emerald-600";
	return "";
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
	ACTIVE: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
	PAUSED: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
	DELETED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
	ARCHIVED: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
	CAMPAIGN_PAUSED: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

function StatusBadge({ status }: { status?: string }) {
	if (!status) return null;
	const s = STATUS_COLORS[status] || STATUS_COLORS.PAUSED!;
	const bg = s?.bg ?? "bg-amber-50";
	const text = s?.text ?? "text-amber-700";
	const dot = s?.dot ?? "bg-amber-500";
	return (
		<span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${bg} ${text}`}>
			<span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
			{status.replace(/_/g, " ").toLowerCase()}
		</span>
	);
}

function TriageBadge({ row, onChange }: { row: FbAdsRow; onChange?: (id: string, level: string, decision: string) => void }) {
	if (!row.entity_level || row.entity_level !== "campaign") return null;
	const d = row.triage_decision ?? "none";
	const suggested = row.triage_suggested;
	const reason = row.triage_reason;

	const badges: { key: string; label: string; icon: typeof Check; color: string; bg: string }[] = [
		{ key: "keep", label: "Keep", icon: Check, color: "text-emerald-700", bg: "bg-emerald-50" },
		{ key: "kill", label: "Kill", icon: X, color: "text-red-700", bg: "bg-red-50" },
		{ key: "test", label: "Test", icon: FlaskConical, color: "text-amber-700", bg: "bg-amber-50" },
	];

	return (
		<div className="flex items-center gap-1" title={reason || undefined}>
			{badges.map((b) => {
				const active = d === b.key;
				const isSuggested = suggested === b.key && d === "none";
				const Icon = b.icon;
				return (
					<button key={b.key} title={isSuggested ? `AI suggests: ${b.label}` : b.label}
						onClick={(e) => { e.stopPropagation(); onChange?.(row.entity_id, row.entity_level, active ? "none" : b.key); }}
						className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium transition-colors ${active ? `${b.bg} ${b.color}` : isSuggested ? `border border-dashed border-current ${b.color} opacity-60` : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>
						<Icon size={10} /> {b.label}
					</button>
				);
			})}
		</div>
	);
}

interface Column {
	key: string; label: string; align?: "right";
	render: (row: FbAdsRow, currency: string) => React.ReactNode;
	sortKey?: keyof FbAdsRow;
}

function getColumns(tab: FbAdsTab, hasTriageHandler: boolean): Column[] {
	const nameCol: Column = {
		key: "key", label: tab === "hours" ? "Hour" : "Name",
		render: (r) => (
			<div className="min-w-0">
				<p className="font-medium text-sm text-[var(--foreground)] truncate max-w-[280px]">{r.key || "—"}</p>
				{r.meta && <p className="text-[10px] text-[var(--muted-foreground)] truncate max-w-[280px]">{r.meta}</p>}
			</div>
		),
	};
	const statusCol: Column = { key: "status", label: "Status", render: (r) => <StatusBadge status={r.effective_status} /> };
	const spendCol: Column = { key: "spend", label: "Spend", align: "right", render: (r, c) => fmtMoney(r.spend, c), sortKey: "spend" };
	const imprCol: Column = { key: "impressions", label: "Impr.", align: "right", render: (r) => fmtNum(r.impressions), sortKey: "impressions" };
	const clicksCol: Column = { key: "clicks", label: "Clicks", align: "right", render: (r) => fmtNum(r.clicks), sortKey: "clicks" };
	const ctrCol: Column = {
		key: "ctr", label: "CTR", align: "right",
		render: (r) => { const v = r.impressions > 0 ? r.clicks / r.impressions : 0; return <span className={ctrColor(v)}>{v > 0 ? fmtPct(v) : "—"}</span>; },
	};
	const convCol: Column = { key: "conversions", label: "Conv.", align: "right", render: (r) => fmtNum(r.conversions), sortKey: "conversions" };
	const revCol: Column = { key: "revenue", label: "Revenue", align: "right", render: (r, c) => fmtMoney(r.revenue, c), sortKey: "revenue" };
	const roasCol: Column = {
		key: "roas", label: "ROAS", align: "right", sortKey: "roas",
		render: (r) => <span className={roasColor(r.roas)}>{r.roas > 0 ? `${r.roas.toFixed(2)}x` : "—"}</span>,
	};
	const triageCol: Column = {
		key: "triage", label: "Triage",
		render: () => null, // handled inline
	};

	const entityTabs = ["campaigns", "adsets", "ads"];
	if (entityTabs.includes(tab)) {
		const cols = [nameCol, statusCol, spendCol, imprCol, clicksCol, ctrCol, convCol, revCol, roasCol];
		if (tab === "campaigns" && hasTriageHandler) cols.push(triageCol);
		return cols;
	}
	return [nameCol, spendCol, imprCol, clicksCol, ctrCol, convCol, revCol, roasCol];
}

export function FbAdsDataTable({ rows, tab, currency, nextCursor, onLoadMore, isLoadingMore, onRowClick, onTriageChange }: DataTableProps) {
	const [sortKey, setSortKey] = useState<string>("spend");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	if (tab === "creatives") {
		return <CreativesGrid rows={rows} currency={currency} nextCursor={nextCursor} onLoadMore={onLoadMore} isLoadingMore={isLoadingMore} onRowClick={onRowClick} />;
	}

	const columns = getColumns(tab, !!onTriageChange);

	const sorted = useMemo(() => {
		const col = columns.find((c) => c.key === sortKey);
		const sk = col?.sortKey;
		if (!sk) return rows;
		return [...rows].sort((a, b) => {
			const av = (a[sk] as number) ?? 0;
			const bv = (b[sk] as number) ?? 0;
			return sortDir === "asc" ? av - bv : bv - av;
		});
	}, [rows, sortKey, sortDir, columns]);

	const toggleSort = (key: string) => {
		if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
		else { setSortKey(key); setSortDir("desc"); }
	};

	const tabLabel = tab.charAt(0).toUpperCase() + tab.slice(1);

	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
			<div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border)]">
				<h3 className="text-sm font-semibold text-[var(--foreground)]">{tabLabel}</h3>
				<span className="text-xs text-[var(--muted-foreground)]">{rows.length} rows</span>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-[var(--border)] bg-[var(--muted)]/30">
							{columns.map((col) => (
								<th key={col.key}
									className={`px-4 py-2.5 text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase whitespace-nowrap ${col.align === "right" ? "text-right" : "text-left"} ${col.sortKey ? "cursor-pointer select-none hover:text-[var(--foreground)]" : ""}`}
									onClick={() => col.sortKey && toggleSort(col.key)}>
									<span className="inline-flex items-center gap-1">
										{col.label}
										{col.sortKey && sortKey === col.key && (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
									</span>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{sorted.map((row, i) => (
							<tr key={`${row.entity_id || row.key}-${i}`}
								className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/20 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
								onClick={() => onRowClick?.(row)}>
								{columns.map((col) => (
									<td key={col.key} className={`px-4 py-2.5 ${col.align === "right" ? "text-right font-mono text-xs" : ""}`}>
										{col.key === "triage" ? <TriageBadge row={row} onChange={onTriageChange} /> : col.render(row, currency)}
									</td>
								))}
							</tr>
						))}
						{sorted.length === 0 && (
							<tr><td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">No data for this period</td></tr>
						)}
					</tbody>
				</table>
			</div>
			{nextCursor && (
				<div className="flex justify-center py-3 border-t border-[var(--border)]">
					<Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoadingMore} className="gap-1.5 text-xs">
						{isLoadingMore && <Loader2 size={14} className="animate-spin" />}
						Load More
					</Button>
				</div>
			)}
		</div>
	);
}

/* ── Creatives Grid with Search/Filter/Sort ────────────────────────── */

function CreativesGrid({ rows, currency, nextCursor, onLoadMore, isLoadingMore, onRowClick }: Omit<DataTableProps, "tab" | "onTriageChange"> & { onRowClick?: (row: FbAdsRow) => void }) {
	const [search, setSearch] = useState("");
	const [minSpend, setMinSpend] = useState("");
	const [sortBy, setSortBy] = useState<"spend" | "conversions" | "roas" | "cpa">("spend");

	const filtered = useMemo(() => {
		let out = rows;
		if (search) { const q = search.toLowerCase(); out = out.filter((r) => r.key.toLowerCase().includes(q) || r.meta.toLowerCase().includes(q)); }
		if (minSpend && !isNaN(Number(minSpend))) { const m = Number(minSpend); out = out.filter((r) => r.spend >= m); }
		return [...out].sort((a, b) => {
			if (sortBy === "cpa") { const ac = a.conversions > 0 ? a.spend / a.conversions : Infinity; const bc = b.conversions > 0 ? b.spend / b.conversions : Infinity; return ac - bc; }
			return (b[sortBy] as number) - (a[sortBy] as number);
		});
	}, [rows, search, minSpend, sortBy]);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-3">
				<h3 className="text-sm font-semibold text-[var(--foreground)]">Creatives</h3>
				<span className="text-xs text-[var(--muted-foreground)]">{filtered.length} ads</span>
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
			<div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{filtered.map((row, i) => (
					<div key={`${row.ad_id}-${i}`}
						className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
						onClick={() => onRowClick?.(row)}>
						<div className="aspect-square bg-[var(--muted)] relative">
							{row.creative_thumb ? (
								<img src={row.creative_thumb} alt={row.key} className="h-full w-full object-cover" loading="lazy" />
							) : (
								<div className="flex h-full w-full items-center justify-center"><ImageIcon size={32} className="text-[var(--muted-foreground)]/30" /></div>
							)}
							{row.creative_format && row.creative_format !== "image" && (
								<span className="absolute top-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white uppercase">{row.creative_format}</span>
							)}
							{row.effective_status && <span className="absolute top-2 left-2"><StatusBadge status={row.effective_status} /></span>}
						</div>
						<div className="p-3 space-y-1.5">
							<p className="text-xs font-medium text-[var(--foreground)] truncate">{row.key || "Untitled"}</p>
							<div className="grid grid-cols-3 gap-1 pt-1">
								<MiniStat label="Spend" value={fmtMoney(row.spend, currency)} />
								<MiniStat label="CTR" value={row.impressions > 0 ? fmtPct(row.clicks / row.impressions) : "—"} />
								<MiniStat label="CPC" value={row.clicks > 0 ? fmtMoney(row.spend / row.clicks, currency) : "—"} />
								<MiniStat label="Conv." value={fmtNum(row.conversions)} />
								<MiniStat label="CPA" value={row.conversions > 0 ? fmtMoney(row.spend / row.conversions, currency) : "—"} />
								<MiniStat label="ROAS" value={row.roas > 0 ? `${row.roas.toFixed(1)}x` : "—"} className={roasColor(row.roas)} />
							</div>
						</div>
					</div>
				))}
			</div>
			{filtered.length === 0 && <p className="text-center text-sm text-[var(--muted-foreground)] py-8">No creatives match your filters</p>}
			{nextCursor && (
				<div className="flex justify-center">
					<Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoadingMore} className="gap-1.5 text-xs">
						{isLoadingMore && <Loader2 size={14} className="animate-spin" />} Load More
					</Button>
				</div>
			)}
		</div>
	);
}

function MiniStat({ label, value, className = "" }: { label: string; value: string; className?: string }) {
	return (
		<div>
			<p className="text-[9px] text-[var(--muted-foreground)]">{label}</p>
			<p className={`text-[11px] font-medium text-[var(--foreground)] font-mono ${className}`}>{value}</p>
		</div>
	);
}
