import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Embeds AI Captain (React app at captain.smartlyq.com) inside the unified shell.
 * Calls backend to mint a proper JWT (same pattern as presentations/video editor).
 */
export function CaptainPage() {
	const [src, setSrc] = useState("");
	const [searchParams] = useSearchParams();
	const prompt = searchParams.get("prompt") ?? "";

	useEffect(() => {
		async function loadUrl() {
			const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
			const addPrompt = (u: string) => prompt ? u + (u.includes("?") ? "&" : "?") + "prompt=" + encodeURIComponent(prompt) : u;
			try {
				const res = await fetch("/api/spa/external/captain", {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = await res.json();
				if (data.redirect_url) {
					// Pass user_info via URL so iframe skips cross-origin api.me() call
					let url = data.redirect_url;
					if (data.user_info) {
						url += (url.includes("?") ? "&" : "?") + "user_info=" + encodeURIComponent(JSON.stringify(data.user_info));
					}
					setSrc(addPrompt(url));
					return;
				}
			} catch {}
			// Fallback: pass SPA JWT directly
			const captainUrl = "https://captain.smartlyq.com";
			setSrc(addPrompt(`${captainUrl}?token=${encodeURIComponent(token ?? "")}`));
		}
		loadUrl();
	}, [prompt]);

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
				title="AI Captain"
				className="h-full w-full border-0"
				allow="clipboard-write"
			/>
		</div>
	);
}
