import { useState } from "react";
import { X, Search, GripVertical, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface FieldConfig {
	key: string;
	label: string;
	visible: boolean;
	locked?: boolean; // Can't be hidden (e.g., Contact name)
}

const DEFAULT_FIELDS: FieldConfig[] = [
	{ key: "name", label: "Contact name", visible: true, locked: true },
	{ key: "phone", label: "Phone", visible: true },
	{ key: "email", label: "Email", visible: true },
	{ key: "company", label: "Business name", visible: true },
	{ key: "role", label: "Role", visible: false },
	{ key: "status", label: "Status", visible: true },
	{ key: "contact_type", label: "Contact type", visible: false },
	{ key: "timezone", label: "Timezone", visible: false },
	{ key: "created_at", label: "Created", visible: true },
	{ key: "last_contacted_at", label: "Last activity", visible: true },
	{ key: "tags", label: "Tags", visible: true },
	{ key: "deals", label: "Deals", visible: true },
	{ key: "secondary_email", label: "Secondary email", visible: false },
	{ key: "secondary_phone", label: "Secondary phone", visible: false },
	{ key: "phone_country_code", label: "Country code", visible: false },
];

export function getDefaultFields(): FieldConfig[] {
	// Load from localStorage if saved
	try {
		const saved = localStorage.getItem("crm_contact_fields");
		if (saved) {
			const parsed = JSON.parse(saved);
			if (Array.isArray(parsed) && parsed.length > 0) return parsed;
		}
	} catch {}
	return DEFAULT_FIELDS;
}

function saveFields(fields: FieldConfig[]) {
	localStorage.setItem("crm_contact_fields", JSON.stringify(fields));
}

interface ManageFieldsPanelProps {
	open: boolean;
	onClose: () => void;
	fields: FieldConfig[];
	onFieldsChange: (fields: FieldConfig[]) => void;
}

export function ManageFieldsPanel({ open, onClose, fields, onFieldsChange }: ManageFieldsPanelProps) {
	const [search, setSearch] = useState("");

	if (!open) return null;

	const filtered = search
		? fields.filter((f) => f.label.toLowerCase().includes(search.toLowerCase()))
		: fields;

	const visibleFields = filtered.filter((f) => f.visible);
	const hiddenFields = filtered.filter((f) => !f.visible);

	function toggleField(key: string) {
		const updated = fields.map((f) => f.key === key && !f.locked ? { ...f, visible: !f.visible } : f);
		onFieldsChange(updated);
		saveFields(updated);
	}

	return (
		<div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
			<div className="w-full max-w-sm h-full bg-[var(--card)] border-l border-[var(--border)] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
					<h2 className="text-lg font-semibold text-[var(--foreground)]">Manage fields</h2>
					<button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--muted)]"><X size={18} /></button>
				</div>

				{/* Search */}
				<div className="px-5 py-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
						<Input placeholder="Search field" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
					</div>
				</div>

				{/* Fields list */}
				<div className="flex-1 overflow-y-auto px-5">
					{visibleFields.length > 0 && (
						<div className="mb-4">
							<p className="text-xs font-medium text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">Fields in table</p>
							<div className="space-y-1">
								{visibleFields.map((f) => (
									<div key={f.key} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-[var(--muted)]/50">
										<GripVertical size={14} className="text-[var(--muted-foreground)] shrink-0 cursor-grab" />
										<button onClick={() => toggleField(f.key)} disabled={f.locked}
											className={`flex h-5 w-5 items-center justify-center rounded border shrink-0 ${f.visible ? "bg-[var(--sq-primary)] border-[var(--sq-primary)]" : "border-[var(--border)]"}`}>
											{f.visible && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
										</button>
										<span className="text-sm text-[var(--foreground)] flex-1">{f.label}</span>
										{f.locked && <Lock size={12} className="text-[var(--muted-foreground)]" />}
									</div>
								))}
							</div>
						</div>
					)}

					{hiddenFields.length > 0 && (
						<div>
							<p className="text-xs font-medium text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">Add fields</p>
							<div className="space-y-1">
								{hiddenFields.map((f) => (
									<div key={f.key} className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-[var(--muted)]/50">
										<GripVertical size={14} className="text-[var(--muted-foreground)] shrink-0" />
										<button onClick={() => toggleField(f.key)}
											className="flex h-5 w-5 items-center justify-center rounded border border-[var(--border)] shrink-0" />
										<span className="text-sm text-[var(--muted-foreground)]">{f.label}</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
