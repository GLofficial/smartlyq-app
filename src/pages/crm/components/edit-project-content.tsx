import { useState } from "react";
import type { ContentItem, SmartlyQProject } from "@/lib/crm-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  X,
  FileText,
  Megaphone,
  Sparkles,
  PenLine,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Config (shared with projects page)
// ---------------------------------------------------------------------------

const CONTENT_TYPES: { value: ContentItem["type"]; label: string }[] = [
  { value: "seo-article", label: "SEO Article" },
  { value: "social-post", label: "Social Post" },
  { value: "ad-copy", label: "Ad Copy" },
  { value: "blog-post", label: "Blog Post" },
];

const TYPE_ICON: Record<ContentItem["type"], React.ReactNode> = {
  "seo-article": <FileText className="w-3.5 h-3.5" />,
  "social-post": <Megaphone className="w-3.5 h-3.5" />,
  "ad-copy": <Sparkles className="w-3.5 h-3.5" />,
  "blog-post": <PenLine className="w-3.5 h-3.5" />,
};

const CONTENT_STATUSES: ContentItem["status"][] = [
  "queued",
  "generating",
  "draft",
  "approved",
  "published",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface EditProjectContentProps {
  project: SmartlyQProject;
  onRename: (name: string) => void;
  onRemoveItem: (itemId: string) => void;
  onStatusChange: (itemId: string, status: ContentItem["status"]) => void;
  addTitle: string;
  setAddTitle: (v: string) => void;
  addType: ContentItem["type"];
  setAddType: (v: ContentItem["type"]) => void;
  onAddItem: () => void;
}

export function EditProjectContent({
  project,
  onRename,
  onRemoveItem,
  onStatusChange,
  addTitle,
  setAddTitle,
  addType,
  setAddType,
  onAddItem,
}: EditProjectContentProps) {
  const [localName, setLocalName] = useState(project.name);

  return (
    <div className="space-y-5">
      {/* Project name */}
      <div className="space-y-2">
        <Label>Project Name</Label>
        <div className="flex gap-2">
          <Input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={localName.trim() === project.name}
            onClick={() => onRename(localName.trim())}
          >
            Rename
          </Button>
        </div>
      </div>

      {/* Content items */}
      <div className="space-y-2">
        <Label>Content Items ({project.items.length})</Label>
        {project.items.length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)] py-2">No content items yet.</p>
        )}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {project.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2.5 rounded-md border border-[var(--border)] bg-[var(--card)]"
            >
              <div className="text-[var(--muted-foreground)]">{TYPE_ICON[item.type]}</div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-[var(--foreground)] truncate block">
                  {item.title}
                </span>
              </div>
              <Select
                value={item.status}
                onValueChange={(v) => onStatusChange(item.id, v as ContentItem["status"])}
              >
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-600 shrink-0"
                onClick={() => onRemoveItem(item.id)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Add item form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Add Content Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Item title"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              className="flex-1"
            />
            <Select value={addType} onValueChange={(v) => setAddType(v as ContentItem["type"])}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={onAddItem} disabled={!addTitle.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
