import { useState } from "react";
import { ChevronDown, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import {
	useAdminSystemModels, useAddSystemModel, useDeleteSystemModel,
	useAdminLanguages, useAddLanguage, useDeleteLanguage, useUpdateLanguage,
	useAdminTones, useAddTone, useDeleteTone, useUpdateTone,
} from "@/api/admin-ai-crud";

const PROVIDERS = ["OpenAI", "Anthropic", "DeepSeek", "Gemini", "xAI", "Black Forest Labs", "Recraft", "Pollo"];
const TYPES     = [{ value: "GPT", label: "Text (GPT)" }, { value: "Image", label: "Image" }];

function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	return (
		<div className="rounded-md border border-[var(--border)]">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors rounded-md"
			>
				{title}
				<ChevronDown size={16} className={cn("text-[var(--muted-foreground)] transition-transform", open && "rotate-180")} />
			</button>
			{open && <div className="border-t border-[var(--border)] px-4 py-4">{children}</div>}
		</div>
	);
}

// ── Model Section ─────────────────────────────────────────────────────────────

function ModelSection() {
	const { data, isLoading } = useAdminSystemModels();
	const addMut    = useAddSystemModel();
	const deleteMut = useDeleteSystemModel();
	const models    = data?.models ?? [];

	const [form, setForm] = useState({ provider: "OpenAI", type: "GPT", name: "", model: "" });

	const handleAdd = () => {
		if (!form.name.trim() || !form.model.trim()) { toast.error("Name and Model ID are required."); return; }
		addMut.mutate(form, {
			onSuccess: (d) => { toast.success(d.message); setForm((f) => ({ ...f, name: "", model: "" })); },
			onError:   () => toast.error("Failed to add model."),
		});
	};

	const handleDelete = (id: number) => {
		if (!confirm("Delete this model?")) return;
		deleteMut.mutate(id, {
			onSuccess: (d) => toast.success(d.message),
			onError:   () => toast.error("Failed to delete."),
		});
	};

	return (
		<AccordionSection title="Model">
			{isLoading ? <p className="text-xs text-[var(--muted-foreground)]">Loading…</p> : (
				<>
					<div className="overflow-x-auto mb-4">
						<table className="w-full text-xs">
							<thead><tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
								{["Provider", "Name", "Model ID", "Type", ""].map((h) => <th key={h} className="pb-2 pr-4 font-medium">{h}</th>)}
							</tr></thead>
							<tbody>
								{models.length === 0 && (
									<tr><td colSpan={5} className="py-3 text-[var(--muted-foreground)]">No models added.</td></tr>
								)}
								{models.map((m) => (
									<tr key={m.id} className="border-b border-[var(--border)] last:border-0">
										<td className="py-2 pr-4">{m.provider}</td>
										<td className="py-2 pr-4">{m.name}</td>
										<td className="py-2 pr-4 font-mono">{m.model}</td>
										<td className="py-2 pr-4">{m.type}</td>
										<td className="py-2 text-right">
											<button type="button" onClick={() => handleDelete(m.id)} className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors">
												<Trash2 size={14} />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-2">
						<select value={form.provider} onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
							className="h-9 rounded-md border border-[var(--input)] bg-[var(--background)] px-2 text-sm">
							{PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
						</select>
						<select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
							className="h-9 rounded-md border border-[var(--input)] bg-[var(--background)] px-2 text-sm">
							{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
						</select>
						<Input placeholder="Name (e.g. GPT 4)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="h-9 text-sm" />
						<Input placeholder="Model ID (e.g. gpt-4)" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} className="h-9 text-sm" />
					</div>
					<Button size="sm" onClick={handleAdd} disabled={addMut.isPending}>
						<Plus size={14} /> Add model
					</Button>
				</>
			)}
		</AccordionSection>
	);
}

// ── Language Section ──────────────────────────────────────────────────────────

function LanguageSection() {
	const { data, isLoading } = useAdminLanguages();
	const addMut    = useAddLanguage();
	const deleteMut = useDeleteLanguage();
	const updateMut = useUpdateLanguage();
	const languages = data?.languages ?? [];
	const [newName, setNewName] = useState("");

	const handleAdd = () => {
		if (!newName.trim()) return;
		addMut.mutate(newName.trim(), {
			onSuccess: (d) => { toast.success(d.message); setNewName(""); },
			onError:   (e: unknown) => toast.error((e as { message?: string })?.message ?? "Failed to add."),
		});
	};

	const handleDelete = (name: string) => {
		if (!confirm(`Delete "${name}"?`)) return;
		deleteMut.mutate(name, {
			onSuccess: (d) => toast.success(d.message),
			onError:   () => toast.error("Failed to delete."),
		});
	};

	return (
		<AccordionSection title="Language">
			{isLoading ? <p className="text-xs text-[var(--muted-foreground)]">Loading…</p> : (
				<>
					<div className="overflow-x-auto mb-4">
						<table className="w-full text-xs">
							<thead><tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
								<th className="pb-2 font-medium">Name</th>
								<th className="pb-2 text-center font-medium">Default</th>
								<th className="pb-2 text-center font-medium">Active</th>
								<th className="pb-2 w-8" />
							</tr></thead>
							<tbody>
								{languages.length === 0 && (
									<tr><td colSpan={4} className="py-3 text-[var(--muted-foreground)]">No languages.</td></tr>
								)}
								{languages.map((l) => (
									<tr key={l.name} className="border-b border-[var(--border)] last:border-0">
										<td className="py-2">{l.name}</td>
										<td className="py-2 text-center">
											<input type="radio" checked={!!l.selected} onChange={() =>
												updateMut.mutate({ name: l.name, selected: true }, { onError: () => toast.error("Failed.") })
											} className="cursor-pointer" />
										</td>
										<td className="py-2 text-center">
											<input type="checkbox" checked={!!l.status} onChange={(e) =>
												updateMut.mutate({ name: l.name, status: e.target.checked }, { onError: () => toast.error("Failed.") })
											} className="cursor-pointer" />
										</td>
										<td className="py-2 text-right">
											<button type="button" onClick={() => handleDelete(l.name)} className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors">
												<Trash2 size={14} />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="flex gap-2">
						<Input placeholder="Language name (e.g. English)" value={newName} onChange={(e) => setNewName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="h-9 text-sm max-w-64" />
						<Button size="sm" onClick={handleAdd} disabled={addMut.isPending}>
							<Plus size={14} /> Add
						</Button>
					</div>
				</>
			)}
		</AccordionSection>
	);
}

// ── Tone Section ──────────────────────────────────────────────────────────────

function ToneSection() {
	const { data, isLoading } = useAdminTones();
	const addMut    = useAddTone();
	const deleteMut = useDeleteTone();
	const updateMut = useUpdateTone();
	const tones     = data?.tones ?? [];
	const [newName, setNewName] = useState("");

	const handleAdd = () => {
		if (!newName.trim()) return;
		addMut.mutate(newName.trim(), {
			onSuccess: (d) => { toast.success(d.message); setNewName(""); },
			onError:   (e: unknown) => toast.error((e as { message?: string })?.message ?? "Failed to add."),
		});
	};

	const handleDelete = (name: string) => {
		if (!confirm(`Delete "${name}"?`)) return;
		deleteMut.mutate(name, {
			onSuccess: (d) => toast.success(d.message),
			onError:   () => toast.error("Failed to delete."),
		});
	};

	return (
		<AccordionSection title="Tone">
			{isLoading ? <p className="text-xs text-[var(--muted-foreground)]">Loading…</p> : (
				<>
					<div className="overflow-x-auto mb-4">
						<table className="w-full text-xs">
							<thead><tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
								<th className="pb-2 font-medium">Name</th>
								<th className="pb-2 text-center font-medium">Active</th>
								<th className="pb-2 w-8" />
							</tr></thead>
							<tbody>
								{tones.length === 0 && (
									<tr><td colSpan={3} className="py-3 text-[var(--muted-foreground)]">No tones.</td></tr>
								)}
								{tones.map((t) => (
									<tr key={t.name} className="border-b border-[var(--border)] last:border-0">
										<td className="py-2">{t.name}</td>
										<td className="py-2 text-center">
											<input type="checkbox" checked={!!t.status} onChange={(e) =>
												updateMut.mutate({ name: t.name, status: e.target.checked }, { onError: () => toast.error("Failed.") })
											} className="cursor-pointer" />
										</td>
										<td className="py-2 text-right">
											<button type="button" onClick={() => handleDelete(t.name)} className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors">
												<Trash2 size={14} />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="flex gap-2">
						<Input placeholder="Tone name (e.g. Formal)" value={newName} onChange={(e) => setNewName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="h-9 text-sm max-w-64" />
						<Button size="sm" onClick={handleAdd} disabled={addMut.isPending}>
							<Plus size={14} /> Add
						</Button>
					</div>
				</>
			)}
		</AccordionSection>
	);
}

// ── Main export ───────────────────────────────────────────────────────────────

export function AiCrudPanel() {
	return (
		<div className="space-y-2">
			<ModelSection />
			<LanguageSection />
			<ToneSection />
		</div>
	);
}
