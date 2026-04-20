import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ChevronDown, Download, Settings, Calendar, ArrowLeftRight, ShoppingCart, Users } from "lucide-react";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { GOOGLE_ADS_TABS } from "./google-ads-types";
import type { GoogleAdsTab } from "./google-ads-types";

interface DateRange { start: string; end: string; label: string }

interface GoogleAdsHeaderProps {
	tab: GoogleAdsTab;
	onTabChange: (t: GoogleAdsTab) => void;
	dateRange: DateRange;
	onDateRangeChange: (r: DateRange) => void;
	customers: string[];
	selectedCustomerId: string;
	onCustomerChange: (id: string) => void;
	accountName?: string;
	onRefresh: () => void;
	onExport: (fmt: string) => void;
	isLoading: boolean;
	currency: string;
	conversionType: string;
	onConversionTypeChange: (t: string) => void;
	compare: boolean;
	onCompareChange: (c: boolean) => void;
}

const PRESETS: { label: string; days: number }[] = [
	{ label: "Last 7 Days", days: 7 },
	{ label: "Last 14 Days", days: 14 },
	{ label: "Last 28 Days", days: 28 },
	{ label: "Last 90 Days", days: 90 },
];

function daysAgo(n: number): DateRange {
	const end = new Date();
	const start = new Date();
	start.setDate(end.getDate() - (n - 1));
	return { start: fmt(start), end: fmt(end), label: PRESETS.find((p) => p.days === n)?.label ?? `Last ${n} Days` };
}
function fmt(d: Date): string { return d.toISOString().slice(0, 10); }

function fmtCustomerId(id: string): string {
	if (id.length === 10 && /^\d+$/.test(id)) return `${id.slice(0,3)}-${id.slice(3,6)}-${id.slice(6)}`;
	return id;
}

export function GoogleAdsHeader(props: GoogleAdsHeaderProps) {
	const { tab, onTabChange, dateRange, onDateRangeChange, customers, selectedCustomerId, onCustomerChange, accountName, onRefresh, onExport, isLoading, currency, conversionType, onConversionTypeChange, compare, onCompareChange } = props;

	return (
		<div className="space-y-4">
			{/* Top bar */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4285F4]/10">
						<PlatformIcon platform="google" size={22} />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h1 className="text-xl font-bold text-[var(--foreground)]">Google Ads Insights</h1>
							<span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> LIVE
							</span>
						</div>
						{selectedCustomerId && (
							<p className="text-xs text-[var(--muted-foreground)]">
								{accountName ? `${accountName} · ` : ""}{fmtCustomerId(selectedCustomerId)}
								{currency ? ` · ${currency}` : ""}
							</p>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2">
					{/* Conversion type toggle */}
					<div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
						<button onClick={() => onConversionTypeChange("purchases")}
							className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${conversionType === "purchases" ? "bg-[var(--sq-primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>
							<ShoppingCart size={12} /> Purchases
						</button>
						<button onClick={() => onConversionTypeChange("leads")}
							className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${conversionType === "leads" ? "bg-[var(--sq-primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>
							<Users size={12} /> Leads
						</button>
					</div>

					<Button variant={compare ? "default" : "outline"} size="sm" onClick={() => onCompareChange(!compare)} className="gap-1 text-xs">
						<ArrowLeftRight size={12} /> vs
					</Button>

					<DateRangePicker value={dateRange} onChange={onDateRangeChange} />
					<Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading} className="gap-1.5">
						<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
					</Button>
					<CustomerPicker customers={customers} selectedId={selectedCustomerId} onChange={onCustomerChange} />
					<ExportMenu onExport={onExport} />
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-0.5 overflow-x-auto border-b border-[var(--border)] pb-px">
				{GOOGLE_ADS_TABS.map((t) => (
					<button key={t.key} onClick={() => onTabChange(t.key)}
						className={`whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
							tab === t.key
								? "border-[var(--sq-primary)] text-[var(--foreground)]"
								: "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
						}`}>{t.label}</button>
				))}
			</div>
		</div>
	);
}

/* ── Date Range Picker ─────────────────────────────────────────────── */

function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
	const [open, setOpen] = useState(false);
	const [custom, setCustom] = useState({ start: value.start, end: value.end });
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div className="relative" ref={ref}>
			<Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-1.5 text-xs">
				<Calendar size={14} />
				<span>{value.label || `${value.start} – ${value.end}`}</span>
				<ChevronDown size={12} />
			</Button>
			{open && (
				<div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg">
					<div className="space-y-1 mb-3">
						{PRESETS.map((p) => (
							<button key={p.days} onClick={() => { onChange(daysAgo(p.days)); setOpen(false); }}
								className="w-full rounded px-3 py-1.5 text-left text-sm hover:bg-[var(--muted)] transition-colors">
								{p.label}
							</button>
						))}
					</div>
					<div className="border-t border-[var(--border)] pt-3 space-y-2">
						<p className="text-xs font-medium text-[var(--muted-foreground)]">Custom Range</p>
						<div className="flex gap-2">
							<input type="date" value={custom.start} onChange={(e) => setCustom({ ...custom, start: e.target.value })}
								className="flex-1 rounded border border-[var(--border)] bg-transparent px-2 py-1 text-xs" />
							<input type="date" value={custom.end} onChange={(e) => setCustom({ ...custom, end: e.target.value })}
								className="flex-1 rounded border border-[var(--border)] bg-transparent px-2 py-1 text-xs" />
						</div>
						<Button size="sm" className="w-full text-xs" onClick={() => {
							if (custom.start && custom.end && custom.start <= custom.end) {
								onChange({ start: custom.start, end: custom.end, label: `${custom.start} – ${custom.end}` });
								setOpen(false);
							}
						}}>Apply</Button>
					</div>
				</div>
			)}
		</div>
	);
}

/* ── Customer Picker ───────────────────────────────────────────────── */

function CustomerPicker({ customers, selectedId, onChange }: { customers: string[]; selectedId: string; onChange: (id: string) => void }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div className="relative" ref={ref}>
			<Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-1.5 text-xs max-w-[220px]">
				<Settings size={14} />
				<span className="truncate">{selectedId ? fmtCustomerId(selectedId) : "Select account"}</span>
				<ChevronDown size={12} />
			</Button>
			{open && (
				<div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg">
					<p className="px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] border-b border-[var(--border)]">Google Ads Accounts ({customers.length})</p>
					<div className="max-h-[280px] overflow-y-auto p-1.5">
						{customers.length === 0 && (
							<p className="px-3 py-4 text-xs text-[var(--muted-foreground)] text-center">No accounts available</p>
						)}
						{customers.map((c) => (
							<button key={c} onClick={() => { onChange(c); setOpen(false); }}
								className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors ${
									c === selectedId
										? "bg-[var(--sq-primary)]/10 text-[var(--sq-primary)]"
										: "hover:bg-[var(--muted)]"
								}`}>
								<p className="font-medium text-xs truncate">{fmtCustomerId(c)}</p>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

/* ── Export Menu ────────────────────────────────────────────────────── */

function ExportMenu({ onExport }: { onExport: (fmt: string) => void }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div className="relative" ref={ref}>
			<Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-1.5 text-xs">
				<Download size={14} /> Export <ChevronDown size={12} />
			</Button>
			{open && (
				<div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg">
					{[{ key: "csv", label: "CSV" }, { key: "xls", label: "Excel (XLS)" }, { key: "ai", label: "AI Report" }].map((i) => (
						<button key={i.key} onClick={() => { onExport(i.key); setOpen(false); }}
							className="w-full rounded px-3 py-2 text-left text-sm hover:bg-[var(--muted)] transition-colors">
							{i.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
