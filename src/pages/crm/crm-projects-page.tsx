import { useState, useMemo } from "react";
import {
  useCrmProjects,
  useCrmProjectSave,
  useCrmProjectDelete,
  useCrmDeals,
  type ApiProject,
} from "@/api/crm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Trash2,
  ArrowUpDown,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

type SortKey = "name" | "items" | "created";
type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function CrmProjectsPage() {
  const { data: projectsData, isLoading } = useCrmProjects();
  const { data: dealsData } = useCrmDeals();
  const saveProject = useCrmProjectSave();
  const deleteProjectMut = useCrmProjectDelete();

  const projects = projectsData?.projects ?? [];
  const deals = dealsData?.deals ?? [];

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiProject | null>(null);

  // Create form
  const [newName, setNewName] = useState("");
  const [newDealId, setNewDealId] = useState<string>("none");

  // --- Filtering & sorting ---
  const filtered = useMemo(() => {
    let list = [...projects];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "items") cmp = a.item_count - b.item_count;
      else cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [projects, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  // --- Create project ---
  function handleCreate() {
    if (!newName.trim()) return;
    saveProject.mutate({
      name: newName.trim(),
      deal_id: newDealId !== "none" ? Number(newDealId) : undefined,
    });
    setNewName("");
    setNewDealId("none");
    setCreateOpen(false);
  }

  // --- Delete project ---
  function handleDelete() {
    if (!deleteTarget) return;
    deleteProjectMut.mutate(deleteTarget.id);
    setDeleteTarget(null);
  }

  if (isLoading) {
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
                <TableHead>Linked Deal</TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort("created")}
                    className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors"
                  >
                    Created <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </TableHead>
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
              {filtered.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="font-medium text-[var(--foreground)]">{project.name}</div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {project.item_count}
                  </TableCell>
                  <TableCell>
                    {project.deal_name ? (
                      <span className="text-sm text-[var(--foreground)]">{project.deal_name}</span>
                    ) : (
                      <span className="text-xs text-[var(--muted-foreground)]">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">
                    {new Date(project.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
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
              ))}
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
            {deals.length > 0 && (
              <div className="space-y-2">
                <Label>Link to Deal (optional)</Label>
                <Select value={newDealId} onValueChange={setNewDealId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a deal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No deal</SelectItem>
                    {deals.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.client_name} — {d.client_company}
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
