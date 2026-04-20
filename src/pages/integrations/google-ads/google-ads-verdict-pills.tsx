import { FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GoogleAdsVerdict } from "./google-ads-types";

const SEVERITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
	success: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
	warning: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
	danger: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export function GoogleAdsVerdictPills({ verdicts, onView }: { verdicts: GoogleAdsVerdict[]; onView: () => void }) {
	if (!verdicts?.length) return null;
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
			<div className="flex items-center justify-between flex-wrap gap-2 mb-2">
				<div>
					<p className="text-sm font-semibold text-[var(--foreground)]">Verdicts</p>
					<p className="text-xs text-[var(--muted-foreground)]">Heuristic signals. Verify before acting.</p>
				</div>
				<Button variant="outline" size="sm" onClick={onView} className="gap-1.5 text-xs">
					<FileCheck size={12} /> View verdicts
				</Button>
			</div>
			<div className="flex flex-wrap gap-2">
				{verdicts.slice(0, 8).map((v, i) => {
					const cfg = SEVERITY_COLORS[v.severity] || SEVERITY_COLORS.warning!;
					return (
						<span key={i} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ${cfg.bg} ${cfg.text}`}>
							<span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
							{v.title}
						</span>
					);
				})}
			</div>
		</div>
	);
}
