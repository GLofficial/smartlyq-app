import { Outlet, Link, useSearchParams } from "react-router-dom";
import {
	ArrowLeft, Building2, UserCog, Settings, Users, CreditCard,
	Activity, Shield, FileCode2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useWorkspacePath } from "@/hooks/use-workspace-path";
import { Header } from "@/components/shell/header";

const SECTIONS = [
	{
		label: "MY BUSINESS",
		items: [
			{ key: "business-profile", label: "Business Profile", icon: Building2 },
			{ key: "account", label: "My Account", icon: UserCog },
			{ key: "billing", label: "Billing", icon: CreditCard },
		],
	},
	{
		label: "WORKSPACE",
		items: [
			{ key: "workspace", label: "General", icon: Settings },
			{ key: "members", label: "My Staff", icon: Users },
			{ key: "defaults", label: "Workspace Defaults", icon: Shield },
			{ key: "activity", label: "Activity Log", icon: Activity },
		],
	},
	{
		label: "OTHER SETTINGS",
		items: [
			{ key: "developer", label: "Developer API", icon: FileCode2 },
		],
	},
];

export function SettingsLayout() {
	const [params, setParams] = useSearchParams();
	const tab = params.get("tab") || "business-profile";
	const wp = useWorkspacePath();

	return (
		<div className="flex h-screen overflow-hidden">
			{/* Settings sidebar */}
			<aside className="flex w-56 shrink-0 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-background)]">
				{/* Go Back */}
				<div className="px-3 pt-3 pb-1">
					<Link
						to={wp("dashboard")}
						className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-[var(--sq-primary)] hover:bg-[color-mix(in_srgb,var(--sq-primary)_8%,transparent)] transition-colors"
					>
						<ArrowLeft size={16} />
						Go Back
					</Link>
				</div>

				<div className="px-4 pt-2 pb-3">
					<h2 className="text-lg font-bold text-[var(--sidebar-foreground)]">Settings</h2>
				</div>

				{/* Sections */}
				<nav className="flex-1 overflow-y-auto px-3 space-y-4">
					{SECTIONS.map((section) => (
						<div key={section.label}>
							<p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
								{section.label}
							</p>
							<div className="space-y-0.5">
								{section.items.map((item) => {
									const Icon = item.icon;
									const active = tab === item.key;
									return (
										<button
											key={item.key}
											onClick={() => setParams({ tab: item.key })}
											className={cn(
												"flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
												active
													? "bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)] text-[var(--sq-primary)] font-medium"
													: "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]",
											)}
										>
											<Icon size={15} className={active ? "text-[var(--sq-primary)]" : "text-[var(--muted-foreground)]"} />
											{item.label}
										</button>
									);
								})}
							</div>
						</div>
					))}
				</nav>
			</aside>

			{/* Content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				<Header />
				<main className="flex-1 overflow-y-auto p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
