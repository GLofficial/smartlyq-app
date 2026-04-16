import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Clock, Send, ListPlus, RefreshCw } from "lucide-react";

interface ActionsBarProps {
	onSaveDraft: () => void;
	onSchedule: (date: string, time: string) => void;
	onPostNow: () => void;
	onQueue?: () => void;
	isSubmitting: boolean;
	hasContent: boolean;
	hasAccounts: boolean;
}

const SUGGESTED_TIMES = ["09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM", "08:00 PM"];

export function PostActionsBar({ onSaveDraft, onSchedule, onPostNow, onQueue, isSubmitting, hasContent, hasAccounts }: ActionsBarProps) {
	const [scheduleOpen, setScheduleOpen] = useState(false);
	const [schedDate, setSchedDate] = useState("");
	const [schedTime, setSchedTime] = useState("");

	const canPost = hasContent && hasAccounts && !isSubmitting;

	return (
		<>
			<div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border)]">
				<Button variant="outline" size="sm" onClick={onSaveDraft} disabled={!hasContent || isSubmitting} className="gap-1.5">
					<Save size={14} /> Save Draft
				</Button>
				<Button size="sm" onClick={() => setScheduleOpen(true)} disabled={!canPost}
					className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
					<Clock size={14} /> Schedule Post
				</Button>
				<Button size="sm" onClick={onPostNow} disabled={!canPost}
					className="gap-1.5 bg-[var(--sq-primary)] hover:bg-[var(--sq-primary)]/90 text-white">
					<Send size={14} /> Post Now
				</Button>
				{onQueue && (
					<Button variant="outline" size="sm" onClick={onQueue} disabled={!canPost} className="gap-1.5">
						<ListPlus size={14} /> Queue
					</Button>
				)}
			</div>

			{/* Schedule Dialog */}
			<Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
				<DialogContent className="max-w-sm">
					<DialogHeader><DialogTitle>Schedule Post</DialogTitle></DialogHeader>
					<div className="space-y-4">
						<div>
							<label className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5 block">Date</label>
							<Input type="date" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} className="text-sm" />
						</div>
						<div>
							<label className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5 block">Time</label>
							<Input type="time" value={schedTime} onChange={(e) => setSchedTime(e.target.value)} className="text-sm" />
						</div>
						<div>
							<div className="flex items-center justify-between mb-2">
								<label className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Suggested Times</label>
								<button className="text-xs text-[var(--sq-primary)] flex items-center gap-1"><RefreshCw size={10} /> Refresh</button>
							</div>
							<div className="flex flex-wrap gap-2">
								{SUGGESTED_TIMES.map((t) => (
									<button key={t} onClick={() => setSchedTime(convertTo24h(t))}
										className={`rounded-full border px-3 py-1 text-xs transition-colors ${schedTime === convertTo24h(t) ? "bg-[var(--sq-primary)] text-white border-[var(--sq-primary)]" : "border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"}`}>
										{t}
									</button>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
						<Button onClick={() => { onSchedule(schedDate, schedTime); setScheduleOpen(false); }}
							disabled={!schedDate || !schedTime}
							className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
							<Clock size={14} /> Schedule
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

function convertTo24h(time12: string): string {
	const [time, modifier] = time12.split(" ");
	if (!time || !modifier) return "";
	const [h, m] = time.split(":");
	let hours = parseInt(h!, 10);
	if (modifier === "PM" && hours !== 12) hours += 12;
	if (modifier === "AM" && hours === 12) hours = 0;
	return `${String(hours).padStart(2, "0")}:${m}`;
}
