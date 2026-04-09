import { useState } from "react";
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
	CalendarDays,
	PenSquare,
	ListTodo,
	MessagesSquare,
	Inbox,
	BarChart3,
	Users,
	Bot,
	Plus,
	BookOpen,
	Wand2,
	ImagePlus,
	VideoIcon,
	AudioLines,
	FileSearch,
	ChevronDown,
	ChevronRight,
	Folders,
	UserCog,
	Receipt,
	Wallet,
	ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useUiStore } from "@/stores/ui-store";
import { useTenantStore } from "@/stores/tenant-store";

interface NavChild {
	label: string;
	path: string;
	icon: React.ElementType;
}

interface NavSection {
	label: string;
	icon: React.ElementType;
	path?: string;
	children?: NavChild[];
}

const NAV_SECTIONS: NavSection[] = [
	{
		label: "Dashboard",
		icon: LayoutDashboard,
		path: "/my",
	},
	{
		label: "AI Captain",
		icon: Sparkles,
		path: "/my/captain",
	},
	{
		label: "Social Media",
		icon: Share2,
		children: [
			{ label: "Dashboard", path: "/my/social-media", icon: LayoutDashboard },
			{ label: "Create Post", path: "/my/social-media/create-post", icon: PenSquare },
			{ label: "Manage Posts", path: "/my/social-media/posts", icon: ListTodo },
			{ label: "Calendar", path: "/my/social-media/calendar", icon: CalendarDays },
			{ label: "Comments", path: "/my/social-media/comments", icon: MessagesSquare },
			{ label: "Inbox", path: "/my/social-media/inbox", icon: Inbox },
			{ label: "Analytics", path: "/my/social-media/analytics", icon: BarChart3 },
			{ label: "Accounts", path: "/my/social-media/accounts", icon: Users },
		],
	},
	{
		label: "Chatbot",
		icon: Bot,
		children: [
			{ label: "My Chatbots", path: "/my/chatbot", icon: Bot },
			{ label: "Create New", path: "/my/chatbot/create", icon: Plus },
			{ label: "Live Agent", path: "/my/chatbot/live-agent", icon: MessageSquare },
			{ label: "Templates", path: "/my/chatbot/templates", icon: BookOpen },
			{ label: "Analytics", path: "/my/chatbot/analytics", icon: BarChart3 },
			{ label: "Settings", path: "/my/chatbot/settings", icon: Settings },
		],
	},
	{
		label: "AI Tools",
		icon: Wand2,
		children: [
			{ label: "Templates", path: "/my/templates", icon: FileText },
			{ label: "Image Generator", path: "/my/image-generator", icon: ImagePlus },
			{ label: "Video Generator", path: "/my/text-to-video", icon: VideoIcon },
			{ label: "Text to Audio", path: "/my/text-to-audio", icon: AudioLines },
			{ label: "Article Generator", path: "/my/article-generator", icon: FileSearch },
		],
	},
	{
		label: "Ad Manager",
		icon: Megaphone,
		children: [
			{ label: "Dashboard", path: "/my/ad-manager", icon: LayoutDashboard },
			{ label: "Campaigns", path: "/my/ad-manager/campaigns", icon: Folders },
			{ label: "Creatives", path: "/my/ad-manager/creatives", icon: Image },
			{ label: "Audiences", path: "/my/ad-manager/audiences", icon: Users },
			{ label: "Analytics", path: "/my/ad-manager/analytics", icon: BarChart3 },
		],
	},
	{
		label: "Media Library",
		icon: Image,
		path: "/my/media",
	},
	{
		label: "Video Editor",
		icon: Video,
		path: "/my/video-editor",
	},
	{
		label: "Presentations",
		icon: Presentation,
		path: "/my/presentations",
	},
	{
		label: "Integrations",
		icon: Plug,
		path: "/my/integrations",
	},
	{
		label: "Billing",
		icon: CreditCard,
		children: [
			{ label: "Overview", path: "/my/billing", icon: Wallet },
			{ label: "Payments", path: "/my/billing/payments", icon: Receipt },
			{ label: "Subscriptions", path: "/my/billing/subscriptions", icon: ClipboardList },
		],
	},
	{
		label: "Workspace",
		icon: Building2,
		path: "/my/workspace",
	},
	{
		label: "Account",
		icon: UserCog,
		path: "/my/account",
	},
	{
		label: "History",
		icon: History,
		path: "/my/history",
	},
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
			<div className="flex h-14 items-center justify-between px-3 border-b border-[var(--sidebar-border)]">
				{!collapsed && (
					<Link to="/my" className="flex items-center gap-2">
						{branding.logo_url ? (
							<img src={branding.logo_url} alt={branding.site_name} className="h-7 w-auto" />
						) : (
							<span className="text-lg font-bold text-[var(--sidebar-foreground)] truncate">
								{branding.site_name}
							</span>
						)}
					</Link>
				)}
				<button
					type="button"
					onClick={toggleSidebar}
					className="p-1.5 rounded-md hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)]"
				>
					{collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
				</button>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
				{NAV_SECTIONS.map((section) =>
					section.children ? (
						<ExpandableSection
							key={section.label}
							section={section}
							collapsed={collapsed}
							currentPath={location.pathname}
						/>
					) : (
						<NavLink
							key={section.path}
							path={section.path!}
							icon={section.icon}
							label={section.label}
							collapsed={collapsed}
							active={
								section.path === "/my"
									? location.pathname === "/my"
									: location.pathname.startsWith(section.path!)
							}
						/>
					),
				)}
			</nav>
		</aside>
	);
}

function ExpandableSection({
	section,
	collapsed,
	currentPath,
}: {
	section: NavSection;
	collapsed: boolean;
	currentPath: string;
}) {
	const isChildActive = section.children?.some((c) => currentPath.startsWith(c.path)) ?? false;
	const [open, setOpen] = useState(isChildActive);

	const Icon = section.icon;

	if (collapsed) {
		// In collapsed mode, show just the icon linking to the first child
		const firstPath = section.children?.[0]?.path ?? "/my";
		return (
			<NavLink
				path={firstPath}
				icon={section.icon}
				label={section.label}
				collapsed
				active={isChildActive}
			/>
		);
	}

	return (
		<div>
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className={cn(
					"flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
					isChildActive
						? "text-[var(--sidebar-primary)]"
						: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
				)}
			>
				<Icon size={18} />
				<span className="flex-1 text-left">{section.label}</span>
				{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
			</button>
			{open && (
				<div className="ml-4 mt-0.5 space-y-0.5 border-l border-[var(--sidebar-border)] pl-3">
					{section.children?.map((child) => (
						<NavLink
							key={child.path}
							path={child.path}
							icon={child.icon}
							label={child.label}
							collapsed={false}
							active={currentPath === child.path || currentPath.startsWith(child.path + "/")}
							small
						/>
					))}
				</div>
			)}
		</div>
	);
}

function NavLink({
	path,
	icon: Icon,
	label,
	collapsed,
	active,
	small,
}: {
	path: string;
	icon: React.ElementType;
	label: string;
	collapsed: boolean;
	active: boolean;
	small?: boolean;
}) {
	return (
		<Link
			to={path}
			className={cn(
				"flex items-center gap-3 rounded-md transition-colors",
				small ? "px-2 py-1.5 text-[13px]" : "px-3 py-2 text-sm font-medium",
				active
					? "bg-[color-mix(in_srgb,var(--sidebar-primary)_10%,transparent)] text-[var(--sidebar-primary)]"
					: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
				collapsed && "justify-center px-2",
			)}
			title={collapsed ? label : undefined}
		>
			<Icon size={small ? 15 : 18} />
			{!collapsed && <span>{label}</span>}
		</Link>
	);
}
