import {
	LayoutDashboard,
	Sparkles,
	FileText,
	ImagePlus,
	VideoIcon,
	AudioLines,
	FileSearch,
	PenLine,
	PenSquare,
	CalendarDays,
	ListTodo,
	Layers,
	Clock,
	Inbox,
	MessagesSquare,
	Tag,
	Users,
	BarChart3,
	FileBarChart,
	FileSpreadsheet,
	CalendarCheck,
	Megaphone,
	Folders,
	Image,
	Target,
	Plug,
	Bot,
	Link2,
	Palette,
	Building2,
	Briefcase,
	Globe,
	Shield,
	Receipt,
	ClipboardList,
	Settings,
	Activity,
	CreditCard,
	type LucideIcon,
} from "lucide-react";

export interface NavItem {
	label: string;
	path: string;
	icon: LucideIcon;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
	{
		label: "",
		items: [{ label: "Dashboard", path: "/my", icon: LayoutDashboard }],
	},
	{
		label: "CREATE",
		items: [
			{ label: "AI Captain", path: "/my/captain", icon: Sparkles },
			{ label: "Templates", path: "/my/templates", icon: FileText },
			{ label: "Image Generator", path: "/my/image-generator", icon: ImagePlus },
			{ label: "Video Generator", path: "/my/text-to-video", icon: VideoIcon },
			{ label: "Text to Audio", path: "/my/text-to-audio", icon: AudioLines },
			{ label: "Content Rewriter", path: "/my/content-rewriter", icon: PenLine },
			{ label: "Article Generator", path: "/my/article-generator", icon: FileSearch },
			{ label: "Editor", path: "/my/editor", icon: PenSquare },
		],
	},
	{
		label: "PUBLISH",
		items: [
			{ label: "Create Post", path: "/my/social-media/create-post", icon: PenSquare },
			{ label: "Content Calendar", path: "/my/social-media/calendar", icon: CalendarDays },
			{ label: "Manage Posts", path: "/my/social-media/posts", icon: ListTodo },
			{ label: "Post Queues", path: "/my/social-media/queues", icon: Layers },
			{ label: "Bulk Scheduler", path: "/my/bulk-scheduler", icon: Clock },
			{ label: "Inbox", path: "/my/social-media/inbox", icon: Inbox },
			{ label: "Comments", path: "/my/social-media/comments", icon: MessagesSquare },
			{ label: "Labels", path: "/my/social-media/labels", icon: Tag },
			{ label: "Social Accounts", path: "/my/social-media/accounts", icon: Users },
		],
	},
	{
		label: "ANALYZE",
		items: [
			{ label: "Analytics", path: "/my/social-media/analytics", icon: BarChart3 },
			{ label: "Reports", path: "/my/social-media/report", icon: FileBarChart },
			{ label: "Custom Reports", path: "/my/social-media/custom-report", icon: FileSpreadsheet },
			{ label: "Scheduled Reports", path: "/my/social-media/schedule-report", icon: CalendarCheck },
		],
	},
	{
		label: "AD MANAGER",
		items: [
			{ label: "Dashboard", path: "/my/ad-manager", icon: Megaphone },
			{ label: "Campaigns", path: "/my/ad-manager/campaigns", icon: Folders },
			{ label: "Creatives", path: "/my/ad-manager/creatives", icon: Image },
			{ label: "Audiences", path: "/my/ad-manager/audiences", icon: Target },
			{ label: "Analytics", path: "/my/ad-manager/analytics", icon: BarChart3 },
		],
	},
	{
		label: "CONNECT",
		items: [
			{ label: "Integrations", path: "/my/integrations", icon: Plug },
			{ label: "Chatbot", path: "/my/chatbot", icon: Bot },
			{ label: "URL Shortener", path: "/my/url-shortener", icon: Link2 },
			{ label: "Canva", path: "/my/canva", icon: Palette },
		],
	},
	{
		label: "WORKSPACE",
		items: [
			{ label: "Overview", path: "/my/workspace", icon: Building2 },
			{ label: "Members", path: "/my/workspace/members", icon: Users },
			{ label: "Brands", path: "/my/brands", icon: Briefcase },
			{ label: "Business Groups", path: "/my/businesses", icon: Building2 },
		],
	},
	{
		label: "WHITELABEL",
		items: [
			{ label: "Settings", path: "/my/whitelabel", icon: Globe },
			{ label: "Agency", path: "/my/agency", icon: Building2 },
		],
	},
];

export const ADMIN_GROUP: NavGroup = {
	label: "ADMIN",
	items: [
		{ label: "Dashboard", path: "/admin", icon: Shield },
		{ label: "Users", path: "/admin/users", icon: Users },
		{ label: "Plans", path: "/admin/plans", icon: CreditCard },
		{ label: "Subscriptions", path: "/admin/subscriptions", icon: ClipboardList },
		{ label: "Transactions", path: "/admin/transactions", icon: Receipt },
		{ label: "Whitelabel", path: "/admin/whitelabel", icon: Globe },
		{ label: "Settings", path: "/admin/settings", icon: Settings },
		{ label: "Monitoring", path: "/admin/monitoring", icon: Activity },
	],
};
