import { Sparkles, Target, BarChart3, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GoogleAdsPatternsCard({ onAnalyze }: { onAnalyze: () => void }) {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
						<Brain size={18} className="text-amber-600" />
					</div>
					<div>
						<h3 className="text-sm font-semibold text-[var(--foreground)]">Ad Copy Patterns</h3>
						<p className="text-xs text-[var(--muted-foreground)]">AI-identified patterns in your winning ad copy</p>
					</div>
				</div>
				<Button size="sm" onClick={onAnalyze} className="gap-1.5 text-xs">
					<Sparkles size={14} /> Analyze Patterns
				</Button>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				<PatternTile icon={Target} color="text-amber-700" bgStyle="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
					title="Top Headlines" desc="Click Analyze Patterns to discover your best headlines." />
				<PatternTile icon={BarChart3} color="text-blue-700" bgStyle="linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
					title="Performance Benchmarks" desc="Compare your top vs average ad performance." />
				<PatternTile icon={Sparkles} color="text-emerald-700" bgStyle="linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
					title="Copy Insights" desc="Get AI-powered copy recommendations." />
			</div>
		</div>
	);
}

function PatternTile({ icon: Icon, color, bgStyle, title, desc }: { icon: typeof Target; color: string; bgStyle: string; title: string; desc: string }) {
	return (
		<div className="rounded-xl p-4" style={{ background: bgStyle }}>
			<div className="flex items-center gap-2 mb-2">
				<Icon size={16} className={color} />
				<p className={`text-xs font-semibold ${color}`}>{title}</p>
			</div>
			<p className="text-[11px] text-[var(--muted-foreground)]">{desc}</p>
		</div>
	);
}
