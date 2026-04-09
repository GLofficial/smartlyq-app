import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Embeds Presentations Editor inside the unified shell.
 * Passes JWT so user stays at app.smartlyq.com.
 */
export function PresentationsPage() {
	const [src, setSrc] = useState("");

	useEffect(() => {
		const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
		const presUrl = "https://presentations.smartlyq.com";
		setSrc(`${presUrl}?token=${encodeURIComponent(token ?? "")}`);
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
				title="Presentations"
				className="h-full w-full rounded-lg border border-[var(--border)]"
				allow="clipboard-write"
			/>
		</div>
	);
}
