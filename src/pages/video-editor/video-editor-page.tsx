import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Embeds Video Editor (Next.js app) inside the unified shell.
 * Passes the SPA JWT directly — it already contains workspace_hash.
 */
export function VideoEditorPage() {
	const [src, setSrc] = useState("");

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
