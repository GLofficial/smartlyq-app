import { useState } from "react";
import {
  useCrmProjectGet,
  useCrmProjectSave,
  useCrmContentItemSave,
  useCrmContentItemDelete,
  useCrmContentItemStatus,
  type ApiContentItem,
} from "@/api/crm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, GripVertical, FileText, X, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: "queued", label: "Queued", color: "bg-gray-500" },
  { value: "generating", label: "Generating", color: "bg-blue-500" },
  { value: "draft", label: "Draft", color: "bg-yellow-500" },
  { value: "approved", label: "Approved", color: "bg-green-500" },
  { value: "published", label: "Published", color: "bg-purple-500" },
] as const;

const TYPE_OPTIONS = [
  "SEO Article",
  "Social Post",
  "Ad Copy",
  "Blog Post",
] as const;

function statusColor(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.color ?? "bg-gray-500";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ProjectEditDialogProps {
  projectId: number | null;
  onClose: () => void;
}

export function ProjectEditDialog({ projectId, onClose }: ProjectEditDialogProps) {
  const { data, isLoading } = useCrmProjectGet(projectId);
  const saveProject = useCrmProjectSave();
  const saveItem = useCrmContentItemSave();
  const deleteItem = useCrmContentItemDelete();
  const statusMut = useCrmContentItemStatus();

  const project = data?.project ?? null;
  const items: Pick<ApiContentItem, "id" | "title" | "type" | "status" | "word_count" | "sort_order">[] =
    project?.content_items ?? [];

  // Rename
  const [renameName, setRenameName] = useState<string | null>(null);
  const displayName = renameName ?? project?.name ?? "";

  // New item form
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<string>(TYPE_OPTIONS[0]);

  // --- Rename ---
  function handleRename() {
    if (!project || !renameName?.trim()) return;
    saveProject.mutate(
      { id: project.id, name: renameName.trim() },
      {
        onSuccess: () => {
          toast.success("Project renamed");
          setRenameName(null);
        },
        onError: () => toast.error("Rename failed"),
      },
    );
  }

  // --- Add item ---
  function handleAddItem() {
    if (!project || !newTitle.trim()) return;
    const nextSort = items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) + 1 : 0;
    saveItem.mutate(
      { project_id: project.id, title: newTitle.trim(), type: newType, status: "queued", sort_order: nextSort },
      {
        onSuccess: () => {
          toast.success("Item added");
          setNewTitle("");
        },
        onError: () => toast.error("Failed to add item"),
      },
    );
  }

  // --- Delete item ---
  function handleDeleteItem(itemId: number) {
    if (!project) return;
    deleteItem.mutate(
      { id: itemId, project_id: project.id },
      {
        onSuccess: () => toast.success("Item removed"),
        onError: () => toast.error("Failed to remove item"),
      },
    );
  }

  // --- Status change ---
  function handleStatusChange(itemId: number, status: string) {
    if (!project) return;
    statusMut.mutate(
      { id: itemId, project_id: project.id, status },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: () => toast.error("Failed to update status"),
      },
    );
  }

  return (
    <Dialog open={projectId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Edit Project
          </DialogTitle>
          <DialogDescription>Manage project name and content items.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : project ? (
          <div className="space-y-5">
            {/* Rename row */}
            <div className="flex items-center gap-2">
              <Input
                className="flex-1"
                value={displayName}
                onChange={(e) => setRenameName(e.target.value)}
                onFocus={() => { if (renameName === null) setRenameName(project.name); }}
              />
              <Button
                size="sm"
                disabled={!renameName?.trim() || renameName.trim() === project.name}
                onClick={handleRename}
              >
                Rename
              </Button>
            </div>

            {/* Content items */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                Content Items ({items.length})
              </h4>
              {items.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)] py-3 text-center">
                  No content items yet. Add one below.
                </p>
              ) : (
                <ul className="space-y-1.5 max-h-56 overflow-y-auto">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 rounded-md border border-[var(--border)] px-2 py-1.5 bg-[var(--card)]"
                    >
                      <GripVertical className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0 cursor-grab" />
                      <FileText className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0" />
                      <span className="flex-1 text-sm truncate text-[var(--foreground)]">
                        {item.title}
                      </span>
                      <Select
                        value={item.status}
                        onValueChange={(val) => handleStatusChange(item.id, val)}
                      >
                        <SelectTrigger className="h-7 w-[130px] text-xs">
                          <SelectValue>
                            <Badge
                              variant="secondary"
                              className={`text-white text-[10px] px-1.5 py-0 ${statusColor(item.status)}`}
                            >
                              {STATUS_OPTIONS.find((s) => s.value === item.status)?.label ?? item.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                                {s.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add new item */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Content title"
                className="flex-1"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddItem(); }}
              />
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="icon" variant="outline" disabled={!newTitle.trim()} onClick={handleAddItem}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">Project not found.</p>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
