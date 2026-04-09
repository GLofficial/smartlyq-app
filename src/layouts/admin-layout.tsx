import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import {
	LayoutDashboard, Users, CreditCard, ClipboardList,
	Receipt, Globe, ArrowLeft, Shield,
} from "lucide-react";
import { cn } from "@/lib/cn";

const ADMIN_NAV = [
	{ label: "Dashboard", path: "/admin", icon: LayoutDashboard },
	{ label: "Users", path: "/admin/users", icon: Users },
	{ label: "Plans", path: "/admin/plans", icon: CreditCard },
	{ label: "Subscriptions", path: "/admin/subscriptions", icon: ClipboardList },
	{ label: "Transactions", path: "/admin/transactions", icon: Receipt },
	{ label: "Whitelabel", path: "/admin/whitelabel", icon: Globe },
];

export function AdminLayout() {
	const user = useAuthStore((s) => s.user);
	const location = useLocation();

	if (!user || user.role !== 1) {
		return <Navigate to="/my" replace />;
	}

	return (
		<div className="flex h-screen overflow-hidden">
			{/* Admin sidebar */}
			<aside className="flex w-56 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-background)]">
				<div className="flex h-14 items-center gap-2 border-b border-[var(--sidebar-border)] px-4">
					<Shield size={18} className="text-[var(--sq-primary)]" />
					<span className="font-bold">Admin Panel</span>
				</div>
				<nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
					{ADMIN_NAV.map((item) => {
						const active = item.path === "/admin"
							? location.pathname === "/admin"
							: location.pathname.startsWith(item.path);
						return (
							<Link
								key={item.path}
								to={item.path}
								className={cn(
									"flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
									active
										? "bg-[color-mix(in_srgb,var(--sidebar-primary)_10%,transparent)] text-[var(--sidebar-primary)]"
										: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
								)}
							>
								<item.icon size={16} />
								<span>{item.label}</span>
							</Link>
						);
					})}
				</nav>
				<div className="border-t border-[var(--sidebar-border)] p-2">
					<Link
						to="/my"
						className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"
					>
						<ArrowLeft size={16} /> Back to App
					</Link>
				</div>
			</aside>
			<main className="flex-1 overflow-y-auto p-6">
				<Outlet />
			</main>
		</div>
	);
}
