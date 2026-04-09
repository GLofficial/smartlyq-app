import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, MessageSquare, Share2, Sparkles } from "lucide-react";

export function DashboardPage() {
	const user = useAuthStore((s) => s.user);
	const plan = useAuthStore((s) => s.plan);

	return (
		<div className="space-y-6">
			{/* Welcome */}
			<div>
				<h1 className="text-2xl font-bold text-[var(--foreground)]">
					Welcome back, {user?.name ?? "there"}
				</h1>
				<p className="text-[var(--muted-foreground)]">
					{plan?.name ?? "Free"} plan
				</p>
			</div>

			{/* Quick Stats */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard icon={Share2} label="Scheduled Posts" value="--" />
				<StatCard icon={MessageSquare} label="Chatbot Conversations" value="--" />
				<StatCard icon={Sparkles} label="AI Tasks" value="--" />
				<StatCard icon={LayoutDashboard} label="Credits Remaining" value="--" />
			</div>

			{/* Placeholder for recent activity */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-[var(--muted-foreground)]">
						Dashboard data will load once the /api/spa/dashboard endpoint is connected.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

function StatCard({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ElementType;
	label: string;
	value: string;
}) {
	return (
		<Card>
			<CardContent className="flex items-center gap-4 p-6">
				<div className="rounded-lg bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)] p-3">
					<Icon size={20} className="text-[var(--sq-primary)]" />
				</div>
				<div>
					<p className="text-2xl font-bold">{value}</p>
					<p className="text-sm text-[var(--muted-foreground)]">{label}</p>
				</div>
			</CardContent>
		</Card>
	);
}
