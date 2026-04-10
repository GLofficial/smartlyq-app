import { cn } from "@/lib/cn";
import { type Deal, formatCurrency, getContentProgress } from "@/lib/deal-flow-data";
import { Calendar, Sparkles } from "lucide-react";

interface DealCardProps {
  deal: Deal;
  isDragging: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onClick: () => void;
  isSelected: boolean;
}

export function DealCard({
  deal,
  isDragging,
  onDragStart,
  onDragEnd,
  onClick,
  isSelected,
}: DealCardProps) {
  const progress = getContentProgress(deal.project);
  const initials = deal.clientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "bg-[var(--card)] border border-[var(--border)] rounded-lg p-3.5 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]",
        isDragging && "opacity-40",
        isSelected &&
          "border-[var(--primary)] ring-1 ring-[var(--primary)]/20 shadow-md",
      )}
      draggable
      onDragStart={() => onDragStart(deal.id)}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      {/* Client row */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
          style={{
            backgroundColor: `hsl(${hashToHue(deal.clientName)} 40% 92%)`,
            color: `hsl(${hashToHue(deal.clientName)} 40% 35%)`,
          }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-[var(--foreground)] truncate">
            {deal.clientName}
          </div>
          <div className="text-xs text-[var(--muted-foreground)] truncate">
            {deal.clientCompany}
          </div>
        </div>
      </div>

      {/* Value */}
      {deal.value > 0 && (
        <div className="text-lg font-bold text-orange-500 mb-2">
          {formatCurrency(deal.value)}
        </div>
      )}

      {/* Content progress */}
      {deal.project && (
        <div className="mb-2">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Sparkles className="w-3 h-3" />
            <span>
              {progress.done} of {progress.total} ready
            </span>
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-[var(--muted)] overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Next action date */}
      {deal.nextActionDate && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mt-2">
          <Calendar className="w-3 h-3" />
          <span>
            {new Date(deal.nextActionDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}
    </div>
  );
}

function hashToHue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}
