import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Check, X, FlaskConical } from "lucide-react";
import type { GoogleAdsRow, GoogleAdsTab } from "./google-ads-types";

interface DataTableProps {
	rows: GoogleAdsRow[];
	tab: GoogleAdsTab;
	currency: string;
	onRowClick?: (row: GoogleAdsRow) => void;
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

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
	ENABLED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
	PAUSED: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
	REMOVED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

function StatusBadge({ status }: { status?: string }) {
	if (!status) return null;
	const s = STATUS_COLORS[status] || STATUS_COLORS.PAUSED!;
	return (
		<span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${s.bg} ${s.text}`}>
			<span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
			{status.toLowerCase()}
		</span>
	);
}

function TriageBadge({ row, onChange }: { row: GoogleAdsRow; onChange?: (id: string, level: string, decision: string) => void }) {
	if (row.entity_level !== "campaign" || !row.entity_id) return null;
	const d = row.triage_decision ?? "none";
	const suggested = row.triage_suggested;
	const badges: { key: string; label: string; icon: typeof Check; color: string; bg: string }[] = [
		{ key: "keep", label: "Keep", icon: Check, color: "text-emerald-700", bg: "bg-emerald-50" },
		{ key: "kill", label: "Kill", icon: X, color: "text-red-700", bg: "bg-red-50" },
		{ key: "test", label: "Test", icon: FlaskConical, color: "text-amber-700", bg: "bg-amber-50" },
	];

	return (
		<div className="flex items-center gap-1" title={row.triage_reason || undefined}>
			{badges.map((b) => {
				const active = d === b.key;
				const isSuggested = suggested === b.key && d === "none";
				const Icon = b.icon;
				return (
					<button key={b.key} title={isSuggested ? `AI suggests: ${b.label}` : b.label}
						onClick={(e) => { e.stopPropagation(); onChange?.(row.entity_id!, row.entity_level!, active ? "none" : b.key); }}
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
	render: (row: GoogleAdsRow, currency: string) => React.ReactNode;
	sortKey?: keyof GoogleAdsRow;
}

function getColumns(tab: GoogleAdsTab, hasTriageHandler: boolean): Column[] {
	const nameCol: Column = {
		key: "key",
		label: tab === "hours" ? "Hour" : tab === "geo" ? "Country" : tab === "regions" ? "Region" : tab === "networks" ? "Network" : tab === "devices" ? "Device" : "Name",
		render: (r) => (
			<div className="min-w-0">
				<p className="font-medium text-sm text-[var(--foreground)] truncate max-w-[280px]">{r.key || "—"}</p>
				{r.campaign_name && <p className="text-[10px] text-[var(--muted-foreground)] truncate max-w-[280px]">{r.campaign_name}{r.adgroup_name ? ` / ${r.adgroup_name}` : ""}</p>}
			</div>
		),
	};
	const statusCol: Column = { key: "status", label: "Status", render: (r) => <StatusBadge status={r.effective_status || r.ad_status} /> };
	const spendCol: Column = { key: "spend", label: "Spend", align: "right", render: (r, c) => fmtMoney(r.spend, c), sortKey: "spend" };
	const imprCol: Column = { key: "impressions", label: "Impr.", align: "right", render: (r) => fmtNum(r.impressions), sortKey: "impressions" };
	const clicksCol: Column = { key: "clicks", label: "Clicks", align: "right", render: (r) => fmtNum(r.clicks), sortKey: "clicks" };
	const ctrCol: Column = {
		key: "ctr", label: "CTR", align: "right",
		render: (r) => { const v = r.impressions > 0 ? r.clicks / r.impressions : 0; return v > 0 ? fmtPct(v) : "—"; },
	};
	const convCol: Column = { key: "conversions", label: "Conv.", align: "right", render: (r) => fmtNum(r.conversions), sortKey: "conversions" };
	const revCol: Column = { key: "revenue", label: "Revenue", align: "right", render: (r, c) => fmtMoney(r.revenue, c), sortKey: "revenue" };
	const roasCol: Column = {
		key: "roas", label: "ROAS", align: "right", sortKey: "roas",
		render: (r) => <span className={roasColor(r.roas)}>{r.roas > 0 ? `${r.roas.toFixed(2)}x` : "—"}</span>,
	};
	const triageCol: Column = { key: "triage", label: "Triage", render: () => null };

	if (tab === "competitors") {
		return [
			nameCol,
			{ key: "impression_share", label: "Impr Share", align: "right", render: (r) => r.impression_share != null ? fmtPct(r.impression_share) : "—" },
			{ key: "top_impression_share", label: "Top IS", align: "right", render: (r) => r.top_impression_share != null ? fmtPct(r.top_impression_share) : "—" },
			{ key: "abs_top_impression_share", label: "Abs Top IS", align: "right", render: (r) => r.abs_top_impression_share != null ? fmtPct(r.abs_top_impression_share) : "—" },
			{ key: "rank_lost_share", label: "Lost (Rank)", align: "right", render: (r) => r.rank_lost_share != null ? fmtPct(r.rank_lost_share) : "—" },
			{ key: "budget_lost_share", label: "Lost (Budget)", align: "right", render: (r) => r.budget_lost_share != null ? fmtPct(r.budget_lost_share) : "—" },
			spendCol, imprCol, clicksCol,
		];
	}

	if (tab === "ads") {
		return [
			{
				key: "key", label: "Ad",
				render: (r) => (
					<div className="min-w-0 max-w-[320px]">
						<p className="font-medium text-sm text-[var(--foreground)] truncate">{r.key || "—"}</p>
						{r.headlines && r.headlines.length > 0 && (
							<p className="text-[10px] text-[var(--muted-foreground)] truncate">{r.headlines.slice(0, 2).join(" · ")}</p>
						)}
						{r.campaign_name && <p className="text-[9px] text-[var(--muted-foreground)] truncate">{r.campaign_name} / {r.adgroup_name}</p>}
					</div>
				),
			},
			statusCol, spendCol, imprCol, clicksCol, ctrCol, convCol, revCol, roasCol,
		];
	}

	const entityTabs: GoogleAdsTab[] = ["campaigns", "adgroups"];
	if (entityTabs.includes(tab)) {
		const cols = [nameCol, statusCol, spendCol, imprCol, clicksCol, ctrCol, convCol, revCol, roasCol];
		if (tab === "campaigns" && hasTriageHandler) cols.push(triageCol);
		return cols;
	}
	return [nameCol, spendCol, imprCol, clicksCol, ctrCol, convCol, revCol, roasCol];
}

export function GoogleAdsDataTable({ rows, tab, currency, onRowClick, onTriageChange }: DataTableProps) {
	const [sortKey, setSortKey] = useState<string>("spend");
	const [sortDir, setSortDir] = useState<SortDir>("desc");
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
		</div>
	);
}

