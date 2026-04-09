import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users } from "lucide-react";
import { useWorkspace } from "@/api/general";

export function WorkspacePage() {
	const { data, isLoading } = useWorkspace();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Workspace</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : (
				<>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Building2 size={18} />
								{data?.workspace?.name ?? "My Workspace"}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-[var(--muted-foreground)]">
								Slug: {data?.workspace?.slug ?? "—"}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Users size={18} />
								Members ({data?.members.length ?? 0})
							</CardTitle>
						</CardHeader>
						<CardContent>
							{!data?.members.length ? (
								<p className="text-sm text-[var(--muted-foreground)]">No members.</p>
							) : (
								<div className="space-y-2">
									{data.members.map((m) => (
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
		<span className={`h-2.5 w-2.5 rounded-full ${status === "active" ? "bg-green-500" : "bg-gray-400"}`}
			title={status} />
	);
}
