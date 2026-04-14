import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Search, Plus, Users, Globe, RotateCcw, UserPlus, RefreshCw, Download } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { AdToolbar } from "@/pages/ad-manager/ad-toolbar";
import { PlatformIcon } from "@/pages/social/platform-icon";

function useAdAudiences() {
	return useQuery({
		queryKey: ["ad-manager", "audiences"],
		queryFn: () => apiClient.get<{ audiences: Audience[] }>("/api/spa/ad-manager/audiences"),
	});
}

interface Audience {
	id: number; name: string; platform: string; type: string; size: number;
	status: string; source: string; description: string; created_at: string;
}

const AUDIENCE_TYPES = [
	{ type: "custom", label: "Custom Audience", desc: "Customer list", icon: Users, platform: "Meta", color: "bg-blue-50 text-blue-700" },
	{ type: "retargeting", label: "Website Traffic", desc: "Retarget visitors", icon: Globe, platform: "Meta", color: "bg-purple-50 text-purple-700" },
	{ type: "lookalike", label: "Lookalike Audience", desc: "Similar people", icon: UserPlus, platform: "Meta", color: "bg-green-50 text-green-700" },
	{ type: "remarketing", label: "Remarketing List", desc: "Website visitors", icon: RotateCcw, platform: "Google", color: "bg-amber-50 text-amber-700" },
] as const;

const PLATFORM_TABS = ["All", "Meta", "Google"] as const;

export function AdAudiencesPage() {
	const { data, isLoading, refetch } = useAdAudiences();
	const [tab, setTab] = useState<string>("All");
	const [search, setSearch] = useState("");

	const audiences = (data?.audiences ?? [])
		.filter((a) => tab === "All" || a.platform.toLowerCase().includes(tab.toLowerCase()))
		.filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()));

	return (
		<div className="space-y-5">
			<AdToolbar />
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[var(--foreground)]">Audiences</h1>
					<p className="text-sm text-[var(--muted-foreground)]">Create and manage your advertising audiences</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw size={14} /><span className="ml-1.5">Refresh</span></Button>
					<Button variant="outline" size="sm"><Download size={14} /><span className="ml-1.5">Export</span></Button>
					<Button size="sm" className="bg-[var(--sq-primary)]"><Plus size={14} /><span className="ml-1.5">Create Audience</span></Button>
				</div>
			</div>

			{/* Type Cards */}
			<div className="flex gap-2">
				{PLATFORM_TABS.map((t) => (
					<button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
						tab === t ? "bg-[var(--sq-primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
					}`}>{t}</button>
				))}
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{AUDIENCE_TYPES.map((at) => (
					<Card key={at.type} className="cursor-pointer hover:shadow-md transition-shadow">
						<CardContent className="flex items-start gap-4 p-5">
							<div className={`flex h-10 w-10 items-center justify-center rounded-lg ${at.color.split(" ")[0]}`}>
								<at.icon size={20} className={at.color.split(" ")[1]} />
							</div>
							<div className="flex-1">
								<p className="text-sm font-semibold text-[var(--foreground)]">{at.label}</p>
								<div className="flex items-center gap-2 mt-0.5">
									<span className="text-xs text-[var(--muted-foreground)]">{at.desc}</span>
									<span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${at.platform === "Meta" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{at.platform}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Search */}
			<div className="relative w-72">
				<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
				<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audiences..." className="pl-9 h-9 text-sm" />
			</div>

			{/* Table */}
			{isLoading ? (
				<div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
			) : audiences.length === 0 ? (
				<Card><CardContent className="flex flex-col items-center gap-3 py-16">
					<Target size={40} className="text-[var(--muted-foreground)]" />
					<p className="text-sm text-[var(--muted-foreground)]">No audiences found.</p>
				</CardContent></Card>
			) : (
				<Card><CardContent className="p-0">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
								<th className="px-4 py-3 font-medium">Audience</th>
								<th className="px-3 py-3 font-medium">Type</th>
								<th className="px-3 py-3 font-medium">Platform</th>
								<th className="px-3 py-3 font-medium text-right">Size</th>
								<th className="px-3 py-3 font-medium">Status</th>
								<th className="px-3 py-3 font-medium text-right">Created</th>
							</tr>
						</thead>
						<tbody>
							{audiences.map((a) => (
								<tr key={a.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors">
									<td className="px-4 py-3 font-medium text-[var(--foreground)]">{a.name}</td>
									<td className="px-3 py-3">
										<span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
											a.type === "lookalike" ? "bg-purple-100 text-purple-700" :
											a.type === "custom" ? "bg-blue-100 text-blue-700" :
											"bg-amber-100 text-amber-700"
										}`}>{a.type}</span>
									</td>
									<td className="px-3 py-3"><PlatformIcon platform={a.platform === "meta" ? "facebook" : a.platform} size={18} /></td>
									<td className="px-3 py-3 text-right font-mono">{Number(a.size).toLocaleString()}</td>
									<td className="px-3 py-3">
										<span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
											a.status === "ready" ? "bg-emerald-100 text-emerald-700" :
											a.status === "processing" ? "bg-blue-100 text-blue-700" :
											"bg-gray-100 text-gray-600"
										}`}>{a.status}</span>
									</td>
									<td className="px-3 py-3 text-right text-xs text-[var(--muted-foreground)]">{new Date(a.created_at).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</CardContent></Card>
			)}
		</div>
	);
}
