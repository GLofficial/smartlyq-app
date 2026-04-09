import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Clock, Save } from "lucide-react";
import type { SocialAccount } from "@/api/social";
import { PlatformIcon } from "./platform-icon";
import { cn } from "@/lib/cn";

interface CreatePostEditorProps {
	accounts: SocialAccount[];
	title: string;
	content: string;
	selectedAccounts: number[];
	scheduledTime: string;
	submitting: boolean;
	onTitleChange: (v: string) => void;
	onContentChange: (v: string) => void;
	onToggleAccount: (acc: SocialAccount) => void;
	onScheduledTimeChange: (v: string) => void;
	onSubmit: (action: "save_draft" | "scheduled" | "post_now") => void;
}

export function CreatePostEditor({
	accounts,
	title,
	content,
	selectedAccounts,
	scheduledTime,
	submitting,
	onTitleChange,
	onContentChange,
	onToggleAccount,
	onScheduledTimeChange,
	onSubmit,
}: CreatePostEditorProps) {
	return (
		<div className="space-y-4">
			{/* Account Selector */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">Select Accounts</CardTitle>
				</CardHeader>
				<CardContent>
					{accounts.length === 0 ? (
						<p className="text-sm text-[var(--muted-foreground)]">
							No social accounts connected.
						</p>
					) : (
						<div className="flex flex-wrap gap-2">
							{accounts.map((acc) => (
								<button
									key={acc.id}
									type="button"
									onClick={() => onToggleAccount(acc)}
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
									<span className="truncate max-w-[120px]">{acc.account_name}</span>
									<PlatformIcon platform={acc.platform} size={12} />
								</button>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Content */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">Content</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Input
						placeholder="Post title (optional)"
						value={title}
						onChange={(e) => onTitleChange(e.target.value)}
					/>
					<textarea
						className="flex min-h-[180px] w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] resize-none"
						placeholder="What would you like to share?"
						value={content}
						onChange={(e) => onContentChange(e.target.value)}
					/>
				</CardContent>
			</Card>

			{/* Schedule */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-medium">Schedule</CardTitle>
				</CardHeader>
				<CardContent>
					<Input
						type="datetime-local"
						value={scheduledTime}
						onChange={(e) => onScheduledTimeChange(e.target.value)}
					/>
				</CardContent>
			</Card>

			{/* Actions */}
			<div className="flex items-center gap-3">
				<Button variant="outline" onClick={() => onSubmit("save_draft")} disabled={submitting}>
					<Save size={16} /> Draft
				</Button>
				<Button
					variant="outline"
					onClick={() => onSubmit("scheduled")}
					disabled={submitting || !scheduledTime}
				>
					<Clock size={16} /> Schedule
				</Button>
				<Button onClick={() => onSubmit("post_now")} disabled={submitting}>
					<Send size={16} /> {submitting ? "Posting..." : "Post Now"}
				</Button>
			</div>
		</div>
	);
}
