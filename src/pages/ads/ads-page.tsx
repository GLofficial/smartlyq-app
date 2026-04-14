import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Megaphone, Search, Plus, X, Pause, Play, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAds } from "@/api/ad-manager/ads";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { AdToolbar } from "@/pages/ad-manager/ad-toolbar";
import { useAdAction2 } from "@/api/ad-manager/mutations";
import { DeleteDialog, PauseDialog } from "./ad-dialogs";
import { useSort } from "./use-sort";
import { SortableHeader } from "./sortable-header";

const FORMAT_TABS = ["All", "Image", "Video", "Carousel", "Text"] as const;

export function AdsPage() {
	const { data, isLoading } = useAds();
	const [tab, setTab] = useState<string>("All");
	const [search, setSearch] = useState("");
	const [selected, setSelected] = useState<number | null>(null);

	const filtered = (data?.ads ?? [])
		.filter((a) => tab === "All" || a.format.toLowerCase() === tab.toLowerCase())
		.filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()));
	const { sorted: ads, sortKey, sortDir, toggle: toggleSort } = useSort(filtered, "spent" as any);

	const detail = selected ? ads.find((a) => a.id === selected) : null;

	return (
		<div className="space-y-5">
			<AdToolbar />
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[var(--foreground)]">Ads</h1>
					<p className="text-sm text-[var(--muted-foreground)]">Manage individual ads across all campaigns and ad sets / ad groups.</p>
				</div>
				<Button size="sm" className="bg-[var(--sq-primary)]"><Plus size={14} /><span className="ml-1.5">Create Ad</span></Button>
			</div>

			<div className="flex items-center gap-4">
				<div className="relative w-64">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
					<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ads or campaigns..." className="pl-9 h-9 text-sm" />
				</div>
				<div className="flex gap-1">
					{FORMAT_TABS.map((t) => {
						const count = t === "All" ? (data?.ads?.length ?? 0) : (data?.ads?.filter((a) => a.format.toLowerCase() === t.toLowerCase()).length ?? 0);
						return (
							<button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
								tab === t ? "bg-[var(--sq-primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
							}`}>{t} ({count})</button>
						);
					})}
				</div>
				<span className="ml-auto text-xs text-[var(--muted-foreground)]">All Formats</span>
			</div>

			<div className="flex gap-4">
				<Card className={`flex-1 ${detail ? "max-w-[60%]" : ""}`}>
					<CardContent className="p-0">
						{isLoading ? (
							<div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
						) : ads.length === 0 ? (
							<div className="flex flex-col items-center gap-3 py-16">
								<Megaphone size={40} className="text-[var(--muted-foreground)]" />
								<p className="text-sm text-[var(--muted-foreground)]">No ads found.</p>
							</div>
						) : (
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
										<SortableHeader label="Ad" sortKey="name" currentKey={sortKey as string} currentDir={sortDir} onSort={(k) => toggleSort(k as any)} />
										<SortableHeader label="Ad Set" sortKey="ad_set_name" currentKey={sortKey as string} currentDir={sortDir} onSort={(k) => toggleSort(k as any)} />
										<SortableHeader label="Status" sortKey="status" currentKey={sortKey as string} currentDir={sortDir} onSort={(k) => toggleSort(k as any)} />
										<th className="px-3 py-3 font-medium">Format</th>
										<SortableHeader label="Spend" sortKey="spent" currentKey={sortKey as string} currentDir={sortDir} onSort={(k) => toggleSort(k as any)} align="right" />
										<SortableHeader label="Impr." sortKey="impressions" currentKey={sortKey as string} currentDir={sortDir} onSort={(k) => toggleSort(k as any)} align="right" />
										<SortableHeader label="Clicks" sortKey="clicks" currentKey={sortKey as string} currentDir={sortDir} onSort={(k) => toggleSort(k as any)} align="right" />
										<SortableHeader label="CTR" sortKey="ctr" currentKey={sortKey as string} currentDir={sortDir} onSort={(k) => toggleSort(k as any)} align="right" />
									</tr>
								</thead>
								<tbody>
									{ads.map((ad) => (
										<tr key={ad.id} className={`border-b border-[var(--border)] cursor-pointer transition-colors ${
											selected === ad.id ? "bg-[var(--sq-primary)]/5" : "hover:bg-[var(--muted)]/30"
										}`} onClick={() => setSelected(selected === ad.id ? null : ad.id)}>
											<td className="px-4 py-3">
												<div className="flex items-center gap-2">
													<PlatformIcon platform={(ad as any).platform || "facebook"} size={16} />
													<span className="font-medium text-[var(--foreground)]">{ad.name}</span>
												</div>
											</td>
											<td className="px-3 py-3 text-[var(--muted-foreground)]">{ad.ad_set_name}</td>
											<td className="px-3 py-3"><StatusBadge status={ad.status} /></td>
											<td className="px-3 py-3"><span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs capitalize">{ad.format}</span></td>
											<td className="px-3 py-3 text-right font-mono">€{Number(ad.spent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
											<td className="px-3 py-3 text-right">{Number(ad.impressions).toLocaleString()}</td>
											<td className="px-3 py-3 text-right">{Number(ad.clicks).toLocaleString()}</td>
											<td className="px-3 py-3 text-right font-medium">{Number(ad.ctr).toFixed(2)}%</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</CardContent>
				</Card>

				{detail && (
					<Card className="w-[40%] sticky top-6 self-start">
						<div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
							<h3 className="text-sm font-semibold">Ad Preview</h3>
							<button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-[var(--muted)]"><X size={14} /></button>
						</div>
						<CardContent className="py-4 space-y-3">
							<p className="text-sm font-medium text-[var(--foreground)]">{detail.name}</p>
							<div className="flex gap-2">
								<StatusBadge status={detail.status} />
								<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs capitalize">{detail.format}</span>
							</div>
							<div className="space-y-2 mt-3">
								<DetailRow label="Ad Set">{detail.ad_set_name}</DetailRow>
								<DetailRow label="Headline">{(detail as any).headline || "—"}</DetailRow>
								<DetailRow label="Spend">€{Number(detail.spent).toFixed(2)}</DetailRow>
								<DetailRow label="Impressions">{Number(detail.impressions).toLocaleString()}</DetailRow>
								<DetailRow label="Clicks">{Number(detail.clicks).toLocaleString()}</DetailRow>
								<DetailRow label="CTR">{Number(detail.ctr).toFixed(2)}%</DetailRow>
								<DetailRow label="Conversions">{(detail as any).conversions ?? 0}</DetailRow>
							</div>
							<AdActions id={detail.id} status={detail.status} name={detail.name} />
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

function AdActions({ id, status, name }: { id: number; status: string; name: string }) {
	const mutation = useAdAction2();
	const [dialog, setDialog] = useState<"delete" | "pause" | null>(null);
	const isPaused = status === "paused";
	return (
		<div className="flex gap-2 pt-3 border-t border-[var(--border)] mt-2">
			<Button variant="outline" size="sm" onClick={() => setDialog("pause")}>
				{isPaused ? <><Play size={13} className="mr-1 text-emerald-600" /> Resume</> : <><Pause size={13} className="mr-1 text-amber-600" /> Pause</>}
			</Button>
			<Button variant="outline" size="sm" onClick={() => mutation.mutate({ action: "duplicate", id })} disabled={mutation.isPending}>
				<Copy size={13} className="mr-1" /> Duplicate
			</Button>
			<Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDialog("delete")}>
				<Trash2 size={13} className="mr-1" /> Delete
			</Button>
			<DeleteDialog open={dialog === "delete"} onClose={() => setDialog(null)} entityType="ad" entityName={name}
				onConfirm={() => { mutation.mutate({ action: "delete", id }); setDialog(null); }} loading={mutation.isPending} />
			<PauseDialog open={dialog === "pause"} onClose={() => setDialog(null)} entityType="ad" entityName={name} isPaused={isPaused}
				onConfirm={() => { mutation.mutate({ action: isPaused ? "resume" : "pause", id }); setDialog(null); }} loading={mutation.isPending} />
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const s: Record<string, string> = {
		active: "bg-emerald-100 text-emerald-700", paused: "bg-amber-100 text-amber-700",
		rejected: "bg-red-100 text-red-700", draft: "bg-blue-100 text-blue-700",
		archived: "bg-gray-100 text-gray-600", error: "bg-red-100 text-red-700",
	};
	return (
		<span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${s[status] ?? s.draft}`}>
			<span className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : status === "paused" ? "bg-amber-500" : "bg-gray-400"}`} />
			{status.replace("_", " ")}
		</span>
	);
}
