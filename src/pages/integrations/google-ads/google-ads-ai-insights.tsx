import { Sparkles, Loader2, TrendingUp, Pause, Wallet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GoogleAdsVerdict } from "./google-ads-types";

interface AiInsightsProps {
	insights: GoogleAdsVerdict[];
	isLoading: boolean;
	onAiChipClick?: (question: string) => void;
	onQuickAction?: (action: string) => void;
	onShowVerdicts?: () => void;
}

const SEVERITY_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
	success: { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
	warning: { dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
	danger: { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700" },
};

const AI_CHIPS = [
	"Why is ROAS declining?",
	"Which campaign to scale?",
	"Keyword audit",
	"Which campaigns to pause?",
	"Best device to target?",
	"Best time of day?",
	"Full account audit",
	"Budget reallocation advice",
];

const QUICK_ACTIONS = [
	{ label: "Scale Winners", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
	{ label: "Pause Losers", icon: Pause, color: "text-red-600", bg: "bg-red-50" },
	{ label: "Optimize Budget", icon: Wallet, color: "text-blue-600", bg: "bg-blue-50" },
	{ label: "Export Report", icon: Download, color: "text-purple-600", bg: "bg-purple-50" },
];

export function GoogleAdsAiInsights({ insights, isLoading, onAiChipClick, onQuickAction, onShowVerdicts }: AiInsightsProps) {
	return (
		<div className="space-y-4">
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
					<p className="text-xs text-[var(--muted-foreground)] py-2">AI insights appear once data loads.</p>
				) : (
					<div className="space-y-2 max-h-[300px] overflow-y-auto">
						{insights.slice(0, 5).map((insight, i) => {
							const sev = SEVERITY_COLORS[insight.severity] || SEVERITY_COLORS.warning!;
							return (
								<div key={i} className={`rounded-lg ${sev.bg} p-3`}>
									<div className="flex items-start gap-2">
										<span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${sev.dot}`} />
										<div>
											<p className={`text-xs font-semibold ${sev.text}`}>{insight.title}</p>
											<p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{insight.message}</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				<Button variant="outline" size="sm" className="w-full mt-3 gap-1.5 text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100"
					onClick={() => onAiChipClick?.("Analyze my Google Ads performance and give me actionable recommendations")}>
					<Sparkles size={12} />
					Ask AI about this data
				</Button>
				{onShowVerdicts && insights.length > 0 && (
					<Button variant="ghost" size="sm" className="w-full mt-1 gap-1.5 text-xs" onClick={onShowVerdicts}>
						View AI Verdicts
					</Button>
				)}
			</div>

			<div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-emerald-50/50 to-blue-50/50 p-4">
				<p className="text-[10px] font-medium text-[var(--muted-foreground)] mb-2">QUICK QUESTIONS</p>
				<div className="flex flex-wrap gap-1.5">
					{AI_CHIPS.map((q) => (
						<button key={q} onClick={() => onAiChipClick?.(q)}
							className="rounded-full bg-white border border-[var(--border)] px-2.5 py-1 text-[10px] text-[var(--foreground)] hover:bg-[var(--sq-primary)] hover:text-white hover:border-[var(--sq-primary)] transition-colors">
							{q}
						</button>
					))}
				</div>
			</div>

			<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
				<p className="text-[10px] font-medium text-[var(--muted-foreground)] mb-2">QUICK ACTIONS</p>
				<div className="grid grid-cols-2 gap-2">
					{QUICK_ACTIONS.map((a) => {
						const Icon = a.icon;
						return (
							<button key={a.label} onClick={() => onQuickAction?.(a.label)}
								className={`flex items-center gap-2 rounded-lg ${a.bg} p-2.5 text-xs font-medium ${a.color} hover:opacity-80 transition-opacity`}>
								<Icon size={14} />
								{a.label}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
