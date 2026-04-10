import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  useCrmTaskSave,
  type ApiTask,
  type ApiDeal,
  type ApiContact,
} from "@/api/crm";
import type { TaskStatus, TaskPriority } from "@/lib/crm-data";
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
  task: ApiTask | null;
  deals: ApiDeal[];
  contacts: ApiContact[];
  onClose: () => void;
}

export function TaskDetailSheet({ task, deals, contacts, onClose }: TaskDetailSheetProps) {
  const saveTask = useCrmTaskSave();

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
      saveTask.mutate(
        {
          id: task.id,
          time_tracked_minutes: task.time_tracked_minutes + elapsed,
        },
        {
          onSuccess: () => toast.success("Time tracked"),
          onError: () => toast.error("Failed to save time"),
        },
      );
      setTimerRunning(false);
      setTimerStart(null);
    } else {
      setTimerRunning(true);
      setTimerStart(Date.now());
    }
  }

  function handleStatusChange(status: TaskStatus) {
    if (!task) return;
    saveTask.mutate(
      { id: task.id, status },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: () => toast.error("Failed to update status"),
      },
    );
  }

  function handlePriorityChange(priority: TaskPriority) {
    if (!task) return;
    saveTask.mutate(
      { id: task.id, priority },
      {
        onSuccess: () => toast.success("Priority updated"),
        onError: () => toast.error("Failed to update priority"),
      },
    );
  }

  function handleDueDateChange(date: string) {
    if (!task) return;
    saveTask.mutate(
      { id: task.id, due_date: date },
      {
        onSuccess: () => toast.success("Due date updated"),
        onError: () => toast.error("Failed to update due date"),
      },
    );
  }

  function handleLinkedDealChange(dealId: string) {
    if (!task) return;
    saveTask.mutate(
      {
        id: task.id,
        linked_deal_id: dealId === "none" ? null : Number(dealId),
      },
      {
        onSuccess: () => toast.success("Linked deal updated"),
        onError: () => toast.error("Failed to update linked deal"),
      },
    );
  }

  function handleLinkedContactChange(contactId: string) {
    if (!task) return;
    saveTask.mutate(
      {
        id: task.id,
        linked_contact_id: contactId === "none" ? null : Number(contactId),
      },
      {
        onSuccess: () => toast.success("Linked contact updated"),
        onError: () => toast.error("Failed to update linked contact"),
      },
    );
  }

  function handleRecurrenceChange(freq: string) {
    if (!task) return;
    saveTask.mutate(
      {
        id: task.id,
        recurrence: freq === "none" ? null : freq,
      },
      {
        onSuccess: () => toast.success("Recurrence updated"),
        onError: () => toast.error("Failed to update recurrence"),
      },
    );
  }

  // Subtasks
  function toggleSubtask(idx: number) {
    if (!task) return;
    const updated = task.subtasks.map((s, i) =>
      i === idx ? { ...s, done: !s.done } : s,
    );
    saveTask.mutate(
      { id: task.id, subtasks: updated },
      {
        onError: () => toast.error("Failed to update subtask"),
      },
    );
  }

  function addSubtask() {
    if (!task || !newSubtask.trim()) return;
    saveTask.mutate(
      {
        id: task.id,
        subtasks: [...task.subtasks, { title: newSubtask.trim(), done: false }],
      },
      {
        onSuccess: () => {
          toast.success("Subtask added");
          setNewSubtask("");
        },
        onError: () => toast.error("Failed to add subtask"),
      },
    );
  }

  function removeSubtask(idx: number) {
    if (!task) return;
    saveTask.mutate(
      {
        id: task.id,
        subtasks: task.subtasks.filter((_, i) => i !== idx),
      },
      {
        onSuccess: () => toast.success("Subtask removed"),
        onError: () => toast.error("Failed to remove subtask"),
      },
    );
  }

  // Tags
  function addTag() {
    if (!task || !newTag.trim()) return;
    if (task.tags.includes(newTag.trim())) return;
    saveTask.mutate(
      { id: task.id, tags: [...task.tags, newTag.trim()] },
      {
        onSuccess: () => {
          toast.success("Tag added");
          setNewTag("");
        },
        onError: () => toast.error("Failed to add tag"),
      },
    );
  }

  function removeTag(tag: string) {
    if (!task) return;
    saveTask.mutate(
      { id: task.id, tags: task.tags.filter((t) => t !== tag) },
      {
        onSuccess: () => toast.success("Tag removed"),
        onError: () => toast.error("Failed to remove tag"),
      },
    );
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
              {formatMinutes(task.time_tracked_minutes)}
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
              value={task.due_date ?? ""}
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
            value={task.recurrence ?? "none"}
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
              value={task.linked_deal_id ? String(task.linked_deal_id) : "none"}
              onValueChange={handleLinkedDealChange}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {deals.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.client_company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Linked Contact</Label>
            <Select
              value={task.linked_contact_id ? String(task.linked_contact_id) : "none"}
              onValueChange={handleLinkedContactChange}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
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
            {task.subtasks.map((st, idx) => (
              <div key={idx} className="flex items-center gap-2 group">
                <Checkbox
                  checked={st.done}
                  onCheckedChange={() => toggleSubtask(idx)}
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
                  onClick={() => removeSubtask(idx)}
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
          {new Date(task.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
