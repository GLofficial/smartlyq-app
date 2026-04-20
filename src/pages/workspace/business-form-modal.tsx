import { useEffect, useState, useMemo } from "react";
import { X, Loader2, Link2, Palette, Share2, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	useBusinessGroupGet, useBusinessGroupSave,
	type BizGroup, type BizAvailableAssets, type BizBrand, type BizSaveInput,
} from "@/api/business-groups";
import { BizAssetIcon, ASSET_TYPE_LABEL, INTEGRATION_TYPES, SOCIAL_TYPES } from "./business-asset-icon";
import { toast } from "sonner";

const CURRENCIES = ["EUR", "USD", "GBP", "CAD", "AUD", "JPY", "INR", "BRL", "MXN", "CHF", "SEK", "NOK", "DKK", "PLN"];

interface Props {
	open: boolean;
	onClose: () => void;
	group: BizGroup | null;
	availableAssets: BizAvailableAssets;
	availableBrands: BizBrand[];
}

export function BusinessFormModal({ open, onClose, group, availableAssets, availableBrands }: Props) {
	const isEdit = !!group;
	const detail = useBusinessGroupGet(isEdit ? group!.id : 0);
	const saveMut = useBusinessGroupSave();

	const [form, setForm] = useState({
		name: "", primary_domain: "", currency: "EUR", timezone: "", description: "",
		brand_id: null as number | null,
	});

	// asset_type -> selected { reference_id, external_id, display_name } | null
	const [linked, setLinked] = useState<Record<string, { reference_id: number | null; external_id: string; display_name: string } | null>>({});

	useEffect(() => {
		if (!open) return;
		setForm({
			name: group?.name ?? "",
			primary_domain: group?.primary_domain ?? "",
			currency: group?.currency || "EUR",
			timezone: group?.timezone ?? "",
			description: group?.description ?? "",
			brand_id: group?.brand_id ?? null,
		});
		// If editing, populate linked from fetched detail assets.
		if (!isEdit) setLinked({});
	}, [group, open, isEdit]);

	useEffect(() => {
		if (!isEdit || !detail.data?.group) return;
		const existing = detail.data.group.assets ?? [];
		const map: typeof linked = {};
		for (const a of existing) {
			map[a.asset_type] = {
				reference_id: a.asset_reference_id,
				external_id: a.external_identifier ?? "",
				display_name: a.display_name,
			};
		}
		setLinked(map);
	}, [isEdit, detail.data?.group]);

	const update = (k: keyof typeof form, v: string | number | null) => setForm((f) => ({ ...f, [k]: v as never }));

	function pickAsset(type: string, externalId: string) {
		const options = availableAssets[type] ?? [];
		if (externalId === "") { setLinked((l) => ({ ...l, [type]: null })); return; }
		const opt = options.find((o) => String(o.external_id ?? "") === externalId);
		if (!opt) return;
		setLinked((l) => ({
			...l,
			[type]: {
				reference_id: opt.reference_id,
				external_id: opt.external_id ?? "",
				display_name: opt.display_name,
			},
		}));
	}

	const assetsPayload = useMemo(() => {
		const out: NonNullable<BizSaveInput["assets"]> = [];
		for (const [type, a] of Object.entries(linked)) {
			if (!a) continue;
			out.push({
				asset_type: type,
				asset_reference_id: a.reference_id,
				external_identifier: a.external_id || undefined,
				display_name: a.display_name || undefined,
			});
		}
		return out;
	}, [linked]);

	async function handleSave() {
		if (!form.name.trim()) { toast.error("Business name is required"); return; }
		try {
			await saveMut.mutateAsync({
				id: group?.id,
				name: form.name,
				description: form.description,
				primary_domain: form.primary_domain,
				currency: form.currency,
				timezone: form.timezone,
				brand_id: form.brand_id ?? undefined,
				assets: assetsPayload,
			});
			toast.success(isEdit ? "Business updated" : "Business created");
			onClose();
		} catch (e) {
			toast.error((e as Error)?.message ?? "Failed to save");
		}
	}

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
			<div className="w-full max-w-3xl max-h-[92vh] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
					<h2 className="text-lg font-semibold">{isEdit ? "Edit Business" : "Create Business"}</h2>
					<button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--muted)]"><X size={18} className="text-[var(--muted-foreground)]" /></button>
				</div>

				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Basics */}
					<div className="grid gap-4 md:grid-cols-2">
						<Field label="Business Name" required>
							<input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Acme Inc."
								className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
						</Field>
						<Field label="Primary Domain">
							<input type="text" value={form.primary_domain} onChange={(e) => update("primary_domain", e.target.value)} placeholder="acme.com"
								className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
						</Field>
						<Field label="Currency">
							<select value={form.currency} onChange={(e) => update("currency", e.target.value)}
								className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm">
								{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
							</select>
						</Field>
						<Field label="Timezone">
							<input type="text" value={form.timezone} onChange={(e) => update("timezone", e.target.value)} placeholder="Europe/Athens"
								className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
						</Field>
					</div>

					<Field label="Description">
						<textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3}
							placeholder="Optional notes about this business..."
							className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm resize-none" />
					</Field>

					{/* Brand Voice */}
					<Section icon={Palette} title="Brand Voice" subtitle="Link a brand voice to define messaging guidelines, tone, and website for this business.">
						<div className="flex items-center gap-3 rounded-md border border-[var(--border)] px-3 py-2">
							<div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--muted)]">
								<Palette size={14} className="text-[var(--muted-foreground)]" />
							</div>
							<select value={form.brand_id ?? ""} onChange={(e) => update("brand_id", e.target.value ? Number(e.target.value) : null)}
								className="flex-1 bg-transparent text-sm focus:outline-none">
								<option value="">No brand linked</option>
								{availableBrands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
							</select>
						</div>
					</Section>

					{/* Linked integrations */}
					<Section icon={Plug} title="Integrations" subtitle="Select which integrations belong to this business. This enables unified reporting and AI analysis.">
						<div className="space-y-2">
							{INTEGRATION_TYPES.map((type) => (
								<AssetRow key={type} type={type} options={availableAssets[type] ?? []}
									value={linked[type]?.external_id ?? ""} onChange={(v) => pickAsset(type, v)} />
							))}
						</div>
					</Section>

					{/* Social media */}
					<Section icon={Share2} title="Social Media" subtitle="Attach social accounts for content planning, inbox routing, and reporting.">
						<div className="space-y-2">
							{SOCIAL_TYPES.map((type) => (
								<AssetRow key={type} type={type} options={availableAssets[type] ?? []}
									value={linked[type]?.external_id ?? ""} onChange={(v) => pickAsset(type, v)} />
							))}
						</div>
					</Section>
				</div>

				<div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--border)]">
					<Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
					<Button size="sm" onClick={handleSave} disabled={saveMut.isPending} className="gap-1.5 min-w-[120px] justify-center">
						{saveMut.isPending && <Loader2 size={12} className="animate-spin" />}
						Save Business
					</Button>
				</div>
			</div>
		</div>
	);
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
	return (
		<label className="block space-y-1.5">
			<span className="text-sm font-medium text-[var(--foreground)]">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</span>
			{children}
		</label>
	);
}

function Section({ icon: Icon, title, subtitle, children }: { icon: typeof Link2; title: string; subtitle: string; children: React.ReactNode }) {
	return (
		<div className="rounded-lg border border-[var(--border)] p-4 space-y-3">
			<div className="flex items-start gap-2">
				<Icon size={16} className="mt-0.5 text-[var(--sq-primary)]" />
				<div>
					<p className="text-sm font-semibold">{title}</p>
					<p className="text-[11px] text-[var(--muted-foreground)]">{subtitle}</p>
				</div>
			</div>
			{children}
		</div>
	);
}

function AssetRow({ type, options, value, onChange }: {
	type: string; options: { reference_id: number | null; external_id: string | null; display_name: string }[];
	value: string; onChange: (v: string) => void;
}) {
	const empty = options.length === 0;
	return (
		<div className="flex items-center gap-3 rounded-md border border-[var(--border)] px-3 py-2">
			<div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--muted)]/50">
				<BizAssetIcon type={type} size={15} />
			</div>
			<span className="text-sm font-medium min-w-[160px]">{ASSET_TYPE_LABEL[type] ?? type}</span>
			{empty ? (
				<span className="ml-auto text-xs text-[var(--muted-foreground)]">Not connected</span>
			) : (
				<select value={value} onChange={(e) => onChange(e.target.value)}
					className="ml-auto flex-1 max-w-[360px] bg-transparent text-sm focus:outline-none text-right">
					<option value="">Not linked</option>
					{options.map((o) => (
						<option key={`${o.reference_id ?? ""}-${o.external_id ?? ""}`} value={String(o.external_id ?? "")}>
							{o.display_name}
						</option>
					))}
				</select>
			)}
		</div>
	);
}
