import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Cpu, Globe, Save } from "lucide-react";
import { useAdminPricingGlobals, useSaveGlobals, useAdminPricingModels, useAdminPricingEndpoints } from "@/api/admin-pricing";
import { toast } from "sonner";

const TABS = [
	{ key: "globals", label: "Global Settings", icon: Settings },
	{ key: "models", label: "Model Pricing", icon: Cpu },
	{ key: "endpoints", label: "API Endpoints", icon: Globe },
];

export function AdminPricingPage() {
	const [tab, setTab] = useState("globals");
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Pricing</h1>
			<div className="flex gap-2">
				{TABS.map((t) => (
					<Button key={t.key} variant={tab === t.key ? "default" : "outline"} size="sm" onClick={() => setTab(t.key)}>
						<t.icon size={14} /> {t.label}
					</Button>
				))}
			</div>
			{tab === "globals" && <GlobalsSection />}
			{tab === "models" && <ModelsSection />}
			{tab === "endpoints" && <EndpointsSection />}
		</div>
	);
}

function GlobalsSection() {
	const { data, isLoading } = useAdminPricingGlobals();
	const saveMutation = useSaveGlobals();
	const [values, setValues] = useState<Record<string, number>>({});
	const [loaded, setLoaded] = useState(false);
	if (data?.globals && !loaded) { setValues(data.globals); setLoaded(true); }
	const update = (key: string, val: string) => setValues((p) => ({ ...p, [key]: Number.parseFloat(val) || 0 }));

	const groups = [
		{ label: "Core", keys: ["sqc_per_usd", "platform_fee_sqc"] },
		{ label: "Markup Multipliers", keys: ["markup_text", "markup_image", "markup_audio", "markup_pollo", "markup_scraping", "markup_video_editing", "markup_presentations", "markup_e2b", "markup_api_tool"] },
		{ label: "Minimums (SQC)", keys: ["min_sqc_text", "min_sqc_image", "min_sqc_audio", "min_sqc_tts", "min_sqc_presentations", "min_sqc_code_exec", "min_sqc_api_tool"] },
		{ label: "Pollo (Video)", keys: ["pollo_usd_per_credit", "pollo_vendor_usd_per_credit"] },
		{ label: "E2B (Code Exec)", keys: ["e2b_usd_per_run"] },
		{ label: "Presentations", keys: ["gamma_usd_per_card", "gamma_usd_per_vendor_credit", "gamma_max_vendor_credits_per_card"] },
		{ label: "Boards Ingestion", keys: ["acb_ingest_url_sqc", "acb_ingest_pdf_url_sqc", "acb_ingest_pdf_upload_sqc", "acb_ingest_youtube_sqc", "acb_ingest_youtube_manual_sqc", "acb_ingest_social_sqc", "acb_ingest_social_manual_sqc", "acb_ingest_confirm_over_sqc"] },
	];

	if (isLoading) return <Spinner />;
	return (
		<div className="space-y-4">
			{groups.map((g) => (
				<Card key={g.label}>
					<CardHeader className="pb-2"><CardTitle className="text-base">{g.label}</CardTitle></CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
							{g.keys.map((k) => (
								<div key={k} className="space-y-1">
									<label className="text-xs font-medium text-[var(--muted-foreground)]">{k.replace(/_/g, " ")}</label>
									<Input type="number" step="0.01" value={values[k] ?? 0} onChange={(e) => update(k, e.target.value)} className="h-8 text-sm" />
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			))}
			<Button onClick={() => saveMutation.mutate(values, { onSuccess: (d) => toast.success(d.message), onError: () => toast.error("Failed.") })} disabled={saveMutation.isPending}>
				<Save size={16} /> {saveMutation.isPending ? "Saving..." : "Save Globals"}
			</Button>
		</div>
	);
}

function ModelsSection() {
	const { data, isLoading } = useAdminPricingModels();
	if (isLoading) return <Spinner />;
	return (
		<div className="space-y-4">
			<p className="text-sm text-[var(--muted-foreground)]">{data?.total ?? 0} models</p>
			{Object.entries(data?.model_groups ?? {}).map(([group, models]) => (
				<Card key={group}>
					<CardHeader className="pb-2"><CardTitle className="text-base">{group}</CardTitle></CardHeader>
					<CardContent>
						<table className="w-full text-sm">
							<thead><tr className="border-b border-[var(--border)]"><th className="py-1.5 text-left font-medium">Model</th><th className="py-1.5 text-left font-medium">Name</th><th className="py-1.5 text-left font-medium">Provider</th></tr></thead>
							<tbody>{models.map((m) => (
								<tr key={m.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
									<td className="py-1.5 font-mono text-xs">{m.model}</td><td className="py-1.5">{m.name}</td><td className="py-1.5 text-[var(--muted-foreground)]">{m.provider}</td>
								</tr>
							))}</tbody>
						</table>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function EndpointsSection() {
	const { data, isLoading } = useAdminPricingEndpoints();
	if (isLoading) return <Spinner />;
	return (
		<Card>
			<CardHeader><CardTitle className="text-lg">API Endpoints ({data?.pricing.length ?? 0})</CardTitle></CardHeader>
			<CardContent>
				<table className="w-full text-sm">
					<thead><tr className="border-b border-[var(--border)]"><th className="py-2 text-left font-medium">Endpoint</th><th className="py-2 text-left font-medium">Unit</th><th className="py-2 text-right font-medium">Cost</th><th className="py-2 text-right font-medium">Min</th><th className="py-2 text-right font-medium">Max</th><th className="py-2 text-center font-medium">Active</th></tr></thead>
					<tbody>{(data?.pricing ?? []).map((p) => (
						<tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
							<td className="py-2 font-mono text-xs">{p.endpoint}</td><td className="py-2"><span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs">{p.unit_name}</span></td>
							<td className="py-2 text-right font-medium">${(p.cost ?? 0).toFixed(4)}</td><td className="py-2 text-right">{p.min_units}</td><td className="py-2 text-right">{p.max_units}</td>
							<td className="py-2 text-center"><span className={`h-2 w-2 inline-block rounded-full ${p.is_active ? "bg-green-500" : "bg-gray-400"}`} /></td>
						</tr>
					))}</tbody>
				</table>
			</CardContent>
		</Card>
	);
}

function Spinner() { return <div className="flex h-32 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
