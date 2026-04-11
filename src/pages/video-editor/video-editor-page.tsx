import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Embeds Video Editor (Next.js app) inside the unified shell.
 * The video editor accepts JWT via ?token= param.
 */
export function VideoEditorPage() {
	const [src, setSrc] = useState("");

	useEffect(() => {
		async function loadUrl() {
			const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
			// The PHP endpoint /my/video-editor normally mints a JWT and redirects.
			// We already have a JWT, so we call the video editor API to get the editor URL.
			try {
				const res = await fetch("/api/spa/external/video-editor/token", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
				const data = await res.json();
				if (data.editor_url) {
					setSrc(data.editor_url);
				} else if (data.token) {
					const editorUrl = "https://video.smartlyq.com";
					setSrc(`${editorUrl}?token=${encodeURIComponent(data.token)}`);
				}
			} catch {
				// Fallback: pass our JWT directly (already contains workspace_hash)
				const editorUrl = "https://video.smartlyq.com";
				setSrc(`${editorUrl}?token=${encodeURIComponent(token ?? "")}`);
			}
		}
		loadUrl();
	}, []);

	if (!src) {
		return (
			<div className="flex h-[calc(100vh-8rem)] items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="h-[calc(100vh-8rem)]">
			<iframe
				src={src}
				title="Video Editor"
				className="h-full w-full rounded-lg border border-[var(--border)]"
				allow="clipboard-write; camera; microphone"
			/>
		</div>
	);
}
