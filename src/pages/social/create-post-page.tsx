import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { useSocialHub, type SocialAccount } from "@/api/social";
import { CreatePostEditor } from "./create-post-editor";
import { PreviewPanel } from "./previews/preview-panel";
import { toast } from "sonner";

export function CreatePostPage() {
	const navigate = useNavigate();
	const { data: hub } = useSocialHub();
	const accounts = hub?.accounts ?? [];

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
	const [scheduledTime, setScheduledTime] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const toggleAccount = (acc: SocialAccount) => {
		const isSelected = selectedAccounts.includes(acc.id);
		if (isSelected) {
			setSelectedAccounts((prev) => prev.filter((id) => id !== acc.id));
			const otherSame = accounts.some(
				(a) => a.platform === acc.platform && a.id !== acc.id && selectedAccounts.includes(a.id),
			);
			if (!otherSame) {
				setSelectedPlatforms((prev) => prev.filter((p) => p !== acc.platform));
			}
		} else {
			setSelectedAccounts((prev) => [...prev, acc.id]);
			if (!selectedPlatforms.includes(acc.platform)) {
				setSelectedPlatforms((prev) => [...prev, acc.platform]);
			}
		}
	};

	// Get the first selected account for preview
	const activeAccount = accounts.find((a) => selectedAccounts.includes(a.id)) ?? null;
	const previewAccount = activeAccount
		? {
				name: activeAccount.account_name,
				username: activeAccount.account_username || activeAccount.account_name,
				avatar: activeAccount.profile_picture,
				platform: activeAccount.platform,
			}
		: null;

	const handleSubmit = async (action: "save_draft" | "scheduled" | "post_now") => {
		if (!content.trim() && !title.trim()) {
			toast.error("Enter content or a title.");
			return;
		}
		if (action !== "save_draft" && selectedPlatforms.length === 0) {
			toast.error("Select at least one account.");
			return;
		}
		if (action === "scheduled" && !scheduledTime) {
			toast.error("Pick a scheduled time.");
			return;
		}

		setSubmitting(true);
		try {
			const res = await apiClient.post<{ message: string }>("/api/spa/social/posts/create", {
				title,
				content,
				platforms: selectedPlatforms,
				selected_accounts: selectedAccounts,
				action,
				scheduled_time: scheduledTime || null,
				media_urls: [],
			});
			toast.success(res.message);
			navigate("/my/social-media");
		} catch (err) {
			toast.error((err as { message?: string })?.message ?? "Failed to create post.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Create Post</h1>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Left: Editor */}
				<div>
					<CreatePostEditor
						accounts={accounts}
						title={title}
						content={content}
						selectedAccounts={selectedAccounts}
						scheduledTime={scheduledTime}
						submitting={submitting}
						onTitleChange={setTitle}
						onContentChange={setContent}
						onToggleAccount={toggleAccount}
						onScheduledTimeChange={setScheduledTime}
						onSubmit={handleSubmit}
					/>
				</div>

				{/* Right: Live Preview */}
				<div className="lg:sticky lg:top-0 lg:h-[calc(100vh-10rem)] lg:overflow-y-auto">
					<div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
						<h2 className="mb-3 text-sm font-medium text-[var(--muted-foreground)]">
							Live Preview
						</h2>
						<PreviewPanel
							platforms={selectedPlatforms}
							content={content}
							media={[]}
							account={previewAccount}
							title={title}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
