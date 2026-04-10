import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { NavGroup, NavItem } from "./sidebar-nav-config";
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
				: location.pathname === item.path ||
					location.pathname.startsWith(item.path + "/") ||
					item.children?.some(
						(c) =>
							location.pathname === c.path ||
							location.pathname.startsWith(c.path + "/"),
					),
	);

	const [open, setOpen] = useState(hasActiveChild);

	// No label = top-level items (Dashboard, Sales, etc.) — always visible
	if (!group.label) {
		return (
			<div className="mb-1">
				{group.items.map((item) =>
					item.children ? (
						<ExpandableNavItem
							key={item.path}
							item={item}
							collapsed={collapsed}
						/>
					) : (
						<NavLink key={item.path} item={item} collapsed={collapsed} />
					),
				)}
			</div>
		);
	}

	// Collapsed sidebar: show single group icon only
	if (collapsed) {
		if (!group.icon) return null;
		const Icon = group.icon;
		const groupActive = group.items.some(
			(item) =>
				location.pathname === item.path ||
				location.pathname.startsWith(item.path + "/"),
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

/** Top-level nav item with expandable children (e.g. Sales > Overview, Pipeline...) */
function ExpandableNavItem({
	item,
	collapsed,
}: {
	item: NavItem;
	collapsed: boolean;
}) {
	const location = useLocation();
	const children = item.children ?? [];

	const isChildActive = children.some(
		(c) =>
			location.pathname === c.path ||
			location.pathname.startsWith(c.path + "/"),
	);

	const [open, setOpen] = useState(isChildActive);

	const Icon = item.icon;

	// Collapsed: just show icon linking to the main path
	if (collapsed) {
		return (
			<Link
				to={item.path}
				title={item.label}
				className={cn(
					"flex items-center justify-center rounded-md px-2 py-1.5 transition-colors",
					isChildActive
						? "bg-[color-mix(in_srgb,var(--sidebar-primary)_10%,transparent)] text-[var(--sidebar-primary)]"
						: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
				)}
			>
				<Icon size={16} className="shrink-0" />
			</Link>
		);
	}

	return (
		<div>
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className={cn(
					"flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] transition-colors",
					isChildActive
						? "text-[var(--sidebar-primary)] font-medium"
						: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
				)}
			>
				<Icon size={16} className="shrink-0" />
				<span className="truncate flex-1 text-left">{item.label}</span>
				<ChevronRight
					size={14}
					className={cn(
						"shrink-0 text-[var(--muted-foreground)] transition-transform duration-200",
						open && "rotate-90",
					)}
				/>
			</button>

			{open && (
				<div className="ml-5 mt-0.5 space-y-0.5 border-l border-[var(--sidebar-border)] pl-2.5">
					{children.map((child) => {
						const ChildIcon = child.icon;
						const active =
							child.path === "/my/crm"
								? location.pathname === "/my/crm"
								: location.pathname === child.path ||
									location.pathname.startsWith(child.path + "/");
						return (
							<Link
								key={child.path}
								to={child.path}
								className={cn(
									"flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
									active
										? "bg-[color-mix(in_srgb,var(--sidebar-primary)_10%,transparent)] text-[var(--sidebar-primary)] font-medium"
										: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
								)}
							>
								<ChildIcon size={14} className="shrink-0" />
								<span className="truncate">{child.label}</span>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}

function NavLink({
	item,
	collapsed,
}: {
	item: NavItem;
	collapsed: boolean;
}) {
	const location = useLocation();
	const fullPath = location.pathname + location.search;
	const active = item.path.includes("?")
		? fullPath === item.path || fullPath.startsWith(item.path + "&")
		: location.pathname === item.path;

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
