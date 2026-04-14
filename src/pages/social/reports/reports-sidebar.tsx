import { useState } from "react";
import { Input } from "@/components/ui/input";
import { RefreshCw, AlertTriangle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocialAccounts, type ReportFilters } from "@/api/social-reports";
import { PlatformIcon } from "@/pages/social/platform-icon";

const PLATFORMS = [
	{ id: "", label: "All platforms" },
	{ id: "facebook", label: "Facebook" },
	{ id: "twitter", label: "Twitter" },
	{ id: "linkedin", label: "Linkedin" },
	{ id: "tiktok", label: "Tiktok" },
	{ id: "youtube", label: "Youtube" },
	{ id: "instagram", label: "Instagram" },
	{ id: "bluesky", label: "Bluesky" },
	{ id: "threads", label: "Threads" },
	{ id: "pinterest", label: "Pinterest" },
	{ id: "tumblr", label: "Tumblr" },
] as const;

interface ReportsSidebarProps {
	filters: ReportFilters;
	onFiltersChange: (f: Partial<ReportFilters>) => void;
}

export function ReportsSidebar({ filters, onFiltersChange }: ReportsSidebarProps) {
	const { data, isLoading, refetch } = useSocialAccounts();
	const [showPlatforms, setShowPlatforms] = useState(false);
	const accounts = data?.accounts ?? [];
	const needsReconnect = data?.needs_reconnect_count ?? 0;

	const filteredAccounts = accounts.filter(
		(a) => !filters.platform || a.platform === filters.platform
	);

	return (
		<div className="w-72 shrink-0 rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
				<h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
					<span>Analytics</span>
				</h3>
				<Button variant="ghost" size="sm" onClick={() => refetch()} className="h-7 w-7 p-0">
					<RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
				</Button>
			</div>

			{/* Platform Filter */}
			<div className="px-4 py-3 border-b border-[var(--border)]">
				<div className="relative">
					<button onClick={() => setShowPlatforms(!showPlatforms)}
						className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm">
						<span className="flex items-center gap-2">
							{filters.platform ? <PlatformIcon platform={filters.platform} size={14} /> : null}
							{filters.platform ? PLATFORMS.find((p) => p.id === filters.platform)?.label : "All platforms"}
						</span>
						<ChevronDown size={14} className="text-[var(--muted-foreground)]" />
					</button>
					{showPlatforms && (
						<div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg py-1">
							{PLATFORMS.map((p) => (
								<button key={p.id} onClick={() => { onFiltersChange({ platform: p.id }); setShowPlatforms(false); }}
									className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--muted)] ${
										filters.platform === p.id ? "font-semibold text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
									}`}>
									{p.id && <PlatformIcon platform={p.id} size={14} />}
									{p.label}
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Date Range */}
			<div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
				<Input type="date" value={filters.dateFrom} onChange={(e) => onFiltersChange({ dateFrom: e.target.value })} className="h-8 text-xs" />
				<span className="text-xs text-[var(--muted-foreground)]">→</span>
				<Input type="date" value={filters.dateTo} onChange={(e) => onFiltersChange({ dateTo: e.target.value })} className="h-8 text-xs" />
			</div>

			{/* Reconnection Warning */}
			{needsReconnect > 0 && (
				<div className="mx-4 my-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
					<AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
					<div>
						<p className="text-xs font-semibold text-amber-800">{needsReconnect} account{needsReconnect > 1 ? "s" : ""} needs reconnecting.</p>
						<p className="text-[10px] text-amber-700">Token expired or revoked.</p>
						<a href="/my/social-media/accounts" className="text-[10px] font-medium text-amber-700 underline">Reconnect now</a>
					</div>
				</div>
			)}

			{/* Account List */}
			<div className="px-2 py-2 overflow-y-auto max-h-[calc(100vh-24rem)]">
				<p className="px-2 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
					Platform Breakdown
				</p>
				{isLoading ? (
					<div className="flex h-20 items-center justify-center"><div className="h-5 w-5 animate-spin rounded-full border-3 border-[var(--sq-primary)] border-t-transparent" /></div>
				) : filteredAccounts.length === 0 ? (
					<p className="px-2 text-xs text-[var(--muted-foreground)]">No accounts found</p>
				) : (
					<div className="space-y-1">
						{filteredAccounts.map((a) => (
							<button key={a.id} onClick={() => onFiltersChange({ accountId: filters.accountId === a.id ? null : a.id })}
								className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${
									filters.accountId === a.id ? "bg-[var(--sq-primary)]/10" : "hover:bg-[var(--muted)]"
								}`}>
								{a.profile_picture ? (
									<img src={a.profile_picture} alt="" className="h-8 w-8 rounded-full object-cover" />
								) : (
									<div className="h-8 w-8 rounded-full bg-[var(--muted)] flex items-center justify-center">
										<PlatformIcon platform={a.platform} size={14} />
									</div>
								)}
								<div className="flex-1 min-w-0">
									<p className="text-xs font-medium text-[var(--foreground)] truncate">{a.account_name}</p>
									<div className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]">
										<span>{a.followers_count.toLocaleString()} followers</span>
									</div>
								</div>
								{a.needs_reconnect && (
									<span className="h-2 w-2 rounded-full bg-red-500 shrink-0" title="Needs reconnection" />
								)}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
