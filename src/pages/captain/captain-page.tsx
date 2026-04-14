import { useEffect, useRef, useCallback } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

const CAPTAIN_ORIGIN = "https://captain.smartlyq.com";

/**
 * Embeds AI Captain (React app at captain.smartlyq.com) inside the unified shell.
 * Sends JWT via postMessage after iframe loads — keeps token out of URL/logs.
 */
export function CaptainPage() {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const sendToken = useCallback(() => {
		const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
		if (token && iframeRef.current?.contentWindow) {
			iframeRef.current.contentWindow.postMessage(
				{ type: "sq_auth", token },
				CAPTAIN_ORIGIN
			);
		}
	}, []);

	useEffect(() => {
		// Also respond to token requests from the iframe (in case it loads before message)
		const handler = (e: MessageEvent) => {
			if (e.origin === CAPTAIN_ORIGIN && e.data?.type === "sq_auth_request") {
				sendToken();
			}
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [sendToken]);

	return (
		<div className="h-[calc(100vh-8rem)]">
			<iframe
				ref={iframeRef}
				src={CAPTAIN_ORIGIN}
				title="AI Captain"
				className="h-full w-full rounded-lg border border-[var(--border)]"
				allow="clipboard-write"
				onLoad={sendToken}
			/>
		</div>
	);
}
