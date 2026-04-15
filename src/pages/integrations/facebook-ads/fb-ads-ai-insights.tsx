import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FbAdsVerdict } from "./fb-ads-types";

interface AiInsightsProps {
	insights: FbAdsVerdict[];
	isLoading: boolean;
}

const SEVERITY_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
	success: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
	warning: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
	danger: { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
};

export function FbAdsAiInsights({ insights, isLoading }: AiInsightsProps) {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
			<div className="flex items-center gap-2 mb-3">
				<Sparkles size={16} className="text-[var(--sq-primary)]" />
				<h3 className="text-sm font-semibold text-[var(--foreground)]">AI Insights</h3>
			</div>

			{isLoading ? (
				<div className="flex items-center gap-2 py-4">
					<Loader2 size={14} className="animate-spin text-[var(--sq-primary)]" />
					<p className="text-xs text-[var(--muted-foreground)]">Analyzing your data...</p>
				</div>
			) : insights.length === 0 ? (
				<p className="text-xs text-[var(--muted-foreground)] py-2">
					AI insights appear once data loads.
				</p>
			) : (
				<div className="space-y-2">
					{insights.slice(0, 5).map((insight, i) => {
						const sev = SEVERITY_COLORS[insight.severity] || SEVERITY_COLORS.warning!;
						const bg = sev?.bg ?? "bg-amber-50";
						const dot = sev?.dot ?? "bg-amber-500";
						const textColor = sev?.text ?? "text-amber-700";
						return (
							<div key={i} className={`rounded-lg ${bg} p-3`}>
								<div className="flex items-start gap-2">
									<span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dot}`} />
									<div>
										<p className={`text-xs font-semibold ${textColor}`}>{insight.title}</p>
										<p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{insight.message}</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			<Button variant="outline" size="sm" className="w-full mt-3 gap-1.5 text-xs">
				<Sparkles size={12} />
				Ask AI about this data
			</Button>
		</div>
	);
}
