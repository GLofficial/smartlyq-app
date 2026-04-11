
import { useSearchParams, Link } from "react-router-dom";
import { Settings, Building2, Users, CreditCard, Activity, Shield, Sliders, FileCode2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useWorkspacePath } from "@/hooks/use-workspace-path";
import { BusinessProfileTab } from "./tabs/business-profile-tab";
import { MembersSettingsTab } from "./tabs/members-settings-tab";
import { BillingSettingsTab } from "./tabs/billing-settings-tab";
import { WorkspaceSettingsTab } from "./tabs/workspace-settings-tab";
import { ActivitySettingsTab } from "./tabs/activity-settings-tab";
import { DefaultsSettingsTab } from "./tabs/defaults-settings-tab";

const TABS = [
	{ key: "business-profile", label: "Business Profile", icon: Building2 },
	{ key: "workspace", label: "Workspace", icon: Settings },
	{ key: "members", label: "Members", icon: Users },
	{ key: "billing", label: "Billing", icon: CreditCard },
	{ key: "activity", label: "Activity", icon: Activity },
	{ key: "defaults", label: "Workspace Defaults", icon: Shield },
	{ key: "developer", label: "Developer API", icon: FileCode2 },
];

export function SettingsPage() {
	const [params, setParams] = useSearchParams();
	const tab = params.get("tab") || "business-profile";
	const setTab = (t: string) => setParams({ tab: t });
	const wp = useWorkspacePath();

	return (
		<div className="flex gap-6">
			{/* Settings sidebar */}
			<aside className="hidden w-56 shrink-0 lg:block">
				<h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
					<Sliders size={18} /> Settings
				</h2>
				<nav className="space-y-0.5">
					{TABS.map((t) => {
						const Icon = t.icon;
						const active = tab === t.key;
						return (
							<button
								key={t.key}
								onClick={() => setTab(t.key)}
								className={cn(
									"flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
									active
										? "bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)] text-[var(--sq-primary)] font-medium"
										: "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
								)}
							>
								<Icon size={16} />
								{t.label}
							</button>
						);
					})}
				</nav>
			</aside>

			{/* Mobile tab bar */}
			<div className="w-full lg:hidden">
				<div className="mb-4 flex gap-1 overflow-x-auto border-b border-[var(--border)]">
					{TABS.map((t) => (
						<button
							key={t.key}
							onClick={() => setTab(t.key)}
							className={cn(
								"whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors",
								tab === t.key
									? "border-[var(--sq-primary)] text-[var(--sq-primary)]"
									: "border-transparent text-[var(--muted-foreground)]",
							)}
						>
							{t.label}
						</button>
					))}
				</div>
			</div>

			{/* Content */}
			<div className="min-w-0 flex-1">
				{tab === "business-profile" && <BusinessProfileTab />}
				{tab === "workspace" && <WorkspaceSettingsTab />}
				{tab === "members" && <MembersSettingsTab />}
				{tab === "billing" && <BillingSettingsTab />}
				{tab === "activity" && <ActivitySettingsTab />}
				{tab === "defaults" && <DefaultsSettingsTab />}
				{tab === "developer" && (
					<div className="text-center py-12">
						<p className="text-[var(--muted-foreground)] mb-3">Developer API settings</p>
						<Link to={wp("developer")} className="text-sm text-[var(--sq-primary)] hover:underline">
							Open Developer Portal
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
