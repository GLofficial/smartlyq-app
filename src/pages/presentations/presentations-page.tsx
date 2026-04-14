import { useIframeAuth } from "@/hooks/use-iframe-auth";

const PRESENTATIONS_URL = "https://presentations.smartlyq.com";

export function PresentationsPage() {
	const { iframeRef, src, onLoad } = useIframeAuth(PRESENTATIONS_URL);

	if (!src) return null;

	return (
		<div className="-m-6 h-[calc(100%+3rem)]">
			<iframe
				ref={iframeRef}
				src={src}
				title="Presentations"
				className="h-full w-full border-0"
				allow="clipboard-write"
				onLoad={onLoad}
			/>
		</div>
	);
}
