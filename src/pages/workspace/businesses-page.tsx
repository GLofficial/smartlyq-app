import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { useBusinessGroups, useBusinessGroupDelete, type BizGroup } from "@/api/business-groups";
import { toast } from "sonner";
import { BusinessFormModal } from "./business-form-modal";
import { BizAssetIcon } from "./business-asset-icon";

export function BusinessesPage() {
	const { data, isLoading } = useBusinessGroups();
	const delMut = useBusinessGroupDelete();
	const [editing, setEditing] = useState<BizGroup | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	const groups = data?.groups ?? [];
	const availableAssets = data?.available_assets ?? {};
	const availableBrands = data?.available_brands ?? [];
	const used = data?.used ?? groups.length;
	const limit = data?.limit ?? null;

	function openCreate() { setEditing(null); setModalOpen(true); }
	function openEdit(g: BizGroup) { setEditing(g); setModalOpen(true); }

	async function handleDelete(g: BizGroup) {
		if (!confirm(`Archive business "${g.name}"?`)) return;
		try {
			await delMut.mutateAsync(g.id);
			toast.success("Business archived");
		} catch (e) {
			toast.error((e as Error)?.message ?? "Failed to archive");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between flex-wrap gap-3">
				<div className="flex items-center gap-3">
					<Building2 size={24} className="text-[var(--sq-primary)]" />
					<div>
						<h1 className="text-2xl font-bold">Businesses</h1>
						<p className="text-sm text-[var(--muted-foreground)]">Group your integrations by business for unified reporting and AI insights.</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					{limit !== null && (
						<span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
							{used} / {limit}
						</span>
					)}
					<Button onClick={openCreate} disabled={data?.can_create === false} className="gap-1.5">
						<Plus size={16} /> Create Business
					</Button>
				</div>
			</div>

			{isLoading ? (
				<Spinner />
			) : groups.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-16">
						<Building2 size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No businesses yet.</p>
						<p className="text-sm text-[var(--muted-foreground)] text-center max-w-md">
							Group your Facebook Ads, Google Ads, GA4, Search Console and social accounts under a single business for clearer reporting.
						</p>
						<Button onClick={openCreate} className="mt-2 gap-1.5"><Plus size={16} /> Create your first business</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 lg:grid-cols-2">
					{groups.map((g) => (
						<BusinessCard key={g.id} group={g} onEdit={() => openEdit(g)} onDelete={() => handleDelete(g)} />
					))}
				</div>
			)}

			<BusinessFormModal open={modalOpen} onClose={() => setModalOpen(false)} group={editing}
				availableAssets={availableAssets} availableBrands={availableBrands} />
		</div>
	);
}

function BusinessCard({ group, onEdit, onDelete }: { group: BizGroup; onEdit: () => void; onDelete: () => void }) {
	const summary = group.assets_summary ?? [];
	return (
		<Card className="overflow-hidden">
			<CardContent className="p-5 space-y-3">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<p className="text-base font-semibold truncate">{group.name}</p>
						{group.primary_domain && (
							<p className="text-xs text-[var(--muted-foreground)] truncate">{group.primary_domain}</p>
						)}
					</div>
					<div className="flex items-center gap-1 shrink-0">
						<Button variant="outline" size="icon" className="h-8 w-8 text-[var(--sq-primary)] border-[var(--sq-primary)]/40" title="Edit" onClick={onEdit}>
							<Pencil size={14} />
						</Button>
						<Button variant="outline" size="icon" className="h-8 w-8 text-red-500 border-red-200 hover:bg-red-50" title="Archive" onClick={onDelete}>
							<Trash2 size={14} />
						</Button>
					</div>
				</div>

				{group.brand && (
					<div className="flex flex-wrap gap-2">
						<span className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 text-purple-700 px-2 py-1 text-xs font-medium">
							<span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-purple-500" />
							{group.brand.name}
						</span>
					</div>
				)}

				{summary.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{summary.map((a, i) => (
							<span key={`${a.type}-${i}`} className="inline-flex items-center gap-1.5 rounded-md bg-[var(--muted)]/50 px-2 py-1 text-xs text-[var(--foreground)]" title={a.label}>
								<BizAssetIcon type={a.type} size={13} />
								<span className="truncate max-w-[180px]">{a.name || a.label}</span>
							</span>
						))}
					</div>
				)}

				<div className="flex items-center justify-between pt-3 border-t border-dashed border-[var(--border)] text-xs text-[var(--muted-foreground)]">
					<span>
						<strong className="text-[var(--foreground)]">{summary.length}</strong> linked asset{summary.length === 1 ? "" : "s"}
					</span>
					{group.currency && (
						<span>Currency: <strong className="text-[var(--foreground)]">{group.currency}</strong></span>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function Spinner() {
	return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;
}
