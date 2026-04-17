import { useState } from "react";
import { RefreshCw, AlertTriangle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { PlatformIcon } from "./platform-icon";
import { PlatformBadge } from "./PlatformIcons";

export interface FilterSidebarAccount {
	id: number;
	platform: string;
	account_name: string;
	account_username?: string;
	profile_picture?: string;
	needs_reconnect?: boolean;
}

const PLATFORMS = [
	{ id: "", label: "All platforms" },
	{ id: "facebook", label: "Facebook" },
	{ id: "instagram", label: "Instagram" },
	{ id: "twitter", label: "Twitter" },
	{ id: "linkedin", label: "LinkedIn" },
	{ id: "tiktok", label: "TikTok" },
	{ id: "youtube", label: "YouTube" },
	{ id: "threads", label: "Threads" },
	{ id: "bluesky", label: "Bluesky" },
	{ id: "pinterest", label: "Pinterest" },
	{ id: "tumblr", label: "Tumblr" },
] as const;

interface SocialFilterSidebarProps {
	title: string;
	icon?: React.ReactNode;
	platform: string;
	accountId: number | null;
	accounts: FilterSidebarAccount[];
	isLoading?: boolean;
	needsReconnectCount?: number;
	onPlatformChange: (platform: string) => void;
	onAccountChange: (accountId: number | null) => void;
	onRefresh?: () => void;
	isRefreshing?: boolean;
}

export function SocialFilterSidebar({
	title,
	icon,
	platform,
	accountId,
	accounts,
	isLoading,
	needsReconnectCount = 0,
	onPlatformChange,
	onAccountChange,
	onRefresh,
	isRefreshing,
}: SocialFilterSidebarProps) {
	const [showPlatforms, setShowPlatforms] = useState(false);
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const accountsPath = wsHash ? `/w/${wsHash}/social-media/accounts` : "/social-media/accounts";

	const filteredAccounts = accounts.filter((a) => !platform || a.platform === platform);
	const activePlatformLabel = platform
		? PLATFORMS.find((p) => p.id === platform)?.label ?? platform
		: "All platforms";

	return (
		<div className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden flex flex-col">
			<div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
				<h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
					{icon}
					<span>{title}</span>
				</h3>
				{onRefresh && (
					<Button variant="ghost" size="sm" onClick={onRefresh} className="h-7 w-7 p-0" title="Refresh">
						<RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
					</Button>
				)}
			</div>

			<div className="px-4 py-3 border-b border-[var(--border)]">
				<div className="relative">
					<button
						onClick={() => setShowPlatforms((v) => !v)}
						className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm hover:bg-[var(--muted)]/30 transition-colors"
					>
						<span className="flex items-center gap-2">
							{platform ? <PlatformIcon platform={platform} size={14} /> : null}
							{activePlatformLabel}
						</span>
						<ChevronDown size={14} className={`text-[var(--muted-foreground)] transition-transform ${showPlatforms ? "rotate-180" : ""}`} />
					</button>
					{showPlatforms && (
						<div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg p-3">
							<p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Platform</p>
							<div className="grid grid-cols-2 gap-1">
								{PLATFORMS.map((p) => {
									const isActive = platform === p.id;
									return (
										<button
											key={p.id}
											onClick={() => { onPlatformChange(p.id); setShowPlatforms(false); }}
											className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
												isActive ? "bg-[var(--sq-primary)] text-white" : "text-[var(--foreground)] hover:bg-[var(--muted)]"
											}`}
										>
											{p.id ? <PlatformIcon platform={p.id} size={14} /> : <span className="text-sm">▦</span>}
											{p.label}
										</button>
									);
								})}
							</div>
						</div>
					)}
				</div>
			</div>

			{needsReconnectCount > 0 && (
				<Link
					to={accountsPath}
					className="mx-4 my-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-gradient-to-r from-amber-400 to-orange-400 p-3 hover:from-amber-500 hover:to-orange-500 transition-colors"
				>
					<AlertTriangle size={14} className="text-white mt-0.5 shrink-0" />
					<div>
						<p className="text-xs font-semibold text-white">
							{needsReconnectCount} account{needsReconnectCount > 1 ? "s" : ""} need reconnecting.
						</p>
						<p className="text-[10px] text-white/90">Token expired or revoked. <span className="underline font-medium">Reconnect now</span></p>
					</div>
				</Link>
			)}

			<div className="px-2 py-2 overflow-y-auto flex-1">
				<p className="px-2 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Accounts</p>
				{isLoading ? (
					<div className="flex h-20 items-center justify-center">
						<div className="h-5 w-5 animate-spin rounded-full border-3 border-[var(--sq-primary)] border-t-transparent" />
					</div>
				) : filteredAccounts.length === 0 ? (
					<p className="px-2 text-xs text-[var(--muted-foreground)]">No accounts found</p>
				) : (
					<div className="space-y-0.5">
						{filteredAccounts.map((a) => (
							<button
								key={a.id}
								onClick={() => onAccountChange(accountId === a.id ? null : a.id)}
								className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${
									accountId === a.id ? "bg-[var(--sq-primary)]/10" : "hover:bg-[var(--muted)]"
								}`}
							>
								{/* Avatar with platform badge overlay (same pattern as create-post account picker). */}
								<div className="relative shrink-0">
									{a.profile_picture ? (
										<img src={a.profile_picture} alt="" className="h-7 w-7 rounded-full object-cover" />
									) : (
										<div className="h-7 w-7 rounded-full bg-[var(--muted)] flex items-center justify-center">
											<PlatformIcon platform={a.platform} size={14} />
										</div>
									)}
									<div className="absolute -bottom-0.5 -right-0.5">
										<PlatformBadge platformId={a.platform} size={12} />
									</div>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs font-medium text-[var(--foreground)] truncate">{a.account_name || a.account_username}</p>
								</div>
								{a.needs_reconnect ? (
									<Link to={accountsPath} onClick={(e) => e.stopPropagation()} className="text-[10px] text-red-500 font-medium hover:underline shrink-0">
										Reconnect
									</Link>
								) : (
									<span className="text-[10px] text-[var(--muted-foreground)] capitalize shrink-0">{a.platform}</span>
								)}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
