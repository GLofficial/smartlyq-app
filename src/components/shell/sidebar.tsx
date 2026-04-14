import { Link } from "react-router-dom";
import { PanelLeftClose, PanelLeft, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/ui-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useAuthStore } from "@/stores/auth-store";
import { getNavGroups } from "./sidebar-nav-config";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { SidebarSection } from "./sidebar-section";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { SidebarSearch } from "./sidebar-search";

export function Sidebar() {
	const collapsed = useUiStore((s) => s.sidebarCollapsed);
	const toggleSidebar = useUiStore((s) => s.toggleSidebar);
	const branding = useTenantStore((s) => s.branding);
	const user = useAuthStore((s) => s.user);
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const isAdmin = user?.role === 1;
	const navGroups = getNavGroups(wsHash ?? "");

	return (
		<aside
			className={cn(
				"flex h-screen flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-background)] transition-all duration-200",
				collapsed ? "w-14" : "w-56",
			)}
		>
			{/* Logo */}
			<div className="flex items-center justify-between px-3 pt-3 pb-2">
				{!collapsed && (
					<Link to={wsHash ? `/w/${wsHash}/dashboard` : "/my"} className="flex items-center gap-2 min-w-0">
						{branding.logo_url ? (
							<img src={branding.logo_url} alt={branding.site_name} className="h-7 w-auto" />
						) : (
							<span className="text-lg font-bold text-[var(--sidebar-foreground)]">{branding.site_name}</span>
						)}
					</Link>
				)}
				<button
					type="button"
					onClick={toggleSidebar}
					className="p-1 rounded-md hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)]"
				>
					{collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
				</button>
			</div>

			{/* Workspace selector */}
			{!collapsed && (
				<div className="px-3 pb-2">
					<WorkspaceSwitcher />
				</div>
			)}

			{/* Search + Quick Actions */}
			<div className={cn("pb-2 border-b border-[var(--sidebar-border)]", collapsed ? "px-1.5" : "px-3")}>
				<SidebarSearch collapsed={collapsed} />
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto px-1.5 py-1">
				{navGroups.map((group) => (
					<SidebarSection key={group.label || "top"} group={group} collapsed={collapsed} />
				))}
			</nav>

			{/* Admin + Settings — bottom */}
			{!collapsed && (
				<div className="border-t border-[var(--sidebar-border)] px-3 py-2">
					{isAdmin && (
						<Link
							to="/admin"
							className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] transition-colors"
						>
							<Shield size={16} className="shrink-0 text-[var(--muted-foreground)]" />
							<span className="text-[14px] font-medium">Admin</span>
						</Link>
					)}
					<Link
						to={wsHash ? `/w/${wsHash}/settings` : "/my"}
						className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] transition-colors"
					>
						<Settings size={16} className="shrink-0 text-[var(--muted-foreground)]" />
						<span className="text-[14px] font-medium">Settings</span>
					</Link>
				</div>
			)}
		</aside>
	);
}
