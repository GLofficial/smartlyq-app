import { Link } from "react-router-dom";
import {
	Sparkles, PlayCircle, User, Puzzle, Home, HelpCircle, LogOut,
	ChevronRight, ExternalLink, ArrowRightLeft, Monitor,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ROUTES } from "@/lib/constants";

interface UserProfilePopoverProps {
	children: React.ReactNode;
	userName?: string;
	userEmail?: string;
	planName?: string;
	credits?: number;
	avatarUrl?: string | null;
	onLogout: () => void;
}

export function UserProfilePopover({
	children, userName, userEmail, planName, credits, avatarUrl, onLogout,
}: UserProfilePopoverProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent className="w-72 p-0" align="end" sideOffset={8}>
				{/* User info */}
				<div className="flex items-center gap-3 px-4 py-4">
					<div className="h-11 w-11 shrink-0 rounded-full bg-[color-mix(in_srgb,var(--sq-primary)_15%,transparent)] ring-2 ring-[color-mix(in_srgb,var(--sq-primary)_25%,transparent)] flex items-center justify-center overflow-hidden">
						{avatarUrl ? (
							<img src={avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
						) : (
							<span className="text-sm font-semibold text-[var(--sq-primary)]">
								{userName?.charAt(0).toUpperCase() ?? "U"}
							</span>
						)}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-semibold text-[var(--foreground)] truncate">{userName || "User"}</p>
						<p className="text-xs text-[var(--muted-foreground)] truncate">{userEmail || ""}</p>
					</div>
					<Link
						to={ROUTES.ACCOUNT}
						className="shrink-0 h-8 w-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
						title="Switch account"
					>
						<ArrowRightLeft size={14} />
					</Link>
				</div>

				{/* Plan + Credits card */}
				<div className="mx-4 mb-3 rounded-lg border border-[var(--border)]">
					<div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
						<span className="text-sm font-medium text-[var(--foreground)]">{planName || "Free"}</span>
						<Link
							to={ROUTES.BILLING}
							className="rounded-md bg-[var(--foreground)] px-3 py-1 text-xs font-medium text-[var(--background)] hover:opacity-90 transition-opacity"
						>
							Upgrade
						</Link>
					</div>
					<Link
						to={ROUTES.HISTORY}
						className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--muted)] transition-colors rounded-b-lg"
					>
						<div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
							<Sparkles size={15} className="text-amber-500" />
							Credits
							<span className="text-xs text-[var(--muted-foreground)] cursor-help" title="SmartlyQ Credits (SQC)">&#9432;</span>
						</div>
						<div className="flex items-center gap-1 text-sm font-medium text-[var(--foreground)]">
							{credits !== undefined ? Math.round(credits).toLocaleString() : "—"}
							<ChevronRight size={14} className="text-[var(--muted-foreground)]" />
						</div>
					</Link>
				</div>

				{/* Menu items */}
				<div className="border-t border-[var(--border)] py-1">
					<MenuItem icon={PlayCircle} label="Tutorials" to="/my/tutorials" />
					<MenuItem icon={User} label="Account" to={ROUTES.ACCOUNT} />
					<MenuItem icon={Puzzle} label="Integrations" to={ROUTES.INTEGRATIONS} />
				</div>

				{/* External links */}
				<div className="border-t border-[var(--border)] py-1">
					<ExternalMenuItem icon={Home} label="Homepage" href="https://smartlyq.com" />
					<ExternalMenuItem icon={Monitor} label="Usage" href="https://app.smartlyq.com/my/history" />
					<ExternalMenuItem icon={HelpCircle} label="Get help" href="https://docs.smartlyq.com/" />
				</div>

				{/* Log Out */}
				<div className="px-4 py-3 border-t border-[var(--border)]">
					<button
						onClick={onLogout}
						className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
					>
						<LogOut size={16} />
						Log Out
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function MenuItem({ icon: Icon, label, to }: { icon: React.ElementType; label: string; to: string }) {
	return (
		<Link
			to={to}
			className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
		>
			<Icon size={16} className="text-[var(--muted-foreground)]" />
			{label}
		</Link>
	);
}

function ExternalMenuItem({ icon: Icon, label, href }: { icon: React.ElementType; label: string; href: string }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
		>
			<div className="flex items-center gap-3">
				<Icon size={16} className="text-[var(--muted-foreground)]" />
				{label}
			</div>
			<ExternalLink size={12} className="text-[var(--muted-foreground)]" />
		</a>
	);
}
