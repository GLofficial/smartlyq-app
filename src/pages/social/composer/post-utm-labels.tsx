import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, Link2, Tag, Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { PlatformBrandIcon, PLATFORM_BRANDS } from "../platform-brands";

/* eslint-disable @typescript-eslint/no-explicit-any */

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <div onClick={onToggle} className={cn("w-9 h-5 rounded-full relative transition-colors cursor-pointer", enabled ? "bg-primary" : "bg-muted")}>
      <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform", enabled ? "translate-x-4" : "translate-x-0.5")} />
    </div>
  );
}

// ---- UTM Tracking Section ----
interface UtmValues { source: string; medium: string; campaign: string; term: string; content: string }
interface UtmProps { values: UtmValues; onChange: (v: UtmValues) => void; selectedPlatforms?: string[] }

export function UtmTrackingSection({ values, onChange, selectedPlatforms = [] }: UtmProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Link2 className="w-4 h-4 text-muted-foreground" />URL Tracking (UTM)
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : "Configure"}
        </Button>
      </div>
      {expanded && (
        <div className="px-5 pb-4 border-t border-border pt-4">
          <div className="border border-border rounded-lg p-4 space-y-4">
            <p className="text-xs text-muted-foreground">UTM parameters will be appended to any URLs in your post content.</p>
            {selectedPlatforms.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedPlatforms.map((pid) => {
                  const brand = PLATFORM_BRANDS[pid];
                  if (!brand) return null;
                  return (
                    <span key={pid} className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border text-xs text-foreground">
                      <PlatformBrandIcon platformId={pid} size={8} />{brand.label}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Source</label>
                <input type="text" value={values.source} onChange={(e) => onChange({ ...values, source: e.target.value })} placeholder="e.g. facebook" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Medium</label>
                <input type="text" value={values.medium} onChange={(e) => onChange({ ...values, medium: e.target.value })} placeholder="e.g. social" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Campaign</label>
              <input type="text" value={values.campaign} onChange={(e) => onChange({ ...values, campaign: e.target.value })} placeholder="e.g. spring_sale" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Term (optional)</label>
                <input type="text" value={values.term} onChange={(e) => onChange({ ...values, term: e.target.value })} placeholder="e.g. keyword" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Content (optional)</label>
                <input type="text" value={values.content} onChange={(e) => onChange({ ...values, content: e.target.value })} placeholder="e.g. banner_ad" className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Toggle enabled={false} onToggle={() => {}} />
              <div>
                <div className="flex items-center gap-1.5"><Link2 className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">Shorten URLs in post</span></div>
                <p className="text-xs text-muted-foreground mt-0.5">Automatically replace URLs with short trackable links.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Labels Section ----
interface LabelsProps { selectedLabels: string[]; onLabelsChange: (labels: string[]) => void }

export function LabelsSection({ selectedLabels, onLabelsChange }: LabelsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [labelSearch, setLabelSearch] = useState("");
  const [availableLabels] = useState(["facebook", "instagram", "twitter", "linkedin", "marketing", "product"]);

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Tag className="w-4 h-4 text-muted-foreground" /> Labels</div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:bg-muted hover:text-foreground">Manage</Button>
        </div>

        {selectedLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedLabels.map((label) => (
              <span key={label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />{label}
                <button onClick={() => onLabelsChange(selectedLabels.filter((l) => l !== label))} className="ml-0.5 hover:text-destructive"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}

        <div className="relative inline-block">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-dashed border-primary/40 text-primary text-xs font-medium hover:border-primary/60 hover:bg-primary/5 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Label
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg py-2 z-20 min-w-[220px]">
                <div className="px-3 pb-2 flex items-center gap-2">
                  <input type="text" value={labelSearch} onChange={(e) => setLabelSearch(e.target.value)} placeholder="Search or create..." className="flex-1 px-3 py-1.5 border border-border rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  <button onClick={() => { if (labelSearch.trim() && !availableLabels.includes(labelSearch.trim().toLowerCase())) { onLabelsChange([...selectedLabels, labelSearch.trim().toLowerCase()]); setLabelSearch(""); } }} className="w-8 h-8 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/10 shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-[160px] overflow-y-auto">
                  {availableLabels.filter((l) => l.includes(labelSearch.toLowerCase()) && !selectedLabels.includes(l)).map((label) => (
                    <button key={label} onClick={() => { onLabelsChange([...selectedLabels, label]); setDropdownOpen(false); setLabelSearch(""); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                      <span className="w-3 h-3 rounded-full bg-muted-foreground" />{label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
