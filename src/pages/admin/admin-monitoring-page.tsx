import { Card, CardContent } from "@/components/ui/card";
import { Database, Users, Activity, AlertTriangle, Clock, Server } from "lucide-react";
import { useAdminMonitoring } from "@/api/admin-monitoring";

export function AdminMonitoringPage() {
	const { data, isLoading } = useAdminMonitoring();
	const v = (n?: number) => isLoading ? "..." : (n ?? 0).toLocaleString();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">System Monitoring</h1>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Stat icon={Database} label="Database Size" value={isLoading ? "..." : `${data?.db_size_mb ?? 0} MB`} color="text-blue-600" />
				<Stat icon={Users} label="Total Users" value={v(data?.total_users)} color="text-green-600" />
				<Stat icon={Activity} label="Active (24h)" value={v(data?.active_users_24h)} color="text-purple-600" />
				<Stat icon={Clock} label="Pending Jobs" value={v(data?.pending_jobs)} color="text-yellow-600" />
				<Stat icon={AlertTriangle} label="Failed (24h)" value={v(data?.failed_jobs_24h)} color="text-red-600" />
				<Stat icon={Server} label="PHP Version" value={isLoading ? "..." : data?.php_version ?? ""} color="text-gray-600" />
			</div>
			{data?.server_time && (
				<p className="text-sm text-[var(--muted-foreground)]">Server time: {data.server_time}</p>
			)}
		</div>
	);
}

function Stat({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
	return (
		<Card>
			<CardContent className="flex items-center gap-4 p-6">
				<Icon size={24} className={color} />
				<div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-[var(--muted-foreground)]">{label}</p></div>
			</CardContent>
		</Card>
	);
}
