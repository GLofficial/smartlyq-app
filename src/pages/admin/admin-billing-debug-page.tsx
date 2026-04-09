import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useAdminBillingDebug } from "@/api/admin-monitoring";

export function AdminBillingDebugPage() {
	const [userId, setUserId] = useState(0);
	const [input, setInput] = useState("");
	const { data, isLoading } = useAdminBillingDebug(userId);

	const handleSearch = () => {
		const id = Number.parseInt(input, 10);
		if (id > 0) setUserId(id);
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Billing Debug</h1>

			<Card>
				<CardHeader><CardTitle className="text-base">Lookup User</CardTitle></CardHeader>
				<CardContent>
					<div className="flex gap-3">
						<Input placeholder="User ID" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="w-40" />
						<Button onClick={handleSearch}><Search size={16} /> Lookup</Button>
					</div>
				</CardContent>
			</Card>

			{userId > 0 && (
				<>
					{isLoading ? (
						<div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
					) : !data?.user ? (
						<Card><CardContent className="py-8 text-center text-sm text-[var(--muted-foreground)]">User not found.</CardContent></Card>
					) : (
						<>
							<Card>
								<CardHeader><CardTitle className="text-base">User #{data.user.id}</CardTitle></CardHeader>
								<CardContent className="grid grid-cols-2 gap-3 text-sm">
									<div><span className="font-medium">Name:</span> {data.user.name}</div>
									<div><span className="font-medium">Email:</span> {data.user.email}</div>
									<div><span className="font-medium">Plan ID:</span> {data.user.plan_id}</div>
									<div><span className="font-medium">Credits:</span> {data.user.credits.toFixed(2)}</div>
								</CardContent>
							</Card>

							{data.wallet && (
								<Card>
									<CardHeader><CardTitle className="text-base">API Wallet</CardTitle></CardHeader>
									<CardContent className="grid grid-cols-2 gap-3 text-sm">
										<div><span className="font-medium">Balance:</span> {data.wallet.balance}</div>
										<div><span className="font-medium">Monthly:</span> {data.wallet.monthly_balance}</div>
										<div><span className="font-medium">Resets:</span> {data.wallet.monthly_reset_at}</div>
									</CardContent>
								</Card>
							)}

							<Card>
								<CardHeader><CardTitle className="text-base">Subscriptions ({data.subscriptions.length})</CardTitle></CardHeader>
								<CardContent>
									{data.subscriptions.map((s: Record<string, unknown>) => (
										<div key={String(s.id)} className="flex gap-4 border-b border-[var(--border)] py-2 text-sm">
											<span>#{String(s.id)}</span>
											<span>Plan: {String(s.plan_id)}</span>
											<span>Status: {String(s.status)}</span>
											<span className="text-[var(--muted-foreground)]">{String(s.created_at)}</span>
										</div>
									))}
								</CardContent>
							</Card>

							<Card>
								<CardHeader><CardTitle className="text-base">Recent Transactions ({data.transactions.length})</CardTitle></CardHeader>
								<CardContent>
									{data.transactions.map((t: Record<string, unknown>) => (
										<div key={String(t.id)} className="flex gap-4 border-b border-[var(--border)] py-2 text-sm">
											<span>#{String(t.id)}</span>
											<span>${Number(t.amount).toFixed(2)}</span>
											<span>{String(t.status)}</span>
											<span className="text-[var(--muted-foreground)]">{String(t.description)}</span>
										</div>
									))}
								</CardContent>
							</Card>
						</>
					)}
				</>
			)}
		</div>
	);
}
