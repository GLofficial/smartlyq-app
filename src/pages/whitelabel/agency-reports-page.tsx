import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, Search } from "lucide-react";
import { useAgencyReports } from "@/api/whitelabel";

function defaultFrom(): string {
	const d = new Date();
	d.setDate(d.getDate() - 30);
	return d.toISOString().slice(0, 10);
}

function defaultTo(): string {
	return new Date().toISOString().slice(0, 10);
}

export function AgencyReportsPage() {
	const [from, setFrom] = useState(defaultFrom);
	const [to, setTo] = useState(defaultTo);
	const [appliedFrom, setAppliedFrom] = useState(from);
	const [appliedTo, setAppliedTo] = useState(to);
	const { data, isLoading } = useAgencyReports(appliedFrom, appliedTo);

	const handleSearch = () => {
		setAppliedFrom(from);
		setAppliedTo(to);
	};

	const dailyUsage = data?.daily_usage ?? [];

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Agency Reports</h1>

			{/* Date Range */}
			<Card>
				<CardContent className="flex flex-wrap items-end gap-4 p-4">
					<div className="space-y-1.5">
						<label className="text-sm font-medium flex items-center gap-1">
							<Calendar size={14} /> From
						</label>
						<Input
							type="date"
							value={from}
							onChange={(e) => setFrom(e.target.value)}
							className="w-44"
						/>
					</div>
					<div className="space-y-1.5">
						<label className="text-sm font-medium flex items-center gap-1">
							<Calendar size={14} /> To
						</label>
						<Input
							type="date"
							value={to}
							onChange={(e) => setTo(e.target.value)}
							className="w-44"
						/>
					</div>
					<Button onClick={handleSearch}>
						<Search size={16} /> Filter
					</Button>
				</CardContent>
			</Card>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : (
				<>
					{/* Total Credits Stat */}
					<Card>
						<CardContent className="flex items-center gap-3 p-4">
							<BarChart3 size={20} className="text-blue-600" />
							<div>
								<p className="text-2xl font-bold">
									{(data?.total_credits ?? 0).toLocaleString()}
								</p>
								<p className="text-xs text-[var(--muted-foreground)]">
									Total Credits Used ({appliedFrom} to {appliedTo})
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Daily Usage Table */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<BarChart3 size={18} />
								Daily Usage
							</CardTitle>
						</CardHeader>
						<CardContent>
							{!dailyUsage.length ? (
								<div className="flex flex-col items-center gap-3 py-12">
									<BarChart3
										size={48}
										className="text-[var(--muted-foreground)]"
									/>
									<p className="text-[var(--muted-foreground)]">
										No usage data for the selected period.
									</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-[var(--border)]">
												<th className="py-2 text-left font-medium">Date</th>
												<th className="py-2 text-right font-medium">
													Credits Used
												</th>
											</tr>
										</thead>
										<tbody>
											{dailyUsage.map((row) => (
												<tr
													key={row.date}
													className="border-b border-[var(--border)] hover:bg-[var(--accent)]"
												>
													<td className="py-2 text-[var(--muted-foreground)]">
														{new Date(row.date).toLocaleDateString()}
													</td>
													<td className="py-2 text-right font-medium">
														{row.credits.toLocaleString()}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
