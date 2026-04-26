import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Embeds the calendar app (cal.diy fork at calendar.smartlyq.com) inside the
 * unified shell as an iframe. Mints a SmartlyQ JWT, appends it to the URL,
 * cal.diy's proxy.ts plants it as the smartlyq_jwt cookie + clean redirects.
 *
 * Same pattern as VideoEditorPage. postMessage bridge handles in-iframe
 * navigation intents (e.g. an Upgrade button inside cal.diy routing the
 * parent to the SPA plans page).
 */
export function BookingCalendarPage() {
	const [src, setSrc] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		async function loadUrl() {
			const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

			try {
				const res = await fetch("/api/spa/external/calendar/token", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});
				if (res.ok) {
					const data = await res.json();
					if (data.calendar_url) { setSrc(data.calendar_url); return; }
					if (data.token) {
						setSrc(`https://calendar.smartlyq.com?token=${encodeURIComponent(data.token)}`);
						return;
					}
				}
			} catch {}

			// Fallback: pass SPA JWT directly (cal.diy validates HS256 with the same shared jwt_key)
			setSrc(`https://calendar.smartlyq.com?token=${encodeURIComponent(token ?? "")}`);
		}
		loadUrl();
	}, []);

	useEffect(() => {
		const handler = (e: MessageEvent) => {
			const data = e.data as { type?: string; target?: string } | null;
			if (!data || data.type !== "smartlyq:navigate") return;
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
				title="Calendar"
				className="h-full w-full border-0"
				allow="clipboard-write; camera; microphone; fullscreen"
				allowFullScreen
			/>
		</div>
	);
}
