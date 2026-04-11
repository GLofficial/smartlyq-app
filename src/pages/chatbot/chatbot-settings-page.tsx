import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Save } from "lucide-react";
import { useChatbotSettings, useSaveChatbotSettings } from "@/api/chatbot";
import { toast } from "sonner";

export function ChatbotSettingsPage() {
	const { data, isLoading } = useChatbotSettings();
	const saveMut = useSaveChatbotSettings();
	const [edits, setEdits] = useState<Record<string, string>>({});
	const [initialized, setInitialized] = useState(false);

	// Seed local edits from server data once
	if (data?.settings && !initialized) {
		setEdits(data.settings);
		setInitialized(true);
	}

	const update = (key: string, value: string) =>
		setEdits((prev) => ({ ...prev, [key]: value }));

	const handleSave = () => {
		saveMut.mutate(edits, {
			onSuccess: () => toast.success("Settings saved."),
			onError: () => toast.error("Failed to save settings."),
		});
	};

	if (isLoading) {
		return (
			<div className="flex h-40 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<h1 className="text-2xl font-bold">Chatbot Settings</h1>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Settings size={18} /> Default Configuration
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-1">
						<label className="text-sm font-medium">Default Provider</label>
						<Input value={edits.chatbot_default_provider ?? ""} onChange={(e) => update("chatbot_default_provider", e.target.value)} placeholder="openai" />
					</div>
					<div className="space-y-1">
						<label className="text-sm font-medium">Default Model</label>
						<Input value={edits.chatbot_default_model ?? ""} onChange={(e) => update("chatbot_default_model", e.target.value)} placeholder="gpt-4o-mini" />
					</div>
					<div className="space-y-1">
						<label className="text-sm font-medium">Default Instruction</label>
						<textarea
							className="flex min-h-[80px] w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
							value={edits.chatbot_default_instruction ?? ""}
							onChange={(e) => update("chatbot_default_instruction", e.target.value)}
							placeholder="Default system instruction..."
						/>
					</div>
					<div className="space-y-1">
						<label className="text-sm font-medium">Default Welcome Message</label>
						<Input value={edits.chatbot_default_welcome ?? ""} onChange={(e) => update("chatbot_default_welcome", e.target.value)} placeholder="Hi! How can I help?" />
					</div>
					<div className="space-y-1">
						<label className="text-sm font-medium">Default Primary Color</label>
						<div className="flex items-center gap-3">
							<input type="color" value={edits.chatbot_default_primary_color ?? "#377DEE"} onChange={(e) => update("chatbot_default_primary_color", e.target.value)} className="h-10 w-14 cursor-pointer rounded border" />
							<Input value={edits.chatbot_default_primary_color ?? ""} onChange={(e) => update("chatbot_default_primary_color", e.target.value)} className="w-32" />
						</div>
					</div>

					<Button onClick={handleSave} disabled={saveMut.isPending}>
						<Save size={16} /> {saveMut.isPending ? "Saving..." : "Save Settings"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
