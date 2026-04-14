import { useIframeAuth } from "@/hooks/use-iframe-auth";

const PRESENTATIONS_URL = "https://presentations.smartlyq.com";

export function PresentationsPage() {
	const { iframeRef, onLoad } = useIframeAuth(PRESENTATIONS_URL);

	return (
		<div className="-m-6 h-[calc(100%+3rem)]">
			<iframe
				ref={iframeRef}
				src={PRESENTATIONS_URL}
				title="Presentations"
				className="h-full w-full border-0"
				allow="clipboard-write"
				onLoad={onLoad}
			/>
		</div>
	);
}
