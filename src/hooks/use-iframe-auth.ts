import { useEffect, useRef, useCallback } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Shared hook for embedding external apps in iframes with postMessage auth.
 *
 * Instead of passing JWT via URL (visible in logs, browser history, server access logs),
 * this sends the token via postMessage after the iframe loads.
 *
 * The child app must:
 * 1. Listen for { type: "sq_auth", token } messages from the parent origin
 * 2. Optionally send { type: "sq_auth_request" } to request the token
 *
 * Usage:
 *   const { iframeRef, onLoad } = useIframeAuth("https://captain.smartlyq.com");
 *   <iframe ref={iframeRef} src="https://captain.smartlyq.com" onLoad={onLoad} />
 */
export function useIframeAuth(targetOrigin: string) {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const sendToken = useCallback(() => {
		const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
		if (token && iframeRef.current?.contentWindow) {
			iframeRef.current.contentWindow.postMessage(
				{ type: "sq_auth", token },
				targetOrigin,
			);
		}
	}, [targetOrigin]);

	useEffect(() => {
		// Respond to token requests from the iframe
		const handler = (e: MessageEvent) => {
			if (e.origin === targetOrigin && e.data?.type === "sq_auth_request") {
				sendToken();
			}
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [targetOrigin, sendToken]);

	return { iframeRef, onLoad: sendToken };
}
