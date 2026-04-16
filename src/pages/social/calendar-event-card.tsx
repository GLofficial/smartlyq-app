import type { EventContentArg } from "@fullcalendar/core";
import { PlatformIcon } from "@/pages/social/platform-icon";

const STATUS_CONFIG: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
	draft: { emoji: "📝", label: "DRAFT", color: "text-gray-600", bg: "bg-gray-100" },
	scheduled: { emoji: "⏰", label: "SCHEDULED", color: "text-amber-600", bg: "bg-amber-50" },
	published: { emoji: "✅", label: "PUBLISHED", color: "text-emerald-600", bg: "bg-emerald-50" },
	processing: { emoji: "✅", label: "PROCESSING", color: "text-teal-600", bg: "bg-teal-50" },
	failed: { emoji: "❌", label: "FAILED", color: "text-red-600", bg: "bg-red-50" },
	partially_published: { emoji: "⚠️", label: "PARTIAL", color: "text-orange-600", bg: "bg-orange-50" },
};

const STATUS_BORDER: Record<string, string> = {
	draft: "border-gray-300", scheduled: "border-amber-300", published: "border-emerald-300",
	processing: "border-teal-300", failed: "border-red-300", partially_published: "border-orange-300",
};

export function CalendarEventCard({ eventInfo }: { eventInfo: EventContentArg }) {
	const { extendedProps } = eventInfo.event;
	const type = (extendedProps?.type as string) ?? "post";
	const view = eventInfo.view.type;
	const isMonth = view === "dayGridMonth";

	// ── Notes ──
	if (type === "note") {
		const bg = (extendedProps?.bgColor as string) || "#22c55e";
		return (
			<div className="rounded-md px-2 py-1 text-[11px] font-medium leading-tight truncate"
				style={{ backgroundColor: bg, color: isLightBg(bg) ? "#1a1a1a" : "#ffffff" }}>
				{eventInfo.event.title}
			</div>
		);
	}

	// ── Posts ──
	const status = (extendedProps?.status as string) ?? "draft";
	const platforms = (extendedProps?.platforms as string[]) ?? [];
	const accountName = (extendedProps?.accountName as string) ?? "";
	const content = (extendedProps?.content as string) ?? "";
	const thumbnail = (extendedProps?.thumbnail as string) ?? "";
	const timeDisplay = (extendedProps?.timeDisplay as string) ?? "";
	const title = eventInfo.event.title || "";
	const sc = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
	const borderColor = STATUS_BORDER[status] ?? "border-gray-200";

	// Compact for month view (small cells)
	if (isMonth) {
		return (
			<div className={`rounded-lg border ${borderColor} bg-[var(--card)] p-1.5 hover:shadow-md transition-shadow overflow-hidden`}>
				{/* Thumbnail — hide on load error */}
				{thumbnail && (
					<div className="w-full aspect-video rounded overflow-hidden mb-1 bg-[var(--muted)]">
						<img src={thumbnail} alt="" className="w-full h-full object-cover" loading="lazy"
							onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = "none"; }} />
					</div>
				)}
				{/* Account name */}
				{accountName && (
					<p className="text-[10px] font-semibold text-[var(--foreground)] text-center truncate">{accountName}</p>
				)}
				{/* Title + Content */}
				<p className="text-[9px] font-medium text-[var(--foreground)] truncate mt-0.5">{title}</p>
				{content && content !== title && (
					<p className="text-[8px] text-[var(--muted-foreground)] truncate">{content.slice(0, 50)}</p>
				)}
				{/* Platforms + Status */}
				<div className="flex items-center justify-between mt-1">
					<div className="flex items-center gap-0.5">
						{platforms.slice(0, 4).map((p) => (
							<PlatformIcon key={p} platform={p} size={11} />
						))}
					</div>
					<span className={`inline-flex items-center gap-0.5 text-[8px] font-bold ${sc?.color ?? ""}`}>
						{sc?.emoji} {sc?.label}
					</span>
				</div>
			</div>
		);
	}

	// Week/Day/List view — horizontal compact card
	return (
		<div className={`flex items-center gap-2 rounded-md border ${borderColor} bg-[var(--card)] px-2 py-1 hover:shadow transition-shadow overflow-hidden`}>
			{thumbnail && <img src={thumbnail} alt="" className="h-8 w-8 rounded object-cover shrink-0" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-1">
					{timeDisplay && <span className="text-[10px] text-[var(--muted-foreground)] shrink-0">{timeDisplay}</span>}
					<span className="text-[11px] font-medium truncate">{title}</span>
				</div>
				{accountName && <p className="text-[9px] text-[var(--muted-foreground)] truncate">{accountName}</p>}
			</div>
			<div className="flex items-center gap-1 shrink-0">
				{platforms.slice(0, 3).map((p) => <PlatformIcon key={p} platform={p} size={12} />)}
				<span className={`text-[8px] font-bold ${sc?.color ?? ""}`}>{sc?.emoji}</span>
			</div>
		</div>
	);
}

function isLightBg(hex: string): boolean {
	const c = hex.replace("#", "");
	if (c.length < 6) return true;
	const r = parseInt(c.substring(0, 2), 16);
	const g = parseInt(c.substring(2, 4), 16);
	const b = parseInt(c.substring(4, 6), 16);
	return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
