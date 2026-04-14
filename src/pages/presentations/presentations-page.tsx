import { useIframeAuth } from "@/hooks/use-iframe-auth";

const PRESENTATIONS_URL = "https://presentations.smartlyq.com";

export function PresentationsPage() {
	const { iframeRef, onLoad } = useIframeAuth(PRESENTATIONS_URL);

	return (
		<div className="h-[calc(100vh-8rem)]">
			<iframe
				ref={iframeRef}
				src={PRESENTATIONS_URL}
				title="Presentations"
				className="h-full w-full rounded-lg border border-[var(--border)]"
				allow="clipboard-write"
				onLoad={onLoad}
			/>
		</div>
	);
}
