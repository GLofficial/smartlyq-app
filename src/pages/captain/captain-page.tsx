import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Embeds AI Captain (React app at captain.smartlyq.com) inside the unified shell.
 * Passes JWT token so the user stays authenticated without redirect.
 */
export function CaptainPage() {
	const [src, setSrc] = useState("");

	useEffect(() => {
		const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
		// Load Captain app with token — it accepts ?token= param
		const captainUrl = "https://captain.smartlyq.com";
		setSrc(`${captainUrl}?token=${encodeURIComponent(token ?? "")}`);
	}, []);

	if (!src) return null;

	return (
		<div className="h-[calc(100vh-8rem)]">
			<iframe
				src={src}
				title="AI Captain"
				className="h-full w-full rounded-lg border border-[var(--border)]"
				allow="clipboard-write"
			/>
		</div>
	);
}
