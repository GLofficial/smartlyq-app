import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Users, Pencil, Check, X } from "lucide-react";
import { useWorkspace } from "@/api/general";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function WorkspacePage() {
	const { data, isLoading } = useWorkspace();
	const [editing, setEditing] = useState(false);
	const [nameInput, setNameInput] = useState("");

	const renameMutation = useMutation({
		mutationFn: (name: string) =>
			apiClient.post<{ message: string }>("/api/spa/workspace/rename", { name }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["workspace"] });
			toast.success("Workspace name updated");
			setEditing(false);
		},
		onError: (err: { message?: string }) => {
			toast.error(err.message ?? "Failed to rename workspace");
		},
	});

	const startEditing = () => {
		setNameInput(data?.workspace?.name ?? "");
		setEditing(true);
	};

	const handleSave = () => {
		const trimmed = nameInput.trim();
		if (!trimmed) {
			toast.error("Name cannot be empty");
			return;
		}
		renameMutation.mutate(trimmed);
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Workspace</h1>

			{isLoading ? (
				<Spinner />
			) : (
				<>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Building2 size={18} />
								{editing ? (
									<div className="flex items-center gap-2 flex-1">
										<Input
											value={nameInput}
											onChange={(e) => setNameInput(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") handleSave();
												if (e.key === "Escape") setEditing(false);
											}}
											className="h-8 max-w-xs"
											autoFocus
										/>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-green-600"
											onClick={handleSave}
											disabled={renameMutation.isPending}
										>
											<Check size={16} />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7"
											onClick={() => setEditing(false)}
										>
											<X size={16} />
										</Button>
									</div>
								) : (
									<>
										<span>{data?.workspace?.name ?? "My Workspace"}</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7"
											title="Edit Name"
											onClick={startEditing}
										>
											<Pencil size={14} />
										</Button>
									</>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-[var(--muted-foreground)]">
								Slug: {data?.workspace?.slug ?? "—"}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex-row items-center justify-between">
							<CardTitle className="flex items-center gap-2 text-lg">
								<Users size={18} />
								Members ({(data?.members ?? []).length ?? 0})
							</CardTitle>
							<Link to="/workspace/members">
								<Button variant="outline" size="sm">
									Manage Members
								</Button>
							</Link>
						</CardHeader>
						<CardContent>
							{!(data?.members ?? []).length ? (
								<p className="text-sm text-[var(--muted-foreground)]">No members.</p>
							) : (
								<div className="space-y-2">
									{data?.members.map((m) => (
										<div key={m.id} className="flex items-center gap-4 rounded border border-[var(--border)] p-3">
											<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)]">
												<span className="text-sm font-medium">{m.name.charAt(0).toUpperCase()}</span>
											</div>
											<div className="min-w-0 flex-1">
												<p className="font-medium">{m.name}</p>
												<p className="text-xs text-[var(--muted-foreground)]">{m.email}</p>
											</div>
											<RoleBadge role={m.role} />
											<StatusDot status={m.status} />
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}

function RoleBadge({ role }: { role: string }) {
	const colors: Record<string, string> = {
		owner: "bg-purple-100 text-purple-700",
		admin: "bg-blue-100 text-blue-700",
		member: "bg-gray-100 text-gray-600",
		viewer: "bg-gray-100 text-gray-500",
	};
	return (
		<span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[role] ?? "bg-gray-100 text-gray-600"}`}>
			{role}
		</span>
	);
}

function StatusDot({ status }: { status: string }) {
	return (
		<span
			className={`h-2.5 w-2.5 rounded-full ${status === "active" ? "bg-green-500" : "bg-gray-400"}`}
			title={status}
		/>
	);
}

function Spinner() {
	return (
		<div className="flex h-40 items-center justify-center">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
		</div>
	);
}
