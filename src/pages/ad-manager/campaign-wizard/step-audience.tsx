import { Input } from "@/components/ui/input";
import { MapPin, X } from "lucide-react";
import { useState } from "react";
import type { WizardState } from "./wizard-layout";

const SUGGESTED_LOCATIONS = ["United States", "United Kingdom", "Greece", "Germany", "France", "Spain", "Italy", "Canada", "Australia"];

export function StepAudience({ state, update }: { state: WizardState; update: (p: Partial<WizardState>) => void }) {
	const [locationInput, setLocationInput] = useState("");
	const locations = state.targeting.locations;

	const addLocation = (loc: string) => {
		if (!locations.includes(loc)) {
			update({ targeting: { ...state.targeting, locations: [...locations, loc] } });
		}
		setLocationInput("");
	};

	const removeLocation = (loc: string) => {
		update({ targeting: { ...state.targeting, locations: locations.filter((l) => l !== loc) } });
	};

	const filtered = SUGGESTED_LOCATIONS.filter(
		(l) => l.toLowerCase().includes(locationInput.toLowerCase()) && !locations.includes(l)
	);

	return (
		<div>
			<h2 className="text-lg font-semibold mb-1">Target Audience</h2>
			<p className="text-sm text-[var(--muted-foreground)] mb-6">Define who should see your ads.</p>

			<div className="grid grid-cols-2 gap-6">
				<div>
					<label className="text-sm font-medium text-[var(--foreground)]">Locations</label>
					<div className="relative mt-1">
						<MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
						<Input value={locationInput} onChange={(e) => setLocationInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && locationInput.trim()) { addLocation(locationInput.trim()); e.preventDefault(); } }}
							placeholder="Add location..." className="pl-9" />
					</div>
					{locationInput && filtered.length > 0 && (
						<div className="mt-1 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm">
							{filtered.slice(0, 5).map((l) => (
								<button key={l} onClick={() => addLocation(l)} className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--muted)]">{l}</button>
							))}
						</div>
					)}
					<div className="flex flex-wrap gap-2 mt-3">
						{locations.map((l) => (
							<span key={l} className="inline-flex items-center gap-1 rounded-full bg-[var(--sq-primary)]/10 text-[var(--sq-primary)] px-3 py-1 text-xs font-medium">
								{l} <button onClick={() => removeLocation(l)}><X size={12} /></button>
							</span>
						))}
					</div>
				</div>

				<div className="space-y-4">
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Age Range</label>
						<div className="flex items-center gap-2 mt-1">
							<Input type="number" min={13} max={65} value={state.targeting.age_min}
								onChange={(e) => update({ targeting: { ...state.targeting, age_min: Number(e.target.value) } })} className="w-20" />
							<span className="text-[var(--muted-foreground)]">to</span>
							<Input type="number" min={13} max={65} value={state.targeting.age_max}
								onChange={(e) => update({ targeting: { ...state.targeting, age_max: Number(e.target.value) } })} className="w-20" />
						</div>
					</div>
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">Gender</label>
						<div className="flex gap-2 mt-1">
							{["All", "Male", "Female"].map((g) => {
								const val = g === "All" ? [] : [g.toLowerCase()];
								const active = g === "All" ? state.targeting.genders.length === 0 : state.targeting.genders.includes(g.toLowerCase());
								return (
									<button key={g} onClick={() => update({ targeting: { ...state.targeting, genders: val } })}
										className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
											active ? "bg-[var(--sq-primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
										}`}>{g}</button>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
