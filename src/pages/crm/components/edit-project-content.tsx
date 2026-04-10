import { useState, useCallback } from "react";
import type { ApiContentItem } from "@/api/crm";
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
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CONTENT_TYPES: { value: string; label: string }[] = [
  { value: "seo-article", label: "SEO Article" },
  { value: "social-post", label: "Social Post" },
  { value: "ad-copy", label: "Ad Copy" },
  { value: "blog-post", label: "Blog Post" },
];

const CONTENT_STATUSES: string[] = [
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
  projectId: number;
  projectName: string;
  items: ApiContentItem[];
  onRename: (name: string) => void;
  onRemoveItem: (itemId: number) => void;
  onStatusChange: (itemId: number, status: string) => void;
  onReorder?: (reorderedItems: ApiContentItem[]) => void;
  addTitle: string;
  setAddTitle: (v: string) => void;
  addType: string;
  setAddType: (v: string) => void;
  onAddItem: () => void;
}

export function EditProjectContent({
  projectName,
  items,
  onRename,
  onRemoveItem,
  onStatusChange,
  onReorder,
  addTitle,
  setAddTitle,
  addType,
  setAddType,
  onAddItem,
}: EditProjectContentProps) {
  const [localName, setLocalName] = useState(projectName);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= items.length) return;
      const reordered = [...items];
      const removed = reordered.splice(fromIndex, 1);
      if (!removed[0]) return;
      reordered.splice(toIndex, 0, removed[0]);
      onReorder?.(reordered.map((item, i) => ({ ...item, sort_order: i })));
    },
    [items, onReorder],
  );

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
            disabled={localName.trim() === projectName}
            onClick={() => onRename(localName.trim())}
          >
            Rename
          </Button>
        </div>
      </div>

      {/* Content items */}
      <div className="space-y-2">
        <Label>Content Items ({items.length})</Label>
        {items.length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)] py-2">No content items yet.</p>
        )}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable={!!onReorder}
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx !== null && dragIdx !== idx) moveItem(dragIdx, idx);
                setDragIdx(null);
              }}
              onDragEnd={() => setDragIdx(null)}
              className="flex items-center gap-2 p-2.5 rounded-md border border-[var(--border)] bg-[var(--card)]"
            >
              {onReorder && (
                <div className="flex flex-col shrink-0">
                  <button
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, idx - 1)}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-30"
                    disabled={idx === items.length - 1}
                    onClick={() => moveItem(idx, idx + 1)}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              )}
              {onReorder && (
                <div className="text-[var(--muted-foreground)] cursor-grab shrink-0">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="text-[var(--muted-foreground)]">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-[var(--foreground)] truncate block">
                  {item.title}
                </span>
              </div>
              <Select
                value={item.status}
                onValueChange={(v) => onStatusChange(item.id, v)}
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
            <Select value={addType} onValueChange={setAddType}>
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
