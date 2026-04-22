import { useState } from "react";
import { CalendarDays, Clock, CheckSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isSubmitting?: boolean;
	/** Called with an ISO datetime string if the user set a date, or undefined to send without a scheduled time. */
	onConfirm: (scheduledTime?: string) => void;
}

export function ApprovalScheduleModal({ open, onOpenChange, isSubmitting, onConfirm }: Props) {
	const [date, setDate] = useState("");
	const [time, setTime] = useState("");

	function parseScheduledTime(): string | undefined {
		if (!date.trim() && !time.trim()) return undefined;
		if (!date.trim()) { toast.error("Please enter a date or leave both fields empty."); return null as unknown as undefined; }
		const parts = date.split("/");
		if (parts.length !== 3) { toast.error("Date must be in DD/MM/YYYY format."); return null as unknown as undefined; }
		const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
		const raw = (time || "").trim() || "09:00";
		const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
		let h24: number;
		let min: number;
		if (ampmMatch) {
			const h = parseInt(ampmMatch[1]!, 10);
			min = parseInt(ampmMatch[2]!, 10);
			const isPm = ampmMatch[3]!.toLowerCase() === "pm";
			h24 = h % 12 + (isPm ? 12 : 0);
		} else {
			const m24 = raw.match(/^(\d{1,2}):(\d{2})$/);
			if (!m24) { toast.error("Time must be HH:MM AM/PM or 24-hour HH:MM."); return null as unknown as undefined; }
			h24 = parseInt(m24[1]!, 10);
			min = parseInt(m24[2]!, 10);
		}
		if (isNaN(h24) || isNaN(min) || h24 > 23 || min > 59) { toast.error("Invalid time."); return null as unknown as undefined; }
		const hh = String(h24).padStart(2, "0");
		const mm = String(min).padStart(2, "0");
		return `${isoDate}T${hh}:${mm}:00`;
	}

	function handleConfirm(withDate: boolean) {
		if (withDate) {
			const scheduled = parseScheduledTime();
			if (scheduled === null) return;
			onConfirm(scheduled);
		} else {
			onConfirm(undefined);
		}
		setDate("");
		setTime("");
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
						Optionally propose a publish date. The approver can approve without changing it, or you can leave this blank and schedule after approval.
					</p>
				</DialogHeader>

				<div className="space-y-4 py-1">
					<div className="space-y-2">
						<label className="text-sm font-medium text-foreground">Proposed date <span className="text-muted-foreground font-normal">(optional)</span></label>
						<div className="relative">
							<input
								type="text"
								value={date}
								onChange={(e) => setDate(e.target.value)}
								className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								placeholder="DD/MM/YYYY"
							/>
							<CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-foreground">Proposed time <span className="text-muted-foreground font-normal">(optional, defaults to 09:00)</span></label>
						<div className="relative">
							<input
								type="text"
								value={time}
								onChange={(e) => setTime(e.target.value)}
								className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
								placeholder="HH:MM AM/PM"
							/>
							<Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-2 mt-2">
					<Button className="w-full" disabled={isSubmitting} onClick={() => handleConfirm(true)}>
						<CheckSquare className="w-4 h-4" />
						{date.trim() ? "Send for Approval with Proposed Date" : "Send for Approval"}
					</Button>
					{date.trim() && (
						<Button variant="outline" className="w-full" disabled={isSubmitting} onClick={() => handleConfirm(false)}>
							Send Without a Date
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
