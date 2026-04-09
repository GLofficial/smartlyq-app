import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Clock, Save } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useSocialHub, type SocialAccount } from "@/api/social";
import { PlatformIcon } from "./platform-icon";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

export function CreatePostPage() {
	const navigate = useNavigate();
	const { data: hub } = useSocialHub();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
	const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
	const [scheduledTime, setScheduledTime] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const accounts = hub?.accounts ?? [];

	const toggleAccount = (acc: SocialAccount) => {
		const isSelected = selectedAccounts.includes(acc.id);
		if (isSelected) {
			setSelectedAccounts((prev) => prev.filter((id) => id !== acc.id));
			// Remove platform if no other account of same platform selected
			const otherSamePlatform = accounts.some(
				(a) => a.platform === acc.platform && a.id !== acc.id && selectedAccounts.includes(a.id),
			);
			if (!otherSamePlatform) {
				setSelectedPlatforms((prev) => prev.filter((p) => p !== acc.platform));
			}
		} else {
			setSelectedAccounts((prev) => [...prev, acc.id]);
			if (!selectedPlatforms.includes(acc.platform)) {
				setSelectedPlatforms((prev) => [...prev, acc.platform]);
			}
		}
	};

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
		<div className="mx-auto max-w-3xl space-y-6">
			<h1 className="text-2xl font-bold">Create Post</h1>

			{/* Account Selector */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Select Accounts</CardTitle>
				</CardHeader>
				<CardContent>
					{accounts.length === 0 ? (
						<p className="text-sm text-[var(--muted-foreground)]">
							No social accounts connected. Connect accounts in Integrations.
						</p>
					) : (
						<div className="flex flex-wrap gap-2">
							{accounts.map((acc) => (
								<button
									key={acc.id}
									type="button"
									onClick={() => toggleAccount(acc)}
									className={cn(
										"flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
										selectedAccounts.includes(acc.id)
											? "border-[var(--sq-primary)] bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)]"
											: "border-[var(--border)] hover:border-[var(--sq-primary)]",
									)}
								>
									{acc.profile_picture ? (
										<img src={acc.profile_picture} alt="" className="h-6 w-6 rounded-full" />
									) : (
										<PlatformIcon platform={acc.platform} size={16} />
									)}
									<span>{acc.account_name}</span>
									<PlatformIcon platform={acc.platform} size={12} />
								</button>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Content */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Content</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Input
						placeholder="Post title (optional)"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<textarea
						className="flex min-h-[150px] w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
						placeholder="What would you like to share?"
						value={content}
						onChange={(e) => setContent(e.target.value)}
					/>
				</CardContent>
			</Card>

			{/* Schedule */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Schedule</CardTitle>
				</CardHeader>
				<CardContent>
					<Input
						type="datetime-local"
						value={scheduledTime}
						onChange={(e) => setScheduledTime(e.target.value)}
					/>
				</CardContent>
			</Card>

			{/* Actions */}
			<div className="flex items-center gap-3">
				<Button variant="outline" onClick={() => handleSubmit("save_draft")} disabled={submitting}>
					<Save size={16} />
					Save Draft
				</Button>
				<Button
					variant="outline"
					onClick={() => handleSubmit("scheduled")}
					disabled={submitting || !scheduledTime}
				>
					<Clock size={16} />
					Schedule
				</Button>
				<Button onClick={() => handleSubmit("post_now")} disabled={submitting}>
					<Send size={16} />
					{submitting ? "Posting..." : "Post Now"}
				</Button>
			</div>
		</div>
	);
}
