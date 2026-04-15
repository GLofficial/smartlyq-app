import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Loader2, Image as ImageIcon } from "lucide-react";
import type { FbAdsRow, FbAdsTab } from "./fb-ads-types";

interface DataTableProps {
	rows: FbAdsRow[];
	tab: FbAdsTab;
	currency: string;
	nextCursor: string;
	onLoadMore: () => void;
	isLoadingMore: boolean;
}

type SortDir = "asc" | "desc";

function fmtMoney(n: number, c: string): string {
	if (!c) c = "USD";
	try { return new Intl.NumberFormat(undefined, { style: "currency", currency: c, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n); }
	catch { return n.toFixed(2); }
}
function fmtNum(n: number): string { return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }
function fmtPct(n: number): string { return `${(n * 100).toFixed(2)}%`; }

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

interface Column {
	key: string;
	label: string;
	align?: "right";
	render: (row: FbAdsRow, currency: string) => React.ReactNode;
	sortKey?: keyof FbAdsRow;
}

function getColumns(tab: FbAdsTab): Column[] {
	const nameCol: Column = {
		key: "key", label: tab === "hours" ? "Hour" : "Name",
		render: (r) => (
			<div className="min-w-0">
				<p className="font-medium text-sm text-[var(--foreground)] truncate max-w-[280px]">{r.key || "—"}</p>
				{r.meta && <p className="text-[10px] text-[var(--muted-foreground)] truncate max-w-[280px]">{r.meta}</p>}
			</div>
		),
	};
	const statusCol: Column = {
		key: "status", label: "Status",
		render: (r) => <StatusBadge status={r.effective_status} />,
	};
	const spendCol: Column = { key: "spend", label: "Spend", align: "right", render: (r, c) => fmtMoney(r.spend, c), sortKey: "spend" };
	const imprCol: Column = { key: "impressions", label: "Impr.", align: "right", render: (r) => fmtNum(r.impressions), sortKey: "impressions" };
	const clicksCol: Column = { key: "clicks", label: "Clicks", align: "right", render: (r) => fmtNum(r.clicks), sortKey: "clicks" };
	const ctrCol: Column = { key: "ctr", label: "CTR", align: "right", render: (r) => r.impressions > 0 ? fmtPct(r.clicks / r.impressions) : "—" };
	const convCol: Column = { key: "conversions", label: "Conv.", align: "right", render: (r) => fmtNum(r.conversions), sortKey: "conversions" };
	const revCol: Column = { key: "revenue", label: "Revenue", align: "right", render: (r, c) => fmtMoney(r.revenue, c), sortKey: "revenue" };
	const roasCol: Column = { key: "roas", label: "ROAS", align: "right", render: (r) => r.roas > 0 ? `${r.roas.toFixed(2)}x` : "—", sortKey: "roas" };

	const entityTabs = ["campaigns", "adsets", "ads"];
	if (entityTabs.includes(tab)) {
		return [nameCol, statusCol, spendCol, imprCol, clicksCol, ctrCol, convCol, revCol, roasCol];
	}
	// Breakdown tabs (geo, regions, placements, hours, devices, demographics)
	return [nameCol, spendCol, imprCol, clicksCol, ctrCol, convCol, revCol, roasCol];
}

export function FbAdsDataTable({ rows, tab, currency, nextCursor, onLoadMore, isLoadingMore }: DataTableProps) {
	const [sortKey, setSortKey] = useState<string>("spend");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	// Creatives tab: card grid
	if (tab === "creatives") {
		return <CreativesGrid rows={rows} currency={currency} nextCursor={nextCursor} onLoadMore={onLoadMore} isLoadingMore={isLoadingMore} />;
	}

	const columns = getColumns(tab);

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
							<tr key={`${row.entity_id || row.key}-${i}`} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/20 transition-colors">
								{columns.map((col) => (
									<td key={col.key} className={`px-4 py-2.5 ${col.align === "right" ? "text-right font-mono text-xs" : ""}`}>
										{col.render(row, currency)}
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

/* ── Creatives Grid ────────────────────────────────────────────────── */

function CreativesGrid({ rows, currency, nextCursor, onLoadMore, isLoadingMore }: Omit<DataTableProps, "tab">) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<h3 className="text-sm font-semibold text-[var(--foreground)]">Creatives</h3>
				<span className="text-xs text-[var(--muted-foreground)]">{rows.length} ads</span>
			</div>
			<div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{rows.map((row, i) => (
					<div key={`${row.ad_id}-${i}`} className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:shadow-md transition-shadow">
						<div className="aspect-square bg-[var(--muted)] relative">
							{row.creative_thumb ? (
								<img src={row.creative_thumb} alt={row.key} className="h-full w-full object-cover" loading="lazy" />
							) : (
								<div className="flex h-full w-full items-center justify-center">
									<ImageIcon size={32} className="text-[var(--muted-foreground)]/30" />
								</div>
							)}
							{row.creative_format && row.creative_format !== "image" && (
								<span className="absolute top-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white uppercase">
									{row.creative_format}
								</span>
							)}
							{row.effective_status && (
								<span className="absolute top-2 left-2">
									<StatusBadge status={row.effective_status} />
								</span>
							)}
						</div>
						<div className="p-3 space-y-1.5">
							<p className="text-xs font-medium text-[var(--foreground)] truncate">{row.key || "Untitled"}</p>
							<p className="text-[10px] text-[var(--muted-foreground)] truncate">{row.meta}</p>
							<div className="grid grid-cols-2 gap-1 pt-1">
								<MiniStat label="Spend" value={fmtMoney(row.spend, currency)} />
								<MiniStat label="Impr." value={fmtNum(row.impressions)} />
								<MiniStat label="Clicks" value={fmtNum(row.clicks)} />
								<MiniStat label="ROAS" value={row.roas > 0 ? `${row.roas.toFixed(1)}x` : "—"} />
							</div>
						</div>
					</div>
				))}
			</div>
			{nextCursor && (
				<div className="flex justify-center">
					<Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoadingMore} className="gap-1.5 text-xs">
						{isLoadingMore && <Loader2 size={14} className="animate-spin" />}
						Load More
					</Button>
				</div>
			)}
		</div>
	);
}

function MiniStat({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-[9px] text-[var(--muted-foreground)]">{label}</p>
			<p className="text-[11px] font-medium text-[var(--foreground)] font-mono">{value}</p>
		</div>
	);
}
