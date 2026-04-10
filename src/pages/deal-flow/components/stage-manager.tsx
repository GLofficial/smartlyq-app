import { useState } from "react";
import { cn } from "@/lib/cn";
import { type StageConfig, DEFAULT_STAGE_COLORS } from "@/lib/deal-flow-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Trash2, Plus } from "lucide-react";

interface StageManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageOrder: string[];
  stageConfig: Record<string, StageConfig>;
  onUpdate: (
    order: string[],
    config: Record<string, StageConfig>,
  ) => void;
}

interface EditableStage {
  key: string;
  label: string;
  color: string;
}

export function StageManager({
  open,
  onOpenChange,
  stageOrder,
  stageConfig,
  onUpdate,
}: StageManagerProps) {
  const [stages, setStages] = useState<EditableStage[]>(() =>
    stageOrder.map((key) => ({
      key,
      label: stageConfig[key]?.label ?? key,
      color: stageConfig[key]?.color ?? "220 14% 46%",
    })) as EditableStage[],
  );
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Keep local state in sync when dialog opens
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setStages(
        stageOrder.map((key) => ({
          key,
          label: stageConfig[key]?.label ?? key,
          color: stageConfig[key]?.color ?? "220 14% 46%",
        })) as EditableStage[],
      );
    }
    onOpenChange(nextOpen);
  }

  function handleLabelChange(idx: number, label: string) {
    setStages((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, label } : s)),
    );
  }

  function handleDelete(idx: number) {
    if (stages.length <= 2) return; // keep at least 2 stages
    setStages((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleAdd() {
    const newKey = `stage-${Date.now()}`;
    const colorIdx = stages.length % DEFAULT_STAGE_COLORS.length;
    const color = DEFAULT_STAGE_COLORS[colorIdx] ?? "220 14% 46%";
    setStages((prev) => [
      ...prev,
      { key: newKey, label: "New Stage", color },
    ]);
  }

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;

    setStages((prev) => {
      const next = [...prev];
      const removed = next.splice(dragIdx, 1);
      if (removed[0]) next.splice(idx, 0, removed[0]);
      return next;
    });
    setDragIdx(idx);
  }

  function handleDragEnd() {
    setDragIdx(null);
  }

  function handleSave() {
    const order = stages.map((s) => s.key);
    const config: Record<string, StageConfig> = {};
    for (const s of stages) {
      config[s.key] = { label: s.label, color: s.color };
    }
    onUpdate(order, config);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Stages</DialogTitle>
        </DialogHeader>

        <div className="space-y-1.5 max-h-[50vh] overflow-y-auto py-2">
          {stages.map((stage, idx) => (
            <div
              key={stage.key}
              className={cn(
                "flex items-center gap-2 p-2 rounded-md border border-transparent hover:border-[var(--border)] transition-colors",
                dragIdx === idx && "opacity-50",
              )}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <GripVertical className="w-4 h-4 text-[var(--muted-foreground)] cursor-grab shrink-0" />

              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: `hsl(${stage.color})` }}
              />

              <Input
                className="h-8 flex-1 text-sm"
                value={stage.label}
                onChange={(e) => handleLabelChange(idx, e.target.value)}
              />

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-[var(--muted-foreground)] hover:text-red-500"
                onClick={() => handleDelete(idx)}
                disabled={stages.length <= 2}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleAdd}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Stage
        </Button>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
