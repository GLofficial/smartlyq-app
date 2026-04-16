import type { EventContentArg } from "@fullcalendar/core";
import { PlatformIcon } from "@/pages/social/platform-icon";

const STATUS_COLORS: Record<string, string> = {
	draft: "#6c757d", scheduled: "#ffc107", published: "#28a745",
	processing: "#009496", failed: "#dc3545", partially_published: "#fd7e14",
};

export function CalendarEventCard({ eventInfo }: { eventInfo: EventContentArg }) {
	const { extendedProps } = eventInfo.event;
	const type = (extendedProps?.type as string) ?? "post";

	if (type === "note") {
		const bg = (extendedProps?.bgColor as string) || "#F8F8F8";
		return (
			<div className="px-1.5 py-0.5 rounded text-[10px] leading-tight truncate" style={{ backgroundColor: bg, color: isLight(bg) ? "#333" : "#fff" }}>
				{eventInfo.event.title}
			</div>
		);
	}

	const status = (extendedProps?.status as string) ?? "";
	const platforms = (extendedProps?.platforms as string[]) ?? [];
	const timeDisplay = (extendedProps?.timeDisplay as string) ?? "";
	const thumbnail = (extendedProps?.thumbnail as string) ?? "";
	const statusColor = STATUS_COLORS[status] ?? "#6c757d";

	return (
		<div className="flex items-center gap-1 px-1 py-0.5 rounded-md hover:bg-[var(--muted)]/50 overflow-hidden">
			{/* Status dot */}
			<span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />

			{/* Thumbnail (tiny) */}
			{thumbnail && (
				<img src={thumbnail} alt="" className="h-4 w-4 rounded-sm object-cover shrink-0" loading="lazy" />
			)}

			{/* Time */}
			{timeDisplay && <span className="text-[9px] text-[var(--muted-foreground)] shrink-0">{timeDisplay}</span>}

			{/* Title */}
			<span className="text-[10px] font-medium truncate flex-1">{eventInfo.event.title}</span>

			{/* Platform icons */}
			<div className="flex items-center gap-0.5 shrink-0">
				{platforms.slice(0, 3).map((p) => (
					<PlatformIcon key={p} platform={p} size={10} />
				))}
			</div>
		</div>
	);
}

function isLight(hex: string): boolean {
	const c = hex.replace("#", "");
	const r = parseInt(c.substring(0, 2), 16);
	const g = parseInt(c.substring(2, 4), 16);
	const b = parseInt(c.substring(4, 6), 16);
	return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
