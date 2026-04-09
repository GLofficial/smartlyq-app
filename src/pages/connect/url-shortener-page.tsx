import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Plus, Copy, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useShortUrls, useCreateShortUrl } from "@/api/url-shortener";
import { toast } from "sonner";

export function UrlShortenerPage() {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useShortUrls(page);
	const createMutation = useCreateShortUrl();
	const [url, setUrl] = useState("");

	const handleCreate = () => {
		if (!url.trim()) { toast.error("Enter a URL."); return; }
		createMutation.mutate(url, {
			onSuccess: (d) => { toast.success(d.message); setUrl(""); },
			onError: (e) => toast.error((e as { message?: string })?.message ?? "Failed."),
		});
	};

	const copyLink = (code: string) => {
		navigator.clipboard.writeText(`${window.location.origin}/l/${code}`);
		toast.success("Copied to clipboard!");
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">URL Shortener</h1>

			<Card>
				<CardHeader className="pb-2"><CardTitle className="text-base">Shorten URL</CardTitle></CardHeader>
				<CardContent>
					<div className="flex gap-3">
						<Input placeholder="https://example.com/long-url" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
						<Button onClick={handleCreate} disabled={createMutation.isPending}>
							<Plus size={16} /> Shorten
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle className="text-lg">Your Links ({data?.total ?? 0})</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-20 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !(data?.urls ?? []).length ? (
						<div className="flex flex-col items-center gap-2 py-8">
							<Link2 size={32} className="text-[var(--muted-foreground)]" />
							<p className="text-sm text-[var(--muted-foreground)]">No shortened URLs yet.</p>
						</div>
					) : (
						<div className="space-y-2">
							{data?.urls.map((u) => (
								<div key={u.id} className="flex items-center gap-3 rounded-md border border-[var(--border)] p-3">
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-[var(--sq-primary)]">{window.location.origin}/l/{u.code}</p>
										<p className="truncate text-xs text-[var(--muted-foreground)]">{u.original_url}</p>
									</div>
									<span className="text-sm font-medium">{u.clicks} clicks</span>
									<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyLink(u.code)}><Copy size={14} /></Button>
									<a href={u.original_url} target="_blank" rel="noopener noreferrer">
										<Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink size={14} /></Button>
									</a>
								</div>
							))}
						</div>
					)}
					{data && data?.pages > 1 && (
						<div className="mt-4 flex items-center justify-between">
							<p className="text-sm text-[var(--muted-foreground)]">Page {data?.page} of {data?.pages}</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></Button>
								<Button variant="outline" size="sm" disabled={page >= data?.pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
