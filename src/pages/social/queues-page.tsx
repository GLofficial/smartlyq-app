import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Layers, Power, PowerOff, Plus, Pencil, Trash2 } from "lucide-react";
import { useQueues, useSaveQueue, useDeleteQueue, useToggleQueue } from "@/api/queues";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function QueuesPage() {
	const { data, isLoading } = useQueues();
	const saveMut = useSaveQueue();
	const deleteMut = useDeleteQueue();
	const toggleMut = useToggleQueue();

	const [editOpen, setEditOpen] = useState(false);
	const [editId, setEditId] = useState<number | null>(null);
	const [editName, setEditName] = useState("");
	const [editSlots, setEditSlots] = useState<Record<string, string[]>>({});

	const openNew = () => {
		setEditId(null);
		setEditName("");
		setEditSlots({});
		setEditOpen(true);
	};

	const openEdit = (q: any) => {
		setEditId(q.id);
		setEditName(q.name);
		setEditSlots(q.schedule?.slots ?? {});
		setEditOpen(true);
	};

	const addSlot = (day: string) => {
		setEditSlots(prev => ({ ...prev, [day]: [...(prev[day] ?? []), "09:00"] }));
	};

	const removeSlot = (day: string, idx: number) => {
		setEditSlots(prev => ({ ...prev, [day]: (prev[day] ?? []).filter((_, i) => i !== idx) }));
	};

	const updateSlot = (day: string, idx: number, val: string) => {
		setEditSlots(prev => ({ ...prev, [day]: (prev[day] ?? []).map((s, i) => i === idx ? val : s) }));
	};

	const handleSave = () => {
		if (!editName.trim()) { toast.error("Queue name required"); return; }
		saveMut.mutate(
			{ id: editId ?? undefined, name: editName.trim(), schedule: { slots: editSlots }, is_active: true },
			{ onSuccess: () => { toast.success(editId ? "Queue updated" : "Queue created"); setEditOpen(false); } },
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Post Queues</h1>
				<Button onClick={openNew}><Plus size={16} /> New Queue</Button>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !(data?.queues ?? []).length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-12">
						<Layers size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No post queues configured yet.</p>
						<p className="text-sm text-[var(--muted-foreground)]">
							Queues let you set recurring time slots for automatic post scheduling.
						</p>
						<Button onClick={openNew} variant="outline"><Plus size={14} /> Create your first queue</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{data?.queues.map((q) => (
						<Card key={q.id}>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">{q.name}</CardTitle>
									<div className="flex items-center gap-1">
										<Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit" onClick={() => openEdit(q)}>
											<Pencil size={14} />
										</Button>
										<Button variant="ghost" size="sm" className="h-7 w-7 p-0" title={q.is_active ? "Pause" : "Activate"}
											onClick={() => toggleMut.mutate(q.id, { onSuccess: (res) => toast.success(res.is_active ? "Queue activated" : "Queue paused") })}>
											{q.is_active ? <Power size={14} className="text-green-500" /> : <PowerOff size={14} className="text-gray-400" />}
										</Button>
										<Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" title="Delete"
											onClick={() => { if (confirm("Delete this queue?")) deleteMut.mutate(q.id, { onSuccess: () => toast.success("Queue deleted") }); }}>
											<Trash2 size={14} />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								{q.schedule && typeof q.schedule === "object" && (q.schedule as any).slots && (
									<div className="space-y-1 mb-2">
										{Object.entries((q.schedule as any).slots as Record<string, string[]>).filter(([, times]) => times.length > 0).map(([day, times]) => (
											<div key={day} className="flex items-center gap-2 text-xs">
												<span className="font-medium w-20 text-[var(--foreground)]">{day}</span>
												<span className="text-[var(--muted-foreground)]">{(times as string[]).join(", ")}</span>
											</div>
										))}
									</div>
								)}
								<p className="text-xs text-[var(--muted-foreground)]">
									Created {new Date(q.created_at).toLocaleDateString()}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Create/Edit Queue Dialog */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>{editId ? "Edit Queue" : "New Queue"}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium">Queue Name</label>
							<Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="e.g. Morning posts" className="mt-1" />
						</div>
						<div>
							<label className="text-sm font-medium">Time Slots</label>
							<p className="text-xs text-[var(--muted-foreground)] mb-2">Set posting times for each day of the week.</p>
							<div className="space-y-3">
								{DAYS.map(day => (
									<div key={day} className="flex items-start gap-3">
										<span className="text-sm font-medium w-24 pt-1.5 shrink-0">{day}</span>
										<div className="flex-1 space-y-1">
											{(editSlots[day] ?? []).map((time, idx) => (
												<div key={idx} className="flex items-center gap-1">
													<Input type="time" value={time} onChange={(e) => updateSlot(day, idx, e.target.value)} className="w-32 h-8 text-sm" />
													<Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => removeSlot(day, idx)}>
														<Trash2 size={12} />
													</Button>
												</div>
											))}
											<Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={() => addSlot(day)}>
												<Plus size={12} /> Add time
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
						<Button onClick={handleSave} disabled={saveMut.isPending}>
							{saveMut.isPending ? "Saving..." : editId ? "Update Queue" : "Create Queue"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
