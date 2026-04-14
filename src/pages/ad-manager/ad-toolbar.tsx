import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Link2 } from "lucide-react";
import { useAdSettings } from "@/api/ad-manager/settings";
import { PlatformIcon } from "@/pages/social/platform-icon";

const DATE_RANGES = ["Last 7 Days", "Last 14 Days", "Last 30 Days", "Last 90 Days", "Custom Range"] as const;

/** Shared top toolbar for all Ad Manager pages — account picker + date range. */
export function AdToolbar() {
	const { data } = useAdSettings();
	const accounts = data?.accounts ?? [];
	const connected = accounts.filter((a) => a.status === "connected").length;

	const [dateRange, setDateRange] = useState("Last 30 Days");
	const [showAccounts, setShowAccounts] = useState(false);
	const [showDates, setShowDates] = useState(false);
	const accRef = useRef<HTMLDivElement>(null);
	const dateRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (accRef.current && !accRef.current.contains(e.target as Node)) setShowAccounts(false);
			if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDates(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-6">
			<div className="flex items-center gap-3">
				{/* Account Picker */}
				<div ref={accRef} className="relative">
					<button onClick={() => setShowAccounts(!showAccounts)}
						className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
						<Calendar size={14} className="text-[var(--muted-foreground)]" />
						All Accounts
						<ChevronDown size={14} className="text-[var(--muted-foreground)]" />
					</button>
					{showAccounts && (
						<div className="absolute left-0 top-full mt-1 z-50 w-80 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg py-1">
							<label className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)] cursor-pointer">
								<input type="checkbox" defaultChecked className="rounded border-[var(--border)]" />
								<span className="text-sm font-medium">All Accounts</span>
							</label>
							{accounts.map((a) => (
								<label key={`${a.platform}-${a.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)] cursor-pointer">
									<input type="checkbox" defaultChecked className="rounded border-[var(--border)]" />
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-[var(--foreground)]">{a.account_name || a.account_id}</p>
										<p className="text-[11px] text-[var(--muted-foreground)]">{a.account_id}</p>
									</div>
									<PlatformIcon platform={platformMap(a.platform)} size={16} />
								</label>
							))}
						</div>
					)}
				</div>

				{/* Date Range Picker */}
				<div ref={dateRef} className="relative">
					<button onClick={() => setShowDates(!showDates)}
						className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
						<Calendar size={14} className="text-[var(--muted-foreground)]" />
						{dateRange}
						<ChevronDown size={14} className="text-[var(--muted-foreground)]" />
					</button>
					{showDates && (
						<div className="absolute left-0 top-full mt-1 z-50 w-48 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg py-1">
							{DATE_RANGES.map((r) => (
								<button key={r} onClick={() => { setDateRange(r); setShowDates(false); }}
									className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--muted)] transition-colors ${
										dateRange === r ? "font-semibold text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
									}`}>{r}</button>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Connected Badge */}
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
	const map: Record<string, string> = { meta: "facebook", google: "google", tiktok: "tiktok", linkedin: "linkedin" };
	return map[p] ?? p;
}
