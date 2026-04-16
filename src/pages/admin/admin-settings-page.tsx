import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Settings } from "lucide-react";
import { useAdminSettings, useSaveAdminSettings, useAdminModels } from "@/api/admin-settings";
import { useAdminPlans } from "@/api/admin";
import { TAB_FIELDS, type FieldDef } from "./settings-field-config";
import { ModelSelectField, type ModelOption } from "./model-select-field";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { SocialOAuthTab } from "./social-oauth/social-oauth-tab";

const TABS = [
	{ key: "general", label: "General" },
	{ key: "openai", label: "AI / API Keys" },
	{ key: "payment", label: "Payment" },
	{ key: "mail", label: "Mail / SMTP" },
	{ key: "social_oauth", label: "Social OAuth" },
	{ key: "security", label: "Security" },
	{ key: "storage", label: "Storage / R2" },
	{ key: "app", label: "App Config" },
	{ key: "ai_captain", label: "AI Captain" },
	{ key: "railway", label: "Railway / Flask" },
	{ key: "marketing", label: "Marketing" },
	{ key: "finance", label: "Finance" },
	{ key: "theme", label: "Theme" },
];

const GPT_MODEL_KEYS   = ["default_template_model", "default_chat_model", "default_analyst_model", "default_article_model"];
const IMAGE_MODEL_KEYS = ["default_image_model"];
const MODEL_SELECT_KEYS = [...GPT_MODEL_KEYS, ...IMAGE_MODEL_KEYS];

export function AdminSettingsPage() {
	const [activeTab, setActiveTab] = useState("general");
	const { data, isLoading } = useAdminSettings(activeTab);
	const saveMutation = useSaveAdminSettings();
	const [values, setValues] = useState<Record<string, string>>({});
	const { data: plansData } = useAdminPlans();
	const { data: modelsData } = useAdminModels();

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
				onError: () => toast.error("Failed to save."),
			},
		);
	};

	const planOptions = [
		{ value: "0", label: "None" },
		...(plansData?.plans ?? []).map((p) => ({ value: String(p.id), label: p.name })),
	];

	const allModels: ModelOption[] = modelsData?.models ?? [];
	const gptModels   = allModels.filter((m) => m.type === "GPT");
	const imageModels = allModels.filter((m) => m.type === "Image");

	const fields = (TAB_FIELDS[activeTab] ?? []).map((f) => {
		if (f.key === "free_plan") return { ...f, options: planOptions };
		return f;
	});

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Site Settings</h1>

			<div className="flex gap-6">
				{/* Tab sidebar */}
				<div className="w-44 shrink-0 space-y-0.5">
					{TABS.map((tab) => (
						<button
							key={tab.key}
							type="button"
							onClick={() => setActiveTab(tab.key)}
							className={cn(
								"flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors text-left",
								activeTab === tab.key
									? "bg-[var(--sq-primary)] text-white font-medium"
									: "text-[var(--foreground)] hover:bg-[var(--accent)]",
							)}
						>
							{tab.label}
						</button>
					))}
				</div>

				{/* Form */}
				<div className="flex-1 min-w-0">
					{activeTab === "social_oauth" ? (
						<SocialOAuthTab />
					) : (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Settings size={18} />
								{TABS.find((t) => t.key === activeTab)?.label}
							</CardTitle>
						</CardHeader>
						<CardContent>
							{isLoading ? (
								<div className="flex h-32 items-center justify-center">
									<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
								</div>
							) : fields.length === 0 ? (
								<p className="text-sm text-[var(--muted-foreground)]">No fields for this tab.</p>
							) : (
								<div className="space-y-5">
									<div className="grid grid-cols-2 gap-x-4 gap-y-5">
										{fields.map((f) => (
											<div key={f.key} className={f.type === "heading" || !f.half ? "col-span-2" : "col-span-1"}>
												{f.type === "heading" ? (
													<div className="border-t border-[var(--border)] pt-4 mt-1">
														<p className="text-sm font-semibold text-[var(--foreground)]">{f.label}</p>
														{(f.description || f.link) && (
															<p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
																{f.description}
																{f.link && (
																	<a href={f.link.url} target="_blank" rel="noopener noreferrer"
																		className="ml-1 text-red-500 hover:underline">
																		{f.link.label} ↗
																	</a>
																)}
															</p>
														)}
													</div>
												) : MODEL_SELECT_KEYS.includes(f.key) ? (
													<div className="space-y-1.5">
														<label className="text-sm font-medium text-[var(--foreground)]">{f.label}</label>
														<ModelSelectField
															value={values[f.key] ?? ""}
															options={IMAGE_MODEL_KEYS.includes(f.key) ? imageModels : gptModels}
															onChange={(v) => update(f.key, v)}
														/>
													</div>
												) : (
													<SettingField field={f} value={values[f.key] ?? ""} onChange={(v) => update(f.key, v)} />
												)}
											</div>
										))}
									</div>
									<Button onClick={handleSave} disabled={saveMutation.isPending}>
										<Save size={16} /> {saveMutation.isPending ? "Saving..." : "Update details"}
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
					)}
				</div>
			</div>
		</div>
	);
}

function SettingField({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
	return (
		<div className="space-y-1.5">
			<label className="text-sm font-medium text-[var(--foreground)]">{field.label}</label>
			{field.type === "select" && field.options ? (
				<select
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="flex h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
				>
					{field.options.map((opt) => (
						<option key={opt.value} value={opt.value}>{opt.label}</option>
					))}
				</select>
			) : field.type === "textarea" ? (
				<textarea
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={field.placeholder}
					rows={3}
					className="flex w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] resize-none"
				/>
			) : (
				<Input
					type={field.type === "password" ? "password" : "text"}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={field.placeholder}
				/>
			)}
			{field.description && (
				<p className="text-xs text-[var(--muted-foreground)]">{field.description}</p>
			)}
		</div>
	);
}
