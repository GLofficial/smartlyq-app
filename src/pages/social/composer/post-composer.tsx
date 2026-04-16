import { useState } from "react";
import { PostAccountSelector, type SocialAccount } from "./post-account-selector";
import { PostContentEditor } from "./post-content-editor";
import { PostPlatformOptions } from "./post-platform-options";
import { PostMediaManager, type MediaItem } from "./post-media-manager";
import { AiTextModal, AiImageModal, AiVideoModal } from "./post-ai-modals";
import { PostActionsBar } from "./post-actions-bar";
import { UtmTrackingSection, LabelsSection } from "./post-utm-labels";

interface PostComposerProps {
	accounts: SocialAccount[];
	selectedAccountIds: number[];
	onAccountsChange: (ids: number[]) => void;
	content: string;
	onContentChange: (val: string) => void;
	platformContent: Record<string, string>;
	onPlatformContentChange: (pc: Record<string, string>) => void;
	customizeChannel: boolean;
	onCustomizeChannelChange: (val: boolean) => void;
	media: MediaItem[];
	onMediaChange: (media: MediaItem[]) => void;
	onSaveDraft: () => void;
	onSchedule: (date: string, time: string) => void;
	onPostNow: () => void;
	isSubmitting: boolean;
}

export function PostComposer(props: PostComposerProps) {
	const {
		accounts, selectedAccountIds, onAccountsChange,
		content, onContentChange, platformContent, onPlatformContentChange,
		customizeChannel, onCustomizeChannelChange,
		media, onMediaChange, onSaveDraft, onSchedule, onPostNow, isSubmitting,
	} = props;

	// Derive selected platforms from selected accounts
	const safeAccounts = Array.isArray(accounts) ? accounts : [];
	const selectedPlatforms = [...new Set(
		safeAccounts.filter((a) => a && selectedAccountIds.includes(a.id)).map((a) => a.platform).filter(Boolean)
	)];

	// Platform settings state
	const [platformSettings, setPlatformSettings] = useState<Record<string, Record<string, any>>>({});
	const [platformPostType, setPlatformPostType] = useState<Record<string, string>>({});

	// UTM + Labels state
	const [utmValues, setUtmValues] = useState({ source: "", medium: "", campaign: "", term: "", content: "" });
	const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

	// AI modal state
	const [aiTextOpen, setAiTextOpen] = useState(false);
	const [aiImageOpen, setAiImageOpen] = useState(false);
	const [aiVideoOpen, setAiVideoOpen] = useState(false);

	// Media upload state (for future use)

	function handleSettingsChange(platform: string, key: string, value: any) {
		setPlatformSettings((prev) => ({ ...prev, [platform]: { ...(prev[platform] ?? {}), [key]: value } }));
	}

	function handlePostTypeChange(platform: string, type: string) {
		setPlatformPostType((prev) => ({ ...prev, [platform]: type }));
	}

	function handleAiTextUse(text: string) {
		onContentChange(text);
	}

	function handleImageUpload() {
		// Add a placeholder — real implementation would upload to R2
		const newItem: MediaItem = { id: String(Date.now()), url: "", type: "image", name: "AI Generated" };
		onMediaChange([...media, newItem]);
	}

	const hasContent = content.trim().length > 0;
	const hasAccounts = selectedAccountIds.length > 0;

	return (
		<div className="space-y-5">
			{/* Account Selector */}
			<div>
				<p className="text-sm font-semibold text-[var(--sq-primary)] mb-2">Select Accounts</p>
				<PostAccountSelector accounts={accounts} selectedIds={selectedAccountIds} onSelectionChange={onAccountsChange} />
			</div>

			{/* Content Editor (toolbar + textarea + char counter) */}
			{selectedAccountIds.length > 0 && (
				<div>
					<PostContentEditor
						content={content} onContentChange={onContentChange}
						platformContent={platformContent} onPlatformContentChange={onPlatformContentChange}
						customizeChannel={customizeChannel} onCustomizeChannelChange={onCustomizeChannelChange}
						selectedPlatforms={selectedPlatforms}
						onOpenAiText={() => setAiTextOpen(true)}
						onOpenAiImage={() => setAiImageOpen(true)}
						onOpenAiVideo={() => setAiVideoOpen(true)}
					/>
				</div>
			)}

			{/* Media Manager */}
			<PostMediaManager media={media} onMediaChange={onMediaChange} />

			{/* Platform-specific options */}
			{selectedPlatforms.length > 0 && (
				<PostPlatformOptions
					selectedPlatforms={selectedPlatforms}
					platformSettings={platformSettings}
					onSettingsChange={handleSettingsChange}
					platformPostType={platformPostType}
					onPostTypeChange={handlePostTypeChange}
				/>
			)}

			{/* UTM Tracking */}
			<UtmTrackingSection values={utmValues} onChange={setUtmValues} />

			{/* Labels */}
			<LabelsSection selectedLabels={selectedLabels} onLabelsChange={setSelectedLabels} />

			{/* Action buttons */}
			<PostActionsBar
				onSaveDraft={onSaveDraft} onSchedule={onSchedule} onPostNow={onPostNow}
				isSubmitting={isSubmitting} hasContent={hasContent} hasAccounts={hasAccounts}
			/>

			{/* AI Modals */}
			<AiTextModal open={aiTextOpen} onClose={() => setAiTextOpen(false)} onUse={handleAiTextUse} />
			<AiImageModal open={aiImageOpen} onClose={() => setAiImageOpen(false)} onUse={handleImageUpload} />
			<AiVideoModal open={aiVideoOpen} onClose={() => setAiVideoOpen(false)} onUse={handleImageUpload} />
		</div>
	);
}

export { type MediaItem } from "./post-media-manager";
