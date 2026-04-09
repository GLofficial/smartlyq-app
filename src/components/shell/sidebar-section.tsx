import { Link, useLocation } from "react-router-dom";
import type { NavGroup } from "./sidebar-nav-config";
import { cn } from "@/lib/cn";

interface SidebarSectionProps {
	group: NavGroup;
	collapsed: boolean;
}

export function SidebarSection({ group, collapsed }: SidebarSectionProps) {
	const location = useLocation();

	return (
		<div className="mb-1">
			{/* Section header */}
			{group.label && !collapsed && (
				<p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
					{group.label}
				</p>
			)}
			{group.label && collapsed && <div className="mx-3 my-2 border-t border-[var(--sidebar-border)]" />}

			{/* Items */}
			<div className="space-y-0.5">
				{group.items.map((item) => {
					const active =
						item.path === "/my"
							? location.pathname === "/my"
							: location.pathname === item.path ||
								location.pathname.startsWith(item.path + "/");

					return (
						<Link
							key={item.path}
							to={item.path}
							className={cn(
								"flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition-colors",
								active
									? "bg-[color-mix(in_srgb,var(--sidebar-primary)_10%,transparent)] text-[var(--sidebar-primary)] font-medium"
									: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
								collapsed && "justify-center px-2",
							)}
							title={collapsed ? item.label : undefined}
						>
							<item.icon size={16} className="shrink-0" />
							{!collapsed && <span className="truncate">{item.label}</span>}
						</Link>
					);
				})}
			</div>
		</div>
	);
}
