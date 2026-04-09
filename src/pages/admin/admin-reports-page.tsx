import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, DollarSign, UserPlus } from "lucide-react";
import { useAdminReports } from "@/api/admin-pages";

export function AdminReportsPage() {
	const { data, isLoading } = useAdminReports();
	const v = (n?: number) => isLoading ? "..." : (n ?? 0).toLocaleString();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Reports</h1>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Stat icon={Users} label="Total Users" value={v(data?.total_users)} color="text-blue-600" />
				<Stat icon={UserPlus} label="New Users (30d)" value={v(data?.new_users_30d)} color="text-green-600" />
				<Stat icon={FileText} label="Total Posts" value={v(data?.total_posts)} color="text-purple-600" />
				<Stat icon={DollarSign} label="Total Revenue" value={isLoading ? "..." : `$${(data?.total_revenue ?? 0).toFixed(2)}`} color="text-orange-600" />
			</div>
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
