import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Link2, Tag, Plus, X } from "lucide-react";

/* ── UTM Tracking Section ────────────────────────────────────────── */

interface UtmValues { source: string; medium: string; campaign: string; term: string; content: string }

interface UtmTrackingProps {
	values: UtmValues;
	onChange: (vals: UtmValues) => void;
}

export function UtmTrackingSection({ values, onChange }: UtmTrackingProps) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="border border-[var(--border)] rounded-lg overflow-hidden">
			<button onClick={() => setExpanded(!expanded)}
				className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--muted)]/30 transition-colors">
				<div className="flex items-center gap-2">
					<Link2 size={16} className="text-[var(--muted-foreground)]" />
					<span className="text-sm font-medium text-[var(--foreground)]">URL Tracking (UTM)</span>
				</div>
				<span className="text-xs text-[var(--muted-foreground)]">
					{expanded ? <ChevronUp size={16} /> : <>Configure <ChevronDown size={16} className="inline" /></>}
				</span>
			</button>
			{expanded && (
				<div className="px-4 pb-4 space-y-3 border-t border-[var(--border)] pt-3">
					<div className="grid grid-cols-3 gap-3">
						<div><FieldLabel required>Source</FieldLabel><Input value={values.source} onChange={(e) => onChange({ ...values, source: e.target.value })} placeholder="e.g. smartlyq" className="text-sm h-9" /></div>
						<div><FieldLabel required>Medium</FieldLabel><Input value={values.medium} onChange={(e) => onChange({ ...values, medium: e.target.value })} placeholder="e.g. social" className="text-sm h-9" /></div>
						<div><FieldLabel required>Campaign</FieldLabel><Input value={values.campaign} onChange={(e) => onChange({ ...values, campaign: e.target.value })} placeholder="e.g. spring_sale" className="text-sm h-9" /></div>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div><FieldLabel>Term</FieldLabel><Input value={values.term} onChange={(e) => onChange({ ...values, term: e.target.value })} placeholder="Optional" className="text-sm h-9" /></div>
						<div><FieldLabel>Content</FieldLabel><Input value={values.content} onChange={(e) => onChange({ ...values, content: e.target.value })} placeholder="Optional" className="text-sm h-9" /></div>
					</div>
				</div>
			)}
		</div>
	);
}

/* ── Labels Section ──────────────────────────────────────────────── */

interface LabelsProps {
	selectedLabels: string[];
	onLabelsChange: (labels: string[]) => void;
	availableLabels?: string[];
}

export function LabelsSection({ selectedLabels, onLabelsChange, availableLabels = [] }: LabelsProps) {
	const [expanded, setExpanded] = useState(false);
	const [newLabel, setNewLabel] = useState("");

	function addLabel(label: string) {
		const trimmed = label.trim();
		if (trimmed && !selectedLabels.includes(trimmed)) {
			onLabelsChange([...selectedLabels, trimmed]);
		}
		setNewLabel("");
	}

	function removeLabel(label: string) {
		onLabelsChange(selectedLabels.filter((l) => l !== label));
	}

	return (
		<div className="border border-[var(--border)] rounded-lg overflow-hidden">
			<button onClick={() => setExpanded(!expanded)}
				className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--muted)]/30 transition-colors">
				<div className="flex items-center gap-2">
					<Tag size={16} className="text-[var(--muted-foreground)]" />
					<span className="text-sm font-medium text-[var(--foreground)]">Labels</span>
					{selectedLabels.length > 0 && (
						<span className="text-[10px] bg-[var(--sq-primary)]/10 text-[var(--sq-primary)] rounded-full px-2 py-0.5">{selectedLabels.length}</span>
					)}
				</div>
				<span className="text-xs text-[var(--muted-foreground)]">{expanded ? <ChevronUp size={16} /> : "Manage"}</span>
			</button>
			{expanded && (
				<div className="px-4 pb-4 border-t border-[var(--border)] pt-3 space-y-3">
					{/* Selected labels */}
					{selectedLabels.length > 0 && (
						<div className="flex flex-wrap gap-1.5">
							{selectedLabels.map((l) => (
								<span key={l} className="inline-flex items-center gap-1 rounded-full bg-[var(--sq-primary)]/10 text-[var(--sq-primary)] px-2.5 py-0.5 text-xs">
									{l} <button onClick={() => removeLabel(l)}><X size={10} /></button>
								</span>
							))}
						</div>
					)}
					{/* Add new / select existing */}
					<div className="flex gap-2">
						<Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Add label..." className="text-sm h-8 flex-1"
							onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLabel(newLabel); } }} />
						<Button variant="outline" size="sm" onClick={() => addLabel(newLabel)} disabled={!newLabel.trim()} className="h-8"><Plus size={12} /></Button>
					</div>
					{/* Available labels */}
					{availableLabels.filter((l) => !selectedLabels.includes(l)).length > 0 && (
						<div className="flex flex-wrap gap-1">
							{availableLabels.filter((l) => !selectedLabels.includes(l)).map((l) => (
								<button key={l} onClick={() => addLabel(l)} className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] hover:bg-[var(--muted)] transition-colors">{l}</button>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
	return (
		<label className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1 block">
			{children} {required && <span className="text-red-500">*</span>}
		</label>
	);
}
