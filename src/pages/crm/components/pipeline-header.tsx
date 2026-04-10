import { type ApiDeal } from "@/api/crm";
import { formatCurrency } from "@/lib/crm-data";
import { Button } from "@/components/ui/button";
import { Plus, Settings2 } from "lucide-react";

interface PipelineHeaderProps {
  deals: ApiDeal[];
  onNewDeal: () => void;
  onManageStages: () => void;
}

export function PipelineHeader({
  deals,
  onNewDeal,
  onManageStages,
}: PipelineHeaderProps) {
  const activeDeals = deals.filter(
    (d) => d.stage !== "closed" && d.stage !== "published",
  );
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--card)]">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Pipeline</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Content-to-Deal Pipeline
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <div className="text-lg font-bold text-[var(--foreground)]">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            {activeDeals.length} active / {deals.length} total
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onManageStages}>
            <Settings2 className="w-4 h-4 mr-1.5" />
            Stages
          </Button>
          <Button size="sm" onClick={onNewDeal}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Deal
          </Button>
        </div>
      </div>
    </div>
  );
}
