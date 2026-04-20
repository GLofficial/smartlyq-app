import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DashboardDateRange { start: string; end: string; label: string }

const PRESETS: { label: string; days: number }[] = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 14 Days", days: 14 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
];

export function daysAgoRange(n: number): DashboardDateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (n - 1));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end), label: PRESETS.find((p) => p.days === n)?.label ?? `Last ${n} Days` };
}

export function CrmDashboardDatePicker({ value, onChange }: { value: DashboardDateRange; onChange: (r: DashboardDateRange) => void }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState({ start: value.start, end: value.end });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)} className="gap-1.5 bg-[var(--card)] shadow-sm">
        <Calendar className="h-4 w-4" />
        <span>{value.label}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 shadow-lg">
          <div className="space-y-1 mb-3">
            {PRESETS.map((p) => (
              <button key={p.days} onClick={() => { onChange(daysAgoRange(p.days)); setOpen(false); }}
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
