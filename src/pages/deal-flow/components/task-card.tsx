import { cn } from "@/lib/cn";
import type { CrmTask, Deal, Contact } from "@/lib/deal-flow-data";
import { PRIORITY_CONFIG } from "@/lib/deal-flow-data";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  AlertTriangle,
  Timer,
  LinkIcon,
  ListChecks,
  Tag,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TaskCardProps {
  task: CrmTask;
  deals: Deal[];
  contacts: Contact[];
  onClick: () => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export function TaskCard({
  task,
  deals,
  contacts,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
}: TaskCardProps) {
  const priorityCfg = PRIORITY_CONFIG[task.priority];
  const overdue = task.status !== "done" && isOverdue(task.dueDate);
  const linkedDeal = task.linkedDealId
    ? deals.find((d) => d.id === task.linkedDealId)
    : undefined;
  const linkedContact = task.linkedContactId
    ? contacts.find((c) => c.id === task.linkedContactId)
    : undefined;
  const completedSubtasks = task.subtasks.filter((s) => s.done).length;

  return (
    <div
      className={cn(
        "bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]",
        isDragging && "opacity-40",
        overdue && "border-red-300",
      )}
      draggable
      onDragStart={() => onDragStart(task.id)}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      {/* Title + priority */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-[var(--foreground)] line-clamp-2">
          {task.title}
        </span>
        <Badge
          variant="outline"
          className={cn("text-[10px] px-1.5 py-0 shrink-0", priorityCfg.className)}
        >
          {priorityCfg.label}
        </Badge>
      </div>

      {/* Overdue indicator */}
      {overdue && (
        <div className="flex items-center gap-1 text-xs text-red-500 font-medium mb-2">
          <AlertTriangle className="w-3 h-3" />
          Overdue
        </div>
      )}

      {/* Due date */}
      <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-1.5">
        <Clock className="w-3 h-3" />
        {new Date(task.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </div>

      {/* Timer */}
      {task.timeTrackedMinutes > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-1.5">
          <Timer className="w-3 h-3" />
          {formatMinutes(task.timeTrackedMinutes)}
        </div>
      )}

      {/* Linked items */}
      {(linkedDeal || linkedContact) && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-1.5">
          <LinkIcon className="w-3 h-3" />
          <span className="truncate">
            {linkedDeal ? linkedDeal.clientCompany : ""}
            {linkedDeal && linkedContact ? " / " : ""}
            {linkedContact ? linkedContact.name : ""}
          </span>
        </div>
      )}

      {/* Subtasks */}
      {task.subtasks.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-1.5">
          <ListChecks className="w-3 h-3" />
          {completedSubtasks}/{task.subtasks.length} subtasks
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {task.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
            >
              <Tag className="w-2.5 h-2.5 mr-0.5" />
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
