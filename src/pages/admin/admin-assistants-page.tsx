import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useAdminAssistants } from "@/api/admin-pages";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";

interface Assistant {
	id: number;
	name: string;
	description: string;
	model: string;
	status: number;
}

export function AdminAssistantsPage() {
	const { data, isLoading } = useAdminAssistants();
	const [confirmDelete, setConfirmDelete] = useState<Assistant | null>(null);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Assistants</h1>

			{confirmDelete && (
				<DeleteConfirm assistant={confirmDelete} onClose={() => setConfirmDelete(null)} />
			)}

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						AI Assistants ({(data?.assistants ?? []).length ?? 0})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Spinner />
					) : !(data?.assistants ?? []).length ? (
						<div className="flex flex-col items-center gap-2 py-8">
							<Bot size={32} className="text-[var(--muted-foreground)]" />
							<p className="text-sm text-[var(--muted-foreground)]">No assistants configured.</p>
						</div>
					) : (
						<div className="space-y-2">
							{data?.assistants.map((a) => (
								<div key={a.id} className="flex items-center gap-3 rounded border border-[var(--border)] p-3">
									<Bot size={18} className="text-[var(--sq-primary)]" />
									<div className="min-w-0 flex-1">
										<p className="font-medium">{a.name}</p>
										<p className="text-xs text-[var(--muted-foreground)]">{a.description}</p>
									</div>
									<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs">{a.model}</span>
									{a.status === 1 ? (
										<CheckCircle size={14} className="text-green-500" />
									) : (
										<XCircle size={14} className="text-gray-400" />
									)}
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7 text-red-500 hover:text-red-600"
										title="Delete"
										onClick={() => setConfirmDelete(a)}
									>
										<Trash2 size={14} />
									</Button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function DeleteConfirm({ assistant, onClose }: { assistant: Assistant; onClose: () => void }) {
	const mutation = useMutation({
		mutationFn: () =>
			apiClient.post<{ message: string }>("/api/spa/admin/assistants/delete", { id: assistant.id }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "assistants"] });
			toast.success(`Assistant "${assistant.name}" deleted`);
			onClose();
		},
		onError: (err: { message?: string }) => {
			toast.error(err.message ?? "Failed to delete assistant");
		},
	});

	return (
		<Card className="border-red-200">
			<CardContent className="flex items-center justify-between py-4">
				<p className="text-sm">
					Delete assistant <strong>{assistant.name}</strong>? This cannot be undone.
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
		<div className="flex h-20 items-center justify-center">
			<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
		</div>
	);
}
