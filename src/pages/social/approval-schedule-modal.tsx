import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, CheckSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isSubmitting?: boolean;
	onConfirm: (scheduledTime?: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export function ApprovalScheduleModal({ open, onOpenChange, isSubmitting, onConfirm }: Props) {
	const [date, setDate] = useState<Date | undefined>(undefined);
	const [hour, setHour] = useState(9);
	const [minute, setMinute] = useState("00");
	const [calOpen, setCalOpen] = useState(false);

	function buildIso(): string | undefined {
		if (!date) return undefined;
		const hh = String(hour).padStart(2, "0");
		return `${format(date, "yyyy-MM-dd")}T${hh}:${minute}:00`;
	}

	function handleConfirm(withDate: boolean) {
		if (withDate) {
			const iso = buildIso();
			if (!iso) return;
			if (new Date(iso) <= new Date()) {
				toast.error("Proposed date and time must be in the future.");
				return;
			}
			onConfirm(iso);
		} else {
			onConfirm(undefined);
		}
		setDate(undefined);
		setHour(9);
		setMinute("00");
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<CheckSquare className="w-5 h-5 text-emerald-600" />
						<DialogTitle className="text-xl font-semibold">Send for Approval</DialogTitle>
					</div>
					<p className="text-sm text-muted-foreground pt-1">
						Optionally propose a publish date. You can also skip this and schedule after approval.
					</p>
				</DialogHeader>

				<div className="space-y-4 py-1">
					{/* Date picker */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-foreground">
							Proposed date <span className="text-muted-foreground font-normal">(optional)</span>
						</label>
						<Popover open={calOpen} onOpenChange={setCalOpen}>
							<PopoverTrigger asChild>
								<button
									type="button"
									className={cn(
										"w-full flex items-center gap-2 px-4 py-3 border border-border rounded-lg text-sm bg-background text-left transition-colors hover:bg-muted/40",
										!date && "text-muted-foreground",
									)}
								>
									<CalendarDays className="w-4 h-4 shrink-0" />
									{date ? format(date, "MMMM d, yyyy") : "Pick a date"}
								</button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={date}
									onSelect={(d) => { setDate(d); setCalOpen(false); }}
									disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
								/>
							</PopoverContent>
						</Popover>
					</div>

					{/* Time picker — only shown when a date is selected */}
					{date && (
						<div className="space-y-2">
							<label className="text-sm font-medium text-foreground">Proposed time</label>
							<div className="flex gap-2">
								<select
									value={hour}
									onChange={(e) => setHour(Number(e.target.value))}
									className="flex-1 px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								>
									{HOURS.map((h) => (
										<option key={h} value={h}>
											{String(h).padStart(2, "0")}:00
										</option>
									))}
								</select>
								<select
									value={minute}
									onChange={(e) => setMinute(e.target.value)}
									className="w-28 px-3 py-2.5 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								>
									{MINUTES.map((m) => (
										<option key={m} value={m}>:{m}</option>
									))}
								</select>
							</div>
							<p className="text-xs text-muted-foreground">
								Proposed: {format(date, "MMM d, yyyy")} at {String(hour).padStart(2, "0")}:{minute}
							</p>
						</div>
					)}
				</div>

				<div className="flex flex-col gap-2 mt-2">
					<Button className="w-full" disabled={isSubmitting} onClick={() => handleConfirm(true)}>
						<CheckSquare className="w-4 h-4" />
						{date ? `Send for Approval — ${format(date, "MMM d")} at ${String(hour).padStart(2, "0")}:${minute}` : "Send for Approval"}
					</Button>
					{date && (
						<Button variant="outline" className="w-full text-muted-foreground" disabled={isSubmitting} onClick={() => handleConfirm(false)}>
							Send Without a Date
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
