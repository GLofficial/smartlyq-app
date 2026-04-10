import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCrmStore } from "@/stores/crm-store";
import type { ContentItem } from "@/lib/crm-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, MessageSquare, FileText, Megaphone, PenLine, Sparkles } from "lucide-react";

// ---------------------------------------------------------------------------
// Content-type icons
// ---------------------------------------------------------------------------

const TYPE_ICON: Record<ContentItem["type"], React.ReactNode> = {
  "seo-article": <FileText className="w-4 h-4" />,
  "social-post": <Megaphone className="w-4 h-4" />,
  "ad-copy": <Sparkles className="w-4 h-4" />,
  "blog-post": <PenLine className="w-4 h-4" />,
};

const TYPE_LABEL: Record<ContentItem["type"], string> = {
  "seo-article": "SEO Article",
  "social-post": "Social Post",
  "ad-copy": "Ad Copy",
  "blog-post": "Blog Post",
};

const STATUS_STYLE: Record<ContentItem["status"], string> = {
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
  const deals = useCrmStore((s) => s.deals);
  const updateContentItemStatus = useCrmStore((s) => s.updateContentItemStatus);

  const deal = useMemo(() => deals.find((d) => d.id === dealId), [deals, dealId]);

  if (!deal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <p className="text-[var(--muted-foreground)] text-lg">Deal not found.</p>
      </div>
    );
  }

  const project = deal.project;

  if (!project || project.items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <p className="text-[var(--muted-foreground)] text-lg">
          No content items for this project yet.
        </p>
      </div>
    );
  }

  const approvedCount = project.items.filter(
    (i) => i.status === "approved" || i.status === "published",
  ).length;

  function handleApprove(itemId: string) {
    updateContentItemStatus(project!.id, itemId, "approved");
  }

  function handleRequestChanges(itemId: string) {
    updateContentItemStatus(project!.id, itemId, "draft");
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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{project.name}</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {deal.clientCompany} &mdash; {approvedCount} of {project.items.length} items approved
          </p>
        </div>

        <Separator />

        {/* Items list */}
        <div className="space-y-4">
          {project.items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="text-[var(--muted-foreground)]">{TYPE_ICON[item.type]}</div>
                    <CardTitle className="text-base truncate">{item.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={STATUS_STYLE[item.status]}
                    >
                      {item.status}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {TYPE_LABEL[item.type]}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Word count */}
                {item.wordCount && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {item.wordCount.toLocaleString()} words
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

                {/* Action buttons — only show for draft / generating items */}
                {(item.status === "draft" || item.status === "generating") && item.content && (
                  <div className="flex items-center gap-3 pt-2">
                    <Button size="sm" onClick={() => handleApprove(item.id)}>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestChanges(item.id)}
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
