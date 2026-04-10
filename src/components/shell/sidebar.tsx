import { Link } from "react-router-dom";
import { PanelLeftClose, PanelLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/ui-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { NAV_GROUPS, ADMIN_GROUP } from "./sidebar-nav-config";
import { SidebarSection } from "./sidebar-section";
import { apiClient } from "@/lib/api-client";
import { STORAGE_KEYS } from "@/lib/constants";
import { toast } from "sonner";

export function Sidebar() {
	const collapsed = useUiStore((s) => s.sidebarCollapsed);
	const toggleSidebar = useUiStore((s) => s.toggleSidebar);
	const branding = useTenantStore((s) => s.branding);
	const user = useAuthStore((s) => s.user);
	const plan = useAuthStore((s) => s.plan);
	const isAdmin = user?.role === 1;
	const workspaces = useWorkspaceStore((s) => s.workspaces);
	const activeWsId = useWorkspaceStore((s) => s.activeWorkspaceId);

	return (
		<aside
			className={cn(
				"flex h-screen flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-background)] transition-all duration-200",
				collapsed ? "w-14" : "w-56",
			)}
		>
			{/* Logo + workspace */}
			<div className="flex items-center justify-between px-3 py-3 border-b border-[var(--sidebar-border)]">
				{!collapsed && (
					<WorkspaceDropdown
						workspaces={workspaces}
						activeId={activeWsId}
						branding={branding}
					/>
				)}
				<button
					type="button"
					onClick={toggleSidebar}
					className="p-1 rounded-md hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)]"
				>
					{collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
				</button>
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

function WorkspaceDropdown({
	workspaces,
	activeId,
	branding,
}: {
	workspaces: { id: number; name: string }[];
	activeId: number | null;
	branding: { site_name: string; logo_url: string | null };
}) {
	const activeWs = workspaces.find((w) => w.id === activeId);
	const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);

	const handleSwitch = async (wsId: number) => {
		if (wsId === activeId) return;
		try {
			const res = await apiClient.post<{ access_token: string }>("/api/spa/workspace/switch", {
				workspace_id: wsId,
			});
			localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.access_token);
			setActiveWorkspace(wsId);
			window.location.reload();
		} catch {
			toast.error("Failed to switch workspace.");
		}
	};

	if (workspaces.length <= 1) {
		return (
			<Link to="/my" className="flex items-center gap-2 min-w-0">
				{branding.logo_url ? (
					<img src={branding.logo_url} alt="" className="h-6 w-auto" />
				) : (
					<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--sq-primary)] text-[11px] font-bold text-white">
						{(activeWs?.name ?? branding.site_name).charAt(0).toUpperCase()}
					</div>
				)}
				<span className="truncate text-sm font-semibold text-[var(--sidebar-foreground)]">
					{activeWs?.name ?? branding.site_name}
				</span>
			</Link>
		);
	}

	return (
		<details className="group min-w-0 flex-1">
			<summary className="flex cursor-pointer items-center gap-2 list-none rounded-md px-1 py-0.5 hover:bg-[var(--sidebar-accent)]">
				<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--sq-primary)] text-[11px] font-bold text-white">
					{(activeWs?.name ?? "W").charAt(0).toUpperCase()}
				</div>
				<span className="truncate text-sm font-semibold text-[var(--sidebar-foreground)]">
					{activeWs?.name ?? "Workspace"}
				</span>
				<ChevronDown size={14} className="shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-180" />
			</summary>
			<div className="mt-1 space-y-0.5 rounded-md border border-[var(--border)] bg-[var(--card)] p-1 shadow-md">
				{workspaces.map((ws) => (
					<button
						key={ws.id}
						type="button"
						onClick={() => handleSwitch(ws.id)}
						className={cn(
							"flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors",
							ws.id === activeId
								? "bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)] text-[var(--sq-primary)] font-medium"
								: "text-[var(--foreground)] hover:bg-[var(--accent)]",
						)}
					>
						<div className="flex h-5 w-5 items-center justify-center rounded bg-[var(--muted)] text-[9px] font-bold">
							{ws.name.charAt(0).toUpperCase()}
						</div>
						<span className="truncate">{ws.name}</span>
					</button>
				))}
			</div>
		</details>
	);
}
