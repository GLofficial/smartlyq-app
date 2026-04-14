import { useEffect, useRef, useCallback, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Shared hook for embedding external apps in iframes with JWT auth.
 *
 * Primary: passes token via ?token= URL param (instant, reliable).
 * Backup: also sends via postMessage after iframe loads (handles edge cases).
 *
 * Usage:
 *   const { iframeRef, src, onLoad } = useIframeAuth("https://captain.smartlyq.com");
 *   <iframe ref={iframeRef} src={src} onLoad={onLoad} />
 */
export function useIframeAuth(baseUrl: string) {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [src, setSrc] = useState("");

	// Build iframe URL with token on mount
	useEffect(() => {
		const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
		setSrc(token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl);
	}, [baseUrl]);

	// Also send token via postMessage after iframe loads (backup)
	const sendToken = useCallback(() => {
		const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
		if (token && iframeRef.current?.contentWindow) {
			iframeRef.current.contentWindow.postMessage(
				{ type: "sq_auth", token },
				baseUrl,
			);
		}
	}, [baseUrl]);

	useEffect(() => {
		const handler = (e: MessageEvent) => {
			if (e.origin === baseUrl && e.data?.type === "sq_auth_request") {
				sendToken();
			}
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [baseUrl, sendToken]);

	return { iframeRef, src, onLoad: sendToken };
}
