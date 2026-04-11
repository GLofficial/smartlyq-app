import { useState } from "react";
import { Link } from "react-router-dom";
import {
	Sparkles, PlayCircle, User, Puzzle, Home, HelpCircle, LogOut,
	ChevronRight, ExternalLink, ArrowRightLeft, Monitor,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkspacePath } from "@/hooks/use-workspace-path";

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
	const [creditsDialogOpen, setCreditsDialogOpen] = useState(false);
	const wp = useWorkspacePath();

	return (
		<>
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
						to={wp("account")}
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
							to={wp("billing")}
							className="rounded-md bg-[var(--foreground)] px-3 py-1 text-xs font-medium text-[var(--background)] hover:opacity-90 transition-opacity"
						>
							Upgrade
						</Link>
					</div>
					<div className="flex items-center justify-between px-4 py-2.5 rounded-b-lg">
						<div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
							<Sparkles size={15} className="text-amber-500" />
							Credits
							<button
								type="button"
								onClick={() => setCreditsDialogOpen(true)}
								className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
								aria-label="About credits"
							>
								<HelpCircle size={14} />
							</button>
						</div>
						<Link to={wp("history")} className="flex items-center gap-1 text-sm font-medium text-[var(--foreground)] hover:text-[var(--sq-primary)] transition-colors">
							{credits !== undefined ? Math.round(credits).toLocaleString() : "—"}
							<ChevronRight size={14} className="text-[var(--muted-foreground)]" />
						</Link>
					</div>
				</div>

				{/* Menu items */}
				<div className="border-t border-[var(--border)] py-1">
					<MenuItem icon={User} label="Account" to={wp("settings?tab=account")} />
					<MenuItem icon={Puzzle} label="Integrations" to={wp("integrations")} />
				</div>

				{/* External links */}
				<div className="border-t border-[var(--border)] py-1">
					<ExternalMenuItem icon={PlayCircle} label="Tutorials" href="https://www.youtube.com/@SmartlyQ" />
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

		{/* Credits explainer dialog */}
		<Dialog open={creditsDialogOpen} onOpenChange={setCreditsDialogOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>About credits</DialogTitle>
					<DialogDescription asChild>
						<ul className="mt-3 space-y-2 text-sm text-[var(--foreground)] list-disc pl-4">
							<li><strong>One balance</strong>: SmartlyQ shows a single "Available credits" number everywhere.</li>
							<li><strong>How credits are used</strong>: Each AI action burns credits based on the feature/model usage. After completion, your balance updates.</li>
							<li><strong>Workspaces</strong>: Members spend from the workspace credits pool.</li>
							<li><strong>Whitelabel (agency)</strong>: If you're inside a whitelabel workspace, usage is paid from the agency credits pool.</li>
							<li><strong>No daily refresh / free buckets</strong>: SmartlyQ does not split credits into "free/daily/monthly" buckets.</li>
						</ul>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Link to={wp("billing")} onClick={() => setCreditsDialogOpen(false)}>
						<Button size="sm">View usage</Button>
					</Link>
					<Button variant="outline" size="sm" onClick={() => setCreditsDialogOpen(false)}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
		</>
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
