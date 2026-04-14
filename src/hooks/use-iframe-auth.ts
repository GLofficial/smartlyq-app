import { useEffect, useRef, useCallback, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Map of iframe base URLs to the SPA endpoint that mints a proper JWT for that app.
 * Each endpoint returns { redirect_url, token } with a full JWT (name, email, iss, etc.).
 */
const TOKEN_ENDPOINTS: Record<string, { url: string; method: string }> = {
	"https://captain.smartlyq.com": { url: "/api/spa/external/captain", method: "GET" },
	"https://presentations.smartlyq.com": { url: "/api/spa/external/presentations", method: "GET" },
	"https://video.smartlyq.com": { url: "/api/spa/external/video-editor/token", method: "POST" },
};

/**
 * Shared hook for embedding external apps in iframes with proper JWT auth.
 *
 * Flow:
 * 1. Calls the SPA backend to mint a proper JWT for the target app
 * 2. Passes the JWT via ?token= URL param (instant, reliable)
 * 3. Also sends via postMessage after load (backup)
 *
 * Usage:
 *   const { iframeRef, src, onLoad } = useIframeAuth("https://captain.smartlyq.com");
 *   <iframe ref={iframeRef} src={src} onLoad={onLoad} />
 */
export function useIframeAuth(baseUrl: string) {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [src, setSrc] = useState("");

	// Get a proper JWT from the backend, then build iframe URL
	useEffect(() => {
		const spaToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
		if (!spaToken) {
			setSrc(baseUrl);
			return;
		}

		const endpoint = TOKEN_ENDPOINTS[baseUrl];
		if (!endpoint) {
			// No dedicated endpoint — pass SPA token directly
			setSrc(`${baseUrl}?token=${encodeURIComponent(spaToken)}`);
			return;
		}

		fetch(endpoint.url, {
			method: endpoint.method,
			headers: {
				Authorization: `Bearer ${spaToken}`,
				"Content-Type": "application/json",
			},
		})
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (data?.redirect_url) {
					setSrc(data.redirect_url);
				} else if (data?.token) {
					setSrc(`${baseUrl}?token=${encodeURIComponent(data.token)}`);
				} else {
					// Endpoint failed — fall back to SPA token
					setSrc(`${baseUrl}?token=${encodeURIComponent(spaToken)}`);
				}
			})
			.catch(() => {
				setSrc(`${baseUrl}?token=${encodeURIComponent(spaToken)}`);
			});
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
