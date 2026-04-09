import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Settings } from "lucide-react";
import { useAdminSettings, useSaveAdminSettings } from "@/api/admin-settings";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

const TABS = [
	{ key: "general", label: "General" },
	{ key: "openai", label: "AI / API Keys" },
	{ key: "payment", label: "Payment" },
	{ key: "mail", label: "Mail / SMTP" },
	{ key: "social_oauth", label: "Social OAuth" },
	{ key: "security", label: "Security" },
	{ key: "storage", label: "Storage / R2" },
	{ key: "app", label: "App Config" },
	{ key: "railway", label: "Railway / Flask" },
	{ key: "marketing", label: "Marketing" },
	{ key: "finance", label: "Finance" },
	{ key: "theme", label: "Theme" },
];

export function AdminSettingsPage() {
	const [activeTab, setActiveTab] = useState("general");
	const { data, isLoading } = useAdminSettings(activeTab);
	const saveMutation = useSaveAdminSettings();
	const [values, setValues] = useState<Record<string, string>>({});

	// Sync fetched settings into local state
	useEffect(() => {
		if (data?.settings) setValues(data.settings);
	}, [data?.settings]);

	const update = (key: string, val: string) =>
		setValues((prev) => ({ ...prev, [key]: val }));

	const handleSave = () => {
		saveMutation.mutate(
			{ tab: activeTab, values },
			{
				onSuccess: (d) => toast.success(d.message),
				onError: () => toast.error("Failed to save settings."),
			},
		);
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Settings</h1>

			<div className="flex gap-6">
				{/* Tab sidebar */}
				<div className="w-48 shrink-0 space-y-0.5">
					{TABS.map((tab) => (
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
							{tab.label}
						</button>
					))}
				</div>

				{/* Settings form */}
				<div className="flex-1">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Settings size={18} />
								{TABS.find((t) => t.key === activeTab)?.label ?? "Settings"}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex h-32 items-center justify-center">
									<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
								</div>
							) : Object.keys(values).length === 0 ? (
								<p className="text-sm text-[var(--muted-foreground)]">
									No settings found for this tab.
								</p>
							) : (
								<div className="space-y-4">
									{Object.entries(values).map(([key, val]) => (
										<SettingField
											key={key}
											name={key}
											value={val}
											onChange={(v) => update(key, v)}
										/>
									))}
									<Button onClick={handleSave} disabled={saveMutation.isPending}>
										<Save size={16} /> {saveMutation.isPending ? "Saving..." : "Save Settings"}
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

function SettingField({
	name,
	value,
	onChange,
}: {
	name: string;
	value: string;
	onChange: (v: string) => void;
}) {
	const label = name
		.replace(/_/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());

	const isSecret = name.includes("secret") || name.includes("password") || name.includes("apikey");

	return (
		<div className="space-y-1">
			<label className="text-sm font-medium">{label}</label>
			<Input
				type={isSecret ? "password" : "text"}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={isSecret ? "••••••••" : `Enter ${label.toLowerCase()}`}
			/>
		</div>
	);
}
