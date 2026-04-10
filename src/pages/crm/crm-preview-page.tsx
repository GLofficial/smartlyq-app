import { useParams } from "react-router-dom";
import {
  useCrmDealGet,
  type ApiContentItem,
} from "@/api/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  MessageSquare,
  FileText,
  Loader2,
} from "lucide-react";
import { useCrmContentItemStatus } from "@/api/crm";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Status styles
// ---------------------------------------------------------------------------

const STATUS_STYLE: Record<string, string> = {
  queued: "bg-gray-100 text-gray-600 border-gray-200",
  generating: "bg-blue-50 text-blue-600 border-blue-200",
  draft: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export function CrmPreviewPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const numericId = dealId ? Number(dealId) : null;
  const { data, isLoading } = useCrmDealGet(numericId);
  const statusMutation = useCrmContentItemStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  const deal = data?.deal;
  const project = data?.project;

  if (!deal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <p className="text-[var(--muted-foreground)] text-lg">Deal not found.</p>
      </div>
    );
  }

  const items = project?.content_items ?? [];

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <p className="text-[var(--muted-foreground)] text-lg">
          No content items for this project yet.
        </p>
      </div>
    );
  }

  const approvedCount = items.filter(
    (i) => i.status === "approved" || i.status === "published",
  ).length;

  function handleApprove(item: ApiContentItem) {
    if (!project) return;
    statusMutation.mutate(
      {
        id: item.id,
        project_id: project.id,
        status: "approved",
      },
      {
        onSuccess: () => toast.success("Content approved"),
        onError: () => toast.error("Failed to approve content"),
      },
    );
  }

  function handleRequestChanges(item: ApiContentItem) {
    if (!project) return;
    statusMutation.mutate(
      {
        id: item.id,
        project_id: project.id,
        status: "draft",
      },
      {
        onSuccess: () => toast.success("Changes requested"),
        onError: () => toast.error("Failed to request changes"),
      },
    );
  }

  return (
    <div className="min-h-screen bg-[var(--muted)]/30">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--background)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold text-[var(--foreground)]">SmartlyQ</span>
          <div className="text-sm text-[var(--muted-foreground)]">
            Client Preview
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Project header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {project?.name ?? "Project"}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {deal.client_company} &mdash; {approvedCount} of {items.length} items approved
          </p>
        </div>

        <Separator />

        {/* Items list */}
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="text-[var(--muted-foreground)]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base truncate">{item.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={STATUS_STYLE[item.status] ?? ""}
                    >
                      {item.status}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Word count */}
                {item.word_count > 0 && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {item.word_count.toLocaleString()} words
                  </p>
                )}

                {/* Content preview */}
                {item.content ? (
                  <div className="rounded-md bg-[var(--muted)]/50 border border-[var(--border)] p-4 text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </div>
                ) : (
                  <div className="rounded-md bg-[var(--muted)]/30 border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)] text-center">
                    {item.status === "generating"
                      ? "Content is being generated..."
                      : "Content not yet available."}
                  </div>
                )}

                {/* Action buttons */}
                {(item.status === "draft" || item.status === "generating") && item.content && (
                  <div className="flex items-center gap-3 pt-2">
                    <Button size="sm" onClick={() => handleApprove(item)}>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestChanges(item)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1.5" />
                      Request Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
