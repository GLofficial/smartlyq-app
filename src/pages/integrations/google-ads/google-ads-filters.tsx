import { useState, useRef, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GoogleAdsRow } from "./google-ads-types";

export interface GoogleAdsFilters {
	campaign: string;
	adgroup: string;
	device: string;
	country: string;
}

interface FiltersProps {
	filters: GoogleAdsFilters;
	onChange: (f: GoogleAdsFilters) => void;
	rows: GoogleAdsRow[];
}

export function GoogleAdsFiltersBar({ filters, onChange, rows }: FiltersProps) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const campaigns = [...new Set(rows.filter((r) => r.entity_level === "campaign").map((r) => r.entity_id!).filter(Boolean))];
	const adgroups = [...new Set(rows.filter((r) => r.entity_level === "adgroup").map((r) => r.entity_id!).filter(Boolean))];

	const activeCount = [filters.campaign, filters.adgroup, filters.device, filters.country].filter(Boolean).length;

	function clearAll() { onChange({ campaign: "", adgroup: "", device: "", country: "" }); }

	return (
		<div className="flex items-center gap-2 flex-wrap">
			<div className="relative" ref={ref}>
				<Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-1.5 text-xs">
					<Filter size={14} />
					Add Filter
					{activeCount > 0 && <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--sq-primary)] text-[9px] text-white">{activeCount}</span>}
				</Button>
				{open && (
					<div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg space-y-3">
						<FilterSelect label="Campaign (ID)" value={filters.campaign} options={campaigns}
							onChange={(v) => onChange({ ...filters, campaign: v })} freeText placeholder="Campaign ID…" />
						<FilterSelect label="Ad Group (ID)" value={filters.adgroup} options={adgroups}
							onChange={(v) => onChange({ ...filters, adgroup: v })} freeText placeholder="Ad group ID…" />
						<FilterSelect label="Device" value={filters.device}
							options={["MOBILE", "DESKTOP", "TABLET", "CONNECTED_TV"]}
							onChange={(v) => onChange({ ...filters, device: v })} />
						<FilterSelect label="Country (code)" value={filters.country} options={[]}
							onChange={(v) => onChange({ ...filters, country: v })} placeholder="e.g. US, GR, DE" freeText />
						{activeCount > 0 && (
							<Button variant="ghost" size="sm" onClick={clearAll} className="w-full text-xs text-red-500">Clear All Filters</Button>
						)}
					</div>
				)}
			</div>

			{filters.campaign && <FilterPill label="Campaign" value={filters.campaign} onRemove={() => onChange({ ...filters, campaign: "" })} />}
			{filters.adgroup && <FilterPill label="Ad Group" value={filters.adgroup} onRemove={() => onChange({ ...filters, adgroup: "" })} />}
			{filters.device && <FilterPill label="Device" value={filters.device} onRemove={() => onChange({ ...filters, device: "" })} />}
			{filters.country && <FilterPill label="Country" value={filters.country} onRemove={() => onChange({ ...filters, country: "" })} />}
		</div>
	);
}

function FilterSelect({ label, value, options, onChange, placeholder, freeText }: {
	label: string; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string; freeText?: boolean;
}) {
	return (
		<div>
			<p className="text-[10px] font-medium text-[var(--muted-foreground)] mb-1">{label}</p>
			{freeText ? (
				<input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "Filter..."}
					className="w-full rounded border border-[var(--border)] bg-transparent px-2 py-1 text-xs" />
			) : (
				<select value={value} onChange={(e) => onChange(e.target.value)}
					className="w-full rounded border border-[var(--border)] bg-transparent px-2 py-1 text-xs">
					<option value="">All</option>
					{options.map((o) => <option key={o} value={o}>{o}</option>)}
				</select>
			)}
		</div>
	);
}

function FilterPill({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-[var(--sq-primary)]/10 border border-[var(--sq-primary)]/20 px-2.5 py-0.5 text-[11px] text-[var(--sq-primary)]">
			{label}: {value.length > 20 ? value.slice(0, 20) + "..." : value}
			<button onClick={onRemove} className="hover:text-red-500"><X size={10} /></button>
		</span>
	);
}
