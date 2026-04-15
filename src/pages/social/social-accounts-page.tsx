import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { useSocialAccountsFull, useSyncAccount, useSyncAll, useDisconnectAccount, useReconnectAccount, useStartOAuth, type SocialAccount } from "@/api/social-accounts";
import { PlatformIcon } from "./platform-icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const PLATFORMS = [
	{ id: "facebook", label: "Facebook", desc: "Connect your Facebook pages for content posting and analytics.", features: ["Post Creation", "Analytics", "Scheduling"] },
	{ id: "instagram", label: "Instagram", desc: "Connect your Instagram business account for content creation and insights.", features: ["Post Creation", "Stories", "Analytics"], dual: true },
	{ id: "twitter", label: "X (Twitter)", desc: "Connect your X account for tweet scheduling and engagement tracking.", features: ["Tweet Creation", "Threads", "Analytics"] },
	{ id: "linkedin", label: "LinkedIn", desc: "Connect your LinkedIn account for B2B content and analytics.", features: ["Post Creation", "Articles", "Analytics"] },
	{ id: "youtube", label: "YouTube", desc: "Connect your YouTube channel for video management and analytics.", features: ["Video Management", "Analytics", "Comments"] },
	{ id: "tiktok", label: "TikTok", desc: "Connect your TikTok account for short-form video creation and insights.", features: ["Video Creation", "Trending", "Analytics"] },
	{ id: "gmb", label: "Google My Business", desc: "Connect your Google Business Profile to publish updates and manage locations.", features: ["Local Posts", "Updates", "Locations"] },
	{ id: "pinterest", label: "Pinterest", desc: "Connect your Pinterest account to create pins and manage boards.", features: ["Pin Creation", "Boards", "Scheduling"] },
	{ id: "reddit", label: "Reddit", desc: "Connect your Reddit account for subreddit posting and scheduling.", features: ["Post Creation", "Subreddits", "Scheduling"] },
	{ id: "tumblr", label: "Tumblr", desc: "Connect your Tumblr account for creative social media publishing.", features: ["Post Creation", "Images", "Scheduling"] },
	{ id: "bluesky", label: "Bluesky", desc: "Connect your Bluesky account for posts and media content.", features: ["Post Creation", "Images", "Scheduling"] },
	{ id: "threads", label: "Threads", desc: "Connect your Threads account for text, image, video and carousel posts.", features: ["Text Posts", "Images", "Videos"] },
] as const;

export function SocialAccountsPage() {
	const { data, isLoading } = useSocialAccountsFull();
	const syncAll = useSyncAll();
	const accounts = data?.accounts ?? [];
	const activeIds = accounts.filter((a) => a.is_active === 1).map((a) => a.id);
	const [disconnectId, setDisconnectId] = useState<SocialAccount | null>(null);
	const disconnect = useDisconnectAccount();
	const reconnect = useReconnectAccount();
	const syncOne = useSyncAccount();
	const startOAuth = useStartOAuth();
	const [igModal, setIgModal] = useState(false);

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[var(--foreground)]">Social Media — Account Management</h1>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => syncAll.mutate(activeIds)} disabled={syncAll.isPending || activeIds.length === 0}>
						<RefreshCw size={14} className={syncAll.isPending ? "animate-spin" : ""} />
						<span className="ml-1.5">Sync All</span>
					</Button>
					<Button variant="outline" size="sm" onClick={() => syncAll.mutate(activeIds)} disabled={syncAll.isPending}>
						Sync Profile Info Only
					</Button>
				</div>
			</div>

			{/* Connected Accounts Table */}
			<div>
				<h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Connected Accounts</h2>
				<Card><CardContent className="p-0">
					{isLoading ? (
						<div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>
					) : accounts.length === 0 ? (
						<div className="flex flex-col items-center gap-3 py-12 text-center">
							<p className="text-sm text-[var(--muted-foreground)]">No social accounts connected yet.</p>
							<p className="text-xs text-[var(--muted-foreground)]">Connect your first account below to get started.</p>
						</div>
					) : (
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
									<th className="px-4 py-3 font-medium w-12">ID</th>
									<th className="px-4 py-3 font-medium">Social Account</th>
									<th className="px-3 py-3 font-medium">Type</th>
									<th className="px-3 py-3 font-medium">Status</th>
									<th className="px-3 py-3 font-medium">Validity</th>
									<th className="px-3 py-3 font-medium">Last Connected By</th>
									<th className="px-3 py-3 font-medium text-right">Actions</th>
								</tr>
							</thead>
							<tbody>
								{accounts.map((a) => (
									<tr key={a.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
										<td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">{a.id}</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												{a.profile_picture ? (
													<div className="relative">
														<img src={a.profile_picture} alt="" className="h-8 w-8 rounded-full object-cover" />
														<div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white flex items-center justify-center shadow-sm">
															<PlatformIcon platform={a.platform} size={10} />
														</div>
													</div>
												) : (
													<div className="h-8 w-8 rounded-full bg-[var(--muted)] flex items-center justify-center">
														<PlatformIcon platform={a.platform} size={16} />
													</div>
												)}
												<span className="font-medium text-[var(--foreground)]">{a.account_name || a.account_username}</span>
											</div>
										</td>
										<td className="px-3 py-3 text-xs text-[var(--muted-foreground)] capitalize">{a.account_type || "—"}</td>
										<td className="px-3 py-3"><StatusBadge label={a.status_label} /></td>
										<td className="px-3 py-3 text-xs text-[var(--muted-foreground)]">
											{a.needs_reconnect ? (
												<button onClick={() => reconnect.mutate(a.id)} className="text-red-500 font-medium hover:underline">
													↻ Reconnect
												</button>
											) : a.validity || "—"}
										</td>
										<td className="px-3 py-3 text-xs text-[var(--muted-foreground)]">{a.connected_by}</td>
										<td className="px-3 py-3 text-right">
											<div className="flex items-center justify-end gap-1">
												{a.needs_reconnect && (
													<Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => reconnect.mutate(a.id)} title="Reconnect">
														<RotateCcw size={14} className="text-amber-600" />
													</Button>
												)}
												<Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => syncOne.mutate(a.id)} disabled={syncOne.isPending} title="Sync">
													<RefreshCw size={14} className={syncOne.isPending ? "animate-spin" : ""} />
												</Button>
												<Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => setDisconnectId(a)} title="Remove">
													<Trash2 size={14} />
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</CardContent></Card>
			</div>

			{/* Connect New Account */}
			<div>
				<h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">Connect New Account</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{PLATFORMS.map((p) => (
						<Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer"
							onClick={() => {
								if (p.id === "instagram") { setIgModal(true); return; }
								startOAuth.mutate({ platform: p.id });
							}}>
							<CardContent className="p-5">
								<div className="flex items-start gap-4">
									<div className="h-12 w-12 rounded-xl bg-[var(--muted)] flex items-center justify-center shrink-0">
										<PlatformIcon platform={p.id} size={24} />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-[var(--foreground)]">{p.label}</p>
										<p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">{p.desc}</p>
										<div className="flex flex-wrap gap-1 mt-2">
											{p.features.map((f) => (
												<span key={f} className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)]">{f}</span>
											))}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* Disconnect Confirmation */}
			<Dialog open={!!disconnectId} onOpenChange={() => setDisconnectId(null)}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100"><Trash2 size={20} className="text-red-600" /></div>
							<div><DialogTitle>Remove Account?</DialogTitle><DialogDescription>This will permanently disconnect this social account.</DialogDescription></div>
						</div>
					</DialogHeader>
					{disconnectId && (
						<div className="py-3">
							<div className="flex items-center gap-3 rounded-lg bg-[var(--muted)] p-3">
								<PlatformIcon platform={disconnectId.platform} size={20} />
								<div>
									<p className="text-sm font-medium">{disconnectId.account_name}</p>
									<p className="text-xs text-[var(--muted-foreground)]">{disconnectId.platform} · {disconnectId.account_username}</p>
								</div>
							</div>
							<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 mt-3">
								<AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
								<p className="text-xs text-red-700">This will remove all analytics data, comments, and inbox conversations for this account.</p>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setDisconnectId(null)}>Cancel</Button>
						<Button variant="destructive" onClick={() => { disconnect.mutate(disconnectId!.id); setDisconnectId(null); }} disabled={disconnect.isPending}>Remove</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Instagram Connection Method Modal */}
			<Dialog open={igModal} onOpenChange={setIgModal}>
				<DialogContent className="max-w-md">
					<DialogHeader><DialogTitle>Connect Instagram</DialogTitle><DialogDescription>Choose your connection method.</DialogDescription></DialogHeader>
					<div className="space-y-3 py-3">
						<button onClick={() => { setIgModal(false); startOAuth.mutate({ platform: "instagram", connection_method: "facebook" }); }}
							className="w-full rounded-lg border border-[var(--border)] p-4 text-left hover:border-[var(--sq-primary)] transition-colors">
							<p className="text-sm font-semibold text-[var(--foreground)]">Via Facebook Page</p>
							<p className="text-xs text-[var(--muted-foreground)] mt-1">Requires Business/Creator account linked to a Facebook Page. Full features including Stories and Reels.</p>
						</button>
						<button onClick={() => { setIgModal(false); startOAuth.mutate({ platform: "instagram", connection_method: "direct" }); }}
							className="w-full rounded-lg border border-[var(--border)] p-4 text-left hover:border-[var(--sq-primary)] transition-colors">
							<p className="text-sm font-semibold text-[var(--foreground)]">Via Instagram Direct</p>
							<p className="text-xs text-[var(--muted-foreground)] mt-1">Login with Instagram credentials directly. Business/Creator account required.</p>
						</button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function StatusBadge({ label }: { label: string }) {
	const styles: Record<string, string> = {
		"Connected": "bg-emerald-100 text-emerald-700",
		"Disconnected": "bg-gray-100 text-gray-600",
		"Needs Reconnect": "bg-red-100 text-red-700",
		"Expiring Soon": "bg-amber-100 text-amber-700",
	};
	return (
		<span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[label] ?? "bg-gray-100 text-gray-600"}`}>
			<span className={`h-1.5 w-1.5 rounded-full ${
				label === "Connected" ? "bg-emerald-500" : label === "Needs Reconnect" ? "bg-red-500" : label === "Expiring Soon" ? "bg-amber-500" : "bg-gray-400"
			}`} />
			{label}
		</span>
	);
}
