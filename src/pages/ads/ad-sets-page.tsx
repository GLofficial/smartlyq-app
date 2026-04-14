import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, Search, Plus, X } from "lucide-react";
import { useAdSets } from "@/api/ad-manager/ad-sets";

const STATUS_TABS = ["All", "Active", "Paused"] as const;

export function AdSetsPage() {
	const { data, isLoading } = useAdSets();
	const [tab, setTab] = useState<string>("All");
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<number | null>(null);

	const sets = (data?.ad_sets ?? [])
		.filter((s) => tab === "All" || s.status.toLowerCase() === tab.toLowerCase())
		.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()));

	const counts = {
		All: data?.ad_sets?.length ?? 0,
		Active: data?.ad_sets?.filter((s) => s.status === "active").length ?? 0,
		Paused: data?.ad_sets?.filter((s) => s.status === "paused").length ?? 0,
	};

	const detail = selected ? sets.find((s) => s.id === selected) : null;

	return (
		<div className="space-y-5 max-w-[1400px]">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[var(--foreground)]">Ad Sets / Ad Groups</h1>
					<p className="text-sm text-[var(--muted-foreground)]">Manage targeting, budgets, and bid strategies. Meta uses Ad Sets, Google uses Ad Groups.</p>
				</div>
				<Button size="sm" className="bg-[var(--sq-primary)]"><Plus size={14} /><span className="ml-1.5">New Ad Set</span></Button>
			</div>

			<div className="flex items-center gap-4">
				<div className="relative w-72">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
					<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ad sets or campaigns..." className="pl-9 h-9 text-sm" />
				</div>
				<div className="flex gap-1">
					{STATUS_TABS.map((t) => (
						<button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
							tab === t ? "bg-[var(--sq-primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
						}`}>{t} ({counts[t]})</button>
					))}
				</div>
			</div>

			<div className="flex gap-4">
				{/* Table */}
				<Card className={`flex-1 ${detail ? "max-w-[65%]" : ""}`}>
					<CardContent className="p-0">
						{isLoading ? (
							<div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
						) : sets.length === 0 ? (
							<div className="flex flex-col items-center gap-3 py-16">
								<Layers size={40} className="text-[var(--muted-foreground)]" />
								<p className="text-sm text-[var(--muted-foreground)]">No ad sets found.</p>
							</div>
						) : (
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
										<th className="px-4 py-3 font-medium">Ad Set / Group</th>
										<th className="px-3 py-3 font-medium">Campaign</th>
										<th className="px-3 py-3 font-medium">Status</th>
										<th className="px-3 py-3 font-medium">Bid Strategy</th>
										<th className="px-3 py-3 font-medium text-right">Budget</th>
										<th className="px-3 py-3 font-medium text-right">Spent</th>
										<th className="px-3 py-3 font-medium text-right">Conv.</th>
										<th className="px-3 py-3 font-medium text-right">CPA</th>
									</tr>
								</thead>
								<tbody>
									{sets.map((s) => (
										<tr key={s.id} className={`border-b border-[var(--border)] cursor-pointer transition-colors ${
											selected === s.id ? "bg-[var(--sq-primary)]/5" : "hover:bg-[var(--muted)]/30"
										}`} onClick={() => setSelected(selected === s.id ? null : s.id)}>
											<td className="px-4 py-3 font-medium text-[var(--foreground)]">{s.name}</td>
											<td className="px-3 py-3 text-[var(--muted-foreground)]">{s.campaign_name}</td>
											<td className="px-3 py-3"><StatusBadge status={s.status} /></td>
											<td className="px-3 py-3 text-xs text-[var(--muted-foreground)]">{(s as any).bid_strategy || "—"}</td>
											<td className="px-3 py-3 text-right font-mono">€{Number(s.budget).toFixed(2)}</td>
											<td className="px-3 py-3 text-right font-mono">€{Number(s.spent).toFixed(2)}</td>
											<td className="px-3 py-3 text-right">{(s as any).conversions ?? 0}</td>
											<td className="px-3 py-3 text-right font-mono">€{Number((s as any).cpa ?? 0).toFixed(2)}</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</CardContent>
				</Card>

				{/* Detail Panel */}
				{detail && (
					<Card className="w-[35%] sticky top-6 self-start">
						<div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
							<h3 className="text-sm font-semibold text-[var(--foreground)]">{detail.name}</h3>
							<button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-[var(--muted)]"><X size={14} /></button>
						</div>
						<CardContent className="py-4 space-y-3">
							<DetailRow label="Status"><StatusBadge status={detail.status} /></DetailRow>
							<DetailRow label="Campaign">{detail.campaign_name}</DetailRow>
							<DetailRow label="Bid Strategy">{(detail as any).bid_strategy || "—"}</DetailRow>
							<DetailRow label="Budget">€{Number(detail.budget).toFixed(2)}</DetailRow>
							<DetailRow label="Spent">€{Number(detail.spent).toFixed(2)}</DetailRow>
							<DetailRow label="Impressions">{Number(detail.impressions).toLocaleString()}</DetailRow>
							<DetailRow label="Clicks">{Number(detail.clicks).toLocaleString()}</DetailRow>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
			<span className="text-xs text-[var(--muted-foreground)]">{label}</span>
			<span className="text-sm font-medium text-[var(--foreground)]">{children}</span>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const styles: Record<string, string> = {
		active: "bg-emerald-100 text-emerald-700", paused: "bg-amber-100 text-amber-700",
		draft: "bg-blue-100 text-blue-700", archived: "bg-gray-100 text-gray-600", error: "bg-red-100 text-red-700",
	};
	return (
		<span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] ?? styles.draft}`}>
			<span className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : status === "paused" ? "bg-amber-500" : "bg-gray-400"}`} />
			{status}
		</span>
	);
}
