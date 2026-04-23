import { useState } from "react";
import { ChevronDown, Database } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ImageModel, ImageStyle } from "@/api/tools";

const TRIGGER_CLS = "w-full h-10 flex items-center gap-2 px-3 border border-border rounded-lg bg-background text-sm text-left hover:bg-muted/40 transition-colors disabled:opacity-50";
const ICON_CLS = "w-6 h-6 rounded object-contain shrink-0";

// --- Style Selector ---

interface StyleSelectorProps {
	styles: ImageStyle[];
	value: string;
	onChange: (value: string, prompt: string) => void;
}

export function StyleSelector({ styles, value, onChange }: StyleSelectorProps) {
	const [open, setOpen] = useState(false);
	const active = styles.find((s) => s.value === value) ?? styles[0];

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button type="button" className={TRIGGER_CLS}>
					{active?.icon_url ? (
						<img src={active.icon_url} alt="" className={ICON_CLS} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
					) : (
						<div className="w-6 h-6 rounded bg-muted shrink-0" />
					)}
					<span className="flex-1 truncate">{active?.value ?? "None"}</span>
					<ChevronDown size={14} className="text-muted-foreground shrink-0" />
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80 p-3 max-h-96 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
				<div className="grid grid-cols-3 gap-2">
					{styles.map((s) => (
						<button
							key={s.value}
							type="button"
							onClick={() => { onChange(s.value, s.prompt); setOpen(false); }}
							className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all text-center ${s.value === value ? "border-primary bg-primary/10" : "border-transparent hover:border-border hover:bg-muted/50"}`}
						>
							{s.icon_url ? (
								<img src={s.icon_url} alt={s.value} className="w-full aspect-square object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
							) : (
								<div className="w-full aspect-square rounded bg-muted flex items-center justify-center text-2xl">⊘</div>
							)}
							<span className="text-xs text-foreground leading-tight">{s.value}</span>
						</button>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}

// --- Aspect Ratio Selector ---

type Aspect = "Square" | "Portrait" | "Landscape";

function AspectIcon({ ar }: { ar: Aspect }) {
	if (ar === "Square")    return <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0"><rect x="1" y="1" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
	if (ar === "Portrait")  return <svg width="13" height="18" viewBox="0 0 13 18" className="shrink-0"><rect x="1" y="1" width="11" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
	return                         <svg width="22" height="16" viewBox="0 0 22 16" className="shrink-0"><rect x="1" y="1" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}

interface AspectSelectorProps {
	value: Aspect;
	onChange: (v: Aspect) => void;
}

export function AspectSelector({ value, onChange }: AspectSelectorProps) {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button type="button" className={TRIGGER_CLS}>
					<span className="w-6 h-6 flex items-center justify-center shrink-0">
						<AspectIcon ar={value} />
					</span>
					<span className="flex-1">{value}</span>
					<ChevronDown size={14} className="text-muted-foreground shrink-0" />
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-44 p-1">
				{(["Square", "Portrait", "Landscape"] as Aspect[]).map((ar) => (
					<button
						key={ar}
						type="button"
						onClick={() => { onChange(ar); setOpen(false); }}
						className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${ar === value ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"}`}
					>
						<span className="w-6 flex items-center justify-center shrink-0">
							<AspectIcon ar={ar} />
						</span>
						{ar}
					</button>
				))}
			</PopoverContent>
		</Popover>
	);
}

// --- Model Selector ---

const TIER_LABELS: Record<string, string> = {
	basic: "Basic models",
	advanced: "Advanced models",
	premium: "Premium models",
	ultra: "Ultra models",
};
const TIER_ORDER = ["basic", "advanced", "premium", "ultra"];

interface ModelSelectorProps {
	models: ImageModel[];
	value: string;
	onChange: (model: string) => void;
	disabled?: boolean;
}

export function ModelSelector({ models, value, onChange, disabled }: ModelSelectorProps) {
	const [open, setOpen] = useState(false);
	const activeModel = models.find((m) => m.model === value) ?? models[0];

	const grouped: Record<string, ImageModel[]> = {};
	for (const m of models) {
		const t = m.tier ?? "basic";
		if (!grouped[t]) grouped[t] = [];
		grouped[t].push(m);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button type="button" disabled={disabled} className={TRIGGER_CLS}>
					{activeModel?.icon_url ? (
						<img src={activeModel.icon_url} alt="" className={ICON_CLS} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
					) : (
						<div className="w-6 h-6 rounded bg-muted shrink-0" />
					)}
					<span className="flex-1 truncate">{activeModel?.name ?? "Select model"}</span>
					<ChevronDown size={14} className="text-muted-foreground shrink-0" />
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80 p-1 max-h-80 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
				{TIER_ORDER.filter((t) => (grouped[t]?.length ?? 0) > 0).map((tier, i) => (
					<div key={tier}>
						{i > 0 && <div className="my-1 border-t border-border" />}
						<p className="px-3 py-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{TIER_LABELS[tier]}</p>
						{(grouped[tier] ?? []).map((m) => (
							<button
								key={m.model}
								type="button"
								onClick={() => { onChange(m.model); setOpen(false); }}
								className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${m.model === value ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"}`}
							>
								{m.icon_url ? (
									<img src={m.icon_url} alt="" className={ICON_CLS} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
								) : (
									<div className="w-6 h-6 rounded bg-muted shrink-0" />
								)}
								<span className="flex-1 truncate min-w-0">{m.name} ({m.provider})</span>
								{m.credits !== null && (
									<span className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 shrink-0">
										<Database size={11} /> {m.credits}
									</span>
								)}
							</button>
						))}
					</div>
				))}
				{!models.length && <p className="px-3 py-2 text-sm text-muted-foreground">No models available for your plan.</p>}
			</PopoverContent>
		</Popover>
	);
}
