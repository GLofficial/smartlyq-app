import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, CalendarDays, Send, ListOrdered, Clock, Sparkles } from "lucide-react";

interface ActionsBarProps {
  onSaveDraft: () => void;
  onSchedule: (date: string, time: string) => void;
  onPostNow: () => void;
  isSubmitting: boolean;
  hasContent: boolean;
  hasAccounts: boolean;
}

export function PostActionsBar({ onSaveDraft, onSchedule, onPostNow, isSubmitting, hasContent, hasAccounts }: ActionsBarProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  });
  const [scheduleTime, setScheduleTime] = useState(() => {
    const now = new Date();
    let h = now.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${ampm}`;
  });

  const scheduleSummary = useMemo(() => {
    const parts = scheduleDate.split("/");
    if (parts.length !== 3) return "";
    const [d, m, y] = parts;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `Post will be published on ${days[date.getDay()]}, ${months[date.getMonth()]} ${Number(d)}, ${y} at ${scheduleTime}`;
  }, [scheduleDate, scheduleTime]);

  const handleScheduleConfirm = () => {
    const parts = scheduleDate.split("/");
    if (parts.length !== 3) return;
    const [d, m, y] = parts;
    const isoDate = `${y}-${m}-${d}`;
    onSchedule(isoDate, scheduleTime);
    setScheduleOpen(false);
  };

  const disabled = isSubmitting || !hasContent || !hasAccounts;

  return (
    <>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Button variant="accent" className="flex-1 min-w-[100px] sm:min-w-[140px] text-xs sm:text-sm" disabled={disabled} onClick={onSaveDraft}>
          <Save className="w-4 h-4" /> Save Draft
        </Button>
        <Button variant="success" className="flex-1 min-w-[100px] sm:min-w-[140px] text-xs sm:text-sm" disabled={disabled} onClick={() => setScheduleOpen(true)}>
          <CalendarDays className="w-4 h-4" /> Schedule Post
        </Button>
        <Button className="flex-1 min-w-[100px] sm:min-w-[140px] text-xs sm:text-sm" disabled={disabled} onClick={onPostNow}>
          <Send className="w-4 h-4" /> Post Now
        </Button>
        <Button variant="outline" className="min-w-[80px] sm:min-w-[120px] text-xs sm:text-sm" disabled={disabled}>
          <ListOrdered className="w-4 h-4" /> Queue
        </Button>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select date</label>
              <div className="relative">
                <input type="text" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="DD/MM/YYYY" />
                <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select time</label>
              <div className="relative">
                <input type="text" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="HH:MM AM/PM" />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <p className="text-sm font-medium text-[hsl(var(--destructive))]">{scheduleSummary}</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-foreground"><Sparkles className="w-4 h-4" /> Suggested times</div>
                <button className="text-sm font-medium text-primary hover:underline">Refresh</button>
              </div>
              <p className="text-xs text-muted-foreground">Could not load suggestions.</p>
            </div>
          </div>
          <Button className="w-full mt-2" onClick={handleScheduleConfirm}>Post</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
