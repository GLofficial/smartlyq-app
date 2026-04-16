import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Globe, Bot, Share2 } from "lucide-react";
import { useAdminDashboard } from "@/api/admin";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";

export function AdminDashboardPage() {
	const { data, isLoading } = useAdminDashboard();
	const v = (n?: number) => (isLoading ? "..." : (n ?? 0).toLocaleString());

	// Merge words + images + videos chart data by date
	const chartData = (data?.chart?.words ?? []).map((w, i) => ({
		date: w.x.slice(5), // "MM-DD"
		words: w.y,
		images: data?.chart?.images?.[i]?.y ?? 0,
		videos: data?.chart?.videos?.[i]?.y ?? 0,
	}));

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Admin Dashboard</h1>

			{/* Stat cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Stat icon={Users} label="Total Users" value={v(data?.total_users)} sub={`${v(data?.active_users)} active`} color="text-blue-600" />
				<Stat icon={CreditCard} label="Active Subscriptions" value={v(data?.total_subs)} color="text-green-600" />
				<Stat icon={Globe} label="Whitelabel Tenants" value={v(data?.total_tenants)} color="text-purple-600" />
				<Stat icon={Bot} label="Chatbots" value={v(data?.total_chatbots)} color="text-orange-600" />
				<Stat icon={Share2} label="Social Posts" value={v(data?.total_posts)} color="text-pink-600" />
			</div>

			{/* Usage chart */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Usage This Month</CardTitle>
					<div className="flex items-center gap-4 mt-1">
						<Legend color="#6366f1" label="Words" />
						<Legend color="#22c55e" label="Images" />
						<Legend color="#f59e0b" label="Videos" />
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Spinner />
					) : (
						<ResponsiveContainer width="100%" height={220}>
							<AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
								<defs>
									<linearGradient id="gWords" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
										<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
									</linearGradient>
									<linearGradient id="gImages" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
										<stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
									</linearGradient>
									<linearGradient id="gVideos" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
										<stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
								<XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
								<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={40} />
								<Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
								<Area type="monotone" dataKey="words" stroke="#6366f1" strokeWidth={2} fill="url(#gWords)" dot={false} />
								<Area type="monotone" dataKey="images" stroke="#22c55e" strokeWidth={2} fill="url(#gImages)" dot={false} />
								<Area type="monotone" dataKey="videos" stroke="#f59e0b" strokeWidth={2} fill="url(#gVideos)" dot={false} />
							</AreaChart>
						</ResponsiveContainer>
					)}
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Recent users */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg">Recent Users</CardTitle>
						<Link to="/admin/users" className="text-xs text-[var(--sq-primary)] hover:underline">View All</Link>
					</CardHeader>
					<CardContent className="p-0">
						{isLoading ? <Spinner /> : (
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)]">
										<th className="px-4 py-2 font-medium">User</th>
										<th className="px-4 py-2 font-medium">Plan</th>
										<th className="px-4 py-2 font-medium">Joined</th>
										<th className="px-4 py-2 font-medium">Status</th>
									</tr>
								</thead>
								<tbody>
									{(data?.recent_users ?? []).map((u) => (
										<tr key={u.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
											<td className="px-4 py-2">
												<p className="font-medium">{u.name}</p>
												<p className="text-xs text-[var(--muted-foreground)]">{u.email}</p>
											</td>
											<td className="px-4 py-2 text-xs">{u.plan_name || "—"}</td>
											<td className="px-4 py-2 text-xs text-[var(--muted-foreground)]">{fmtDate(u.created_at)}</td>
											<td className="px-4 py-2">
												<span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${u.status === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
													<span className={`h-1.5 w-1.5 rounded-full ${u.status === 1 ? "bg-green-500" : "bg-gray-400"}`} />
													{u.status === 1 ? "Active" : "Inactive"}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</CardContent>
				</Card>

				{/* Recent subscriptions */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg">Recent Subscriptions</CardTitle>
						<Link to="/admin/subscriptions" className="text-xs text-[var(--sq-primary)] hover:underline">View All</Link>
					</CardHeader>
					<CardContent className="p-0">
						{isLoading ? <Spinner /> : (
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)]">
										<th className="px-4 py-2 font-medium">User</th>
										<th className="px-4 py-2 font-medium">Plan</th>
										<th className="px-4 py-2 font-medium">Amount</th>
										<th className="px-4 py-2 font-medium">Date</th>
									</tr>
								</thead>
								<tbody>
									{(data?.recent_subscriptions ?? []).map((s) => (
										<tr key={s.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
											<td className="px-4 py-2">
												<p className="font-medium">{s.user_name}</p>
												<p className="text-xs text-[var(--muted-foreground)]">{s.user_email}</p>
											</td>
											<td className="px-4 py-2 text-xs">{s.plan_name || "—"}</td>
											<td className="px-4 py-2 text-xs font-medium">${s.amount.toFixed(2)}</td>
											<td className="px-4 py-2 text-xs text-[var(--muted-foreground)]">{fmtDate(s.created_at)}</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</CardContent>
				</Card>
			</div>
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

function Legend({ color, label }: { color: string; label: string }) {
	return (
		<div className="flex items-center gap-1.5">
			<span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
			<span className="text-xs text-[var(--muted-foreground)]">{label}</span>
		</div>
	);
}

function Spinner() {
	return (
		<div className="flex h-20 items-center justify-center">
			<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
		</div>
	);
}

function fmtDate(d: string) {
	if (!d) return "—";
	return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
