import { Link } from "react-router-dom";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/ui-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useAuthStore } from "@/stores/auth-store";
import { NAV_GROUPS, ADMIN_GROUP } from "./sidebar-nav-config";
import { SidebarSection } from "./sidebar-section";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { SidebarSearch } from "./sidebar-search";

export function Sidebar() {
	const collapsed = useUiStore((s) => s.sidebarCollapsed);
	const toggleSidebar = useUiStore((s) => s.toggleSidebar);
	const branding = useTenantStore((s) => s.branding);
	const user = useAuthStore((s) => s.user);
	const plan = useAuthStore((s) => s.plan);
	const isAdmin = user?.role === 1;

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
					<Link to="/my" className="flex items-center gap-2 min-w-0">
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
				{NAV_GROUPS.map((group) => (
					<SidebarSection key={group.label || "top"} group={group} collapsed={collapsed} />
				))}
				{isAdmin && <SidebarSection group={ADMIN_GROUP} collapsed={collapsed} />}
			</nav>

			{/* User info — bottom */}
			{!collapsed && user && (
				<div className="border-t border-[var(--sidebar-border)] px-3 py-2.5">
					<div className="flex items-center gap-2.5">
						{user.avatar_url ? (
							<img src={user.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
						) : (
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sq-primary)] text-xs font-bold text-white">
								{user.name.charAt(0).toUpperCase()}
							</div>
						)}
						<div className="min-w-0 flex-1">
							<p className="truncate text-[13px] font-medium text-[var(--sidebar-foreground)]">
								{user.name}
							</p>
							<p className="truncate text-[11px] text-[var(--muted-foreground)]">
								{plan?.name ?? "Free"} Plan
							</p>
						</div>
						<div className="flex h-5 items-center rounded bg-[color-mix(in_srgb,var(--sq-primary)_12%,transparent)] px-1.5">
							<span className="text-[10px] font-semibold text-[var(--sq-primary)]">●</span>
						</div>
					</div>
				</div>
			)}
		</aside>
	);
}
