import { useState, useCallback } from "react";
import { cn } from "@/lib/cn";
import {
  type StageConfig,
  STAGE_ORDER,
  STAGE_CONFIG,
  getDealsForStage,
  formatCurrency,
} from "@/lib/deal-flow-data";
import { useDealFlowStore } from "@/stores/deal-flow-store";
import { DealCard } from "./deal-card";
import { DealDetail } from "./deal-detail";
import { NewDealDialog } from "./new-deal-dialog";
import { PipelineHeader } from "./pipeline-header";
import { StageManager } from "./stage-manager";

export function KanbanBoard() {
  const deals = useDealFlowStore((s) => s.deals);
  const createDeal = useDealFlowStore((s) => s.createDeal);
  const updateDeal = useDealFlowStore((s) => s.updateDeal);

  // Stage configuration (mutable for custom pipelines)
  const [stageOrder, setStageOrder] = useState<string[]>(STAGE_ORDER);
  const [stageConfig, setStageConfig] =
    useState<Record<string, StageConfig>>(STAGE_CONFIG);

  // UI state
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [dragDealId, setDragDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [showStageManager, setShowStageManager] = useState(false);

  const selectedDeal = deals.find((d) => d.id === selectedDealId) ?? null;

  // Drag handlers
  const handleDragStart = useCallback((id: string) => setDragDealId(id), []);
  const handleDragEnd = useCallback(() => {
    setDragDealId(null);
    setDragOverStage(null);
  }, []);

  function handleDragOver(e: React.DragEvent, stage: string) {
    e.preventDefault();
    setDragOverStage(stage);
  }

  function handleDrop(stage: string) {
    if (dragDealId) {
      updateDeal(dragDealId, { stage });
    }
    setDragDealId(null);
    setDragOverStage(null);
  }

  // Stage manager save
  function handleStagesUpdate(
    order: string[],
    config: Record<string, StageConfig>,
  ) {
    setStageOrder(order);
    setStageConfig(config);
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
        onCreate={createDeal}
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
