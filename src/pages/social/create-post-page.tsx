import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PostComposer from "./PostComposer";
import PostPreview from "./PostPreview";

interface LocationState {
  prefillDate?: string;
  prefillTime?: string;
  editPost?: {
    content: string;
    platforms: string[];
    date?: string;
    time?: string;
  };
}

export function CreatePostPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    state?.editPost?.platforms || ["bluesky", "facebook", "instagram"]
  );
  const [content, setContent] = useState(state?.editPost?.content || "");
  const [platformContent, setPlatformContent] = useState<Record<string, string>>({});
  const [customizeChannel, setCustomizeChannel] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [platformPostType, setPlatformPostType] = useState<Record<string, string>>({});
  const [scheduledDate] = useState<string | undefined>(
    state?.prefillDate || state?.editPost?.date
  );
  const [scheduledTime] = useState<string | undefined>(
    state?.prefillTime || state?.editPost?.time
  );

  useEffect(() => {
    if (state) {
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 max-w-6xl mx-auto">
        <PostComposer
          selectedPlatforms={selectedPlatforms}
          onPlatformsChange={setSelectedPlatforms}
          content={content}
          onContentChange={setContent}
          platformContent={platformContent}
          onPlatformContentChange={setPlatformContent}
          customizeChannel={customizeChannel}
          onCustomizeChannelChange={setCustomizeChannel}
          onImageCountChange={setImageCount}
          onPostTypeChange={setPlatformPostType}
          initialScheduledDate={scheduledDate}
          initialScheduledTime={scheduledTime}
        />
        <PostPreview
          selectedPlatforms={selectedPlatforms}
          content={content}
          platformContent={platformContent}
          customizeChannel={customizeChannel}
          imageCount={imageCount}
          platformPostType={platformPostType}
        />
      </div>
    </div>
  );
}
