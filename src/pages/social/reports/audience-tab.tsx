import { Card, CardContent } from "@/components/ui/card";
import { useReportAudience, useSocialAccounts, type ReportFilters } from "@/api/social-reports";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function AudienceTab({ filters }: { filters: ReportFilters }) {
	const { data: growth, isLoading } = useReportAudience(filters);
	const { data: accountsData } = useSocialAccounts();
	const accounts = accountsData?.accounts ?? [];

	const filteredAccounts = accounts.filter(
		(a) => !filters.platform || a.platform === filters.platform
	);

	// Build chart data
	const chartData = (growth?.labels ?? []).map((date: string, i: number) => ({
		date: formatDate(date),
		"New Followers": growth?.new_followers?.[i] ?? 0,
		"Net Change": growth?.net_followers?.[i] ?? 0,
		"Lost Followers": growth?.lost_followers?.[i] ?? 0,
	}));

	return (
		<div className="space-y-6">
			{/* Follower Growth Chart */}
			<Card>
				<CardContent className="p-5">
					<h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Follower Growth</h3>
					{isLoading ? (
						<div className="h-64 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
					) : chartData.length === 0 ? (
						<p className="text-sm text-[var(--muted-foreground)] text-center py-12">No follower data for this period.</p>
					) : (
						<ResponsiveContainer width="100%" height={280}>
							<AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
								<defs>
									<linearGradient id="fill-new" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
										<stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
									</linearGradient>
									<linearGradient id="fill-net" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
										<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
								<XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
								<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
								<Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }} />
								<Legend verticalAlign="top" height={30} iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
								<Area type="monotone" dataKey="New Followers" stroke="#22c55e" strokeWidth={2} fill="url(#fill-new)" dot={false} />
								<Area type="monotone" dataKey="Net Change" stroke="#3b82f6" strokeWidth={2} fill="url(#fill-net)" dot={false} />
								<Area type="monotone" dataKey="Lost Followers" stroke="#ef4444" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 4" />
							</AreaChart>
						</ResponsiveContainer>
					)}
				</CardContent>
			</Card>

			{/* Followers by Platform */}
			<div>
				<p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Followers by Platform</p>
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
					{filteredAccounts.map((a) => (
						<Card key={a.id}>
							<CardContent className="flex items-center gap-3 p-4">
								{a.profile_picture ? (
									<img src={a.profile_picture} alt="" className="h-8 w-8 rounded-full object-cover" />
								) : (
									<div className="h-8 w-8 rounded-full bg-[var(--muted)] flex items-center justify-center">
										<PlatformIcon platform={a.platform} size={14} />
									</div>
								)}
								<div className="min-w-0">
									<p className="text-xs font-medium text-[var(--foreground)] truncate">{a.account_name}</p>
									<p className="text-lg font-bold text-[var(--foreground)]">{a.followers_count.toLocaleString()}</p>
								</div>
								{a.needs_reconnect && <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />}
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

function formatDate(d: string): string {
	try {
		const date = new Date(d);
		return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;
	} catch { return d; }
}
