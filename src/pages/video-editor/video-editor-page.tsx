import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Embeds Video Editor (Next.js app) inside the unified shell.
 * Passes the SPA JWT directly — it already contains workspace_hash.
 *
 * Also listens for cross-origin navigation intents posted by the editor
 * via `{ type: 'smartlyq:navigate', target: 'plans' }`. That lets the
 * editor's in-iframe Upgrade button route the parent window to the SPA
 * plans page instead of the legacy Bootstrap UI.
 */
export function VideoEditorPage() {
	const [src, setSrc] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		async function loadUrl() {
			const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

			// Try the SPA endpoint first (returns a properly minted editor JWT)
			try {
				const res = await fetch("/api/spa/external/video-editor/token", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
				if (res.ok) {
					const data = await res.json();
					if (data.editor_url) { setSrc(data.editor_url); return; }
					if (data.token) {
						setSrc(`https://video.smartlyq.com?token=${encodeURIComponent(data.token)}`);
						return;
					}
				}
			} catch {}

			// Fallback: pass SPA JWT directly (already contains workspace_hash)
			setSrc(`https://video.smartlyq.com?token=${encodeURIComponent(token ?? "")}`);
		}
		loadUrl();
	}, []);

	useEffect(() => {
		const handler = (e: MessageEvent) => {
			const data = e.data as { type?: string; target?: string } | null;
			if (!data || data.type !== "smartlyq:navigate") return;
			// Extract workspace hash from the current SPA URL: /w/{hash}/...
			const match = window.location.pathname.match(/^\/w\/([^/]+)/);
			const hash = match?.[1];
			if (data.target === "plans") {
				navigate(hash ? `/w/${hash}/plans` : "/w/plans");
			}
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, [navigate]);

	if (!src) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="-m-6 h-[calc(100%+3rem)]">
			<iframe
				src={src}
				title="Video Editor"
				className="h-full w-full border-0"
				allow="clipboard-write; camera; microphone; fullscreen"
				allowFullScreen
			/>
		</div>
	);
}
