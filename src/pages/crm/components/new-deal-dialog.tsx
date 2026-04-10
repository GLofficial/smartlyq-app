import { useState } from "react";
import { useCrmDealSave, useCrmProjects } from "@/api/crm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageOrder: string[];
  stageConfig: Record<string, { label: string; color: string }>;
}

export function NewDealDialog({
  open,
  onOpenChange,
  stageOrder,
  stageConfig,
}: NewDealDialogProps) {
  const { data: projectsData } = useCrmProjects();
  const saveDeal = useCrmDealSave();

  const projects = projectsData?.projects ?? [];

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState(stageOrder[0] ?? "lead");
  const [projectId, setProjectId] = useState<string>("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) return;

    saveDeal.mutate({
      client_name: clientName.trim(),
      client_email: clientEmail.trim(),
      client_company: clientCompany.trim(),
      value: parseFloat(value) || 0,
      stage,
      notes: notes.trim(),
      project_id: projectId && projectId !== "none" ? Number(projectId) : null,
    });
    resetForm();
    onOpenChange(false);
  }

  function resetForm() {
    setClientName("");
    setClientEmail("");
    setClientCompany("");
    setValue("");
    setStage(stageOrder[0] ?? "lead");
    setProjectId("");
    setNotes("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Deal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nd-name">Client Name *</Label>
            <Input
              id="nd-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="nd-email">Email</Label>
              <Input
                id="nd-email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="jane@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nd-company">Company</Label>
              <Input
                id="nd-company"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="Acme Inc"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="nd-value">Deal Value ($)</Label>
              <Input
                id="nd-value"
                type="number"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageOrder.map((s) => (
                    <SelectItem key={s} value={s}>
                      {stageConfig[s]?.label ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {projects.length > 0 && (
            <div className="space-y-2">
              <Label>Link SmartlyQ Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nd-notes">Notes</Label>
            <Textarea
              id="nd-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional context..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Deal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
