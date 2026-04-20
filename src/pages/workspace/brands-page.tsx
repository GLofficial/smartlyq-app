import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useBrands, useBrandDelete, type Brand } from "@/api/brands";
import { toast } from "sonner";
import { BrandFormModal } from "./brand-form-modal";

export function BrandsPage() {
	const { data, isLoading } = useBrands();
	const [search, setSearch] = useState("");
	const [editing, setEditing] = useState<Brand | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const delMut = useBrandDelete();

	const brands = data?.brands ?? [];
	const filtered = useMemo(() => {
		if (!search.trim()) return brands;
		const q = search.toLowerCase();
		return brands.filter((b) =>
			b.name.toLowerCase().includes(q) || (b.industry ?? "").toLowerCase().includes(q),
		);
	}, [brands, search]);

	function openCreate() { setEditing(null); setModalOpen(true); }
	function openEdit(b: Brand) { setEditing(b); setModalOpen(true); }

	async function handleDelete(b: Brand) {
		if (!confirm(`Delete brand "${b.name}"? This cannot be undone.`)) return;
		try {
			await delMut.mutateAsync(b.id);
			toast.success(`Brand "${b.name}" deleted`);
		} catch (e) {
			toast.error((e as Error)?.message ?? "Failed to delete brand");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between flex-wrap gap-3">
				<div>
					<h1 className="text-2xl font-bold">My Brands</h1>
					<p className="text-sm text-[var(--muted-foreground)]">Define tone, colors, and voice presets AI will use across your content.</p>
				</div>
				<Button onClick={openCreate} className="gap-1.5">
					<Plus size={16} /> Add a Brand
				</Button>
			</div>

			<div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2">
				<Search size={16} className="text-[var(--muted-foreground)]" />
				<input
					type="text" placeholder="Search brands"
					value={search} onChange={(e) => setSearch(e.target.value)}
					className="flex-1 bg-transparent text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none"
				/>
			</div>

			{isLoading ? (
				<Spinner />
			) : brands.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-16">
						<Briefcase size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No brand voices configured yet.</p>
						<p className="text-sm text-[var(--muted-foreground)] text-center max-w-md">
							Brand voices help AI generate content that matches your tone and style.
						</p>
						<Button onClick={openCreate} className="mt-2 gap-1.5"><Plus size={16} /> Add your first brand</Button>
					</CardContent>
				</Card>
			) : (
				<Card className="overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-[var(--border)] bg-[var(--muted)]/30">
									<Th>Brand Name</Th>
									<Th>Industry</Th>
									<Th>Colors</Th>
									<Th align="right">Actions</Th>
								</tr>
							</thead>
							<tbody>
								{filtered.map((b) => (
									<tr key={b.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/20">
										<td className="px-4 py-3">
											<div className="flex items-center gap-3 min-w-0">
												<LogoTile brand={b} />
												<div className="min-w-0">
													<p className="font-medium truncate">{b.name}</p>
													{b.tagline && <p className="text-[11px] text-[var(--muted-foreground)] truncate max-w-[320px]">{b.tagline}</p>}
												</div>
											</div>
										</td>
										<td className="px-4 py-3 text-[var(--muted-foreground)]">{b.industry || "—"}</td>
										<td className="px-4 py-3">
											<ColorSwatches primary={b.primary_color} secondary={b.secondary_color} accent={b.accent_color} />
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-1 justify-end">
												<Button variant="outline" size="icon" className="h-8 w-8 text-[var(--sq-primary)]"
													title="Edit" onClick={() => openEdit(b)}>
													<Pencil size={14} />
												</Button>
												<Button variant="outline" size="icon" className="h-8 w-8 text-red-500 border-red-200 hover:bg-red-50"
													title="Delete" onClick={() => handleDelete(b)}>
													<Trash2 size={14} />
												</Button>
											</div>
										</td>
									</tr>
								))}
								{filtered.length === 0 && (
									<tr>
										<td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
											No brands match your search.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</Card>
			)}

			<BrandFormModal open={modalOpen} onClose={() => setModalOpen(false)} brand={editing} />
		</div>
	);
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
	return (
		<th className={`px-4 py-3 text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase ${align === "right" ? "text-right" : "text-left"}`}>
			{children}
		</th>
	);
}

function LogoTile({ brand }: { brand: Brand }) {
	if (brand.logo) {
		return <img src={brand.logo} alt="" className="h-9 w-9 rounded-lg object-cover border border-[var(--border)] shrink-0" />;
	}
	return (
		<div
			className="flex h-9 w-9 items-center justify-center rounded-lg text-white font-bold text-sm shrink-0"
			style={{ backgroundColor: brand.primary_color || "var(--sq-primary)" }}
		>
			{brand.name.charAt(0).toUpperCase()}
		</div>
	);
}

function ColorSwatches({ primary, secondary, accent }: { primary: string; secondary: string; accent: string }) {
	const colors = [primary, secondary, accent].filter(Boolean);
	if (!colors.length) return <span className="text-[var(--muted-foreground)]">—</span>;
	return (
		<div className="flex items-center gap-1">
			{colors.map((c, i) => (
				<div key={i} className="h-4 w-4 rounded-full border border-[var(--border)]" style={{ backgroundColor: c }} title={c} />
			))}
		</div>
	);
}

function Spinner() {
	return (
		<div className="flex h-40 items-center justify-center">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
		</div>
	);
}
