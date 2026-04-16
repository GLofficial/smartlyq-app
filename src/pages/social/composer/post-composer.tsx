import { useState } from "react";
import { PostAccountSelector, type SocialAccount } from "./post-account-selector";
import { PostContentEditor } from "./post-content-editor";
import { PostPlatformOptions } from "./post-platform-options";
import { PostMediaManager, type MediaItem } from "./post-media-manager";
import { AiTextModal, AiImageModal, AiVideoModal, CanvaModal, HashtagModal, LinkModal } from "./post-ai-modals";
import { PostActionsBar } from "./post-actions-bar";
import { UtmTrackingSection, LabelsSection } from "./post-utm-labels";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  onImageCountChange?: (count: number) => void;
  onPostTypeChange?: (postTypes: Record<string, string>) => void;
}

export function PostComposer(props: PostComposerProps) {
  const {
    accounts, selectedAccountIds, onAccountsChange,
    content, onContentChange, platformContent, onPlatformContentChange,
    customizeChannel, onCustomizeChannelChange,
    media, onMediaChange, onSaveDraft, onSchedule, onPostNow, isSubmitting,
    onImageCountChange, onPostTypeChange,
  } = props;

  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const selectedPlatforms = [...new Set(
    safeAccounts.filter((a) => a && a.platform && selectedAccountIds.includes(a.id)).map((a) => a.platform).filter(Boolean),
  )];

  const [platformSettings, setPlatformSettings] = useState<Record<string, Record<string, any>>>({});
  const [platformPostType, setPlatformPostType] = useState<Record<string, string>>({});
  const [utmValues, setUtmValues] = useState({ source: "", medium: "", campaign: "", term: "", content: "" });
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  // Modal state
  const [aiTextOpen, setAiTextOpen] = useState(false);
  const [aiImageOpen, setAiImageOpen] = useState(false);
  const [aiVideoOpen, setAiVideoOpen] = useState(false);
  const [canvaOpen, setCanvaOpen] = useState(false);
  const [hashtagOpen, setHashtagOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);

  function handleSettingsChange(platform: string, key: string, value: any) {
    setPlatformSettings((prev) => ({ ...prev, [platform]: { ...(prev[platform] ?? {}), [key]: value } }));
  }

  function handlePostTypeChange(platform: string, type: string) {
    const next = { ...platformPostType, [platform]: type };
    setPlatformPostType(next);
    onPostTypeChange?.(next);
  }

  function handleAiTextUse(text: string) { onContentChange(content + text); }
  function handleImageUpload() {
    const newItem: MediaItem = { id: String(Date.now()), url: "", type: "image", name: "AI Generated" };
    onMediaChange([...media, newItem]);
    onImageCountChange?.(media.length + 1);
  }

  const hasContent = content.trim().length > 0;
  const hasAccounts = selectedAccountIds.length > 0;

  return (
    <div className="flex-1 min-w-0 space-y-4">
      {/* Account Selector */}
      <PostAccountSelector accounts={accounts} selectedIds={selectedAccountIds} onSelectionChange={onAccountsChange} />

      {/* Content Editor */}
      <PostContentEditor
        content={content} onContentChange={onContentChange}
        platformContent={platformContent} onPlatformContentChange={onPlatformContentChange}
        customizeChannel={customizeChannel} onCustomizeChannelChange={onCustomizeChannelChange}
        selectedPlatforms={selectedPlatforms}
        onOpenAiText={() => setAiTextOpen(true)}
        onOpenAiImage={() => setAiImageOpen(true)}
        onOpenAiVideo={() => setAiVideoOpen(true)}
        onOpenCanva={() => setCanvaOpen(true)}
        onOpenHashtag={() => setHashtagOpen(true)}
        onOpenLink={() => setLinkOpen(true)}
      />

      {/* Media Manager */}
      <PostMediaManager media={media} onMediaChange={(m) => { onMediaChange(m); onImageCountChange?.(m.length); }} />

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
      <UtmTrackingSection values={utmValues} onChange={setUtmValues} selectedPlatforms={selectedPlatforms} />

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
      <CanvaModal open={canvaOpen} onClose={() => setCanvaOpen(false)} />
      <HashtagModal open={hashtagOpen} onClose={() => setHashtagOpen(false)} onAdd={(text) => onContentChange(content + text)} />
      <LinkModal open={linkOpen} onClose={() => setLinkOpen(false)} onAdd={(url) => onContentChange(content + (content ? " " : "") + url)} />
    </div>
  );
}

export { type MediaItem } from "./post-media-manager";
