import { useState, useMemo } from "react";
import { useDealFlowStore } from "@/stores/deal-flow-store";
import type { ContentItem, SmartlyQProject } from "@/lib/deal-flow-data";
import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Pencil,
  Trash2,
  ArrowUpDown,
  FileText,
  Megaphone,
  Sparkles,
  PenLine,
} from "lucide-react";
import { EditProjectContent } from "./components/edit-project-content";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TYPE_ICON: Record<ContentItem["type"], React.ReactNode> = {
  "seo-article": <FileText className="w-3.5 h-3.5" />,
  "social-post": <Megaphone className="w-3.5 h-3.5" />,
  "ad-copy": <Sparkles className="w-3.5 h-3.5" />,
  "blog-post": <PenLine className="w-3.5 h-3.5" />,
};

const STATUS_STYLE: Record<ContentItem["status"], string> = {
  queued: "bg-gray-100 text-gray-600 border-gray-200",
  generating: "bg-blue-50 text-blue-600 border-blue-200",
  draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const CONTENT_STATUSES: ContentItem["status"][] = [
  "queued",
  "generating",
  "draft",
  "approved",
  "published",
];

type SortKey = "name" | "items" | "progress";
type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function DealFlowProjectsPage() {
  const projects = useDealFlowStore((s) => s.projects);
  const deals = useDealFlowStore((s) => s.deals);
  const createProject = useDealFlowStore((s) => s.createProject);
  const updateProject = useDealFlowStore((s) => s.updateProject);
  const deleteProject = useDealFlowStore((s) => s.deleteProject);
  const addContentItem = useDealFlowStore((s) => s.addContentItem);
  const removeContentItem = useDealFlowStore((s) => s.removeContentItem);
  const updateContentItemStatus = useDealFlowStore((s) => s.updateContentItemStatus);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<SmartlyQProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SmartlyQProject | null>(null);

  // Create form
  const [newName, setNewName] = useState("");
  const [newDealId, setNewDealId] = useState<string>("none");

  // Add item form (inside edit dialog)
  const [addTitle, setAddTitle] = useState("");
  const [addType, setAddType] = useState<ContentItem["type"]>("seo-article");

  // --- Filtering & sorting ---
  const filtered = useMemo(() => {
    let list = [...projects];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      list = list.filter((p) =>
        p.items.some((i) => i.status === statusFilter),
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "items") cmp = a.items.length - b.items.length;
      else {
        const pa = getPercent(a);
        const pb = getPercent(b);
        cmp = pa - pb;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [projects, search, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function getPercent(p: SmartlyQProject): number {
    if (p.items.length === 0) return 0;
    const done = p.items.filter(
      (i) => i.status === "approved" || i.status === "published",
    ).length;
    return Math.round((done / p.items.length) * 100);
  }

  // --- Create project ---
  function handleCreate() {
    if (!newName.trim()) return;
    const id = `proj-${Date.now()}`;
    const project: SmartlyQProject = { id, name: newName.trim(), items: [] };
    createProject(project, newDealId !== "none" ? newDealId : undefined);
    setNewName("");
    setNewDealId("none");
    setCreateOpen(false);
  }

  // --- Add content item ---
  function handleAddItem() {
    if (!editProject || !addTitle.trim()) return;
    const item: ContentItem = {
      id: `ci-${Date.now()}`,
      title: addTitle.trim(),
      type: addType,
      status: "queued",
    };
    addContentItem(editProject.id, item);
    setAddTitle("");
    // Refresh editProject reference
    const updated = projects.find((p) => p.id === editProject.id);
    if (updated) setEditProject({ ...updated, items: [...updated.items, item] });
  }

  // --- Delete project ---
  function handleDelete() {
    if (!deleteTarget) return;
    deleteProject(deleteTarget.id);
    setDeleteTarget(null);
  }

  // Deals that don't already have a project
  const availableDeals = deals.filter((d) => !d.project);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Projects</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Manage content projects linked to your deals.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {CONTENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors"
                  >
                    Project <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </TableHead>
                <TableHead className="text-center">
                  <button
                    onClick={() => toggleSort("items")}
                    className="flex items-center gap-1 mx-auto hover:text-[var(--foreground)] transition-colors"
                  >
                    Items <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort("progress")}
                    className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors"
                  >
                    Progress <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </TableHead>
                <TableHead>Content Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-[var(--muted-foreground)]">
                    No projects found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((project) => {
                const pct = getPercent(project);
                const linkedDeal = deals.find((d) => d.project?.id === project.id);
                return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-[var(--foreground)]">{project.name}</div>
                        {linkedDeal && (
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {linkedDeal.clientCompany}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {project.items.length}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-xs text-[var(--muted-foreground)] w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.items.slice(0, 3).map((item) => (
                          <Badge
                            key={item.id}
                            variant="outline"
                            className={cn("text-[10px] gap-1", STATUS_STYLE[item.status])}
                          >
                            {TYPE_ICON[item.type]}
                            <span className="truncate max-w-[100px]">{item.title}</span>
                          </Badge>
                        ))}
                        {project.items.length > 3 && (
                          <Badge variant="secondary" className="text-[10px]">
                            +{project.items.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditProject(project)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => setDeleteTarget(project)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- Create dialog --- */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>Create a content project and optionally link it to a deal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                placeholder="e.g. Q2 Content Suite"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            {availableDeals.length > 0 && (
              <div className="space-y-2">
                <Label>Link to Deal (optional)</Label>
                <Select value={newDealId} onValueChange={setNewDealId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a deal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No deal</SelectItem>
                    {availableDeals.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.clientName} — {d.clientCompany}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Edit dialog --- */}
      <Dialog open={!!editProject} onOpenChange={(open) => !open && setEditProject(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Manage project name and content items.</DialogDescription>
          </DialogHeader>
          {editProject && (
            <EditProjectContent
              project={editProject}
              onRename={(name) => {
                updateProject(editProject.id, { name });
                setEditProject({ ...editProject, name });
              }}
              onRemoveItem={(itemId) => {
                removeContentItem(editProject.id, itemId);
                setEditProject({
                  ...editProject,
                  items: editProject.items.filter((i) => i.id !== itemId),
                });
              }}
              onStatusChange={(itemId, status) => {
                updateContentItemStatus(editProject.id, itemId, status);
                setEditProject({
                  ...editProject,
                  items: editProject.items.map((i) =>
                    i.id === itemId ? { ...i, status } : i,
                  ),
                });
              }}
              addTitle={addTitle}
              setAddTitle={setAddTitle}
              addType={addType}
              setAddType={setAddType}
              onAddItem={handleAddItem}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* --- Delete dialog --- */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This will remove the project
              and all its content items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

