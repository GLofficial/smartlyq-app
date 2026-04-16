import { useState, useCallback, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventContentArg, DatesSetArg, EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { useCalendarEvents } from "@/api/social";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useNavigate } from "react-router-dom";
import { CalendarEventCard } from "./calendar-event-card";
import { CalendarEventModal, type CalendarEventData } from "./calendar-event-modal";
import { CalendarFilters } from "./calendar-filters";

type ViewType = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";
const VIEWS: { key: ViewType; label: string }[] = [
	{ key: "dayGridMonth", label: "Month" },
	{ key: "timeGridWeek", label: "Week" },
	{ key: "timeGridDay", label: "Day" },
	{ key: "listWeek", label: "Agenda" },
];

export function CalendarPage() {
	const calendarRef = useRef<FullCalendar>(null);
	const [currentView, setCurrentView] = useState<ViewType>("dayGridMonth");
	const [dateRange, setDateRange] = useState({ start: "", end: "" });
	const [titleText, setTitleText] = useState("");
	const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [platformFilter, setPlatformFilter] = useState("");
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const navigate = useNavigate();

	const { data } = useCalendarEvents(dateRange.start, dateRange.end);
	const allEvents = data?.events ?? [];

	// Client-side filtering
	const filteredEvents = useMemo(() => {
		let events = allEvents;
		if (search) {
			const q = search.toLowerCase();
			events = events.filter((e) => {
				const title = (e.title ?? "").toLowerCase();
				const content = (e.extendedProps?.content ?? "").toLowerCase();
				return title.includes(q) || content.includes(q);
			});
		}
		if (statusFilter) {
			events = events.filter((e) => (e.extendedProps?.status ?? e.status) === statusFilter || e.extendedProps?.type === "note");
		}
		if (platformFilter) {
			const pf = platformFilter.toLowerCase();
			events = events.filter((e) => {
				const platforms = e.extendedProps?.platforms ?? e.platforms ?? [];
				return platforms.some((p: string) => p.toLowerCase() === pf) || e.extendedProps?.type === "note";
			});
		}
		return events;
	}, [allEvents, search, statusFilter, platformFilter]);

	const handleDatesSet = useCallback((arg: DatesSetArg) => {
		setDateRange({ start: arg.startStr.slice(0, 10), end: arg.endStr.slice(0, 10) });
		setTitleText(arg.view.title);
	}, []);

	const handleEventClick = useCallback((info: EventClickArg) => {
		const e = info.event;
		setSelectedEvent({
			id: Number(e.id) || 0,
			title: e.title,
			start: e.startStr,
			extendedProps: e.extendedProps as CalendarEventData["extendedProps"],
		});
	}, []);

	const handleDateClick = useCallback((info: DateClickArg) => {
		if (new Date(info.dateStr) < new Date(new Date().toDateString())) return;
		const path = wsHash ? `/w/${wsHash}/social-media/create` : "/social-media/create";
		navigate(path + `?date=${info.dateStr}`);
	}, [wsHash, navigate]);

	const handleViewChange = useCallback((view: ViewType) => {
		setCurrentView(view);
		calendarRef.current?.getApi().changeView(view);
	}, []);

	const goToday = useCallback(() => calendarRef.current?.getApi().today(), []);
	const goPrev = useCallback(() => calendarRef.current?.getApi().prev(), []);
	const goNext = useCallback(() => calendarRef.current?.getApi().next(), []);

	const renderEventContent = useCallback((eventInfo: EventContentArg) => <CalendarEventCard eventInfo={eventInfo} />, []);

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<CalendarIcon size={20} className="text-[var(--sq-primary)]" />
					<h1 className="text-xl font-bold text-[var(--foreground)]">Content Calendar</h1>
				</div>
				<Button size="sm" onClick={() => navigate(wsHash ? `/w/${wsHash}/social-media/create` : "/social-media/create")}>
					<Plus size={14} className="mr-1.5" /> Create Post
				</Button>
			</div>

			{/* Toolbar */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={goPrev} className="h-8 w-8 p-0"><ChevronLeft size={16} /></Button>
					<Button variant="outline" size="sm" onClick={goToday} className="text-xs">Today</Button>
					<Button variant="outline" size="sm" onClick={goNext} className="h-8 w-8 p-0"><ChevronRight size={16} /></Button>
					<span className="text-sm font-semibold text-[var(--foreground)] ml-2">{titleText}</span>
				</div>
				<div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
					{VIEWS.map((v) => (
						<button key={v.key} onClick={() => handleViewChange(v.key)}
							className={`px-3 py-1.5 text-xs font-medium transition-colors ${currentView === v.key ? "bg-[var(--sq-primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>
							{v.label}
						</button>
					))}
				</div>
			</div>

			{/* Filters */}
			<CalendarFilters search={search} onSearchChange={setSearch}
				statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
				platformFilter={platformFilter} onPlatformFilterChange={setPlatformFilter} />

			{/* Calendar */}
			<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden fc-smartlyq">
				<FullCalendar
					ref={calendarRef}
					plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
					initialView="dayGridMonth"
					headerToolbar={false}
					height="auto"
					dayMaxEvents={3}
					eventDisplay="block"
					nextDayThreshold="09:00:00"
					events={filteredEvents.filter((e) => e.start !== null) as any}
					datesSet={handleDatesSet}
					eventClick={handleEventClick}
					dateClick={handleDateClick}
					eventContent={renderEventContent}
					nowIndicator
				/>
			</div>

			<CalendarEventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />

			{/* FullCalendar theme */}
			<style>{`
				.fc-smartlyq { --fc-border-color: var(--border); --fc-page-bg-color: var(--card); --fc-neutral-bg-color: var(--muted); --fc-today-bg-color: rgba(59,130,246,0.04); --fc-event-border-color: transparent; --fc-event-bg-color: transparent; --fc-event-text-color: var(--foreground); }
				.fc-smartlyq .fc-daygrid-day-number { font-size: 12px; color: var(--muted-foreground); padding: 4px 8px; }
				.fc-smartlyq .fc-col-header-cell-cushion { font-size: 11px; font-weight: 600; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; }
				.fc-smartlyq .fc-daygrid-more-link { font-size: 11px; color: var(--sq-primary); font-weight: 600; }
				.fc-smartlyq .fc-event { cursor: pointer; border-radius: 6px; margin: 1px 2px; }
				.fc-smartlyq .fc-daygrid-event { padding: 0; }
				.fc-smartlyq .fc-timegrid-event .fc-event-main { padding: 2px 4px; }
				.fc-smartlyq .fc-list-event td { font-size: 13px; }
				.fc-smartlyq .fc-day-today { background: rgba(59,130,246,0.04) !important; }
			`}</style>
		</div>
	);
}
