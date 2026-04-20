import { useState, useEffect, useRef } from "react";
import { X, Upload, Trash2, Plus, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
	useBrandSave, useBrandDelete, useBrandLogoUpload,
	useBrandPresets, useBrandPresetAdd, useBrandPresetDelete,
	type Brand,
} from "@/api/brands";

const PRESET_TYPES = [
	{ value: "tone", label: "Tone" },
	{ value: "cta", label: "CTA" },
	{ value: "tagline", label: "Tagline" },
	{ value: "hashtag", label: "Hashtag" },
	{ value: "keyword", label: "Keyword" },
];

interface Props {
	open: boolean;
	onClose: () => void;
	brand: Brand | null; // null = create mode
}

export function BrandFormModal({ open, onClose, brand }: Props) {
	const isEdit = !!brand;
	const [form, setForm] = useState({
		name: "", industry: "", tagline: "", website: "", audience: "", description: "",
		logo_url: "", primary_color: "", secondary_color: "", accent_color: "",
	});

	const saveMut = useBrandSave();
	const delMut = useBrandDelete();
	const logoMut = useBrandLogoUpload();

	useEffect(() => {
		if (!open) return;
		setForm({
			name: brand?.name ?? "",
			industry: brand?.industry ?? "",
			tagline: brand?.tagline ?? "",
			website: brand?.website ?? "",
			audience: brand?.audience ?? "",
			description: brand?.description ?? "",
			logo_url: brand?.logo ?? "",
			primary_color: brand?.primary_color ?? "",
			secondary_color: brand?.secondary_color ?? "",
			accent_color: brand?.accent_color ?? "",
		});
	}, [brand, open]);

	const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

	async function handleSave() {
		if (!form.name.trim()) { toast.error("Brand name is required"); return; }
		try {
			await saveMut.mutateAsync({ id: brand?.id, ...form });
			toast.success(isEdit ? "Brand updated" : "Brand created");
			onClose();
		} catch (e) {
			toast.error((e as Error)?.message ?? "Failed to save");
		}
	}

	async function handleDelete() {
		if (!brand) return;
		if (!confirm(`Delete brand "${brand.name}"? This cannot be undone.`)) return;
		try {
			await delMut.mutateAsync(brand.id);
			toast.success("Brand deleted");
			onClose();
		} catch (e) {
			toast.error((e as Error)?.message ?? "Failed to delete");
		}
	}

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
			<div className="w-full max-w-4xl max-h-[92vh] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
				<div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
					<h2 className="text-lg font-semibold">{isEdit ? "Edit Brand" : "Add a Brand"}</h2>
					<button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--muted)]"><X size={18} className="text-[var(--muted-foreground)]" /></button>
				</div>

				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					<div className="grid gap-4 md:grid-cols-2">
						<Field label="Brand Name" required>
							<input type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
								placeholder="Enter brand name"
								className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
						</Field>
						<Field label="Industry / Category">
							<input type="text" value={form.industry} onChange={(e) => update("industry", e.target.value)}
								placeholder="Enter brand category"
								className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
						</Field>
						<Field label="Tagline / Mission">
							<input type="text" value={form.tagline} onChange={(e) => update("tagline", e.target.value)}
								placeholder="Enter brand mission"
								className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
						</Field>
						<Field label="Website Link">
							<input type="url" value={form.website} onChange={(e) => update("website", e.target.value)}
								placeholder="Enter website link"
								className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
						</Field>
					</div>

					<Field label="Target Audience">
						<input type="text" value={form.audience} onChange={(e) => update("audience", e.target.value)}
							placeholder="Enter target audience"
							className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
					</Field>

					<Field label="Brand / Company Description">
						<textarea value={form.description} onChange={(e) => update("description", e.target.value)}
							placeholder="Enter the brand description"
							rows={5}
							className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm resize-none" />
					</Field>

					<div className="border-t border-[var(--border)] pt-5">
						<h3 className="text-sm font-semibold mb-4">Brand identity</h3>
						<div className="grid gap-5 md:grid-cols-[auto_1fr]">
							<LogoBlock logoUrl={form.logo_url} brandId={brand?.id ?? 0} uploading={logoMut.isPending}
								onUpload={async (file) => {
									if (!brand) { toast.error("Save brand first to upload a logo"); return; }
									try {
										const res = await logoMut.mutateAsync({ brandId: brand.id, file });
										update("logo_url", res.url);
										toast.success("Logo uploaded");
									} catch (e) { toast.error((e as Error)?.message ?? "Upload failed"); }
								}} />
							<div className="space-y-2">
								<p className="text-sm font-medium">Brand colors</p>
								<div className="grid grid-cols-3 gap-3">
									<ColorField label="Primary" value={form.primary_color} onChange={(v) => update("primary_color", v)} />
									<ColorField label="Secondary" value={form.secondary_color} onChange={(v) => update("secondary_color", v)} />
									<ColorField label="Accent" value={form.accent_color} onChange={(v) => update("accent_color", v)} />
								</div>
							</div>
						</div>
					</div>

					{isEdit && brand && (
						<div className="border-t border-[var(--border)] pt-5">
							<h3 className="text-sm font-semibold mb-1">Dropdown answers (presets)</h3>
							<p className="text-xs text-[var(--muted-foreground)] mb-4">Create reusable tone / CTA / tagline snippets for this brand.</p>
							<PresetManager brandId={brand.id} />
						</div>
					)}
				</div>

				<div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
					{isEdit ? (
						<Button variant="destructive" size="sm" onClick={handleDelete} disabled={delMut.isPending} className="gap-1.5">
							<Trash2 size={14} /> Delete
						</Button>
					) : <span />}
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
						<Button size="sm" onClick={handleSave} disabled={saveMut.isPending} className="gap-1.5 min-w-[110px] justify-center">
							{saveMut.isPending && <Loader2 size={12} className="animate-spin" />}
							Save Brand
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
	return (
		<label className="block space-y-1.5">
			<span className="text-sm font-medium text-[var(--foreground)]">
				{label}{required && <span className="text-red-500 ml-0.5">*</span>}
			</span>
			{children}
		</label>
	);
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
	const normalized = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : "";
	return (
		<div className="space-y-1.5">
			<p className="text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
			<div className="flex items-center gap-2 rounded-md border border-[var(--border)] px-2 py-1.5">
				<input type="color" value={normalized || "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())}
					className="h-6 w-6 cursor-pointer rounded border border-[var(--border)]" />
				<input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000"
					className="flex-1 bg-transparent text-xs font-mono focus:outline-none" maxLength={7} />
			</div>
		</div>
	);
}

function LogoBlock({ logoUrl, brandId, uploading, onUpload }: { logoUrl: string; brandId: number; uploading: boolean; onUpload: (file: File) => void }) {
	const ref = useRef<HTMLInputElement>(null);
	return (
		<div className="flex flex-col items-center gap-2">
			<p className="text-sm font-medium self-start">Logo</p>
			<div className="flex h-28 w-28 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 overflow-hidden">
				{logoUrl ? (
					<img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
				) : (
					<div className="flex flex-col items-center gap-1 text-[var(--muted-foreground)]">
						<ImageIcon size={24} />
						<span className="text-[10px]">No logo yet</span>
					</div>
				)}
			</div>
			<input ref={ref} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden"
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) onUpload(file);
					e.target.value = "";
				}} />
			<Button type="button" size="sm" variant="outline" onClick={() => ref.current?.click()}
				disabled={uploading || brandId <= 0} className="gap-1.5 text-xs">
				{uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
				Upload logo
			</Button>
			<p className="text-[10px] text-[var(--muted-foreground)] text-center max-w-[160px]">
				{brandId <= 0 ? "Save the brand first to upload a logo." : "PNG/JPG/SVG, recommended square."}
			</p>
		</div>
	);
}

function PresetManager({ brandId }: { brandId: number }) {
	const { data } = useBrandPresets(brandId);
	const addMut = useBrandPresetAdd();
	const delMut = useBrandPresetDelete();
	const [type, setType] = useState("tone");
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");

	async function handleAdd() {
		if (!content.trim()) { toast.error("Preset text is required"); return; }
		try {
			await addMut.mutateAsync({ brand_id: brandId, type, title: title || undefined, content });
			setTitle(""); setContent("");
			toast.success("Preset added");
		} catch (e) { toast.error((e as Error)?.message ?? "Failed to add preset"); }
	}

	const presets = data?.presets ?? [];
	const grouped = new Map<string, typeof presets>();
	for (const p of presets) {
		if (!grouped.has(p.type)) grouped.set(p.type, []);
		grouped.get(p.type)!.push(p);
	}

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-[140px_1fr_auto] gap-2">
				<select value={type} onChange={(e) => setType(e.target.value)}
					className="rounded-md border border-[var(--border)] bg-transparent px-2 py-2 text-sm">
					{PRESET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
				</select>
				<input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
					placeholder="Label (optional)"
					className="rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm" />
				<Button size="sm" onClick={handleAdd} disabled={addMut.isPending} className="gap-1.5">
					<Plus size={14} /> Add
				</Button>
			</div>
			<textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Preset text..."
				rows={3}
				className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm resize-none" />

			{presets.length > 0 && (
				<div className="space-y-3 pt-2">
					{Array.from(grouped.entries()).map(([t, list]) => (
						<div key={t}>
							<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">{t}</p>
							<div className="space-y-1">
								{list.map((p) => (
									<div key={p.id} className="flex items-start gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm">
										<div className="flex-1 min-w-0">
											{p.title && <p className="text-xs font-medium text-[var(--muted-foreground)]">{p.title}</p>}
											<p className="whitespace-pre-wrap break-words">{p.content}</p>
										</div>
										<button onClick={() => delMut.mutate({ id: p.id, brand_id: brandId })}
											className="text-[var(--muted-foreground)] hover:text-red-500"><Trash2 size={14} /></button>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
