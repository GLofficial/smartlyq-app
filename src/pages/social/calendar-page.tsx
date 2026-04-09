import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSocialCalendar, type CalendarEvent } from "@/api/social";

const STATUS_COLORS: Record<string, string> = {
	scheduled: "bg-blue-500",
	published: "bg-green-500",
	draft: "bg-gray-400",
	failed: "bg-red-500",
	partially_published: "bg-yellow-500",
};

export function CalendarPage() {
	const [currentMonth, setCurrentMonth] = useState(() => {
		const d = new Date();
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
	});

	const { data, isLoading } = useSocialCalendar(currentMonth);

	const monthDate = new Date(currentMonth + "-01");
	const monthLabel = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

	const prevMonth = () => {
		const d = new Date(monthDate);
		d.setMonth(d.getMonth() - 1);
		setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
	};

	const nextMonth = () => {
		const d = new Date(monthDate);
		d.setMonth(d.getMonth() + 1);
		setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
	};

	// Build calendar grid
	const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
	const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	const blanks = Array.from({ length: firstDay }, (_, i) => i);

	const eventsByDay: Record<number, CalendarEvent[]> = {};
	for (const ev of data?.events ?? []) {
		if (ev.date) {
			const day = Number.parseInt(ev.date.split("-")[2] ?? "0", 10);
			if (day > 0) {
				(eventsByDay[day] ??= []).push(ev);
			}
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Calendar</h1>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="icon" onClick={prevMonth}>
						<ChevronLeft size={16} />
					</Button>
					<span className="min-w-[160px] text-center font-medium">{monthLabel}</span>
					<Button variant="outline" size="icon" onClick={nextMonth}>
						<ChevronRight size={16} />
					</Button>
				</div>
			</div>

			<Card>
				<CardContent className="p-4">
					{isLoading ? (
						<div className="flex h-64 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : (
						<div className="grid grid-cols-7 gap-px">
							{/* Day headers */}
							{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
								<div key={d} className="p-2 text-center text-xs font-medium text-[var(--muted-foreground)]">
									{d}
								</div>
							))}
							{/* Blanks */}
							{blanks.map((b) => (
								<div key={`b-${b}`} className="min-h-[80px] rounded border border-transparent p-1" />
							))}
							{/* Days */}
							{days.map((day) => {
								const events = eventsByDay[day] ?? [];
								const isToday =
									new Date().getDate() === day &&
									new Date().getMonth() === monthDate.getMonth() &&
									new Date().getFullYear() === monthDate.getFullYear();

								return (
									<div
										key={day}
										className={`min-h-[80px] rounded border p-1 ${isToday ? "border-[var(--sq-primary)] bg-[color-mix(in_srgb,var(--sq-primary)_5%,transparent)]" : "border-[var(--border)]"}`}
									>
										<span className={`text-xs font-medium ${isToday ? "text-[var(--sq-primary)]" : ""}`}>
											{day}
										</span>
										<div className="mt-1 space-y-0.5">
											{events.slice(0, 3).map((ev) => (
												<div
													key={ev.id}
													className="flex items-center gap-1 rounded px-1 py-0.5"
													title={ev.title}
												>
													<div className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_COLORS[ev.status] ?? "bg-gray-400"}`} />
													<span className="truncate text-[10px]">{ev.title}</span>
												</div>
											))}
											{events.length > 3 && (
												<span className="text-[10px] text-[var(--muted-foreground)]">
													+{events.length - 3} more
												</span>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
