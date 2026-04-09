import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Mail } from "lucide-react";
import { toast } from "sonner";
import type { WhitelabelSettings } from "@/api/whitelabel";
import { useSaveSmtp } from "@/api/whitelabel";

interface Props {
	smtp: WhitelabelSettings["smtp"];
	onChange: (smtp: WhitelabelSettings["smtp"]) => void;
}

export function EmailTab({ smtp, onChange }: Props) {
	const saveMutation = useSaveSmtp();

	const update = (key: string, value: string | boolean | number) => {
		onChange({ ...smtp, [key]: value });
	};

	const handleSave = () => {
		saveMutation.mutate(smtp, {
			onSuccess: (d) => toast.success(d.message),
			onError: () => toast.error("Failed to save SMTP settings."),
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Mail size={18} />
					Email / SMTP Settings
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Enable toggle */}
				<div className="flex items-center gap-3">
					<label className="relative inline-flex cursor-pointer items-center">
						<input
							type="checkbox"
							checked={smtp.enabled ?? false}
							onChange={(e) => update("enabled", e.target.checked)}
							className="peer sr-only"
						/>
						<div className="h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[var(--sq-primary)] peer-checked:after:translate-x-full" />
					</label>
					<span className="text-sm font-medium">
						{smtp.enabled ? "Custom SMTP Enabled" : "Using Default Mail"}
					</span>
				</div>

				{smtp.enabled && (
					<>
						{/* Server Settings */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-1.5">
								<label className="text-sm font-medium">SMTP Host</label>
								<Input
									value={smtp.host ?? ""}
									onChange={(e) => update("host", e.target.value)}
									placeholder="smtp.example.com"
								/>
							</div>
							<div className="space-y-1.5">
								<label className="text-sm font-medium">Port</label>
								<Input
									type="number"
									value={smtp.port ?? 587}
									onChange={(e) => update("port", Number(e.target.value))}
									placeholder="587"
								/>
							</div>
							<div className="space-y-1.5">
								<label className="text-sm font-medium">Username</label>
								<Input
									value={smtp.username ?? ""}
									onChange={(e) => update("username", e.target.value)}
									placeholder="user@example.com"
								/>
							</div>
							<div className="space-y-1.5">
								<label className="text-sm font-medium">Password</label>
								<Input
									type="password"
									value={smtp.password ?? ""}
									onChange={(e) => update("password", e.target.value)}
									placeholder="********"
								/>
							</div>
						</div>

						{/* Encryption */}
						<div className="space-y-1.5">
							<label className="text-sm font-medium">Encryption</label>
							<select
								value={smtp.encryption ?? "tls"}
								onChange={(e) => update("encryption", e.target.value)}
								className="flex h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
							>
								<option value="tls">TLS</option>
								<option value="ssl">SSL</option>
								<option value="none">None</option>
							</select>
						</div>

						{/* From / Reply-to */}
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div className="space-y-1.5">
								<label className="text-sm font-medium">From Email</label>
								<Input
									value={smtp.from_email ?? ""}
									onChange={(e) => update("from_email", e.target.value)}
									placeholder="noreply@example.com"
								/>
							</div>
							<div className="space-y-1.5">
								<label className="text-sm font-medium">From Name</label>
								<Input
									value={smtp.from_name ?? ""}
									onChange={(e) => update("from_name", e.target.value)}
									placeholder="Your Brand"
								/>
							</div>
							<div className="space-y-1.5">
								<label className="text-sm font-medium">Reply-To</label>
								<Input
									value={smtp.reply_to ?? ""}
									onChange={(e) => update("reply_to", e.target.value)}
									placeholder="support@example.com"
								/>
							</div>
						</div>
					</>
				)}

				<Button onClick={handleSave} disabled={saveMutation.isPending}>
					<Save size={16} />
					{saveMutation.isPending ? "Saving..." : "Save Email Settings"}
				</Button>
			</CardContent>
		</Card>
	);
}
