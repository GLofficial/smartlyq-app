import { useSearchParams, Link } from "react-router-dom";
import { useWorkspacePath } from "@/hooks/use-workspace-path";
import { BusinessProfileTab } from "./tabs/business-profile-tab";
import { AccountSettingsTab } from "./tabs/account-settings-tab";
import { MembersSettingsTab } from "./tabs/members-settings-tab";
import { BillingSettingsTab } from "./tabs/billing-settings-tab";
import { WorkspaceSettingsTab } from "./tabs/workspace-settings-tab";
import { ActivitySettingsTab } from "./tabs/activity-settings-tab";
import { DefaultsSettingsTab } from "./tabs/defaults-settings-tab";

export function SettingsPage() {
	const [params] = useSearchParams();
	const tab = params.get("tab") || "business-profile";
	const wp = useWorkspacePath();

	return (
		<div className="max-w-4xl">
			{tab === "business-profile" && <BusinessProfileTab />}
			{tab === "account" && <AccountSettingsTab />}
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
	);
}
