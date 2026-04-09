import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Link2, CheckCircle, XCircle } from "lucide-react";
import { useAdSettings } from "@/api/ad-manager/settings";

export function AdSettingsPage() {
	const { data, isLoading } = useAdSettings();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Ad Settings</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : (
				<>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Link2 size={18} />
								Connected Ad Accounts
							</CardTitle>
						</CardHeader>
						<CardContent>
							{!data?.accounts.length ? (
								<div className="flex flex-col items-center gap-3 py-8">
									<Link2 size={48} className="text-[var(--muted-foreground)]" />
									<p className="text-[var(--muted-foreground)]">No ad accounts connected.</p>
									<p className="text-sm text-[var(--muted-foreground)]">
										Connect your Facebook, Google, or other ad accounts to manage campaigns.
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{data.accounts.map((account) => (
										<div
											key={account.id}
											className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4"
										>
											<div className="flex items-center gap-3">
												{account.status === "active" ? (
													<CheckCircle size={16} className="text-green-500" />
												) : (
													<XCircle size={16} className="text-red-500" />
												)}
												<div>
													<p className="font-medium">{account.account_name}</p>
													<p className="text-xs text-[var(--muted-foreground)]">
														{account.platform} &middot; {account.account_id}
													</p>
												</div>
											</div>
											<div className="text-right">
												<span
													className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
														account.status === "active"
															? "bg-green-100 text-green-700"
															: "bg-red-100 text-red-700"
													}`}
												>
													{account.status}
												</span>
												<p className="mt-1 text-xs text-[var(--muted-foreground)]">
													Connected {new Date(account.connected_at).toLocaleDateString()}
												</p>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
								<Settings size={18} />
								Default Settings
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="rounded-lg border border-[var(--border)] p-4">
									<p className="text-sm font-medium text-[var(--muted-foreground)]">Default Currency</p>
									<p className="mt-1 text-lg font-semibold">{data?.default_currency ?? "USD"}</p>
								</div>
								<div className="rounded-lg border border-[var(--border)] p-4">
									<p className="text-sm font-medium text-[var(--muted-foreground)]">Default Timezone</p>
									<p className="mt-1 text-lg font-semibold">{data?.default_timezone ?? "UTC"}</p>
								</div>
								<div className="rounded-lg border border-[var(--border)] p-4 sm:col-span-2">
									<p className="text-sm font-medium text-[var(--muted-foreground)]">Auto-Optimization</p>
									<p className="mt-1 text-lg font-semibold">
										{data?.auto_optimize ? "Enabled" : "Disabled"}
									</p>
									<p className="text-xs text-[var(--muted-foreground)]">
										Automatically adjusts budgets based on ad performance.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
