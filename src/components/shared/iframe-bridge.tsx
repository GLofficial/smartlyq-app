import { useState } from "react";

interface IframeBridgeProps {
	path: string;
	title?: string;
}

/**
 * Loads a legacy PHP page inside an iframe within the React shell.
 * The sidebar and header stay React; only the content area is the PHP page.
 * Used for pages not yet migrated to React.
 */
export function IframeBridge({ path, title }: IframeBridgeProps) {
	const [loading, setLoading] = useState(true);

	// Build absolute URL to the PHP app (same domain, no /next/ prefix)
	const src = `${window.location.origin}${path}`;

	return (
		<div className="flex h-[calc(100vh-8rem)] flex-col">
			{title && (
				<div className="mb-3 flex items-center gap-2">
					<h1 className="text-lg font-semibold">{title}</h1>
					<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
						Legacy view
					</span>
				</div>
			)}
			{loading && (
				<div className="flex h-32 items-center justify-center">
					<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			)}
			<iframe
				src={src}
				title={title ?? "SmartlyQ"}
				className="flex-1 rounded-lg border border-[var(--border)]"
				style={{ display: loading ? "none" : "block", width: "100%" }}
				onLoad={() => setLoading(false)}
			/>
		</div>
	);
}
