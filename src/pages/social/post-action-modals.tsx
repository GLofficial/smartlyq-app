import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, Loader2, ListOrdered, Repeat } from "lucide-react";
import { useQueues } from "@/api/queues";

/**
 * Shared centered-portal modal shell. Matches the bulletproof-centering approach
 * used by instagram-method-modal — flex container, no Radix animation transforms.
 */
function CenteredModal({ open, onClose, children, title, icon: Icon }: {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title: string;
	icon: typeof ListOrdered;
}) {
	useEffect(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onKey);
		};
	}, [open, onClose]);

	if (!open) return null;
	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150"
			onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="relative bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-xl p-6 w-full max-w-md"
				onMouseDown={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
					aria-label="Close"
				>
					<X size={16} />
				</button>
				<div className="flex items-center gap-2 mb-4">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--muted)]">
						<Icon size={18} className="text-[var(--sq-primary)]" />
					</div>
					<h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
				</div>
				{children}
			</div>
		</div>,
		document.body,
	);
}

// ────────────────────────────────────────────────────────────────────────────
// Add to Queue modal
// ────────────────────────────────────────────────────────────────────────────

export function AddToQueueModal({ open, onClose, onConfirm }: {
	open: boolean;
	onClose: () => void;
	onConfirm: (queueId: number) => void;
}) {
	const queuesQ = useQueues();
	const queues = queuesQ.data?.queues?.filter((q) => q.is_active) ?? [];
	const [selected, setSelected] = useState<number | null>(null);

	useEffect(() => {
		if (open) setSelected(null);
	}, [open]);

	return (
		<CenteredModal open={open} onClose={onClose} title="Add to Queue" icon={ListOrdered}>
			<p className="text-sm text-[var(--muted-foreground)] mb-4">
				Pick a category queue. Your post will publish in the queue's next open slot.
			</p>
			{queuesQ.isLoading ? (
				<div className="flex items-center justify-center py-8">
					<Loader2 size={18} className="animate-spin text-[var(--muted-foreground)]" />
				</div>
			) : queues.length === 0 ? (
				<div className="rounded-md border border-dashed border-[var(--border)] p-4 text-center text-sm text-[var(--muted-foreground)]">
					No active queues yet. Create one in <span className="font-medium">Publish → Post Queues</span> first.
				</div>
			) : (
				<ul className="space-y-1.5 max-h-[40vh] overflow-y-auto">
					{queues.map((q) => (
						<li key={q.id}>
							<button
								type="button"
								onClick={() => setSelected(q.id)}
								className={`w-full text-left p-3 rounded-md border transition-colors ${
									selected === q.id
										? "border-[var(--sq-primary)] bg-[var(--sq-primary)]/5"
										: "border-[var(--border)] hover:border-[var(--muted-foreground)]/40"
								}`}
							>
								<p className="text-sm font-medium">{q.name}</p>
							</button>
						</li>
					))}
				</ul>
			)}
			<div className="mt-5 flex justify-end gap-2">
				<Button variant="outline" onClick={onClose}>Cancel</Button>
				<Button
					onClick={() => { if (selected) onConfirm(selected); }}
					disabled={!selected || queues.length === 0}
				>
					Add to Queue
				</Button>
			</div>
		</CenteredModal>
	);
}

// ────────────────────────────────────────────────────────────────────────────
// Schedule Recurring Posts modal
// ────────────────────────────────────────────────────────────────────────────

export interface RecurrenceConfig {
	frequency: "daily" | "weekly" | "monthly";
	interval: number;
	days_of_week: string[];
	day_of_month: number | null;
	time_of_day: string; // HH:MM
	starts_at: string; // YYYY-MM-DD
	ends_at: string | null;
	max_occurrences: number | null;
}

const DAYS: Array<{ id: string; label: string }> = [
	{ id: "Mon", label: "M" }, { id: "Tue", label: "T" }, { id: "Wed", label: "W" },
	{ id: "Thu", label: "T" }, { id: "Fri", label: "F" }, { id: "Sat", label: "S" },
	{ id: "Sun", label: "S" },
];

export function ScheduleRecurringModal({ open, onClose, onConfirm }: {
	open: boolean;
	onClose: () => void;
	onConfirm: (recurrence: RecurrenceConfig) => void;
}) {
	const [frequency, setFrequency] = useState<RecurrenceConfig["frequency"]>("weekly");
	const [interval, setInterval] = useState(1);
	const [daysOfWeek, setDaysOfWeek] = useState<string[]>(["Mon"]);
	const [dayOfMonth, setDayOfMonth] = useState(1);
	const [timeOfDay, setTimeOfDay] = useState("09:00");
	const today = new Date().toISOString().slice(0, 10);
	const [startsAt, setStartsAt] = useState(today);
	const [endsAt, setEndsAt] = useState("");
	const [maxOcc, setMaxOcc] = useState("");

	useEffect(() => {
		if (!open) return;
		setFrequency("weekly");
		setInterval(1);
		setDaysOfWeek(["Mon"]);
		setDayOfMonth(1);
		setTimeOfDay("09:00");
		setStartsAt(new Date().toISOString().slice(0, 10));
		setEndsAt("");
		setMaxOcc("");
	}, [open]);

	function toggleDay(d: string) {
		setDaysOfWeek((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
	}

	function handleConfirm() {
		onConfirm({
			frequency,
			interval: Math.max(1, interval),
			days_of_week: frequency === "weekly" ? daysOfWeek : [],
			day_of_month: frequency === "monthly" ? dayOfMonth : null,
			time_of_day: timeOfDay + ":00",
			starts_at: startsAt,
			ends_at: endsAt || null,
			max_occurrences: maxOcc ? Math.max(1, parseInt(maxOcc, 10)) : null,
		});
	}

	const canConfirm = frequency === "weekly" ? daysOfWeek.length > 0 : true;

	return (
		<CenteredModal open={open} onClose={onClose} title="Schedule Recurring Posts" icon={Repeat}>
			<div className="space-y-4">
				<div>
					<label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Frequency</label>
					<select
						value={frequency}
						onChange={(e) => setFrequency(e.target.value as RecurrenceConfig["frequency"])}
						className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm bg-[var(--card)]"
					>
						<option value="daily">Daily</option>
						<option value="weekly">Weekly</option>
						<option value="monthly">Monthly</option>
					</select>
				</div>

				<div>
					<label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">
						Every {interval} {frequency === "daily" ? "day(s)" : frequency === "weekly" ? "week(s)" : "month(s)"}
					</label>
					<input
						type="number"
						min={1}
						max={30}
						value={interval}
						onChange={(e) => setInterval(parseInt(e.target.value, 10) || 1)}
						className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm bg-[var(--card)]"
					/>
				</div>

				{frequency === "weekly" && (
					<div>
						<label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Days of week</label>
						<div className="flex gap-1">
							{DAYS.map((d) => (
								<button
									key={d.id}
									type="button"
									onClick={() => toggleDay(d.id)}
									className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${
										daysOfWeek.includes(d.id)
											? "border-[var(--sq-primary)] bg-[var(--sq-primary)] text-white"
											: "border-[var(--border)] hover:border-[var(--muted-foreground)]/40"
									}`}
								>
									{d.label}
								</button>
							))}
						</div>
					</div>
				)}

				{frequency === "monthly" && (
					<div>
						<label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Day of month</label>
						<input
							type="number"
							min={1}
							max={31}
							value={dayOfMonth}
							onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10) || 1)}
							className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm bg-[var(--card)]"
						/>
					</div>
				)}

				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Time</label>
						<input
							type="time"
							value={timeOfDay}
							onChange={(e) => setTimeOfDay(e.target.value)}
							className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm bg-[var(--card)]"
						/>
					</div>
					<div>
						<label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Starts</label>
						<input
							type="date"
							min={today}
							value={startsAt}
							onChange={(e) => setStartsAt(e.target.value)}
							className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm bg-[var(--card)]"
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Ends (optional)</label>
						<input
							type="date"
							min={startsAt}
							value={endsAt}
							onChange={(e) => setEndsAt(e.target.value)}
							className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm bg-[var(--card)]"
						/>
					</div>
					<div>
						<label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Max posts (optional)</label>
						<input
							type="number"
							min={1}
							placeholder="∞"
							value={maxOcc}
							onChange={(e) => setMaxOcc(e.target.value)}
							className="w-full px-3 py-2 border border-[var(--border)] rounded-md text-sm bg-[var(--card)]"
						/>
					</div>
				</div>
			</div>

			<div className="mt-5 flex justify-end gap-2">
				<Button variant="outline" onClick={onClose}>Cancel</Button>
				<Button onClick={handleConfirm} disabled={!canConfirm}>Schedule Recurring</Button>
			</div>
		</CenteredModal>
	);
}
