import { useIframeAuth } from "@/hooks/use-iframe-auth";

const CAPTAIN_URL = "https://captain.smartlyq.com";

export function CaptainPage() {
	const { iframeRef, onLoad } = useIframeAuth(CAPTAIN_URL);

	return (
		<div className="h-[calc(100vh-8rem)]">
			<iframe
				ref={iframeRef}
				src={CAPTAIN_URL}
				title="AI Captain"
				className="h-full w-full rounded-lg border border-[var(--border)]"
				allow="clipboard-write"
				onLoad={onLoad}
			/>
		</div>
	);
}
