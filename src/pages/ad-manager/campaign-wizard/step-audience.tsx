import { useState } from "react";
import { Input } from "@/components/ui/input";
import { X, Monitor, Smartphone, Tablet } from "lucide-react";
import type { WizardState } from "./wizard-types";

const SUGGESTED_LOCATIONS = ["United States", "United Kingdom", "Greece", "Germany", "France", "Spain", "Italy", "Canada", "Australia", "Netherlands", "Belgium", "Cyprus"];
const SUGGESTED_LANGUAGES = ["English", "Greek", "German", "French", "Spanish", "Italian", "Dutch", "Portuguese"];

export function StepAudience({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	const [locInput, setLocInput] = useState("");
	const [langInput, setLangInput] = useState("");
	const [intInput, setIntInput] = useState("");

	const addChip = (field: "locations" | "languages" | "interests", val: string) => {
		if (val && !state[field].includes(val)) update({ [field]: [...state[field], val] });
	};
	const removeChip = (field: "locations" | "languages" | "interests", val: string) => {
		update({ [field]: state[field].filter((v) => v !== val) });
	};
	const toggleDevice = (d: string) => {
		const next = state.devices.includes(d) ? state.devices.filter((v) => v !== d) : [...state.devices, d];
		update({ devices: next });
	};

	const filteredLocs = SUGGESTED_LOCATIONS.filter((l) => l.toLowerCase().includes(locInput.toLowerCase()) && !state.locations.includes(l));
	const filteredLangs = SUGGESTED_LANGUAGES.filter((l) => l.toLowerCase().includes(langInput.toLowerCase()) && !state.languages.includes(l));

	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
			<h2 className="text-lg font-semibold text-[var(--foreground)]">Define Audience</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-5">Who should see your ads?</p>

			{/* Locations */}
			<div className="mb-5">
				<label className="text-sm font-medium text-[var(--foreground)]">Locations</label>
				<ChipList items={state.locations} onRemove={(v) => removeChip("locations", v)} />
				<div className="relative mt-1">
					<Input value={locInput} onChange={(e) => setLocInput(e.target.value)}
						onKeyDown={(e) => { if (e.key === "Enter" && locInput.trim()) { addChip("locations", locInput.trim()); setLocInput(""); e.preventDefault(); } }}
						placeholder="Search countries..." />
					{locInput && filteredLocs.length > 0 && (
						<Dropdown items={filteredLocs.slice(0, 5)} onSelect={(v) => { addChip("locations", v); setLocInput(""); }} />
					)}
				</div>
			</div>

			{/* Languages + Interests */}
			<div className="grid grid-cols-2 gap-5 mb-5">
				<div>
					<label className="text-sm font-medium text-[var(--foreground)]">Languages</label>
					<ChipList items={state.languages} onRemove={(v) => removeChip("languages", v)} />
					<div className="relative mt-1">
						<Input value={langInput} onChange={(e) => setLangInput(e.target.value)}
							onKeyDown={(e) => { if (e.key === "Enter" && langInput.trim()) { addChip("languages", langInput.trim()); setLangInput(""); e.preventDefault(); } }}
							placeholder="Search languages..." />
						{langInput && filteredLangs.length > 0 && (
							<Dropdown items={filteredLangs.slice(0, 5)} onSelect={(v) => { addChip("languages", v); setLangInput(""); }} />
						)}
					</div>
				</div>
				<div>
					<label className="text-sm font-medium text-[var(--foreground)]">Interests</label>
					<ChipList items={state.interests} onRemove={(v) => removeChip("interests", v)} />
					<Input value={intInput} onChange={(e) => setIntInput(e.target.value)} className="mt-1"
						onKeyDown={(e) => { if (e.key === "Enter" && intInput.trim()) { addChip("interests", intInput.trim()); setIntInput(""); e.preventDefault(); } }}
						placeholder="Type and press Enter..." />
				</div>
			</div>

			{/* Gender + Age */}
			<div className="grid grid-cols-2 gap-5 mb-5">
				<div>
					<label className="text-sm font-medium text-[var(--foreground)]">Gender</label>
					<div className="flex gap-2 mt-2">
						{(["all", "male", "female"] as const).map((g) => (
							<button key={g} onClick={() => update({ gender: g })}
								className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
									state.gender === g ? "bg-[var(--sq-primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]"
								}`}>{g.charAt(0).toUpperCase() + g.slice(1)}</button>
						))}
					</div>
				</div>
				<div>
					<label className="text-sm font-medium text-[var(--foreground)]">Age Range</label>
					<div className="flex items-center gap-2 mt-2">
						<Input type="number" min={13} max={65} value={state.age_min} onChange={(e) => update({ age_min: Number(e.target.value) })} className="w-20" />
						<span className="text-[var(--muted-foreground)] text-sm">to</span>
						<Input type="number" min={13} max={65} value={state.age_max} onChange={(e) => update({ age_max: Number(e.target.value) })} className="w-20" />
					</div>
				</div>
			</div>

			{/* Excluded Audiences */}
			<div className="mb-5">
				<label className="text-sm font-medium text-[var(--muted-foreground)]">Excluded Audiences</label>
				<Input value={state.excluded_audiences} onChange={(e) => update({ excluded_audiences: e.target.value })}
					placeholder="e.g. existing customers, past purchasers (comma-separated)" className="mt-1" />
			</div>

			{/* Toggles */}
			<div className="space-y-3 mb-5">
				<ToggleRow label="Advantage+ Audience" desc="Let Meta find the best audience for your ads"
					value={state.advantage_audience} onChange={(v) => update({ advantage_audience: v })} />
				<ToggleRow label="Detailed Targeting Expansion" desc="Allow Meta to expand beyond selected interests"
					value={state.detailed_targeting_expansion} onChange={(v) => update({ detailed_targeting_expansion: v })} />
			</div>

			{/* Device Targeting */}
			<div>
				<label className="text-sm font-medium text-[var(--foreground)]">Device Targeting</label>
				<div className="flex gap-2 mt-2">
					{[{ id: "desktop", label: "Desktop", icon: Monitor }, { id: "mobile", label: "Mobile", icon: Smartphone }, { id: "tablet", label: "Tablet", icon: Tablet }].map((d) => (
						<button key={d.id} onClick={() => toggleDevice(d.id)}
							className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
								state.devices.includes(d.id) ? "bg-[var(--sq-primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
							}`}><d.icon size={16} /> {d.label}</button>
					))}
				</div>
			</div>
		</div>
	);
}

function ChipList({ items, onRemove }: { items: string[]; onRemove: (v: string) => void }) {
	if (!items.length) return null;
	return (
		<div className="flex flex-wrap gap-1.5 mt-2">
			{items.map((v) => (
				<span key={v} className="inline-flex items-center gap-1 rounded-full bg-[var(--sq-primary)]/10 text-[var(--sq-primary)] px-2.5 py-1 text-xs font-medium">
					{v} <button onClick={() => onRemove(v)}><X size={11} /></button>
				</span>
			))}
		</div>
	);
}

function Dropdown({ items, onSelect }: { items: string[]; onSelect: (v: string) => void }) {
	return (
		<div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg">
			{items.map((v) => (
				<button key={v} onClick={() => onSelect(v)} className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--muted)] transition-colors">{v}</button>
			))}
		</div>
	);
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
	return (
		<div className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3">
			<div><p className="text-sm font-medium text-[var(--foreground)]">{label}</p><p className="text-xs text-[var(--muted-foreground)]">{desc}</p></div>
			<button onClick={() => onChange(!value)} className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-[var(--sq-primary)]" : "bg-gray-300"}`}>
				<span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
			</button>
		</div>
	);
}
