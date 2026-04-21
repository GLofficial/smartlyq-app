import { useEffect, useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFbLeadMapping, useFbLeadMappingSave, type FbLeadMappingRow } from "@/api/crm-lead-sync";
import { toast } from "sonner";

const CRM_FIELD_OPTIONS: { value: string; label: string }[] = [
	{ value: "skip", label: "— Skip (don't import) —" },
	{ value: "first_name", label: "First Name" },
	{ value: "last_name", label: "Last Name" },
	{ value: "full_name", label: "Full Name (split)" },
	{ value: "email", label: "Email" },
	{ value: "secondary_email", label: "Secondary Email" },
	{ value: "phone", label: "Phone" },
	{ value: "secondary_phone", label: "Secondary Phone" },
	{ value: "company", label: "Company" },
	{ value: "role", label: "Role / Job Title" },
	{ value: "tag", label: "Store as tag (name:value)" },
];

interface Props {
	open: boolean;
	onClose: () => void;
	formPk: number;
	formName: string;
}

export function FbLeadMappingModal({ open, onClose, formPk, formName }: Props) {
	const { data, isLoading } = useFbLeadMapping(open ? formPk : 0);
	const save = useFbLeadMappingSave();
	const [rows, setRows] = useState<FbLeadMappingRow[]>([]);

	useEffect(() => {
		if (!data) return;
		if (data.mappings.length > 0) setRows(data.mappings);
		else setRows(data.auto_mapping);
	}, [data]);

	function update(idx: number, crmField: string) {
		setRows((r) => r.map((x, i) => (i === idx ? { ...x, crm_field: crmField } : x)));
	}

	function applyAuto() {
		if (data?.auto_mapping) setRows(data.auto_mapping);
	}

	async function handleSave() {
		try {
			await save.mutateAsync({ form_pk: formPk, mappings: rows });
			toast.success("Mapping saved");
			onClose();
		} catch (e) {
			toast.error((e as Error)?.message ?? "Failed to save");
		}
	}

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
			<div className="w-full max-w-2xl max-h-[85vh] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
					<div>
						<h2 className="text-lg font-semibold">Map form fields</h2>
						<p className="text-xs text-[var(--muted-foreground)]">{formName}</p>
					</div>
					<button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--muted)]"><X size={18} className="text-[var(--muted-foreground)]" /></button>
				</div>

				<div className="flex-1 overflow-y-auto p-6 space-y-3">
					{isLoading ? (
						<div className="flex items-center justify-center py-12"><Loader2 size={24} className="animate-spin text-[var(--sq-primary)]" /></div>
					) : (
						<>
							<div className="flex items-center justify-between">
								<p className="text-xs text-[var(--muted-foreground)]">
									Pick which SmartlyQ CRM field each Facebook question should save to. Anything set to &ldquo;tag&rdquo; is appended to the contact&apos;s tags so no data is lost.
								</p>
								<Button variant="outline" size="sm" onClick={applyAuto} className="gap-1.5 shrink-0 ml-3">
									<Sparkles size={12} /> Auto-map
								</Button>
							</div>

							<div className="rounded-lg border border-[var(--border)] overflow-hidden">
								<div className="grid grid-cols-[1fr_1fr] gap-0 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] border-b border-[var(--border)] bg-[var(--muted)]/30">
									<span>Facebook form field</span>
									<span>→ SmartlyQ CRM field</span>
								</div>
								{rows.length === 0 && (
									<p className="px-3 py-6 text-sm text-[var(--muted-foreground)] text-center">
										No form questions detected. Meta hasn&apos;t returned the question list for this form yet — try Save to persist an empty mapping, new leads will still be captured with auto-defaults.
									</p>
								)}
								{rows.map((r, i) => (
									<div key={`${r.fb_field_name}-${i}`} className="grid grid-cols-[1fr_1fr] gap-3 items-center px-3 py-2 border-b border-[var(--border)] last:border-0">
										<span className="text-sm font-medium truncate" title={r.fb_field_name}>{r.fb_field_name}</span>
										<select value={r.crm_field} onChange={(e) => update(i, e.target.value)}
											className="w-full rounded-md border border-[var(--border)] bg-transparent px-2 py-1.5 text-sm">
											{CRM_FIELD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
										</select>
									</div>
								))}
							</div>
						</>
					)}
				</div>

				<div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--border)]">
					<Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
					<Button size="sm" onClick={handleSave} disabled={save.isPending || isLoading} className="gap-1.5 min-w-[110px] justify-center">
						{save.isPending && <Loader2 size={12} className="animate-spin" />}
						Save mapping
					</Button>
				</div>
			</div>
		</div>
	);
}
