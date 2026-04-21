import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { RefreshCw, ArrowLeft, AlertTriangle, Pencil, Loader2, CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { toast } from "sonner";
import {
	useFbLeadPages, useFbLeadForms, useFbLeadEnable, useFbLeadDisable,
	useFbLeadRun, useFbLeadEvents, type FbLeadPage, type FbLeadForm,
} from "@/api/crm-lead-sync";
import { useWorkspacePath } from "@/hooks/use-workspace-path";
import { FbLeadMappingModal } from "./crm-lead-sync-mapping-modal";

export function CrmLeadSyncPage() {
	const wp = useWorkspacePath();
	const pagesQ = useFbLeadPages();
	const runMut = useFbLeadRun();
	const [mappingFor, setMappingFor] = useState<{ formPk: number; formName: string } | null>(null);
	const eventsQ = useFbLeadEvents(50);

	const pages = pagesQ.data?.pages ?? [];

	async function handleRun() {
		try {
			const r = await runMut.mutateAsync();
			const s = r.stats;
			toast.success(`Sync done — ${s.new} new, ${s.leads_seen} seen, ${s.errors} errors`);
		} catch (e) {
			toast.error((e as Error)?.message ?? "Sync failed");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between flex-wrap gap-3">
				<div>
					<Link to={wp("integrations")} className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-1">
						<ArrowLeft size={12} /> Back to Integrations
					</Link>
					<h1 className="text-2xl font-bold">Facebook Lead Ads → CRM</h1>
					<p className="text-sm text-[var(--muted-foreground)]">
						New leads from your Facebook Lead Ads forms land directly in your CRM contacts.
					</p>
				</div>
				<Button onClick={handleRun} disabled={runMut.isPending} className="gap-1.5 bg-[var(--card)] shadow-sm" variant="outline" size="sm">
					<RefreshCw size={14} className={runMut.isPending ? "animate-spin" : ""} /> Sync now
				</Button>
			</div>

			{/* Pages */}
			{pagesQ.isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : pages.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-16 text-center">
						<PlatformIcon platform="facebook" size={40} />
						<p className="text-[var(--muted-foreground)]">No Facebook pages connected yet.</p>
						<Link to={wp("integrations")} className="text-sm text-[var(--sq-primary)] hover:underline">
							Go to Integrations to connect Facebook
						</Link>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{pages.map((p) => (
						<PageCard key={p.page_id} page={p} onMapForm={(pk, name) => setMappingFor({ formPk: pk, formName: name })} />
					))}
				</div>
			)}

			{/* Events */}
			<Card>
				<CardContent className="p-0">
					<div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
						<h2 className="text-sm font-semibold">Recent lead events</h2>
						<span className="text-xs text-[var(--muted-foreground)]">Auto-refreshes every 30s</span>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-[var(--muted)]/30">
								<tr className="border-b border-[var(--border)]">
									<Th>Time</Th>
									<Th>Form</Th>
									<Th>Contact</Th>
									<Th>Status</Th>
								</tr>
							</thead>
							<tbody>
								{(eventsQ.data?.events ?? []).map((e) => (
									<tr key={e.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/20">
										<td className="px-4 py-2.5 text-[11px] text-[var(--muted-foreground)] font-mono">{e.created_at}</td>
										<td className="px-4 py-2.5"><p className="font-medium truncate max-w-[240px]">{e.form_name || e.form_id}</p></td>
										<td className="px-4 py-2.5">
											{e.contact_id ? (
												<span>{e.contact_name || e.contact_email || `#${e.contact_id}`}</span>
											) : <span className="text-[var(--muted-foreground)]">—</span>}
										</td>
										<td className="px-4 py-2.5"><StatusPill status={e.status} error={e.error_message} /></td>
									</tr>
								))}
								{(eventsQ.data?.events ?? []).length === 0 && (
									<tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
										No events yet. Enable a form above, then submit a test lead from Facebook&apos;s Lead Ads Testing Tool.
									</td></tr>
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{mappingFor && (
				<FbLeadMappingModal open onClose={() => setMappingFor(null)}
					formPk={mappingFor.formPk} formName={mappingFor.formName} />
			)}
		</div>
	);
}

function PageCard({ page, onMapForm }: { page: FbLeadPage; onMapForm: (formPk: number, formName: string) => void }) {
	const formsQ = useFbLeadForms(page.page_id, page.has_lead_retrieval);
	const enableMut = useFbLeadEnable();
	const disableMut = useFbLeadDisable();

	async function toggleForm(f: FbLeadForm) {
		try {
			if (f.enabled) {
				await disableMut.mutateAsync({ form_id: f.form_id });
				toast.success("Sync disabled");
			} else {
				const r = await enableMut.mutateAsync({ page_id: page.page_id, page_name: page.page_name, form_id: f.form_id, form_name: f.form_name });
				toast.success("Sync enabled");
				// Offer mapping immediately
				if (r.form_pk > 0) onMapForm(r.form_pk, f.form_name);
			}
		} catch (e) {
			toast.error((e as Error)?.message ?? "Failed");
		}
	}

	return (
		<Card>
			<CardContent className="p-5 space-y-3">
				<div className="flex items-center gap-3">
					{page.profile_picture ? (
						<img src={page.profile_picture} alt="" className="h-10 w-10 rounded-lg object-cover" />
					) : (
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50"><PlatformIcon platform="facebook" size={20} /></div>
					)}
					<div className="min-w-0 flex-1">
						<p className="font-semibold truncate">{page.page_name}</p>
						<p className="text-xs text-[var(--muted-foreground)] truncate">Page ID: {page.page_id}</p>
					</div>
					{!page.has_lead_retrieval && (
						<a href="/facebook/login" target="_blank" rel="noreferrer">
							<Button variant="outline" size="sm" className="gap-1.5 shrink-0 bg-amber-50 border-amber-300 text-amber-700">
								<AlertTriangle size={14} /> Reconnect for Lead Ads
							</Button>
						</a>
					)}
				</div>

				{page.has_lead_retrieval && (
					<div className="rounded-lg border border-[var(--border)] overflow-hidden">
						{formsQ.isLoading ? (
							<div className="flex items-center justify-center py-6"><Loader2 size={16} className="animate-spin text-[var(--muted-foreground)]" /></div>
						) : (formsQ.data?.forms ?? []).length === 0 ? (
							<p className="px-4 py-6 text-sm text-[var(--muted-foreground)] text-center">No lead forms on this page yet.</p>
						) : (
							<table className="w-full text-sm">
								<thead className="bg-[var(--muted)]/30">
									<tr className="border-b border-[var(--border)]">
										<Th>Form</Th>
										<Th>Status</Th>
										<Th>Last sync</Th>
										<Th align="right">Actions</Th>
									</tr>
								</thead>
								<tbody>
									{(formsQ.data?.forms ?? []).map((f) => (
										<tr key={f.form_id} className="border-b border-[var(--border)] last:border-0">
											<td className="px-4 py-2.5">
												<p className="font-medium">{f.form_name || f.form_id}</p>
												<p className="text-[10px] text-[var(--muted-foreground)]">{f.form_id} · {f.status}</p>
											</td>
											<td className="px-4 py-2.5">
												{f.enabled ? (
													<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-medium">
														<CheckCircle2 size={11} /> Syncing
													</span>
												) : <span className="text-xs text-[var(--muted-foreground)]">Off</span>}
											</td>
											<td className="px-4 py-2.5 text-[11px] text-[var(--muted-foreground)] font-mono">{f.last_synced_at ?? "—"}</td>
											<td className="px-4 py-2.5">
												<div className="flex items-center justify-end gap-1">
													{f.enabled && f.form_pk && (
														<Button variant="outline" size="icon" className="h-8 w-8" title="Map fields"
															onClick={() => onMapForm(f.form_pk as number, f.form_name)}>
															<Pencil size={12} />
														</Button>
													)}
													<Button size="sm" variant={f.enabled ? "outline" : "default"}
														onClick={() => toggleForm(f)}
														disabled={enableMut.isPending || disableMut.isPending}>
														{f.enabled ? "Disable" : "Enable sync"}
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
	return (
		<th className={`px-4 py-2.5 text-[11px] font-semibold tracking-wider text-[var(--muted-foreground)] uppercase ${align === "right" ? "text-right" : "text-left"}`}>
			{children}
		</th>
	);
}

function StatusPill({ status, error }: { status: string; error?: string }) {
	if (status === "ingested") return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-medium"><CheckCircle2 size={11} /> Ingested</span>;
	if (status === "duplicate") return <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 text-slate-600 px-2 py-0.5 text-[11px] font-medium"><FileText size={11} /> Duplicate</span>;
	if (status === "error") return (
		<span title={error} className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 px-2 py-0.5 text-[11px] font-medium">
			<XCircle size={11} /> Error
		</span>
	);
	return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[11px] font-medium"><Clock size={11} /> Pending</span>;
}
