import { useState } from "react";
import { toast } from "sonner";
import {
  type ApiDeal,
  useCrmDealGet,
  useCrmDealDelete,
  useCrmProjects,
  useCrmProjectSave,
  useCrmCommunicationAdd,
} from "@/api/crm";
import { type StageConfig, formatCurrency } from "@/lib/crm-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Mail,
  Building2,
  Calendar,
  FileText,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Loader2,
  Link2,
  Send,
  RefreshCw,
  Unlink,
  Trash2,
} from "lucide-react";
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

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DealDetailProps {
  deal: ApiDeal;
  stageConfig: Record<string, StageConfig>;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DealDetail({ deal, stageConfig, onClose }: DealDetailProps) {
  const { data: detailData, isLoading } = useCrmDealGet(deal.id);
  const deleteDeal = useCrmDealDelete();
  const saveProject = useCrmProjectSave();
  const { data: projectsData } = useCrmProjects();
  const addComm = useCrmCommunicationAdd();

  const stage = stageConfig[deal.stage];
  const communications = detailData?.communications ?? [];
  const project = detailData?.project;
  const contentItems = project?.content_items ?? [];

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("none");
  const [commMessage, setCommMessage] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const availableProjects = projectsData?.projects ?? [];

  function handleAttachProject() {
    if (selectedProjectId === "none") return;
    // If there's already a project linked, unlink it first
    if (project) {
      saveProject.mutate(
        { id: project.id, deal_id: 0 },
        {
          onSuccess: () => {
            // Now link the new project
            saveProject.mutate(
              { id: Number(selectedProjectId), deal_id: deal.id },
              {
                onSuccess: () => {
                  toast.success("Project attached");
                  setProjectDialogOpen(false);
                  setSelectedProjectId("none");
                },
                onError: () => toast.error("Failed to attach project"),
              },
            );
          },
        },
      );
    } else {
      saveProject.mutate(
        { id: Number(selectedProjectId), deal_id: deal.id },
        {
          onSuccess: () => {
            toast.success("Project attached");
            setProjectDialogOpen(false);
            setSelectedProjectId("none");
          },
          onError: () => toast.error("Failed to attach project"),
        },
      );
    }
  }

  function handleAddComm() {
    if (!commMessage.trim()) return;
    addComm.mutate(
      {
        deal_id: deal.id,
        message: commMessage.trim(),
        sender: "You",
      },
      {
        onSuccess: () => {
          toast.success("Note added");
          setCommMessage("");
        },
        onError: () => toast.error("Failed to add note"),
      },
    );
  }

  return (
    <div className="h-full flex flex-col bg-[var(--card)] border-l border-[var(--border)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {deal.client_name}
          </h2>
          {stage && (
            <span
              className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `hsl(${stage.color} / 0.15)`,
                color: `hsl(${stage.color})`,
              }}
            >
              {stage.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-[var(--muted-foreground)] hover:text-red-500"
            onClick={() => setDeleteOpen(true)}
            title="Delete this deal"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 space-y-5">
        {/* Client info */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Mail className="w-3.5 h-3.5" />
            <a href={`mailto:${deal.client_email}`} className="hover:underline">
              {deal.client_email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Building2 className="w-3.5 h-3.5" />
            <span>{deal.client_company}</span>
          </div>
          {deal.next_action_date && (
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Next action:{" "}
                {new Date(deal.next_action_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </section>

        {/* Value */}
        {deal.value > 0 && (
          <div className="text-2xl font-bold text-orange-500">
            {formatCurrency(deal.value)}
          </div>
        )}

        {/* Notes */}
        {deal.notes && (
          <section>
            <h3 className="text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-1.5">
              Notes
            </h3>
            <p className="text-sm text-[var(--foreground)] leading-relaxed">
              {deal.notes}
            </p>
          </section>
        )}

        <Separator />

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : (
          <>
            {/* SmartlyQ project */}
            {project ? (
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold uppercase text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    SmartlyQ Project
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    asChild
                  >
                    <a href={`../crm/preview/${deal.id}`}>
                      <ExternalLink className="w-3 h-3" />
                      Client Preview
                    </a>
                  </Button>
                </div>

                <div className="rounded-lg border border-[var(--border)] bg-[var(--accent)]/30 p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--primary)]" />
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {project.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 gap-1"
                        onClick={() => setProjectDialogOpen(true)}
                        title="Switch to a different project"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Switch
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 gap-1 text-[var(--muted-foreground)] hover:text-red-500"
                        onClick={() => {
                          saveProject.mutate(
                            { id: project.id, deal_id: 0 },
                            {
                              onSuccess: () => toast.success("Project unlinked from this deal"),
                              onError: () => toast.error("Failed to unlink project"),
                            },
                          );
                        }}
                        title="Unlink this project from the deal (project is not deleted)"
                      >
                        <Unlink className="w-3 h-3" />
                        Unlink
                      </Button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-1 ml-6">
                    {contentItems.length} content item{contentItems.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Content items */}
                <ul className="space-y-2">
                  {contentItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <FileText className="w-3.5 h-3.5 text-[var(--muted-foreground)] shrink-0" />
                      <span className="flex-1 truncate text-[var(--foreground)]">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)] shrink-0">
                        {item.type}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 bg-gray-100 text-gray-600">
                        {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <section className="space-y-2">
                <p className="text-sm text-[var(--muted-foreground)] italic">
                  No SmartlyQ project linked yet.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setProjectDialogOpen(true)}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Attach Project
                </Button>
              </section>
            )}

            <Separator />

            {/* Activity history */}
            <section>
              <h3 className="text-xs font-semibold uppercase text-[var(--muted-foreground)] flex items-center gap-1.5 mb-3">
                <MessageSquare className="w-3.5 h-3.5" />
                Activity
              </h3>
              {communications.length > 0 && (
                <div className="space-y-3 mb-3">
                  {communications.map((entry) => (
                    <div key={entry.id} className="relative pl-4 border-l-2 border-[var(--border)]">
                      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-0.5">
                        <span className="font-medium">{entry.sender}</span>
                        <span>&middot;</span>
                        <span>
                          {new Date(entry.comm_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--foreground)]">
                        {entry.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {communications.length === 0 && (
                <p className="text-xs text-[var(--muted-foreground)] mb-3">No activity yet.</p>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a note..."
                  value={commMessage}
                  onChange={(e) => setCommMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddComm(); }}
                  className="h-8 text-xs flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={handleAddComm}
                  disabled={!commMessage.trim() || addComm.isPending}
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Attach project dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach Project</DialogTitle>
            <DialogDescription>
              Link a SmartlyQ project to this deal.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {availableProjects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAttachProject} disabled={selectedProjectId === "none"}>
              Attach
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete deal confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this deal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the deal "{deal.client_name}" and all its activity history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                deleteDeal.mutate(deal.id, {
                  onSuccess: () => {
                    toast.success("Deal deleted");
                    onClose();
                  },
                  onError: () => toast.error("Failed to delete deal"),
                });
              }}
            >
              Delete Deal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
