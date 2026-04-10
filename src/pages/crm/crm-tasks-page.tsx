import { useState, useMemo, useCallback } from "react";
import {
  useCrmTasks,
  useCrmDeals,
  useCrmContacts,
  useCrmTaskSave,
  useCrmTaskDelete,
  type ApiTask,
} from "@/api/crm";
import type {
  TaskStatus,
  TaskPriority,
} from "@/lib/crm-data";
import {
  TASK_STATUS_CONFIG,
  TASK_STATUS_ORDER,
  PRIORITY_CONFIG,
} from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Trash2,
  CheckSquare,
  GripVertical,
  Loader2,
} from "lucide-react";
import { TaskCard } from "./components/task-card";
import { TaskDetailSheet } from "./components/task-detail-sheet";

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function CrmTasksPage() {
  const { data: tasksData, isLoading: tasksLoading } = useCrmTasks();
  const { data: dealsData } = useCrmDeals();
  const { data: contactsData } = useCrmContacts();
  const saveTask = useCrmTaskSave();
  const deleteTaskMut = useCrmTaskDelete();

  const tasks = tasksData?.tasks ?? [];
  const deals = dealsData?.deals ?? [];
  const contacts = contactsData?.contacts ?? [];

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [draggingId, setDraggingId] = useState<number | null>(null);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiTask | null>(null);

  // Bulk select
  const [bulkIds, setBulkIds] = useState<Set<number>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // Create form
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPriority, setFormPriority] = useState<TaskPriority>("medium");
  const [formDueDate, setFormDueDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [formDealId, setFormDealId] = useState("none");
  const [formContactId, setFormContactId] = useState("none");

  // --- Filtered tasks by column ---
  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }
    if (priorityFilter !== "all") {
      list = list.filter((t) => t.priority === priorityFilter);
    }
    return list;
  }, [tasks, search, priorityFilter]);

  const columns: { status: TaskStatus; tasks: ApiTask[] }[] = useMemo(
    () =>
      TASK_STATUS_ORDER.map((status) => ({
        status,
        tasks: filteredTasks
          .filter((t) => t.status === status)
          .sort(
            (a, b) =>
              new Date(a.due_date ?? "").getTime() -
              new Date(b.due_date ?? "").getTime(),
          ),
      })),
    [filteredTasks],
  );

  // --- Drag & drop ---
  const handleDragStart = useCallback((id: number) => setDraggingId(id), []);
  const handleDragEnd = useCallback(() => setDraggingId(null), []);

  function handleDrop(status: TaskStatus) {
    if (draggingId === null) return;
    saveTask.mutate({ id: draggingId, status });
    setDraggingId(null);
  }

  // --- Bulk actions ---
  function toggleBulkId(id: number) {
    setBulkIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkDelete() {
    bulkIds.forEach((id) => deleteTaskMut.mutate(id));
    setBulkIds(new Set());
    setBulkMode(false);
  }

  function bulkChangeStatus(status: TaskStatus) {
    bulkIds.forEach((id) => saveTask.mutate({ id, status }));
    setBulkIds(new Set());
    setBulkMode(false);
  }

  // --- Create task ---
  function handleCreate() {
    if (!formTitle.trim()) return;
    saveTask.mutate({
      title: formTitle.trim(),
      description: formDesc.trim(),
      status: "todo",
      priority: formPriority,
      due_date: formDueDate,
      linked_deal_id: formDealId !== "none" ? Number(formDealId) : null,
      linked_contact_id: formContactId !== "none" ? Number(formContactId) : null,
    });
    resetForm();
    setCreateOpen(false);
  }

  function resetForm() {
    setFormTitle("");
    setFormDesc("");
    setFormPriority("medium");
    setFormDueDate(new Date().toISOString().slice(0, 10));
    setFormDealId("none");
    setFormContactId("none");
  }

  // Keep selectedTask in sync
  const liveSelectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) ?? null
    : null;

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Tasks</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {tasks.filter((t) => t.status !== "done").length} open &middot;{" "}
            {tasks.filter((t) => t.status === "done").length} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          {bulkMode ? (
            <>
              <span className="text-xs text-[var(--muted-foreground)]">
                {bulkIds.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkChangeStatus("done")}
                disabled={bulkIds.size === 0}
              >
                <CheckSquare className="w-3.5 h-3.5 mr-1" />
                Mark Done
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={bulkDelete}
                disabled={bulkIds.size === 0}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBulkMode(false);
                  setBulkIds(new Set());
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkMode(true)}
              >
                <GripVertical className="w-3.5 h-3.5 mr-1" />
                Bulk
              </Button>
              <Button onClick={() => { resetForm(); setCreateOpen(true); }}>
                <Plus className="w-4 h-4 mr-1.5" />
                New Task
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_CONFIG[p].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(({ status, tasks: colTasks }) => {
          const cfg = TASK_STATUS_CONFIG[status];
          return (
            <div
              key={status}
              className="flex flex-col rounded-lg border border-[var(--border)] bg-[var(--muted)]/30"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(status)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    {cfg.label}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {colTasks.length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 space-y-3 min-h-[200px]">
                {colTasks.length === 0 && (
                  <p className="text-xs text-[var(--muted-foreground)] text-center py-8">
                    No tasks
                  </p>
                )}
                {colTasks.map((task) => (
                  <div key={task.id} className="relative">
                    {bulkMode && (
                      <button
                        className={cn(
                          "absolute -left-1 -top-1 z-10 w-5 h-5 rounded border-2 flex items-center justify-center text-xs",
                          bulkIds.has(task.id)
                            ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]"
                            : "bg-[var(--background)] border-[var(--border)]",
                        )}
                        onClick={() => toggleBulkId(task.id)}
                      >
                        {bulkIds.has(task.id) && "check"}
                      </button>
                    )}
                    <TaskCard
                      task={task}
                      deals={deals}
                      contacts={contacts}
                      onClick={() => !bulkMode && setSelectedTaskId(task.id)}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={draggingId === task.id}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task detail sheet */}
      <TaskDetailSheet
        task={liveSelectedTask}
        deals={deals}
        contacts={contacts}
        onClose={() => setSelectedTaskId(null)}
      />

      {/* --- Create dialog --- */}
      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) setCreateOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>Create a new task for your pipeline.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Task title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
                placeholder="Task description..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formPriority}
                  onValueChange={(v) => setFormPriority(v as TaskPriority)}
                >
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Link to Deal</Label>
                <Select value={formDealId} onValueChange={setFormDealId}>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label>Link to Contact</Label>
                <Select value={formContactId} onValueChange={setFormContactId}>
                  <SelectTrigger>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formTitle.trim()}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Delete dialog --- */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deleteTaskMut.mutate(deleteTarget.id);
                setDeleteTarget(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
