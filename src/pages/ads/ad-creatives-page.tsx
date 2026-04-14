import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Search, Upload, FileText } from "lucide-react";
import { AdToolbar } from "@/pages/ad-manager/ad-toolbar";
import { apiClient } from "@/lib/api-client";
import { UploadCreativeDialog } from "./ad-dialogs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function useAdCreatives() {
	return useQuery({
		queryKey: ["ad-manager", "creatives"],
		queryFn: () => apiClient.get<{ creatives: Creative[] }>("/api/spa/ad-manager/creatives"),
	});
}

interface Creative {
	id: number; name: string; format: string; platform: string; status: string;
	preview_url: string | null; impressions: number; clicks: number; ctr: number;
	conversions: number; created_at: string;
}

const FORMAT_TABS = ["All", "Image", "Video", "Carousel"] as const;

export function AdCreativesPage() {
	const { data, isLoading } = useAdCreatives();
	const [tab, setTab] = useState<string>("All");
	const [search, setSearch] = useState("");
	const [showUpload, setShowUpload] = useState(false);
	const qc = useQueryClient();
	const uploadMutation = useMutation({
		mutationFn: (body: Record<string, unknown>) => apiClient.post<{ created?: boolean }>("/api/spa/ad-manager/creatives", { action: "create", ...body }),
		onSuccess: () => { toast.success("Creative uploaded"); qc.invalidateQueries({ queryKey: ["ad-manager", "creatives"] }); setShowUpload(false); },
		onError: (e: Error) => toast.error(e.message),
	});

	const creatives = (data?.creatives ?? [])
		.filter((c) => tab === "All" || c.format.toLowerCase() === tab.toLowerCase())
		.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

	return (
		<div className="space-y-5">
			<AdToolbar />
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[var(--foreground)]">Creatives</h1>
					<p className="text-sm text-[var(--muted-foreground)]">Manage your ad creatives across all platforms</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm"><FileText size={14} /><span className="ml-1.5">Size Guide</span></Button>
					<Button size="sm" className="bg-[var(--sq-primary)]" onClick={() => setShowUpload(true)}><Upload size={14} /><span className="ml-1.5">Upload Creative</span></Button>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<div className="relative w-64">
					<Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
					<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search creatives..." className="pl-9 h-9 text-sm" />
				</div>
				<div className="flex gap-1">
					{FORMAT_TABS.map((t) => (
						<button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
							tab === t ? "bg-[var(--sq-primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
						}`}>{t}</button>
					))}
				</div>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
			) : creatives.length === 0 ? (
				<Card><CardContent className="flex flex-col items-center gap-3 py-16">
					<Image size={40} className="text-[var(--muted-foreground)]" />
					<p className="text-lg font-medium text-[var(--foreground)]">No creatives found</p>
					<p className="text-sm text-[var(--muted-foreground)]">Upload your first creative or adjust your filters.</p>
				</CardContent></Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{creatives.map((c) => (
						<Card key={c.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
							{c.preview_url ? (
								<div className="aspect-video bg-[var(--muted)] overflow-hidden">
									<img src={c.preview_url} alt={c.name} className="h-full w-full object-cover" />
								</div>
							) : (
								<div className="aspect-video bg-[var(--muted)] flex items-center justify-center">
									<Image size={32} className="text-[var(--muted-foreground)]" />
								</div>
							)}
							<CardContent className="p-4 space-y-2">
								<p className="text-sm font-semibold text-[var(--foreground)] truncate">{c.name}</p>
								<div className="flex items-center gap-2">
									<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-[11px] capitalize">{c.format}</span>
									<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-[11px] capitalize">{c.platform}</span>
									<StatusBadge status={c.status} />
								</div>
								{(c.impressions > 0 || c.clicks > 0) && (
									<div className="flex gap-3 text-[11px] text-[var(--muted-foreground)] pt-1">
										<span>{Number(c.impressions).toLocaleString()} impr</span>
										<span>{Number(c.clicks).toLocaleString()} clicks</span>
										<span>{Number(c.ctr).toFixed(2)}% CTR</span>
									</div>
								)}
								<p className="text-[11px] text-[var(--muted-foreground)]">{new Date(c.created_at).toLocaleDateString()}</p>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<UploadCreativeDialog open={showUpload} onClose={() => setShowUpload(false)}
				onConfirm={(d) => uploadMutation.mutate(d)} loading={uploadMutation.isPending} />
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const s: Record<string, string> = {
		active: "bg-emerald-100 text-emerald-700", draft: "bg-gray-100 text-gray-600",
		archived: "bg-amber-100 text-amber-700",
	};
	return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${s[status] ?? s.draft}`}>{status}</span>;
}
