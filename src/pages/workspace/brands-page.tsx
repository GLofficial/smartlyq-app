import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { useBrands } from "@/api/brands";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";

interface Brand {
	id: number;
	name: string;
	logo: string;
	primary_color: string;
	created_at: string;
}

export function BrandsPage() {
	const { data, isLoading } = useBrands();
	const [confirmDelete, setConfirmDelete] = useState<Brand | null>(null);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Brands</h1>
				<Button size="sm" disabled title="Brand creation coming soon">
					<Plus size={16} className="mr-1" /> Create Brand
				</Button>
			</div>

			{confirmDelete && (
				<DeleteConfirm brand={confirmDelete} onClose={() => setConfirmDelete(null)} />
			)}

			{isLoading ? (
				<Spinner />
			) : !(data?.brands ?? []).length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-12">
						<Briefcase size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No brand voices configured yet.</p>
						<p className="text-sm text-[var(--muted-foreground)]">
							Brand voices help AI generate content that matches your tone and style.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{data?.brands.map((b) => (
						<Card key={b.id}>
							<CardContent className="flex items-center gap-3 p-4">
								{b.logo ? (
									<img src={b.logo} alt="" className="h-10 w-10 rounded-lg object-cover" />
								) : (
									<div
										className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold"
										style={{ backgroundColor: b.primary_color || "var(--sq-primary)" }}
									>
										{b.name.charAt(0).toUpperCase()}
									</div>
								)}
								<div className="min-w-0 flex-1">
									<p className="font-medium truncate">{b.name}</p>
									<p className="text-xs text-[var(--muted-foreground)]">
										{new Date(b.created_at).toLocaleDateString()}
									</p>
								</div>
								{b.primary_color && (
									<div className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: b.primary_color }} />
								)}
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 text-red-500 hover:text-red-600 shrink-0"
									title="Delete brand"
									onClick={() => setConfirmDelete(b)}
								>
									<Trash2 size={14} />
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

function DeleteConfirm({ brand, onClose }: { brand: Brand; onClose: () => void }) {
	const mutation = useMutation({
		mutationFn: () =>
			apiClient.post<{ message: string }>("/api/spa/brands/delete", { id: brand.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["brands"] });
			toast.success(`Brand "${brand.name}" deleted`);
			onClose();
		},
		onError: (err: { message?: string }) => {
			toast.error(err.message ?? "Failed to delete brand");
		},
	});

	return (
		<Card className="border-red-200">
			<CardContent className="flex items-center justify-between py-4">
				<p className="text-sm">
					Delete brand <strong>{brand.name}</strong>? This cannot be undone.
				</p>
				<div className="flex gap-2">
					<Button variant="destructive" size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
						{mutation.isPending ? "Deleting..." : "Delete"}
					</Button>
					<Button variant="outline" size="sm" onClick={onClose}>
						Cancel
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function Spinner() {
	return (
		<div className="flex h-40 items-center justify-center">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
		</div>
	);
}
