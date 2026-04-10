import { useState, useEffect } from "react";
import { useCrmStore } from "@/stores/crm-store";
import type { CrmTask, TaskStatus, TaskPriority, Subtask } from "@/lib/crm-data";
import { TASK_STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Timer,
  Play,
  Pause,
  Plus,
  X,
  Tag,
  RefreshCw,
  CalendarIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TaskDetailSheetProps {
  task: CrmTask | null;
  onClose: () => void;
}

export function TaskDetailSheet({ task, onClose }: TaskDetailSheetProps) {
  const deals = useCrmStore((s) => s.deals);
  const contacts = useCrmStore((s) => s.contacts);
  const updateTask = useCrmStore((s) => s.updateTask);

  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<number | null>(null);

  // New subtask
  const [newSubtask, setNewSubtask] = useState("");

  // New tag
  const [newTag, setNewTag] = useState("");

  // Reset timer when task changes
  useEffect(() => {
    setTimerRunning(false);
    setTimerStart(null);
  }, [task?.id]);

  if (!task) return null;

  function handleToggleTimer() {
    if (!task) return;
    if (timerRunning && timerStart) {
      const elapsed = Math.round((Date.now() - timerStart) / 60000);
      updateTask(task.id, {
        timeTrackedMinutes: task.timeTrackedMinutes + elapsed,
      });
      setTimerRunning(false);
      setTimerStart(null);
    } else {
      setTimerRunning(true);
      setTimerStart(Date.now());
    }
  }

  function handleStatusChange(status: TaskStatus) {
    if (!task) return;
    updateTask(task.id, { status });
  }

  function handlePriorityChange(priority: TaskPriority) {
    if (!task) return;
    updateTask(task.id, { priority });
  }

  function handleDueDateChange(date: string) {
    if (!task) return;
    updateTask(task.id, { dueDate: date });
  }

  function handleLinkedDealChange(dealId: string) {
    if (!task) return;
    updateTask(task.id, { linkedDealId: dealId === "none" ? undefined : dealId });
  }

  function handleLinkedContactChange(contactId: string) {
    if (!task) return;
    updateTask(task.id, {
      linkedContactId: contactId === "none" ? undefined : contactId,
    });
  }

  function handleRecurrenceChange(freq: string) {
    if (!task) return;
    if (freq === "none") {
      updateTask(task.id, { recurrence: undefined });
    } else {
      const nextDate = new Date();
      nextDate.setDate(
        nextDate.getDate() +
          (freq === "daily" ? 1 : freq === "weekly" ? 7 : freq === "biweekly" ? 14 : 30),
      );
      updateTask(task.id, {
        recurrence: {
          frequency: freq as CrmTask["recurrence"] extends undefined ? never : NonNullable<CrmTask["recurrence"]>["frequency"],
          nextDate: nextDate.toISOString().slice(0, 10),
        },
      });
    }
  }

  // Subtasks
  function toggleSubtask(subtaskId: string) {
    if (!task) return;
    const updated = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, done: !s.done } : s,
    );
    updateTask(task.id, { subtasks: updated });
  }

  function addSubtask() {
    if (!task || !newSubtask.trim()) return;
    const st: Subtask = {
      id: `st-${Date.now()}`,
      title: newSubtask.trim(),
      done: false,
    };
    updateTask(task.id, { subtasks: [...task.subtasks, st] });
    setNewSubtask("");
  }

  function removeSubtask(subtaskId: string) {
    if (!task) return;
    updateTask(task.id, {
      subtasks: task.subtasks.filter((s) => s.id !== subtaskId),
    });
  }

  // Tags
  function addTag() {
    if (!task || !newTag.trim()) return;
    if (task.tags.includes(newTag.trim())) return;
    updateTask(task.id, { tags: [...task.tags, newTag.trim()] });
    setNewTag("");
  }

  function removeTag(tag: string) {
    if (!task) return;
    updateTask(task.id, { tags: task.tags.filter((t) => t !== tag) });
  }

  return (
    <Sheet open={!!task} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">{task.title}</SheetTitle>
          <SheetDescription>{task.description}</SheetDescription>
        </SheetHeader>

        {/* Timer */}
        <div className="flex items-center gap-3 mt-4 p-3 rounded-md bg-[var(--muted)]/50 border border-[var(--border)]">
          <Timer className="w-5 h-5 text-[var(--muted-foreground)]" />
          <div className="flex-1">
            <span className="text-sm font-medium text-[var(--foreground)]">
              {formatMinutes(task.timeTrackedMinutes)}
            </span>
            <span className="text-xs text-[var(--muted-foreground)] ml-1">tracked</span>
          </div>
          <Button
            variant={timerRunning ? "destructive" : "outline"}
            size="sm"
            onClick={handleToggleTimer}
          >
            {timerRunning ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
            {timerRunning ? "Stop" : "Start"}
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Status & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TASK_STATUS_CONFIG) as TaskStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {TASK_STATUS_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Priority</Label>
            <Select value={task.priority} onValueChange={(v) => handlePriorityChange(v as TaskPriority)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PRIORITY_CONFIG[p].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Due date */}
        <div className="space-y-1.5 mt-3">
          <Label className="text-xs">Due Date</Label>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              type="date"
              value={task.dueDate}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        {/* Recurrence */}
        <div className="space-y-1.5 mt-3">
          <Label className="text-xs flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Recurrence
          </Label>
          <Select
            value={task.recurrence?.frequency ?? "none"}
            onValueChange={handleRecurrenceChange}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No recurrence</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Linked deal / contact */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Linked Deal</Label>
            <Select
              value={task.linkedDealId ?? "none"}
              onValueChange={handleLinkedDealChange}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {deals.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.clientCompany}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Linked Contact</Label>
            <Select
              value={task.linkedContactId ?? "none"}
              onValueChange={handleLinkedContactChange}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Subtasks */}
        <div className="space-y-2">
          <Label className="text-xs">
            Subtasks ({task.subtasks.filter((s) => s.done).length}/{task.subtasks.length})
          </Label>
          <div className="space-y-1.5">
            {task.subtasks.map((st) => (
              <div key={st.id} className="flex items-center gap-2 group">
                <Checkbox
                  checked={st.done}
                  onCheckedChange={() => toggleSubtask(st.id)}
                />
                <span
                  className={cn(
                    "text-sm flex-1",
                    st.done && "line-through text-[var(--muted-foreground)]",
                  )}
                >
                  {st.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={() => removeSubtask(st.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="New subtask..."
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addSubtask()}
            />
            <Button size="sm" variant="outline" className="h-8" onClick={addSubtask} disabled={!newSubtask.trim()}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-xs">Tags</Label>
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs gap-1">
                <Tag className="w-2.5 h-2.5" />
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 hover:text-red-500"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addTag()}
            />
            <Button size="sm" variant="outline" className="h-8" onClick={addTag} disabled={!newTag.trim()}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Created date */}
        <div className="text-xs text-[var(--muted-foreground)] mt-6">
          Created{" "}
          {new Date(task.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
