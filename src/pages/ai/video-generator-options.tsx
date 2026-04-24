import { useState } from "react";
import { ChevronDown, Database, RefreshCw, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { VideoModel } from "@/api/video-gen";
import { useGenerateVideoPrompt } from "@/api/video-gen";
import { toast } from "sonner";

// ── Model selector ────────────────────────────────────────────────────────────

const TRIGGER_CLS = "w-full h-auto min-h-[3rem] flex items-center gap-2.5 px-3 py-2 border border-border rounded-lg bg-background text-sm text-left hover:bg-muted/40 transition-colors disabled:opacity-50";

function minCr(pricing: VideoModel["pricing"]): number {
	if (!pricing.length) return 0;
	return Math.min(...pricing.map((p) => p.credits));
}

interface ModelSelectorProps {
	models: VideoModel[];
	value: string;
	onChange: (m: VideoModel) => void;
}

export function ModelSelector({ models, value, onChange }: ModelSelectorProps) {
	const [open, setOpen] = useState(false);
	const active = models.find((m) => m.model === value) ?? models[0];

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button type="button" className={TRIGGER_CLS} disabled={!models.length}>
					{active?.icon_url ? (
						<img src={active.icon_url} alt="" className="w-8 h-8 rounded object-contain shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
					) : (
						<div className="w-8 h-8 rounded bg-muted shrink-0" />
					)}
					<div className="flex-1 min-w-0">
						<div className="font-medium truncate">{active?.name ?? "Select model"}</div>
						{active?.text && <div className="text-xs text-muted-foreground truncate">{active.text}</div>}
					</div>
					{active && active.pricing.length > 0 && (
						<span className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
							<Database size={10} /> {minCr(active.pricing)}+
						</span>
					)}
					<ChevronDown size={14} className="text-muted-foreground shrink-0" />
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80 p-1 max-h-80 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
				{models.map((m) => (
					<button
						key={m.model}
						type="button"
						onClick={() => { onChange(m); setOpen(false); }}
						className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${m.model === value ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"}`}
					>
						{m.icon_url ? (
							<img src={m.icon_url} alt="" className="w-8 h-8 rounded object-contain shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
						) : (
							<div className="w-8 h-8 rounded bg-muted shrink-0" />
						)}
						<div className="flex-1 min-w-0">
							<div className="font-medium truncate">{m.name}</div>
							{m.text && <div className="text-xs text-muted-foreground truncate">{m.text}</div>}
						</div>
						{m.pricing.length > 0 && (
							<span className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
								<Database size={10} /> {minCr(m.pricing)}+
							</span>
						)}
					</button>
				))}
				{!models.length && <p className="px-3 py-2 text-sm text-muted-foreground">No models available.</p>}
			</PopoverContent>
		</Popover>
	);
}

// ── Reusable option button ────────────────────────────────────────────────────

export function OptBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${active ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-background text-foreground hover:bg-muted/60"}`}
		>
			{children}
		</button>
	);
}

// ── Option group (array of radio-like buttons) ────────────────────────────────

interface OptionGroupProps {
	label: string;
	options: string[];
	value: string;
	onChange: (v: string) => void;
	fmt?: (v: string) => string;
}

export function OptionGroup({ label, options, value, onChange, fmt }: OptionGroupProps) {
	if (!options.length) return null;
	return (
		<div className="space-y-1.5">
			<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
			<div className="flex flex-wrap gap-2">
				{options.map((o) => (
					<OptBtn key={o} active={value === o} onClick={() => onChange(o)}>
						{fmt ? fmt(o) : o}
					</OptBtn>
				))}
			</div>
		</div>
	);
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

export function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-sm">{label}</span>
			<button
				type="button"
				onClick={onToggle}
				className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}
			>
				<span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${on ? "left-[calc(100%-1.375rem)]" : "left-0.5"}`} />
			</button>
		</div>
	);
}

// ── AI Prompt Generator dialog ────────────────────────────────────────────────

interface AiPromptDialogProps {
	open: boolean;
	onClose: () => void;
	onSelect: (prompt: string) => void;
}

export function AiPromptDialog({ open, onClose, onSelect }: AiPromptDialogProps) {
	const [idea, setIdea] = useState("");
	const [prompts, setPrompts] = useState<string[]>([]);
	const gen = useGenerateVideoPrompt();

	function handleGenerate() {
		if (!idea.trim()) { toast.error("Enter an idea first."); return; }
		gen.mutate(idea, {
			onSuccess: (d) => setPrompts(d.prompts ?? []),
			onError: () => toast.error("Failed to generate prompts."),
		});
	}

	return (
		<Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setPrompts([]); setIdea(""); } }}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Generate Prompt with AI</DialogTitle>
				</DialogHeader>
				<div className="space-y-3">
					{prompts.length > 0 && (
						<div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
							{prompts.map((p, i) => (
								<button key={i} type="button" onClick={() => { onSelect(p); onClose(); setPrompts([]); setIdea(""); }} className="w-full text-left text-sm border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors">
									{p}
								</button>
							))}
						</div>
					)}
					{!prompts.length && (
						<>
							<p className="text-sm font-medium">Tell us about your video idea</p>
							<Textarea placeholder="e.g. A futuristic city at sunset with flying cars..." value={idea} onChange={(e) => setIdea(e.target.value)} className="resize-none min-h-[80px]" />
						</>
					)}
					<div className="flex gap-2">
						{prompts.length > 0 && (
							<Button variant="outline" size="sm" onClick={() => { setPrompts([]); }} className="flex-1">
								Back
							</Button>
						)}
						<Button size="sm" disabled={gen.isPending} onClick={handleGenerate} className="flex-1 gap-1.5">
							{gen.isPending ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Sparkles size={14} />}
							{prompts.length ? "Generate More" : "Generate"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// ── Seed input with randomize button ─────────────────────────────────────────

export function SeedInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
	function randomSeed() { onChange(String(Math.floor(Math.random() * 2147483647))); }
	return (
		<div className="space-y-1.5">
			<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Seed</p>
			<div className="relative">
				<input
					type="number"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="w-full h-9 px-3 pr-10 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
					placeholder="Random"
				/>
				<button type="button" onClick={randomSeed} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
					<RefreshCw size={14} />
				</button>
			</div>
		</div>
	);
}
