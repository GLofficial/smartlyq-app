import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Trash2, X } from "lucide-react";
import { useBusinessGroups, useBusinessGroupSave, useBusinessGroupDelete } from "@/api/business-groups";
import { toast } from "sonner";

export function BusinessesPage() {
	const { data, isLoading } = useBusinessGroups();
	const saveMut = useBusinessGroupSave();
	const deleteMut = useBusinessGroupDelete();
	const [showCreate, setShowCreate] = useState(false);
	const [name, setName] = useState("");
	const [desc, setDesc] = useState("");

	const handleCreate = () => {
		if (!name.trim()) { toast.error("Name required"); return; }
		saveMut.mutate({ name: name.trim(), description: desc.trim() }, {
			onSuccess: () => { toast.success("Group created."); setShowCreate(false); setName(""); setDesc(""); },
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed"),
		});
	};

	const handleDelete = (id: number, groupName: string) => {
		if (!confirm(`Archive "${groupName}"?`)) return;
		deleteMut.mutate(id, {
			onSuccess: () => toast.success("Group archived."),
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed"),
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Business Groups</h1>
				<Button size="sm" onClick={() => setShowCreate(!showCreate)}><Plus size={14} /> New Group</Button>
			</div>

			{showCreate && (
				<Card>
					<CardContent className="flex flex-col gap-3 py-4">
						<Input placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} />
						<Input placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
						<div className="flex gap-2">
							<Button size="sm" onClick={handleCreate} disabled={saveMut.isPending}>{saveMut.isPending ? "Creating..." : "Create"}</Button>
							<Button size="sm" variant="outline" onClick={() => setShowCreate(false)}><X size={14} /> Cancel</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{isLoading ? <Spinner /> : !(data?.groups ?? []).length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-12">
						<Building2 size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No business groups yet.</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{data!.groups.map((g) => (
						<Card key={g.id}>
							<CardContent className="flex items-start justify-between p-4">
								<div>
									<p className="font-medium">{g.name}</p>
									{g.description && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{g.description}</p>}
									<p className="mt-2 text-xs text-[var(--muted-foreground)]">{g.asset_count} assets</p>
								</div>
								<Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(g.id, g.name)}>
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

function Spinner() { return <div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
