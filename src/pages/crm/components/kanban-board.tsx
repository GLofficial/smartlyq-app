import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/cn";
import {
  type StageConfig,
  getDealsForStage,
  formatCurrency,
} from "@/lib/crm-data";
import {
  useCrmDeals,
  useCrmDealSave,
  useCrmStages,
  useCrmStagesSave,
} from "@/api/crm";
import { DealCard } from "./deal-card";
import { DealDetail } from "./deal-detail";
import { NewDealDialog } from "./new-deal-dialog";
import { PipelineHeader } from "./pipeline-header";
import { StageManager } from "./stage-manager";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function KanbanBoard() {
  const { data: dealsData, isLoading: dealsLoading } = useCrmDeals();
  const { data: stagesData, isLoading: stagesLoading } = useCrmStages();
  const saveDeal = useCrmDealSave();
  const saveStages = useCrmStagesSave();

  const deals = dealsData?.deals ?? [];
  const stages = stagesData?.stages ?? [];

  // Derive stage order and config from API stages
  const stageOrder = useMemo(() => stages.map((s) => s.stage_key), [stages]);
  const stageConfig = useMemo(() => {
    const m: Record<string, StageConfig> = {};
    for (const s of stages) {
      m[s.stage_key] = { label: s.label, color: s.color };
    }
    return m;
  }, [stages]);

  // UI state
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
  const [dragDealId, setDragDealId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [showStageManager, setShowStageManager] = useState(false);

  const selectedDeal = deals.find((d) => d.id === selectedDealId) ?? null;

  // Drag handlers
  const handleDragStart = useCallback((id: number) => setDragDealId(id), []);
  const handleDragEnd = useCallback(() => {
    setDragDealId(null);
    setDragOverStage(null);
  }, []);

  function handleDragOver(e: React.DragEvent, stage: string) {
    e.preventDefault();
    setDragOverStage(stage);
  }

  function handleDrop(stage: string) {
    if (dragDealId !== null) {
      saveDeal.mutate(
        { id: dragDealId, stage },
        {
          onSuccess: () => toast.success("Deal moved"),
          onError: () => toast.error("Failed to move deal"),
        },
      );
    }
    setDragDealId(null);
    setDragOverStage(null);
  }

  // Stage manager save
  function handleStagesUpdate(
    order: string[],
    config: Record<string, StageConfig>,
  ) {
    const apiStages = order.map((key, idx) => ({
      stage_key: key,
      label: config[key]?.label ?? key,
      color: config[key]?.color ?? "220 14% 46%",
      sort_order: idx,
    }));
    saveStages.mutate(apiStages, {
      onSuccess: () => toast.success("Stages updated"),
      onError: () => toast.error("Failed to update stages"),
    });
  }

  if (dealsLoading || stagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PipelineHeader
        deals={deals}
        onNewDeal={() => setShowNewDeal(true)}
        onManageStages={() => setShowStageManager(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Kanban columns */}
        <div className="flex-1 flex overflow-x-auto p-4 gap-4">
          {stageOrder.map((stage) => {
            const cfg = stageConfig[stage];
            const stageDeals = getDealsForStage(deals, stage);
            const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);

            return (
              <div
                key={stage}
                className={cn(
                  "flex flex-col min-w-[280px] w-[280px] shrink-0 rounded-xl bg-[var(--muted)]/30 border border-[var(--border)]",
                  dragOverStage === stage &&
                    "ring-2 ring-[var(--primary)]/30 bg-[var(--primary)]/5",
                )}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDrop={() => handleDrop(stage)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: cfg
                          ? `hsl(${cfg.color})`
                          : "var(--muted-foreground)",
                      }}
                    />
                    <span className="text-sm font-semibold text-[var(--foreground)]">
                      {cfg?.label ?? stage}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] px-1.5 py-0.5 rounded-full">
                      {stageDeals.length}
                    </span>
                  </div>
                  {stageValue > 0 && (
                    <span className="text-xs font-medium text-[var(--muted-foreground)]">
                      {formatCurrency(stageValue)}
                    </span>
                  )}
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {stageDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      isDragging={dragDealId === deal.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedDealId(deal.id)}
                      isSelected={selectedDealId === deal.id}
                    />
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-[var(--muted-foreground)] italic">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selectedDeal && (
          <div className="w-[380px] shrink-0 border-l border-[var(--border)]">
            <DealDetail
              deal={selectedDeal}
              stageConfig={stageConfig}
              onClose={() => setSelectedDealId(null)}
            />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <NewDealDialog
        open={showNewDeal}
        onOpenChange={setShowNewDeal}
        stageOrder={stageOrder}
        stageConfig={stageConfig}
      />

      <StageManager
        open={showStageManager}
        onOpenChange={setShowStageManager}
        stageOrder={stageOrder}
        stageConfig={stageConfig}
        onUpdate={handleStagesUpdate}
      />
    </div>
  );
}
