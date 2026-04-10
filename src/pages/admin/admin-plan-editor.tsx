import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, X, ArrowLeft } from "lucide-react";
import { useAdminPlanGet, useAdminPlanSave } from "@/api/admin-plans";
import { PLAN_EDITOR_SECTIONS, type FieldDef } from "./admin-plan-editor-config";
import { toast } from "sonner";

interface Props {
	planId: number | null;
	onClose: () => void;
}

export function AdminPlanEditor({ planId, onClose }: Props) {
	const isNew = !planId;
	const { data, isLoading } = useAdminPlanGet(planId ?? 0);
	const saveMut = useAdminPlanSave();
	const [values, setValues] = useState<Record<string, unknown>>({});
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		if (!isNew && data?.plan && !initialized) {
			setValues(data.plan);
			setInitialized(true);
		}
		if (isNew && !initialized) {
			setValues({ status: 1, duration: "month" });
			setInitialized(true);
		}
	}, [data, isNew, initialized]);

	const handleChange = (key: string, value: unknown) => {
		setValues(prev => ({ ...prev, [key]: value }));
	};

	const handleSave = () => {
		const payload = { ...values };
		if (planId) payload.id = planId;
		saveMut.mutate(payload, {
			onSuccess: (res) => { toast.success(res.message || "Saved."); onClose(); },
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Save failed."),
		});
	};

	if (!isNew && isLoading) return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft size={18} /></Button>
					<h2 className="text-xl font-bold">{isNew ? "Add new plan" : `Edit: ${String(values.name ?? "Plan")}`}</h2>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={onClose}><X size={14} /> Cancel</Button>
					<Button onClick={handleSave} disabled={saveMut.isPending}><Save size={14} /> {saveMut.isPending ? "Saving..." : "Save Details"}</Button>
				</div>
			</div>

			{PLAN_EDITOR_SECTIONS.map((section) => (
				<Card key={section.title}>
					<CardHeader>
						<CardTitle className="text-base">{section.title}</CardTitle>
						{section.help && <p className="text-xs text-[var(--muted-foreground)]">{section.help}</p>}
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{section.fields.map((field) => (
								<FieldInput key={field.key} field={field} value={values[field.key]} onChange={(v) => handleChange(field.key, v)} span={field.span} />
							))}
						</div>
					</CardContent>
				</Card>
			))}

			<div className="flex justify-center gap-3 pb-8">
				<Button variant="outline" onClick={onClose}>Cancel</Button>
				<Button onClick={handleSave} disabled={saveMut.isPending} className="px-8">{saveMut.isPending ? "Saving..." : "Save Details"}</Button>
			</div>

			<p className="text-center text-xs text-[var(--muted-foreground)]">
				Credits power all AI actions. Budget models ~1 credit, standard ~2-4, premium ~4-7 per request. Images 4-44 credits. Videos 18-788 credits.
			</p>
		</div>
	);
}

function FieldInput({ field, value, onChange, span }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void; span?: number }) {
	const cls = span === 3 ? "sm:col-span-2 lg:col-span-3" : span === 2 ? "sm:col-span-2" : "";

	if (field.type === "bool") {
		const checked = value === 1 || value === "1" || value === true;
		return (
			<label className={`flex items-center gap-2 ${cls}`}>
				<input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked ? 1 : 0)} className="h-4 w-4 rounded border-[var(--input)]" />
				<span className="text-sm">{field.label}</span>
			</label>
		);
	}

	if (field.type === "select") {
		return (
			<div className={cls}>
				<label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{field.label}</label>
				<select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}
					className="w-full h-10 rounded-md border border-[var(--input)] bg-[var(--background)] px-3 text-sm">
					{field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
				</select>
			</div>
		);
	}

	if (field.type === "textarea") {
		return (
			<div className={cls}>
				<label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{field.label}</label>
				<textarea value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder}
					className="w-full min-h-[100px] rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm" />
			</div>
		);
	}

	return (
		<div className={cls}>
			<label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{field.label}</label>
			<Input
				type={field.type === "number" || field.type === "decimal" ? "number" : "text"}
				step={field.type === "decimal" ? "0.01" : undefined}
				value={value === null || value === undefined ? "" : String(value)}
				onChange={(e) => onChange(field.type === "number" ? (e.target.value === "" ? null : parseInt(e.target.value)) : field.type === "decimal" ? (e.target.value === "" ? null : parseFloat(e.target.value)) : e.target.value)}
				placeholder={field.placeholder}
			/>
		</div>
	);
}
