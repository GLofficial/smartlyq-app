import { useIframeAuth } from "@/hooks/use-iframe-auth";

const VIDEO_EDITOR_URL = "https://video.smartlyq.com";

export function VideoEditorPage() {
	const { iframeRef, src, onLoad } = useIframeAuth(VIDEO_EDITOR_URL);

	if (!src) return null;

	return (
		<div className="-m-6 h-[calc(100%+3rem)]">
			<iframe
				ref={iframeRef}
				src={src}
				title="Video Editor"
				className="h-full w-full border-0"
				allow="clipboard-write; camera; microphone"
				onLoad={onLoad}
			/>
		</div>
	);
}
