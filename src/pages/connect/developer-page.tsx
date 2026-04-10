import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code2, Key, Shield, Webhook, Plus, Trash2, Wallet } from "lucide-react";
import { useDeveloperKeys, useDeveloperOverview, useDeveloperWebhooks, useWebhookSave, useWebhookDelete } from "@/api/developer";
import { toast } from "sonner";

export function DeveloperPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Developer</h1>
			<OverviewCard />
			<ApiKeysCard />
			<WebhooksCard />
			<Card>
				<CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Code2 size={18} /> API Documentation</CardTitle></CardHeader>
				<CardContent>
					<p className="text-sm text-[var(--muted-foreground)]">
						Base URL: <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs">{window.location.origin}/api/v1</code>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

function OverviewCard() {
	const { data } = useDeveloperOverview();
	return (
		<div className="grid gap-4 sm:grid-cols-3">
			<Card><CardContent className="flex items-center gap-3 p-4"><Key size={20} className="text-[var(--sq-primary)]" /><div><p className="text-lg font-bold">{data?.active_keys ?? 0}</p><p className="text-xs text-[var(--muted-foreground)]">Active Keys</p></div></CardContent></Card>
			<Card><CardContent className="flex items-center gap-3 p-4"><Wallet size={20} className="text-green-600" /><div><p className="text-lg font-bold">{(data?.balance ?? 0).toFixed(2)}</p><p className="text-xs text-[var(--muted-foreground)]">Balance</p></div></CardContent></Card>
			<Card><CardContent className="flex items-center gap-3 p-4"><Wallet size={20} className="text-blue-600" /><div><p className="text-lg font-bold">{(data?.monthly_balance ?? 0).toFixed(2)}</p><p className="text-xs text-[var(--muted-foreground)]">Monthly Allowance</p></div></CardContent></Card>
		</div>
	);
}

function ApiKeysCard() {
	const { data, isLoading } = useDeveloperKeys();
	return (
		<Card>
			<CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Key size={18} /> API Keys</CardTitle></CardHeader>
			<CardContent>
				{isLoading ? <Spinner /> : !(data?.api_keys ?? []).length ? (
					<p className="text-sm text-[var(--muted-foreground)]">No API keys. Create one from your Account page.</p>
				) : (
					<div className="space-y-2">
						{data?.api_keys.map((k) => (
							<div key={k.id} className="flex items-center gap-3 rounded-md border border-[var(--border)] p-3">
								<Shield size={16} className={k.status === "active" ? "text-green-500" : "text-gray-400"} />
								<div className="min-w-0 flex-1">
									<p className="font-medium text-sm">{k.name}</p>
									<p className="text-xs text-[var(--muted-foreground)]">{k.key_prefix}... · {k.rate_limit} req/min</p>
								</div>
								<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${k.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{k.status}</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function WebhooksCard() {
	const { data, isLoading } = useDeveloperWebhooks();
	const saveMut = useWebhookSave();
	const deleteMut = useWebhookDelete();
	const [showAdd, setShowAdd] = useState(false);
	const [url, setUrl] = useState("");
	const [events, setEvents] = useState("");

	const handleSave = () => {
		if (!url.trim()) { toast.error("URL required"); return; }
		saveMut.mutate({ url: url.trim(), events: events.trim() }, {
			onSuccess: () => { toast.success("Webhook created."); setShowAdd(false); setUrl(""); setEvents(""); },
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Failed"),
		});
	};

	const handleDelete = (id: number) => {
		if (!confirm("Delete this webhook?")) return;
		deleteMut.mutate(id, { onSuccess: () => toast.success("Deleted."), onError: () => toast.error("Failed.") });
	};

	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between">
				<CardTitle className="flex items-center gap-2 text-lg"><Webhook size={18} /> Webhooks</CardTitle>
				<Button size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}><Plus size={14} /> Add Webhook</Button>
			</CardHeader>
			<CardContent className="space-y-3">
				{showAdd && (
					<div className="space-y-2 rounded border border-[var(--border)] p-3">
						<Input placeholder="https://your-server.com/webhook" value={url} onChange={(e) => setUrl(e.target.value)} />
						<Input placeholder="Events (comma-separated, e.g. post.published,subscription.created)" value={events} onChange={(e) => setEvents(e.target.value)} />
						<div className="flex gap-2">
							<Button size="sm" onClick={handleSave} disabled={saveMut.isPending}>{saveMut.isPending ? "..." : "Save"}</Button>
							<Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
						</div>
					</div>
				)}
				{isLoading ? <Spinner /> : !(data?.webhooks ?? []).length ? (
					<p className="text-sm text-[var(--muted-foreground)]">No webhooks configured.</p>
				) : (
					<div className="space-y-2">
						{data!.webhooks.map((w) => (
							<div key={w.id} className="flex items-center justify-between rounded border border-[var(--border)] px-3 py-2">
								<div>
									<p className="text-sm font-medium truncate">{w.url}</p>
									<p className="text-xs text-[var(--muted-foreground)]">{w.events || "All events"} · {w.status}</p>
								</div>
								<Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(w.id)}><Trash2 size={14} /></Button>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function Spinner() { return <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
