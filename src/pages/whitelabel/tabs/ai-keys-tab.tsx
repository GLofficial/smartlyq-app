import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Key } from "lucide-react";
import { toast } from "sonner";
import { useSaveAiKeys } from "@/api/whitelabel";

const KEY_FIELDS = [
	{ key: "openai", label: "OpenAI", placeholder: "sk-..." },
	{ key: "anthropic", label: "Anthropic", placeholder: "sk-ant-..." },
	{ key: "deepseek", label: "DeepSeek", placeholder: "sk-..." },
	{ key: "gemini", label: "Google Gemini", placeholder: "AIza..." },
	{ key: "xai", label: "xAI (Grok)", placeholder: "xai-..." },
	{ key: "bfl", label: "Black Forest Labs", placeholder: "bfl-..." },
	{ key: "recraft", label: "Recraft", placeholder: "recraft-..." },
	{ key: "search_engine", label: "Search Engine API", placeholder: "API key" },
	{ key: "youtube", label: "YouTube Data API", placeholder: "AIza..." },
];

interface Props {
	keys: Record<string, string>;
	onChange: (keys: Record<string, string>) => void;
}

export function AiKeysTab({ keys, onChange }: Props) {
	const saveMutation = useSaveAiKeys();

	const update = (key: string, value: string) => {
		onChange({ ...keys, [key]: value });
	};

	const handleSave = () => {
		saveMutation.mutate(keys, {
			onSuccess: (d) => toast.success(d.message),
			onError: () => toast.error("Failed to save AI keys."),
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Key size={18} />
					AI API Keys
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5">
				<p className="text-sm text-[var(--muted-foreground)]">
					Provide your own API keys so your whitelabel tenants use your accounts
					instead of the platform defaults. Keys are stored encrypted.
				</p>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{KEY_FIELDS.map((f) => (
						<div key={f.key} className="space-y-1.5">
							<label className="text-sm font-medium">{f.label}</label>
							<Input
								type="password"
								value={keys[f.key] ?? ""}
								onChange={(e) => update(f.key, e.target.value)}
								placeholder={f.placeholder}
							/>
						</div>
					))}
				</div>

				<Button onClick={handleSave} disabled={saveMutation.isPending}>
					<Save size={16} />
					{saveMutation.isPending ? "Saving..." : "Save API Keys"}
				</Button>
			</CardContent>
		</Card>
	);
}
