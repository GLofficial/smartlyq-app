import { Link, useLocation } from "react-router-dom";
import {
	LayoutDashboard,
	Share2,
	MessageSquare,
	Plug,
	Megaphone,
	CreditCard,
	Settings,
	Building2,
	Image,
	Video,
	Presentation,
	FileText,
	History,
	PanelLeftClose,
	PanelLeft,
	Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/ui-store";
import { useTenantStore } from "@/stores/tenant-store";
import { ROUTES } from "@/lib/constants";

const NAV_ITEMS = [
	{ label: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard },
	{ label: "AI Captain", path: ROUTES.CAPTAIN, icon: Sparkles },
	{ label: "Social Media", path: ROUTES.SOCIAL, icon: Share2 },
	{ label: "Chatbot", path: ROUTES.CHATBOT, icon: MessageSquare },
	{ label: "Ad Manager", path: ROUTES.AD_MANAGER, icon: Megaphone },
	{ label: "Templates", path: ROUTES.TEMPLATES, icon: FileText },
	{ label: "Media Library", path: ROUTES.MEDIA, icon: Image },
	{ label: "Video Editor", path: ROUTES.VIDEO_EDITOR, icon: Video },
	{ label: "Presentations", path: ROUTES.PRESENTATIONS, icon: Presentation },
	{ label: "Integrations", path: ROUTES.INTEGRATIONS, icon: Plug },
	{ label: "History", path: ROUTES.HISTORY, icon: History },
	{ label: "Billing", path: ROUTES.BILLING, icon: CreditCard },
	{ label: "Workspace", path: ROUTES.WORKSPACE, icon: Building2 },
	{ label: "Account", path: ROUTES.ACCOUNT, icon: Settings },
];

export function Sidebar() {
	const location = useLocation();
	const collapsed = useUiStore((s) => s.sidebarCollapsed);
	const toggleSidebar = useUiStore((s) => s.toggleSidebar);
	const branding = useTenantStore((s) => s.branding);

	return (
		<aside
			className={cn(
				"flex h-screen flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-background)] transition-all duration-200",
				collapsed ? "w-16" : "w-64",
			)}
		>
			{/* Logo */}
			<div className="flex h-16 items-center justify-between px-4 border-b border-[var(--sidebar-border)]">
				{!collapsed && (
					<span className="text-lg font-bold text-[var(--sidebar-foreground)] truncate">
						{branding.site_name}
					</span>
				)}
				<button
					type="button"
					onClick={toggleSidebar}
					className="p-1.5 rounded-md hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)]"
				>
					{collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
				</button>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto p-2 space-y-1">
				{NAV_ITEMS.map((item) => {
					const isActive =
						location.pathname === item.path ||
						(item.path !== ROUTES.DASHBOARD && location.pathname.startsWith(item.path));
					const Icon = item.icon;

					return (
						<Link
							key={item.path}
							to={item.path}
							className={cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
								isActive
									? "bg-[color-mix(in_srgb,var(--sidebar-primary)_10%,transparent)] text-[var(--sidebar-primary)]"
									: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
								collapsed && "justify-center px-2",
							)}
							title={collapsed ? item.label : undefined}
						>
							<Icon size={20} />
							{!collapsed && <span>{item.label}</span>}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
