import { useState } from "react";
import { X, Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FilterRule {
	id: string;
	field: string;
	operator: string;
	value: string;
}

const FILTER_FIELDS = [
	{ key: "name", label: "Contact name", type: "text" },
	{ key: "first_name", label: "First name", type: "text" },
	{ key: "last_name", label: "Last name", type: "text" },
	{ key: "email", label: "Email", type: "text" },
	{ key: "phone", label: "Phone", type: "text" },
	{ key: "company", label: "Company name", type: "text" },
	{ key: "role", label: "Role", type: "text" },
	{ key: "status", label: "Contact status", type: "select", options: ["active", "prospect", "in_progress", "lost"] },
	{ key: "contact_type", label: "Contact type", type: "text" },
	{ key: "country", label: "Country", type: "text" },
	{ key: "tags", label: "Tags", type: "tag" },
	{ key: "created_at", label: "Created", type: "date" },
	{ key: "last_contacted_at", label: "Last activity", type: "date" },
];

const TEXT_OPERATORS = [
	{ key: "contains", label: "Contains" },
	{ key: "equals", label: "Equals" },
	{ key: "starts_with", label: "Starts with" },
	{ key: "not_contains", label: "Does not contain" },
	{ key: "is_empty", label: "Is empty" },
	{ key: "is_not_empty", label: "Is not empty" },
];

const SELECT_OPERATORS = [
	{ key: "equals", label: "Is" },
	{ key: "not_equals", label: "Is not" },
];

const DATE_OPERATORS = [
	{ key: "after", label: "After" },
	{ key: "before", label: "Before" },
	{ key: "equals", label: "On" },
	{ key: "is_empty", label: "Is empty" },
	{ key: "is_not_empty", label: "Is not empty" },
];

const TAG_OPERATORS = [
	{ key: "contains", label: "Has tag" },
	{ key: "not_contains", label: "Does not have tag" },
	{ key: "is_empty", label: "Has no tags" },
];

function getOperators(fieldKey: string) {
	const field = FILTER_FIELDS.find((f) => f.key === fieldKey);
	if (!field) return TEXT_OPERATORS;
	if (field.type === "select") return SELECT_OPERATORS;
	if (field.type === "date") return DATE_OPERATORS;
	if (field.type === "tag") return TAG_OPERATORS;
	return TEXT_OPERATORS;
}

interface AdvancedFiltersPanelProps {
	open: boolean;
	onClose: () => void;
	filters: FilterRule[];
	onFiltersChange: (filters: FilterRule[]) => void;
	onApply: () => void;
	availableTags?: string[];
}

export function AdvancedFiltersPanel({ open, onClose, filters, onFiltersChange, onApply, availableTags = [] }: AdvancedFiltersPanelProps) {
	const [fieldSearch, setFieldSearch] = useState("");

	if (!open) return null;

	function addFilter() {
		onFiltersChange([...filters, { id: String(Date.now()), field: "name", operator: "contains", value: "" }]);
	}

	function updateFilter(id: string, updates: Partial<FilterRule>) {
		onFiltersChange(filters.map((f) => f.id === id ? { ...f, ...updates } : f));
	}

	function removeFilter(id: string) {
		onFiltersChange(filters.filter((f) => f.id !== id));
	}

	function clearAll() {
		onFiltersChange([]);
		onApply();
	}

	const filteredFields = fieldSearch
		? FILTER_FIELDS.filter((f) => f.label.toLowerCase().includes(fieldSearch.toLowerCase()))
		: FILTER_FIELDS;

	return (
		<div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
			<div className="w-full max-w-md h-full bg-[var(--card)] border-l border-[var(--border)] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
					<h2 className="text-lg font-semibold text-[var(--foreground)]">Advanced Filters</h2>
					<button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--muted)]"><X size={18} /></button>
				</div>

				{/* Field search */}
				<div className="px-5 py-3 border-b border-[var(--border)]">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
						<Input placeholder="Search field" value={fieldSearch} onChange={(e) => setFieldSearch(e.target.value)} className="pl-9 text-sm" />
					</div>
				</div>

				{/* Active filters */}
				<div className="flex-1 overflow-y-auto px-5 py-3">
					{filters.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-sm text-[var(--muted-foreground)]">No filters applied</p>
							<p className="text-xs text-[var(--muted-foreground)] mt-1">Click a field below or "Add filter" to start</p>
						</div>
					) : (
						<div className="space-y-3 mb-4">
							{filters.map((f, i) => {
								const operators = getOperators(f.field);
								const fieldDef = FILTER_FIELDS.find((fd) => fd.key === f.field);
								const needsValue = !f.operator.includes("empty");
								return (
									<div key={f.id} className="rounded-lg border border-[var(--border)] p-3 space-y-2">
										{i > 0 && <p className="text-[10px] font-semibold text-[var(--sq-primary)] uppercase">AND</p>}
										<div className="flex gap-2">
											<Select value={f.field} onValueChange={(v) => updateFilter(f.id, { field: v, operator: getOperators(v)[0]?.key ?? "contains", value: "" })}>
												<SelectTrigger className="flex-1 h-8 text-xs"><SelectValue /></SelectTrigger>
												<SelectContent>{filteredFields.map((fd) => <SelectItem key={fd.key} value={fd.key}>{fd.label}</SelectItem>)}</SelectContent>
											</Select>
											<button onClick={() => removeFilter(f.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
										</div>
										<Select value={f.operator} onValueChange={(v) => updateFilter(f.id, { operator: v })}>
											<SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
											<SelectContent>{operators.map((o) => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}</SelectContent>
										</Select>
										{needsValue && (
											fieldDef?.type === "select" ? (
												<Select value={f.value} onValueChange={(v) => updateFilter(f.id, { value: v })}>
													<SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
													<SelectContent>{(fieldDef.options ?? []).map((o) => <SelectItem key={o} value={o}>{o.replace("_", " ")}</SelectItem>)}</SelectContent>
												</Select>
											) : fieldDef?.type === "tag" && availableTags.length > 0 ? (
												<Select value={f.value} onValueChange={(v) => updateFilter(f.id, { value: v })}>
													<SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select tag..." /></SelectTrigger>
													<SelectContent>{availableTags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
												</Select>
											) : fieldDef?.type === "date" ? (
												<Input type="date" value={f.value} onChange={(e) => updateFilter(f.id, { value: e.target.value })} className="h-8 text-xs" />
											) : (
												<Input value={f.value} onChange={(e) => updateFilter(f.id, { value: e.target.value })} placeholder="Enter value..." className="h-8 text-xs" />
											)
										)}
									</div>
								);
							})}
						</div>
					)}

					{/* Quick add from field list */}
					{filters.length === 0 && (
						<div>
							<p className="text-xs font-medium text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">Contact information</p>
							<div className="space-y-0.5">
								{filteredFields.map((f) => (
									<button key={f.key} onClick={() => onFiltersChange([...filters, { id: String(Date.now()), field: f.key, operator: "contains", value: "" }])}
										className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-[var(--muted)] text-[var(--foreground)] transition-colors">
										{f.label}
									</button>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)]">
					<Button variant="outline" size="sm" onClick={addFilter} className="gap-1"><Plus size={12} /> Add filter</Button>
					<div className="flex gap-2">
						{filters.length > 0 && <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-500">Clear all</Button>}
						<Button size="sm" onClick={() => { onApply(); onClose(); }}>Apply filters</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
