import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Star, CheckCircle, XCircle, ToggleLeft } from "lucide-react";
import { useAdminTemplates } from "@/api/admin-pages";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";

interface Template {
	id: number;
	name: string;
	description: string;
	category: string;
	icon: string;
	premium: boolean;
	status: number;
}

export function AdminTemplatesPage() {
	const { data, isLoading } = useAdminTemplates();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Templates</h1>
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">
						Content Templates ({(data?.templates ?? []).length ?? 0})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Spinner />
					) : !(data?.templates ?? []).length ? (
						<div className="flex flex-col items-center gap-2 py-8">
							<FileText size={32} className="text-[var(--muted-foreground)]" />
							<p className="text-sm text-[var(--muted-foreground)]">No templates.</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)]">
										<th className="py-2 text-left font-medium">ID</th>
										<th className="py-2 text-left font-medium">Name</th>
										<th className="py-2 text-left font-medium">Category</th>
										<th className="py-2 text-center font-medium">Premium</th>
										<th className="py-2 text-center font-medium">Status</th>
										<th className="py-2 text-left font-medium">Actions</th>
									</tr>
								</thead>
								<tbody>
									{data?.templates.map((t) => (
										<TemplateRow key={t.id} template={t} />
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function TemplateRow({ template: t }: { template: Template }) {
	const toggleStatus = useMutation({
		mutationFn: () =>
			apiClient.post<{ message: string }>("/api/spa/admin/templates/toggle-status", {
				id: t.id,
				status: t.status === 1 ? 0 : 1,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "templates"] });
			toast.success(`Template "${t.name}" ${t.status === 1 ? "deactivated" : "activated"}`);
		},
		onError: (err: { message?: string }) => {
			toast.error(err.message ?? "Failed to toggle template status");
		},
	});

	return (
		<tr className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
			<td className="py-2">{t.id}</td>
			<td className="py-2">
				<div className="flex items-center gap-2">
					{t.icon && <span>{t.icon}</span>}
					<span className="font-medium">{t.name}</span>
				</div>
			</td>
			<td className="py-2">
				<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs">{t.category}</span>
			</td>
			<td className="py-2 text-center">
				{t.premium && <Star size={14} className="text-yellow-500 fill-yellow-500 inline" />}
			</td>
			<td className="py-2 text-center">
				{t.status === 1 ? (
					<CheckCircle size={14} className="text-green-500 inline" />
				) : (
					<XCircle size={14} className="text-gray-400 inline" />
				)}
			</td>
			<td className="py-2">
				<Button
					variant="ghost"
					size="sm"
					className="h-7"
					onClick={() => toggleStatus.mutate()}
					disabled={toggleStatus.isPending}
				>
					<ToggleLeft size={14} className="mr-1" />
					{toggleStatus.isPending ? "..." : t.status === 1 ? "Deactivate" : "Activate"}
				</Button>
			</td>
		</tr>
	);
}

function Spinner() {
	return (
		<div className="flex h-20 items-center justify-center">
			<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
		</div>
	);
}
