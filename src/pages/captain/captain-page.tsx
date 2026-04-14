import { useIframeAuth } from "@/hooks/use-iframe-auth";

const CAPTAIN_URL = "https://captain.smartlyq.com";

export function CaptainPage() {
	const { iframeRef, src, onLoad } = useIframeAuth(CAPTAIN_URL);

	if (!src) return null;

	return (
		<div className="-m-6 h-[calc(100%+3rem)]">
			<iframe
				ref={iframeRef}
				src={src}
				title="AI Captain"
				className="h-full w-full border-0"
				allow="clipboard-write"
				onLoad={onLoad}
			/>
		</div>
	);
}
