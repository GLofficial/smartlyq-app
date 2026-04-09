import { useState, useEffect } from "react";
import { Globe, Palette, Mail, Key, LayoutGrid } from "lucide-react";
import { useWhitelabelSettings, type WhitelabelSettings } from "@/api/whitelabel";
import { cn } from "@/lib/cn";
import { BrandingTab } from "./tabs/branding-tab";
import { DomainTab } from "./tabs/domain-tab";
import { EmailTab } from "./tabs/email-tab";
import { AiKeysTab } from "./tabs/ai-keys-tab";
import { ModulesTab } from "./tabs/modules-tab";

const TABS = [
	{ key: "branding", label: "Branding", icon: Palette },
	{ key: "domain", label: "Domain", icon: Globe },
	{ key: "email", label: "Email", icon: Mail },
	{ key: "ai_keys", label: "AI Keys", icon: Key },
	{ key: "modules", label: "Modules", icon: LayoutGrid },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const DEFAULT_BRANDING: WhitelabelSettings["branding"] = {
	site_name: "",
	logo_url: "",
	favicon_url: "",
	colors: {
		primary: "#2563eb",
		secondary: "#64748b",
		accent: "#f59e0b",
		bg: "#ffffff",
		surface: "#f8fafc",
		text: "#0f172a",
		muted: "#94a3b8",
		link: "#2563eb",
	},
	terms_url: "",
	privacy_url: "",
	cookie_url: "",
};

const DEFAULT_SMTP: WhitelabelSettings["smtp"] = {
	enabled: false,
	host: "",
	username: "",
	password: "",
	port: 587,
	encryption: "tls",
	from_email: "",
	from_name: "",
	reply_to: "",
};

export function WhitelabelPage() {
	const [activeTab, setActiveTab] = useState<TabKey>("branding");
	const { data, isLoading } = useWhitelabelSettings();

	const [branding, setBranding] = useState(DEFAULT_BRANDING);
	const [smtp, setSmtp] = useState(DEFAULT_SMTP);
	const [aiKeys, setAiKeys] = useState<Record<string, string>>({});
	const [modules, setModules] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (!data) return;
		if (data.branding) setBranding(data.branding);
		if (data.smtp) setSmtp(data.smtp);
		if (data.ai_keys) setAiKeys(data.ai_keys);
		if (data.modules) setModules(data.modules);
	}, [data]);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Whitelabel Settings</h1>

			<div className="flex gap-6">
				{/* Tab sidebar */}
				<div className="w-44 shrink-0 space-y-0.5">
					{TABS.map((tab) => {
						const Icon = tab.icon;
						return (
							<button
								key={tab.key}
								type="button"
								onClick={() => setActiveTab(tab.key)}
								className={cn(
									"flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors text-left",
									activeTab === tab.key
										? "bg-[var(--sq-primary)] text-white font-medium"
										: "text-[var(--foreground)] hover:bg-[var(--accent)]",
								)}
							>
								<Icon size={16} />
								{tab.label}
							</button>
						);
					})}
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					{isLoading ? (
						<div className="flex h-40 items-center justify-center">
							<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : (
						<>
							{activeTab === "branding" && (
								<BrandingTab branding={branding} onChange={setBranding} />
							)}
							{activeTab === "domain" && (
								<DomainTab domain={data?.domain ?? { subdomain: "", custom_domain: "", domain_verified: false, ssl_active: false }} />
							)}
							{activeTab === "email" && (
								<EmailTab smtp={smtp} onChange={setSmtp} />
							)}
							{activeTab === "ai_keys" && (
								<AiKeysTab keys={aiKeys} onChange={setAiKeys} />
							)}
							{activeTab === "modules" && (
								<ModulesTab modules={modules} onChange={setModules} />
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}
