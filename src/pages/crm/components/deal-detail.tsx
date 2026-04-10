import {
  type ApiDeal,
  useCrmDealGet,
} from "@/api/crm";
import { type StageConfig, formatCurrency } from "@/lib/crm-data";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";

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
  const stage = stageConfig[deal.stage];
  const communications = detailData?.communications ?? [];
  const project = detailData?.project;
  const contentItems = project?.content_items ?? [];

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
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
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
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Client Preview
                  </Button>
                </div>

                <p className="text-sm font-medium text-[var(--foreground)] mb-2">
                  {project.name}
                </p>

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
              <section className="text-sm text-[var(--muted-foreground)] italic">
                No SmartlyQ project linked yet.
              </section>
            )}

            <Separator />

            {/* Communication history */}
            {communications.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold uppercase text-[var(--muted-foreground)] flex items-center gap-1.5 mb-3">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Communication
                </h3>
                <div className="space-y-3">
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
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
