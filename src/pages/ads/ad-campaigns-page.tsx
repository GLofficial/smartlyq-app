import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folders, Search, Plus, ChevronDown, ChevronRight, Eye, Layers, BarChart3, Copy, Pause, Play, Trash2, Pencil, DollarSign } from "lucide-react";
import { DeleteDialog, PauseDialog, EditBudgetDialog, EditNameDialog, CampaignAnalyticsDialog } from "./ad-dialogs";
import { apiClient } from "@/lib/api-client";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { Link } from "react-router-dom";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { AdToolbar } from "@/pages/ad-manager/ad-toolbar";
import { useAdContext } from "@/pages/ad-manager/ad-context";
import { useCampaignAction } from "@/api/ad-manager/mutations";

function useAdCampaigns() {
	const { queryString } = useAdContext();
	return useQuery({
		queryKey: ["ad-manager", "campaigns", queryString],
		queryFn: () => apiClient.get<{ campaigns: Campaign[] }>(`/api/spa/ad-manager/campaigns?_=1${queryString}`),
	});
}

interface Campaign {
	id: number; name: string; platform: string; status: string; objective: string;
	budget: number; budget_type: string; spent: number; impressions: number; clicks: number;
	conversions: number; ctr: number; cpa: number; roas: number; purchase_value: number;
	leads: number; start_date: string | null; end_date: string | null; created_at: string;
}

const STATUS_TABS = ["All", "Active", "Paused", "Draft"] as const;

export function AdCampaignsPage() {
	const { data, isLoading } = useAdCampaigns();
	const [tab, setTab] = useState<string>("All");
	const [search, setSearch] = useState("");
	const [expanded, setExpanded] = useState<number | null>(null);
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const p = (path: string) => wsHash ? `/w/${wsHash}/${path}` : `/${path}`;

	const campaigns = (data?.campaigns ?? [])
		.filter((c) => tab === "All" || c.status.toLowerCase() === tab.toLowerCase())
		.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

	const counts = { All: data?.campaigns?.length ?? 0,
		Active: data?.campaigns?.filter((c) => c.status === "active").length ?? 0,
		Paused: data?.campaigns?.filter((c) => c.status === "paused").length ?? 0,
		Draft: data?.campaigns?.filter((c) => c.status === "draft").length ?? 0 };

	return (
		<div className="space-y-5">
			<AdToolbar />
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[var(--foreground)]">Campaigns</h1>
					<p className="text-sm text-[var(--muted-foreground)]">Manage and monitor your advertising campaigns</p>
				</div>
				<Button size="sm" className="bg-[var(--sq-primary)]" asChild>
					<Link to={p("ad-manager/campaigns/new")}><Plus size={14} /><span className="ml-1.5">New Campaign</span></Link>
				</Button>
			</div>

			{/* Search + Tabs */}
			<div className="flex items-center gap-4">
				<div className="relative w-64">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
					<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns..." className="pl-9 h-9 text-sm" />
				</div>
				<div className="flex gap-1">
					{STATUS_TABS.map((t) => (
						<button key={t} onClick={() => setTab(t)}
							className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
								tab === t ? "bg-[var(--sq-primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
							}`}>
							{t} ({counts[t]})
						</button>
					))}
				</div>
			</div>

			{/* Table */}
			{isLoading ? (
				<div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
			) : campaigns.length === 0 ? (
				<Card><CardContent className="flex flex-col items-center gap-3 py-16">
					<Folders size={40} className="text-[var(--muted-foreground)]" />
					<p className="text-sm text-[var(--muted-foreground)]">No campaigns found.</p>
				</CardContent></Card>
			) : (
				<Card><CardContent className="p-0">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
								<th className="px-4 py-3 w-8" />
								<th className="px-4 py-3 font-medium">Campaign</th>
								<th className="px-3 py-3 font-medium">Status</th>
								<th className="px-3 py-3 font-medium text-right">Budget</th>
								<th className="px-3 py-3 font-medium text-right">Spent</th>
								<th className="px-3 py-3 font-medium text-right">Impr.</th>
								<th className="px-3 py-3 font-medium text-right">Clicks</th>
								<th className="px-3 py-3 font-medium text-right">CTR</th>
								<th className="px-3 py-3 font-medium text-right">Conv.</th>
								<th className="px-3 py-3 font-medium text-right">Purch. Value</th>
								<th className="px-3 py-3 font-medium text-right">Leads</th>
							</tr>
						</thead>
						<tbody>
							{campaigns.map((c) => (
								<>
								<tr key={c.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 cursor-pointer transition-colors"
									onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
									<td className="px-4 py-3">{expanded === c.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</td>
									<td className="px-4 py-3">
										<div className="flex items-center gap-2.5">
											<PlatformIcon platform={c.platform || "facebook"} size={18} />
											<span className="font-medium text-[var(--foreground)]">{c.name}</span>
										</div>
									</td>
									<td className="px-3 py-3"><StatusBadge status={c.status} /></td>
									<td className="px-3 py-3 text-right font-mono">€{Number(c.budget).toFixed(2)}</td>
									<td className="px-3 py-3 text-right font-mono">€{Number(c.spent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
									<td className="px-3 py-3 text-right">{Number(c.impressions).toLocaleString()}</td>
									<td className="px-3 py-3 text-right">{Number(c.clicks).toLocaleString()}</td>
									<td className="px-3 py-3 text-right">{Number(c.ctr ?? 0).toFixed(2)}%</td>
									<td className="px-3 py-3 text-right">{c.conversions}</td>
									<td className="px-3 py-3 text-right font-mono">€{Number(c.purchase_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
									<td className="px-3 py-3 text-right">{c.leads ?? 0}</td>
								</tr>
								{expanded === c.id && (
									<tr key={`${c.id}-detail`} className="border-b border-[var(--border)] bg-[var(--muted)]/20">
										<td colSpan={11} className="px-6 py-4">
											<ExpandedRow campaign={c} basePath={p} />
										</td>
									</tr>
								)}
								</>
							))}
						</tbody>
					</table>
				</CardContent></Card>
			)}
		</div>
	);
}

function ExpandedRow({ campaign: c, basePath }: { campaign: Campaign; basePath: (p: string) => string }) {
	const mutation = useCampaignAction();
	const [dialog, setDialog] = useState<"delete" | "pause" | "budget" | "name" | "analytics" | null>(null);
	const budgetPct = c.budget > 0 ? Math.min(100, (c.spent / c.budget) * 100) : 0;
	const cpc = c.clicks > 0 ? c.spent / c.clicks : 0;
	const convRate = c.clicks > 0 ? (c.conversions / c.clicks) * 100 : 0;
	const isPaused = c.status === "paused";

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-4 gap-6">
				<div>
					<p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Budget Utilization</p>
					<p className="text-lg font-bold text-[var(--foreground)]">{budgetPct.toFixed(0)}%</p>
					<div className="h-1.5 w-full rounded-full bg-[var(--border)] mt-1">
						<div className="h-full rounded-full bg-[var(--sq-primary)] transition-all" style={{ width: `${budgetPct}%` }} />
					</div>
				</div>
				<div>
					<p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Start Date</p>
					<p className="text-sm font-medium text-[var(--foreground)]">{c.start_date ?? "—"}</p>
				</div>
				<div>
					<p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Cost Per Click</p>
					<p className="text-sm font-medium text-[var(--foreground)]">€{cpc.toFixed(2)}</p>
				</div>
				<div>
					<p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Conv. Rate</p>
					<p className="text-sm font-medium text-[var(--foreground)]">{convRate.toFixed(2)}%</p>
				</div>
			</div>
			<div className="flex flex-wrap gap-2">
				<Button variant="outline" size="sm" asChild><Link to={basePath("ad-manager/ads")}><Eye size={13} className="mr-1" /> View Ads</Link></Button>
				<Button variant="outline" size="sm" asChild><Link to={basePath("ad-manager/ad-sets")}><Layers size={13} className="mr-1" /> View Ad Groups</Link></Button>
				<Button variant="outline" size="sm" onClick={() => setDialog("analytics")}><BarChart3 size={13} className="mr-1" /> Analytics</Button>
				<Button variant="outline" size="sm" onClick={() => setDialog("budget")}><DollarSign size={13} className="mr-1" /> Edit Budget</Button>
				<Button variant="outline" size="sm" onClick={() => setDialog("name")}><Pencil size={13} className="mr-1" /> Rename</Button>
				<Button variant="outline" size="sm" onClick={() => mutation.mutate({ action: "duplicate", id: c.id })} disabled={mutation.isPending}>
					<Copy size={13} className="mr-1" /> Duplicate
				</Button>
				<Button variant="outline" size="sm" onClick={() => setDialog("pause")}>
					{isPaused ? <><Play size={13} className="mr-1 text-emerald-600" /> Resume</> : <><Pause size={13} className="mr-1 text-amber-600" /> Pause</>}
				</Button>
				<Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDialog("delete")}>
					<Trash2 size={13} className="mr-1" /> Delete
				</Button>
			</div>

			{/* Dialogs */}
			<DeleteDialog open={dialog === "delete"} onClose={() => setDialog(null)} entityType="campaign" entityName={c.name} spent={c.spent}
				onConfirm={() => { mutation.mutate({ action: "delete", id: c.id }); setDialog(null); }} loading={mutation.isPending} />
			<PauseDialog open={dialog === "pause"} onClose={() => setDialog(null)} entityType="campaign" entityName={c.name} isPaused={isPaused}
				onConfirm={() => { mutation.mutate({ action: isPaused ? "resume" : "pause", id: c.id }); setDialog(null); }} loading={mutation.isPending} />
			<EditBudgetDialog open={dialog === "budget"} onClose={() => setDialog(null)} entityName={c.name} currentBudget={c.budget} budgetType={c.budget_type || "daily"}
				onConfirm={(amount) => { mutation.mutate({ action: "update_budget", id: c.id, budget_amount: amount }); setDialog(null); }} loading={mutation.isPending} />
			<EditNameDialog open={dialog === "name"} onClose={() => setDialog(null)} entityType="Campaign" currentName={c.name}
				onConfirm={(name) => { mutation.mutate({ action: "update_name", id: c.id, name }); setDialog(null); }} loading={mutation.isPending} />
			<CampaignAnalyticsDialog open={dialog === "analytics"} onClose={() => setDialog(null)} campaign={c} />
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
