import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Link2, Check } from "lucide-react";
import { useAdSettings } from "@/api/ad-manager/settings";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { useAdContext } from "./ad-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DATE_RANGES = [
	{ label: "Last 7 Days", days: 7 },
	{ label: "Last 14 Days", days: 14 },
	{ label: "Last 30 Days", days: 30 },
	{ label: "Last 90 Days", days: 90 },
	{ label: "Custom Range", days: 0 },
] as const;

export function AdToolbar() {
	const { data } = useAdSettings();
	const accounts = data?.accounts ?? [];
	const connected = accounts.filter((a) => a.status === "connected").length;

	const ctx = useAdContext();
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [showAccounts, setShowAccounts] = useState(false);
	const [showDates, setShowDates] = useState(false);
	const [customFrom, setCustomFrom] = useState("");
	const [customTo, setCustomTo] = useState("");
	const accRef = useRef<HTMLDivElement>(null);
	const dateRef = useRef<HTMLDivElement>(null);

	// Initialize: all accounts selected
	useEffect(() => {
		if (accounts.length > 0 && selectedIds.size === 0) {
			setSelectedIds(new Set(accounts.map((a) => `${a.platform}:${a.id}`)));
		}
	}, [accounts.length]);

	// Sync selected accounts to context
	useEffect(() => {
		const allSelected = selectedIds.size === accounts.length || selectedIds.size === 0;
		ctx.setAccounts(allSelected ? "" : Array.from(selectedIds).join(","));
	}, [selectedIds]);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (accRef.current && !accRef.current.contains(e.target as Node)) setShowAccounts(false);
			if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDates(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const toggleAccount = (key: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	};

	const toggleAll = () => {
		if (selectedIds.size === accounts.length) setSelectedIds(new Set());
		else setSelectedIds(new Set(accounts.map((a) => `${a.platform}:${a.id}`)));
	};

	const selectDateRange = (days: number, label: string) => {
		const to = new Date().toISOString().slice(0, 10);
		const from = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
		ctx.setDateRange(from, to, label);
		setShowDates(false);
	};

	const accountLabel = selectedIds.size === accounts.length || selectedIds.size === 0 ? "All Accounts" : `${selectedIds.size} Account${selectedIds.size > 1 ? "s" : ""}`;

	return (
		<div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-6">
			<div className="flex items-center gap-3">
				{/* Account Picker */}
				<div ref={accRef} className="relative">
					<button onClick={() => setShowAccounts(!showAccounts)}
						className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
						<Calendar size={14} className="text-[var(--muted-foreground)]" />
						{accountLabel}
						<ChevronDown size={14} className="text-[var(--muted-foreground)]" />
					</button>
					{showAccounts && (
						<div className="absolute left-0 top-full mt-1 z-50 w-80 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg py-1">
							<button onClick={toggleAll} className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[var(--muted)] text-left">
								<div className={`h-4 w-4 rounded border flex items-center justify-center ${selectedIds.size === accounts.length ? "bg-[var(--sq-primary)] border-[var(--sq-primary)]" : "border-[var(--border)]"}`}>
									{selectedIds.size === accounts.length && <Check size={10} className="text-white" />}
								</div>
								<span className="text-sm font-medium">All Accounts</span>
							</button>
							{accounts.map((a) => {
								const key = `${a.platform}:${a.id}`;
								const checked = selectedIds.has(key);
								return (
									<button key={key} onClick={() => toggleAccount(key)} className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[var(--muted)] text-left">
										<div className={`h-4 w-4 rounded border flex items-center justify-center ${checked ? "bg-[var(--sq-primary)] border-[var(--sq-primary)]" : "border-[var(--border)]"}`}>
											{checked && <Check size={10} className="text-white" />}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-[var(--foreground)]">{a.account_name || a.account_id}</p>
											<p className="text-[11px] text-[var(--muted-foreground)]">{a.account_id}</p>
										</div>
										<PlatformIcon platform={platformMap(a.platform)} size={16} />
									</button>
								);
							})}
						</div>
					)}
				</div>

				{/* Date Range Picker */}
				<div ref={dateRef} className="relative">
					<button onClick={() => setShowDates(!showDates)}
						className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
						<Calendar size={14} className="text-[var(--muted-foreground)]" />
						{ctx.dateLabel}
						<ChevronDown size={14} className="text-[var(--muted-foreground)]" />
					</button>
					{showDates && (
						<div className="absolute left-0 top-full mt-1 z-50 w-64 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg py-1">
							{DATE_RANGES.map((r) => (
								<button key={r.label} onClick={() => { if (r.days > 0) selectDateRange(r.days, r.label); }}
									className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--muted)] transition-colors ${
										ctx.dateLabel === r.label ? "font-semibold text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
									}`}>{r.label}</button>
							))}
							<div className="border-t border-[var(--border)] px-4 py-3 space-y-2">
								<div className="flex items-center gap-2">
									<Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-8 text-xs" />
									<span className="text-xs text-[var(--muted-foreground)]">to</span>
									<Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-8 text-xs" />
								</div>
								<Button size="sm" className="w-full h-7 text-xs" disabled={!customFrom || !customTo}
									onClick={() => { ctx.setDateRange(customFrom, customTo, `${customFrom} — ${customTo}`); setShowDates(false); }}>
									Apply
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>

			{connected > 0 && (
				<div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted-foreground)]">
					<Link2 size={12} />
					All Accounts ({connected} connected)
				</div>
			)}
		</div>
	);
}

function platformMap(p: string): string {
	return ({ meta: "facebook", google: "google", tiktok: "tiktok", linkedin: "linkedin" } as Record<string, string>)[p] ?? p;
}
