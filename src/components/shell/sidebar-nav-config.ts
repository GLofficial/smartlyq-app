import {
	LayoutDashboard, Sparkles, FileText, ImagePlus, VideoIcon, AudioLines,
	FileSearch, PenLine, PenSquare, CalendarDays, ListTodo, Layers, Clock,
	Inbox, MessagesSquare, Tag, Users, BarChart3, FileBarChart, FileSpreadsheet,
	CalendarCheck, Megaphone, Folders, Image, Target, Plug, Bot, Link2, Palette,
	Building2, Briefcase, Globe, Shield, Receipt, ClipboardList, Settings, Activity,
	CreditCard, MessageSquare, LayoutGrid, Presentation, Database, FileAudio, Film,
	Clapperboard, CircleDollarSign, TrendingUp, ShoppingCart, SquareStack, FileImage,
	ScrollText, History, Headphones, FolderOpen, PieChart,
	BookOpen, FileQuestion, LifeBuoy, Bug, Brain, Wrench,
	type LucideIcon,
} from "lucide-react";

export interface NavItem {
	label: string;
	path: string;
	icon: LucideIcon;
	children?: NavItem[];
}

export interface NavGroup {
	label: string;
	icon?: LucideIcon;
	path?: string;
	items: NavItem[];
}

/** Build workspace-scoped navigation. All paths are under /w/{hash}/. */
export function getNavGroups(wsHash: string): NavGroup[] {
	const p = (sub: string) => `/w/${wsHash}/${sub}`;

	return [
		{
			label: "",
			items: [
				{ label: "Launchpad", path: p("dashboard"), icon: LayoutDashboard },
				{
					label: "Sales", path: p("crm"), icon: Briefcase,
					children: [
						{ label: "Dashboard", path: p("crm"), icon: LayoutDashboard },
						{ label: "Contacts", path: p("crm/contacts"), icon: Users },
						{ label: "Pipeline", path: p("crm/pipeline"), icon: LayoutGrid },
						{ label: "Projects", path: p("crm/projects"), icon: FolderOpen },
						{ label: "Tasks", path: p("crm/tasks"), icon: ClipboardList },
					],
				},
				{ label: "Calendar", path: p("calendar"), icon: CalendarCheck },
			],
		},
		{
			label: "Create", icon: Sparkles, path: p("captain"),
			items: [
				{ label: "AI Captain", path: p("captain"), icon: Sparkles },
				{ label: "Assistant", path: p("chat"), icon: MessageSquare },
				{ label: "Captain Boards", path: p("ai-captain/boards"), icon: LayoutGrid },
				{ label: "Templates", path: p("templates"), icon: FileText },
				{ label: "Campaigns", path: p("campaigns"), icon: Folders },
				{ label: "Image Generator", path: p("image-generator"), icon: ImagePlus },
				{ label: "Text to Video", path: p("text-to-video"), icon: VideoIcon },
				{ label: "Image to Video", path: p("image-to-video"), icon: Film },
				{ label: "Video Editor", path: p("video-editor"), icon: Clapperboard },
				{ label: "Text to Audio", path: p("text-to-audio"), icon: AudioLines },
				{ label: "Transcription", path: p("audio-to-text"), icon: FileAudio },
				{ label: "Presentations", path: p("presentations"), icon: Presentation },
				{ label: "Data Analyst", path: p("analyst"), icon: Database },
				{ label: "Content Rewriter", path: p("content-rewriter"), icon: PenLine },
				{ label: "Article Generator", path: p("articles"), icon: FileSearch },
				{ label: "Editor", path: p("editor"), icon: PenSquare },
			],
		},
		{
			label: "Publish", icon: PenSquare, path: p("social-media/create-post"),
			items: [
				{ label: "Create Post", path: p("social-media/create-post"), icon: PenSquare },
				{ label: "Content Calendar", path: p("social-media/calendar"), icon: CalendarDays },
				{ label: "Manage Posts", path: p("social-media/posts"), icon: ListTodo },
				{ label: "Post Queues", path: p("social-media/queues"), icon: Layers },
				{ label: "Bulk Scheduler", path: p("bulk-scheduler"), icon: Clock },
				{ label: "Inbox", path: p("social-media/inbox"), icon: Inbox },
				{ label: "Comments", path: p("social-media/comments"), icon: MessagesSquare },
				{ label: "Labels", path: p("social-media/labels"), icon: Tag },
				{ label: "Social Accounts", path: p("social-media/accounts"), icon: Users },
			],
		},
		{
			label: "Analyze", icon: BarChart3, path: p("social-media/analytics"),
			items: [
				{ label: "Social Reports", path: p("social-media/analytics"), icon: BarChart3 },
				{ label: "Facebook Ads", path: p("integrations/facebook/ads"), icon: Target },
				{ label: "Google Ads", path: p("integrations/google/ads"), icon: Target },
				{ label: "TikTok Ads", path: p("integrations/tiktok/ads"), icon: Target },
				{ label: "LinkedIn Ads", path: p("integrations/linkedin/ads"), icon: Target },
				{ label: "Google Analytics", path: p("integrations/google/traffic"), icon: TrendingUp },
				{ label: "WooCommerce", path: p("integrations/woocommerce/insights"), icon: ShoppingCart },
				{ label: "Custom Reports", path: p("social-media/custom-report"), icon: FileSpreadsheet },
				{ label: "Scheduled Reports", path: p("social-media/schedule-report"), icon: CalendarCheck },
			],
		},
		{
			label: "Ad Manager", icon: Megaphone, path: p("ad-manager"),
			items: [
				{ label: "Dashboard", path: p("ad-manager"), icon: Megaphone },
				{ label: "Campaigns", path: p("ad-manager/campaigns"), icon: Folders },
				{ label: "Ad Sets", path: p("ad-manager/ad-sets"), icon: SquareStack },
				{ label: "Ads", path: p("ad-manager/ads"), icon: FileImage },
				{ label: "Creatives", path: p("ad-manager/creatives"), icon: Image },
				{ label: "Audiences", path: p("ad-manager/audiences"), icon: Target },
				{ label: "Analytics", path: p("ad-manager/analytics"), icon: BarChart3 },
				{ label: "Audit Log", path: p("ad-manager/audit-log"), icon: ScrollText },
				{ label: "Settings", path: p("ad-manager/settings"), icon: Settings },
			],
		},
		{
			label: "Connect", icon: Plug, path: p("integrations"),
			items: [
				{ label: "Integrations", path: p("integrations"), icon: Plug },
				{ label: "URL Shortener", path: p("url-shortener"), icon: Link2 },
				{ label: "Canva", path: p("canva"), icon: Palette },
			],
		},
		{
			label: "Automate", icon: Bot, path: p("chatbot"),
			items: [
				{ label: "Chatbot", path: p("chatbot"), icon: Bot },
				{ label: "Templates", path: p("chatbot/templates"), icon: FileText },
				{ label: "Analytics", path: p("chatbot/analytics"), icon: BarChart3 },
				{ label: "Chat History", path: p("chatbot/history"), icon: History },
				{ label: "Live Agent", path: p("chatbot/live-agent"), icon: Headphones },
				{ label: "Settings", path: p("chatbot/settings"), icon: Settings },
			],
		},
		{
			label: "",
			items: [
				{ label: "Media Library", path: p("media"), icon: FolderOpen },
			],
		},
		{
			label: "Whitelabel", icon: Globe, path: p("whitelabel"),
			items: [
				{ label: "Settings", path: p("whitelabel"), icon: Globe },
				{ label: "Agency", path: p("agency"), icon: Building2 },
				{ label: "Billing", path: p("agency/billing"), icon: CreditCard },
				{ label: "Reports", path: p("agency/reports"), icon: PieChart },
			],
		},
	];
}

/** Admin group — not workspace-scoped, uses absolute /admin/* paths. */
export const ADMIN_GROUP: NavGroup = {
	label: "Admin", icon: Shield, path: "/admin",
	items: [
		{ label: "Dashboard", path: "/admin", icon: Shield },
		{ label: "Users", path: "/admin/users", icon: Users },
		{ label: "Plans", path: "/admin/plans", icon: CreditCard },
		{ label: "Pricing", path: "/admin/pricing", icon: CircleDollarSign },
		{ label: "Subscriptions", path: "/admin/subscriptions", icon: ClipboardList },
		{ label: "Transactions", path: "/admin/transactions", icon: Receipt },
		{ label: "Templates", path: "/admin/templates", icon: FileText },
		{ label: "Assistants", path: "/admin/assistants", icon: Bot },
		{ label: "Blogs", path: "/admin/blogs", icon: BookOpen },
		{ label: "Pages", path: "/admin/pages", icon: FileQuestion },
		{ label: "Reports", path: "/admin/reports", icon: FileBarChart },
		{ label: "Support", path: "/admin/support", icon: LifeBuoy },
		{ label: "AI Captain Traces", path: "/admin/ai-captain/traces", icon: Activity },
		{ label: "AI Captain KB", path: "/admin/ai-captain/kb", icon: Brain },
		{ label: "AI Captain Skills", path: "/admin/ai-captain/skills", icon: Wrench },
		{ label: "Billing Debug", path: "/admin/billing-debug", icon: Bug },
		{ label: "Whitelabel", path: "/admin/whitelabel", icon: Globe },
		{ label: "Settings", path: "/admin/settings", icon: Settings },
		{ label: "Monitoring", path: "/admin/monitoring", icon: Activity },
	],
};
