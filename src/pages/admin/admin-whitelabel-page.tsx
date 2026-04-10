import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, CheckCircle, XCircle, ToggleLeft } from "lucide-react";
import { useAdminWhitelabel } from "@/api/admin";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { toast } from "sonner";

export function AdminWhitelabelPage() {
	const { data, isLoading } = useAdminWhitelabel();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Whitelabel Tenants</h1>

			{isLoading ? (
				<Spinner />
			) : !(data?.tenants ?? []).length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12">
						<Globe size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No whitelabel tenants.</p>
					</CardContent>
				</Card>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-[var(--border)]">
								<th className="py-2 text-left font-medium">ID</th>
								<th className="py-2 text-left font-medium">Name</th>
								<th className="py-2 text-left font-medium">Domain</th>
								<th className="py-2 text-left font-medium">Status</th>
								<th className="py-2 text-left font-medium">SSL</th>
								<th className="py-2 text-left font-medium">License</th>
								<th className="py-2 text-left font-medium">Created</th>
								<th className="py-2 text-left font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{data?.tenants.map((t) => (
								<TenantRow key={t.id} tenant={t} />
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

interface Tenant {
	id: number;
	subdomain: string;
	custom_domain: string;
	site_name: string;
	status: string;
	license_active: boolean;
	ssl_status: string;
	domain_verified: boolean;
	owner_user_id: number;
	created_at: string;
}

function TenantRow({ tenant: t }: { tenant: Tenant }) {
	const toggleLicense = useMutation({
		mutationFn: () =>
			apiClient.post<{ message: string }>("/api/spa/admin/whitelabel/toggle-license", {
				id: t.id,
				license_active: !t.license_active,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "whitelabel"] });
			toast.success(`License ${t.license_active ? "deactivated" : "activated"} for ${t.site_name || t.subdomain}`);
		},
		onError: (err: { message?: string }) => {
			toast.error(err.message ?? "Failed to toggle license");
		},
	});

	return (
		<tr className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
			<td className="py-2">{t.id}</td>
			<td className="py-2 font-medium">{t.site_name || t.subdomain}</td>
			<td className="py-2 text-[var(--muted-foreground)]">
				{t.custom_domain || `${t.subdomain}.app.smartlyq.com`}
			</td>
			<td className="py-2">
				<span
					className={`rounded-full px-2 py-0.5 text-xs font-medium ${
						t.status === "active"
							? "bg-green-100 text-green-700"
							: t.status === "pending"
								? "bg-yellow-100 text-yellow-700"
								: "bg-red-100 text-red-700"
					}`}
				>
					{t.status || "unknown"}
				</span>
			</td>
			<td className="py-2">
				{t.ssl_status === "active" ? (
					<CheckCircle size={14} className="text-green-500" />
				) : (
					<span className="text-xs text-[var(--muted-foreground)]">{t.ssl_status || "—"}</span>
				)}
			</td>
			<td className="py-2">
				{t.license_active ? (
					<CheckCircle size={14} className="text-green-500" />
				) : (
					<XCircle size={14} className="text-red-500" />
				)}
			</td>
			<td className="py-2 text-[var(--muted-foreground)]">
				{new Date(t.created_at).toLocaleDateString()}
			</td>
			<td className="py-2">
				<Button
					variant="ghost"
					size="sm"
					className="h-7"
					onClick={() => toggleLicense.mutate()}
					disabled={toggleLicense.isPending}
				>
					<ToggleLeft size={14} className="mr-1" />
					{toggleLicense.isPending
						? "..."
						: t.license_active
							? "Deactivate"
							: "Activate"}
				</Button>
			</td>
		</tr>
	);
}

function Spinner() {
	return (
		<div className="flex h-40 items-center justify-center">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
		</div>
	);
}
