import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { useSaveModules } from "@/api/whitelabel";

const MODULE_DEFS = [
	{ key: "social_media", label: "Social Media", desc: "Publish & schedule to social platforms" },
	{ key: "ai_captain", label: "AI Captain", desc: "AI assistant with tools & code execution" },
	{ key: "chatbot", label: "Chatbot Builder", desc: "Build and deploy AI chatbots" },
	{ key: "video_editor", label: "Video Editor", desc: "AI-powered video creation" },
	{ key: "content_gen", label: "Content Generation", desc: "AI writing & image generation" },
	{ key: "analytics", label: "Analytics", desc: "Dashboard & reporting" },
	{ key: "ad_manager", label: "Ad Manager", desc: "Manage social media ads" },
	{ key: "url_shortener", label: "URL Shortener", desc: "Branded short links" },
	{ key: "media_library", label: "Media Library", desc: "Centralized asset management" },
	{ key: "inbox", label: "Social Inbox", desc: "Unified message inbox" },
	{ key: "boards", label: "Boards", desc: "Knowledge boards for AI Captain" },
	{ key: "brands", label: "Brands", desc: "Multi-brand management" },
];

interface Props {
	modules: Record<string, boolean>;
	onChange: (modules: Record<string, boolean>) => void;
}

export function ModulesTab({ modules, onChange }: Props) {
	const saveMutation = useSaveModules();

	const toggle = (key: string) => {
		onChange({ ...modules, [key]: !modules[key] });
	};

	const handleSave = () => {
		saveMutation.mutate(modules, {
			onSuccess: (d) => toast.success(d.message),
			onError: () => toast.error("Failed to save module settings."),
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<LayoutGrid size={18} />
					Module Toggles
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5">
				<p className="text-sm text-[var(--muted-foreground)]">
					Enable or disable modules for your whitelabel tenants. Disabled modules
					will be hidden from the navigation and inaccessible.
				</p>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{MODULE_DEFS.map((m) => (
						<label
							key={m.key}
							className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] p-3 transition-colors hover:bg-[var(--accent)]"
						>
							<input
								type="checkbox"
								checked={modules[m.key] ?? false}
								onChange={() => toggle(m.key)}
								className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--sq-primary)] accent-[var(--sq-primary)]"
							/>
							<div className="min-w-0">
								<p className="text-sm font-medium">{m.label}</p>
								<p className="text-xs text-[var(--muted-foreground)]">
									{m.desc}
								</p>
							</div>
						</label>
					))}
				</div>

				<Button onClick={handleSave} disabled={saveMutation.isPending}>
					<Save size={16} />
					{saveMutation.isPending ? "Saving..." : "Save Modules"}
				</Button>
			</CardContent>
		</Card>
	);
}
