import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useWorkspaceActivity } from "@/api/workspace/settings";

export function ActivitySettingsTab() {
	const [page, setPage] = useState(1);
	const { data } = useWorkspaceActivity(page);

	if (!data) return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;

	return (
		<div className="max-w-4xl">
			<h2 className="text-xl font-bold mb-1">Activity Log</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-4">Recent workspace activity and changes</p>

			{data.activity.length === 0 ? (
				<Card><CardContent className="py-12 text-center text-sm text-[var(--muted-foreground)]">No activity yet</CardContent></Card>
			) : (
				<div className="space-y-2">
					{data.activity.map((a) => {
						const meta = formatMeta(a.event, a.meta);
						return (
							<Card key={a.id}>
								<CardContent className="flex items-start gap-4 p-4">
									<div className="shrink-0 pt-0.5">
										<div className="h-8 w-8 rounded-full bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)] flex items-center justify-center text-xs font-bold text-[var(--sq-primary)]">
											{a.who?.charAt(0)?.toUpperCase() ?? "?"}
										</div>
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2 mb-0.5">
											<span className="text-sm font-medium">{a.who || "System"}</span>
											<span className="text-xs text-[var(--muted-foreground)]">{formatTime(a.created_at)}</span>
										</div>
										<p className="text-sm text-[var(--foreground)]">{formatEvent(a.event)}</p>
										{meta && <p className="mt-1 text-xs text-[var(--muted-foreground)] break-all">{meta}</p>}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{data.pages > 1 && (
				<div className="mt-4 flex items-center justify-between">
					<p className="text-xs text-[var(--muted-foreground)]">Page {page} of {data.pages}</p>
					<div className="flex gap-1">
						<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /></Button>
						<Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={14} /></Button>
					</div>
				</div>
			)}
		</div>
	);
}

function formatEvent(event: string): string {
	return event
		.replace(/_/g, " ")
		.replace(/\./g, " > ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatMeta(event: string, meta: string): string | null {
	if (!meta) return null;
	try {
		const parsed = JSON.parse(meta);
		if (typeof parsed === "object" && parsed !== null) {
			const parts: string[] = [];
			for (const [k, v] of Object.entries(parsed)) {
				if (v === null || v === undefined || v === "") continue;
				const key = k.replace(/_/g, " ");
				parts.push(`${key}: ${String(v)}`);
			}
			return parts.join(" · ");
		}
	} catch {}
	// Not JSON — return truncated raw string
	return meta.length > 200 ? meta.substring(0, 200) + "…" : meta;
}

function formatTime(dateStr: string): string {
	try {
		const d = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 1) return "just now";
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHrs = Math.floor(diffMins / 60);
		if (diffHrs < 24) return `${diffHrs}h ago`;
		const diffDays = Math.floor(diffHrs / 24);
		if (diffDays < 7) return `${diffDays}d ago`;
		return d.toLocaleDateString();
	} catch {
		return dateStr;
	}
}
