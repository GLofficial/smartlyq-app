import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Globe, Bot, Share2 } from "lucide-react";
import { useAdminDashboard } from "@/api/admin";

export function AdminDashboardPage() {
	const { data, isLoading } = useAdminDashboard();
	const v = (n?: number) => (isLoading ? "..." : (n ?? 0).toLocaleString());

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Admin Dashboard</h1>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Stat icon={Users} label="Total Users" value={v(data?.total_users)} sub={`${v(data?.active_users)} active`} color="text-blue-600" />
				<Stat icon={CreditCard} label="Active Subscriptions" value={v(data?.total_subs)} color="text-green-600" />
				<Stat icon={Globe} label="Whitelabel Tenants" value={v(data?.total_tenants)} color="text-purple-600" />
				<Stat icon={Bot} label="Chatbots" value={v(data?.total_chatbots)} color="text-orange-600" />
				<Stat icon={Share2} label="Social Posts" value={v(data?.total_posts)} color="text-pink-600" />
			</div>

			<Card>
				<CardHeader><CardTitle className="text-lg">Recent Users</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-20 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : (
						<div className="space-y-2">
							{(data?.recent_users ?? []).map((u) => (
								<div key={u.id} className="flex items-center justify-between rounded border border-[var(--border)] p-3">
									<div>
										<p className="font-medium">{u.name}</p>
										<p className="text-xs text-[var(--muted-foreground)]">{u.email}</p>
									</div>
									<div className="flex items-center gap-2">
										{u.role === 1 && <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">Admin</span>}
										<span className={`h-2 w-2 rounded-full ${u.status === 1 ? "bg-green-500" : "bg-gray-400"}`} />
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function Stat({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub?: string; color: string }) {
	return (
		<Card>
			<CardContent className="flex items-center gap-4 p-6">
				<Icon size={24} className={color} />
				<div>
					<p className="text-2xl font-bold">{value}</p>
					<p className="text-sm text-[var(--muted-foreground)]">{label}</p>
					{sub && <p className="text-xs text-[var(--muted-foreground)]">{sub}</p>}
				</div>
			</CardContent>
		</Card>
	);
}
