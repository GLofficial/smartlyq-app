import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Palette } from "lucide-react";
import { toast } from "sonner";
import type { WhitelabelSettings } from "@/api/whitelabel";
import { useSaveBranding } from "@/api/whitelabel";

interface Props {
	branding: WhitelabelSettings["branding"];
	onChange: (branding: WhitelabelSettings["branding"]) => void;
}

const COLOR_FIELDS = [
	{ key: "primary", label: "Primary" },
	{ key: "secondary", label: "Secondary" },
	{ key: "accent", label: "Accent" },
	{ key: "bg", label: "Background" },
	{ key: "surface", label: "Surface" },
	{ key: "text", label: "Text" },
	{ key: "muted", label: "Muted" },
	{ key: "link", label: "Link" },
] as const;

export function BrandingTab({ branding, onChange }: Props) {
	const saveMutation = useSaveBranding();

	const update = (key: string, value: string) => {
		onChange({ ...branding, [key]: value });
	};

	const updateColor = (key: string, value: string) => {
		onChange({ ...branding, colors: { ...branding.colors, [key]: value } });
	};

	const handleSave = () => {
		saveMutation.mutate(branding, {
			onSuccess: (d) => toast.success(d.message),
			onError: () => toast.error("Failed to save branding."),
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Palette size={18} />
					Branding
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Site Name */}
				<div className="space-y-1.5">
					<label className="text-sm font-medium">Site Name</label>
					<Input
						value={branding.site_name ?? ""}
						onChange={(e) => update("site_name", e.target.value)}
						placeholder="Your Brand Name"
					/>
				</div>

				{/* Colors */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium">Brand Colors</h3>
					<div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
						{COLOR_FIELDS.map((cf) => (
							<div key={cf.key} className="space-y-1.5">
								<label className="text-xs text-[var(--muted-foreground)]">
									{cf.label}
								</label>
								<div className="flex items-center gap-2">
									<input
										type="color"
										value={branding.colors?.[cf.key] ?? "#000000"}
										onChange={(e) => updateColor(cf.key, e.target.value)}
										className="h-9 w-9 cursor-pointer rounded border border-[var(--input)] bg-transparent p-0.5"
									/>
									<Input
										value={branding.colors?.[cf.key] ?? ""}
										onChange={(e) => updateColor(cf.key, e.target.value)}
										placeholder="#000000"
										className="h-9 font-mono text-xs"
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Legal URLs */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium">Legal Pages</h3>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div className="space-y-1.5">
							<label className="text-xs text-[var(--muted-foreground)]">
								Terms of Service URL
							</label>
							<Input
								value={branding.terms_url ?? ""}
								onChange={(e) => update("terms_url", e.target.value)}
								placeholder="https://example.com/terms"
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-xs text-[var(--muted-foreground)]">
								Privacy Policy URL
							</label>
							<Input
								value={branding.privacy_url ?? ""}
								onChange={(e) => update("privacy_url", e.target.value)}
								placeholder="https://example.com/privacy"
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-xs text-[var(--muted-foreground)]">
								Cookie Policy URL
							</label>
							<Input
								value={branding.cookie_url ?? ""}
								onChange={(e) => update("cookie_url", e.target.value)}
								placeholder="https://example.com/cookies"
							/>
						</div>
					</div>
				</div>

				{/* Support Contact */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium">Support Contact</h3>
					<p className="text-xs text-[var(--muted-foreground)]">
						Shown to your customers in calendar booking confirmations,
						error pages, and "Contact support" links.
					</p>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="space-y-1.5">
							<label className="text-xs text-[var(--muted-foreground)]">
								Support Email
							</label>
							<Input
								type="email"
								value={branding.support_email ?? ""}
								onChange={(e) => update("support_email", e.target.value)}
								placeholder="support@yourbrand.com"
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-xs text-[var(--muted-foreground)]">
								Support / Help URL
							</label>
							<Input
								value={branding.support_url ?? ""}
								onChange={(e) => update("support_url", e.target.value)}
								placeholder="https://yourbrand.com/help"
							/>
						</div>
					</div>
				</div>

				<Button onClick={handleSave} disabled={saveMutation.isPending}>
					<Save size={16} />
					{saveMutation.isPending ? "Saving..." : "Save Branding"}
				</Button>
			</CardContent>
		</Card>
	);
}
