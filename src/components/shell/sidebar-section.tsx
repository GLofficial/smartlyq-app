import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import type { NavGroup } from "./sidebar-nav-config";
import { cn } from "@/lib/cn";

interface SidebarSectionProps {
	group: NavGroup;
	collapsed: boolean;
}

export function SidebarSection({ group, collapsed }: SidebarSectionProps) {
	const location = useLocation();

	// Auto-open if any child is active
	const hasActiveChild = group.items.some(
		(item) =>
			item.path === "/my"
				? location.pathname === "/my"
				: location.pathname === item.path || location.pathname.startsWith(item.path + "/"),
	);

	const [open, setOpen] = useState(hasActiveChild);

	// No label = top-level item (Dashboard), always visible
	if (!group.label) {
		return (
			<div className="mb-1">
				{group.items.map((item) => (
					<NavLink key={item.path} item={item} collapsed={collapsed} />
				))}
			</div>
		);
	}

	// Collapsed sidebar: show single group icon only
	if (collapsed) {
		if (!group.icon) return null;
		const Icon = group.icon;
		const groupActive = group.items.some(
			(item) => location.pathname === item.path || location.pathname.startsWith(item.path + "/"),
		);
		return (
			<div className="mb-0.5">
				<Link
					to={group.path || group.items[0]?.path || "/"}
					title={group.label}
					className={cn(
						"flex items-center justify-center rounded-md px-2 py-1.5 transition-colors",
						groupActive
							? "bg-[color-mix(in_srgb,var(--sidebar-primary)_10%,transparent)] text-[var(--sidebar-primary)]"
							: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
					)}
				>
					<Icon size={18} className="shrink-0" />
				</Link>
			</div>
		);
	}

	return (
		<div className="mb-0.5">
			{/* Toggler header */}
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="flex w-full items-center justify-between px-3 py-1.5 mt-2 rounded-md text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] hover:bg-[var(--sidebar-accent)] transition-colors"
			>
				<span>{group.label}</span>
				<ChevronDown
					size={12}
					className={cn(
						"transition-transform duration-200",
						open ? "rotate-0" : "-rotate-90",
					)}
				/>
			</button>

			{/* Collapsible items */}
			{open && (
				<div className="mt-0.5 space-y-0.5">
					{group.items.map((item) => (
						<NavLink key={item.path} item={item} collapsed={false} />
					))}
				</div>
			)}
		</div>
	);
}

function NavLink({
	item,
	collapsed,
}: {
	item: { label: string; path: string; icon: React.ElementType };
	collapsed: boolean;
}) {
	const location = useLocation();
	const active =
		item.path === "/my"
			? location.pathname === "/my"
			: location.pathname === item.path || location.pathname.startsWith(item.path + "/");

	const Icon = item.icon;

	return (
		<Link
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
			<Icon size={16} className="shrink-0" />
			{!collapsed && <span className="truncate">{item.label}</span>}
		</Link>
	);
}
