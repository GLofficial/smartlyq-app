import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Hook to navigate to AI Captain with a pre-filled CRM question.
 * Uses the same pattern as Facebook Ads: /w/{hash}/ai-captain?prompt=...
 */
export function useCrmAiNavigate() {
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const navigate = useNavigate();

	return useCallback((question: string) => {
		const path = wsHash ? `/w/${wsHash}/captain` : "/captain";
		navigate(path + "?prompt=" + encodeURIComponent(question));
	}, [wsHash, navigate]);
}

/**
 * "Ask AI" button — consistent styling across all CRM pages.
 */
export function CrmAiButton({ question, label = "Ask AI", size = "sm" }: { question: string; label?: string; size?: "sm" | "default" }) {
	const goAi = useCrmAiNavigate();
	return (
		<Button variant="outline" size={size} onClick={() => goAi(question)} className="gap-1.5 text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100">
			<Sparkles size={12} />
			{label}
		</Button>
	);
}

/**
 * AI Quick Questions chip bar — renders a set of pre-filled questions.
 */
export function CrmAiChips({ questions }: { questions: string[] }) {
	const goAi = useCrmAiNavigate();
	return (
		<div className="flex flex-wrap gap-1.5">
			{questions.map((q) => (
				<button key={q} onClick={() => goAi(q)}
					className="rounded-full bg-white border border-[var(--border)] px-2.5 py-1 text-[10px] text-[var(--foreground)] hover:bg-[var(--sq-primary)] hover:text-white hover:border-[var(--sq-primary)] transition-colors">
					{q}
				</button>
			))}
		</div>
	);
}

/** Pre-built CRM question sets by page */
export const CRM_AI_QUESTIONS = {
	dashboard: [
		"Analyze my sales pipeline health",
		"Which deals are most likely to close this week?",
		"What should I focus on today to hit my revenue target?",
		"Show me deals that are stuck and suggest next actions",
		"Give me a weekly sales performance summary",
	],
	contacts: [
		"Which contacts haven't been reached in 30+ days?",
		"Suggest contacts to follow up with this week",
		"Analyze my contact engagement patterns",
		"Which contacts have the highest deal value potential?",
		"Help me write a follow-up email for cold contacts",
	],
	pipeline: [
		"Analyze my deal pipeline and identify bottlenecks",
		"Which deals should I prioritize this week?",
		"Predict which deals are at risk of being lost",
		"Suggest optimal next actions for each deal stage",
		"Compare my win rate across pipeline stages",
	],
	tasks: [
		"Prioritize my overdue tasks by impact",
		"What tasks should I delegate and to whom?",
		"Suggest a daily action plan based on my open tasks",
		"Which tasks are blocking deal progress?",
		"Help me batch similar tasks for efficiency",
	],
	projects: [
		"Summarize the status of all active projects",
		"Which projects are behind schedule?",
		"Suggest content ideas for my next project deliverable",
		"Analyze project completion rates and suggest improvements",
	],
};
