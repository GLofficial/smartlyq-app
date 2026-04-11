import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/cn";
import {
	LayoutDashboard, Users, CreditCard, ClipboardList,
	Receipt, Globe, Settings, ArrowLeft, Shield,
	DollarSign, HelpCircle, FileText, Layers,
	Bot, Sparkles, BookOpen, Zap,
	Activity, Bug, BarChart3,
} from "lucide-react";

const ADMIN_NAV = [
	{ label: "Dashboard", path: "/admin", icon: LayoutDashboard },
	{ label: "Users", path: "/admin/users", icon: Users },
	{ label: "Plans", path: "/admin/plans", icon: CreditCard },
	{ label: "Pricing", path: "/admin/pricing", icon: DollarSign },
	{ label: "Subscriptions", path: "/admin/subscriptions", icon: ClipboardList },
	{ label: "Transactions", path: "/admin/transactions", icon: Receipt },
	{ label: "Templates", path: "/admin/templates", icon: Layers },
	{ label: "Assistants", path: "/admin/assistants", icon: Bot },
	{ label: "Blogs", path: "/admin/blogs", icon: FileText },
	{ label: "Pages", path: "/admin/pages", icon: FileText },
	{ label: "AI Traces", path: "/admin/ai-captain/traces", icon: Sparkles },
	{ label: "AI Knowledge", path: "/admin/ai-captain/kb", icon: BookOpen },
	{ label: "AI Skills", path: "/admin/ai-captain/skills", icon: Zap },
	{ label: "Reports", path: "/admin/reports", icon: BarChart3 },
	{ label: "Support", path: "/admin/support", icon: HelpCircle },
	{ label: "Whitelabel", path: "/admin/whitelabel", icon: Globe },
	{ label: "Monitoring", path: "/admin/monitoring", icon: Activity },
	{ label: "Billing Debug", path: "/admin/billing-debug", icon: Bug },
	{ label: "Settings", path: "/admin/settings", icon: Settings },
];

export function AdminLayout() {
	const user = useAuthStore((s) => s.user);
	const location = useLocation();

	if (!user || user.role !== 1) return <Navigate to="/" replace />;

	return (
		<div className="flex h-screen overflow-hidden">
			<aside className="flex w-52 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-background)]">
				<div className="flex h-12 items-center gap-2 border-b border-[var(--sidebar-border)] px-4">
					<Shield size={16} className="text-[var(--sq-primary)]" />
					<span className="font-bold text-sm">Admin Panel</span>
				</div>
				<nav className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
					{ADMIN_NAV.map((item) => {
						const active = item.path === "/admin"
							? location.pathname === "/admin"
							: location.pathname.startsWith(item.path);
						return (
							<Link
								key={item.path}
								to={item.path}
								className={cn(
									"flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition-colors",
									active
										? "bg-[color-mix(in_srgb,var(--sidebar-primary)_10%,transparent)] text-[var(--sidebar-primary)] font-medium"
										: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
								)}
							>
								<item.icon size={15} />
								<span>{item.label}</span>
							</Link>
						);
					})}
				</nav>
				<div className="border-t border-[var(--sidebar-border)] p-1.5">
					<Link to="/" className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]">
						<ArrowLeft size={15} /> Back to App
					</Link>
				</div>
			</aside>
			<main className="flex-1 overflow-y-auto p-6">
				<Outlet />
			</main>
		</div>
	);
}
