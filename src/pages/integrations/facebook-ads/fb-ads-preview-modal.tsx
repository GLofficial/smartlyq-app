import { useState, useEffect } from "react";
import { X, Loader2, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PreviewResponse {
	ok: number;
	html: string;
	meta?: { headline?: string; body?: string; description?: string; call_to_action_type?: string; link_url?: string };
}

interface VideoResponse {
	ok: number;
	video?: { "3s_views"?: number; thruplay?: number; avg_time_sec?: number; p25?: number; p50?: number; p75?: number; p95?: number; p100?: number; impressions?: number; spend?: number };
	demographics?: { age: string; gender: string; impressions: number; spend: number }[];
}

interface FbAdsPreviewModalProps { adId: string | null; onClose: () => void; accountId?: string }

export function FbAdsPreviewModal({ adId, onClose, accountId }: FbAdsPreviewModalProps) {
	const [activeTab, setActiveTab] = useState<"performance" | "video">("performance");
	const [html, setHtml] = useState("");
	const [meta, setMeta] = useState<PreviewResponse["meta"]>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!adId) return;
		setActiveTab("performance");
		fetchPreview();
	}, [adId]); // eslint-disable-line react-hooks/exhaustive-deps

	async function fetchPreview() {
		setLoading(true); setError("");
		try {
			const res = await apiClient.post<PreviewResponse>("/api/spa/integrations/facebook-ads/action", { action: "fb_ads_ad_preview", ad_id: adId, format: "MOBILE_FEED_STANDARD" });
			if (!res.ok) throw new Error("Preview unavailable");
			setHtml(res.html); setMeta(res.meta);
		} catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to load preview"); }
		finally { setLoading(false); }
	}

	if (!adId) return null;
	const adsManagerUrl = accountId ? `https://www.facebook.com/adsmanager/manage/ads?act=${accountId}&selected_ad_ids=${adId}` : `https://www.facebook.com/adsmanager/manage/ads?selected_ad_ids=${adId}`;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
			<div className="w-full max-w-[1100px] max-h-[90vh] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl flex flex-col mx-4">
				{/* Header with tabs */}
				<div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
					<div className="flex items-center gap-4">
						<h2 className="text-base font-semibold text-[var(--foreground)]">Ad Preview</h2>
						<div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
							<button onClick={() => setActiveTab("performance")} className={`px-3 py-1 text-xs font-medium transition-colors ${activeTab === "performance" ? "bg-[var(--sq-primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>Performance</button>
							<button onClick={() => setActiveTab("video")} className={`px-3 py-1 text-xs font-medium transition-colors ${activeTab === "video" ? "bg-[var(--sq-primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"}`}>Video analysis</button>
						</div>
					</div>
					<button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--muted)] transition-colors"><X size={18} className="text-[var(--muted-foreground)]" /></button>
				</div>

				{/* Body */}
				<div className="flex-1 overflow-y-auto p-5">
					{loading ? (
						<div className="flex flex-col items-center justify-center py-20 gap-3">
							<Loader2 size={28} className="animate-spin text-[var(--sq-primary)]" />
							<p className="text-sm text-[var(--muted-foreground)]">Loading ad preview...</p>
						</div>
					) : error ? (
						<div className="flex flex-col items-center justify-center py-20 gap-3">
							<AlertCircle size={28} className="text-red-500" />
							<p className="text-sm text-red-600">{error}</p>
							<Button variant="outline" size="sm" onClick={fetchPreview} className="gap-1.5"><RefreshCw size={14} /> Retry</Button>
						</div>
					) : activeTab === "performance" ? (
						<PerformanceTab html={html} meta={meta} />
					) : (
						<VideoAnalysisTab adId={adId} />
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)]">
					<a href={adsManagerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[var(--sq-primary)] hover:underline"><ExternalLink size={12} /> Open in Ads Manager</a>
					<Button variant="outline" size="sm" onClick={onClose}>Close</Button>
				</div>
			</div>
		</div>
	);
}

/* ── Performance Tab ───────────────────────────────────────────────── */

function PerformanceTab({ html, meta }: { html: string; meta?: PreviewResponse["meta"] }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-5 gap-5">
			<div className="md:col-span-3">
				<div className="rounded-lg border border-[var(--border)] bg-white overflow-auto" style={{ maxHeight: 500 }} dangerouslySetInnerHTML={{ __html: html }} />
			</div>
			<div className="md:col-span-2">
				<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
					<h3 className="text-sm font-semibold text-[var(--foreground)]">Ad Details</h3>
					<DetailField label="Headline" value={meta?.headline} />
					<DetailField label="Primary Text" value={meta?.body} />
					<DetailField label="Description" value={meta?.description} />
					<DetailField label="CTA" value={meta?.call_to_action_type?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} />
					<DetailField label="Link URL" value={meta?.link_url} isLink />
					<p className="text-[10px] text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">Read from the ad creative (best-effort)</p>
				</div>
			</div>
		</div>
	);
}

/* ── Video Analysis Tab ────────────────────────────────────────────── */

function VideoAnalysisTab({ adId }: { adId: string }) {
	const [data, setData] = useState<VideoResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [demoMetric, setDemoMetric] = useState<"impressions" | "spend">("impressions");

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await apiClient.post<VideoResponse>("/api/spa/integrations/facebook-ads/action", { action: "fb_ads_video_insights", ad_id: adId });
				if (!cancelled && res.ok) setData(res);
			} catch { /* no video data */ }
			finally { if (!cancelled) setLoading(false); }
		})();
		return () => { cancelled = true; };
	}, [adId]);

	if (loading) return <div className="flex items-center justify-center py-20 gap-2"><Loader2 size={20} className="animate-spin text-[var(--sq-primary)]" /><span className="text-sm text-[var(--muted-foreground)]">Loading video analysis...</span></div>;

	const v = data?.video;
	const demographics = data?.demographics ?? [];

	return (
		<div className="space-y-5">
			<p className="text-xs text-[var(--muted-foreground)]">Ad ID: {adId}</p>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				{/* Audience Retention */}
				<div className="rounded-lg border border-[var(--border)] p-4">
					<h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">Audience Retention</h3>
					<p className="text-xs text-[var(--muted-foreground)] mb-3">How far viewers watch your video.</p>
					{v ? <RetentionChart video={v} /> : <p className="text-xs text-[var(--muted-foreground)] py-8 text-center">No retention data</p>}
				</div>

				{/* Video Metrics */}
				<div className="rounded-lg border border-[var(--border)] p-4">
					<h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Video Metrics</h3>
					<div className="grid grid-cols-2 gap-3">
						<MetricCell label="3s Views" value={v?.["3s_views"]} />
						<MetricCell label="ThruPlay" value={v?.thruplay} />
						<MetricCell label="Avg Watch Time" value={v?.avg_time_sec ? `${v.avg_time_sec}s` : undefined} />
						<MetricCell label="25% Watched" value={v?.p25} />
						<MetricCell label="50% Watched" value={v?.p50} />
						<MetricCell label="75% Watched" value={v?.p75} />
						<MetricCell label="95% Watched" value={v?.p95} />
						<MetricCell label="100% Watched" value={v?.p100} />
					</div>
				</div>
			</div>

			{/* Demographics Chart */}
			{demographics.length > 0 && (
				<div className="rounded-lg border border-[var(--border)] p-4">
					<div className="flex items-center justify-between mb-3">
						<h3 className="text-sm font-semibold text-[var(--foreground)]">Gender & Age breakdown</h3>
						<select value={demoMetric} onChange={(e) => setDemoMetric(e.target.value as "impressions" | "spend")} className="rounded border border-[var(--border)] bg-transparent px-2 py-1 text-xs">
							<option value="impressions">Impressions</option>
							<option value="spend">Spend</option>
						</select>
					</div>
					<DemographicsBarChart data={demographics} metric={demoMetric} />
				</div>
			)}
		</div>
	);
}

/* ── Retention Chart ───────────────────────────────────────────────── */

function RetentionChart({ video }: { video: NonNullable<VideoResponse["video"]> }) {
	const base = video["3s_views"] || video.p25 || 1;
	const points = [
		{ label: "3s", value: video["3s_views"] ?? 0, pct: 100 },
		{ label: "25%", value: video.p25 ?? 0, pct: base > 0 ? ((video.p25 ?? 0) / base) * 100 : 0 },
		{ label: "50%", value: video.p50 ?? 0, pct: base > 0 ? ((video.p50 ?? 0) / base) * 100 : 0 },
		{ label: "75%", value: video.p75 ?? 0, pct: base > 0 ? ((video.p75 ?? 0) / base) * 100 : 0 },
		{ label: "95%", value: video.p95 ?? 0, pct: base > 0 ? ((video.p95 ?? 0) / base) * 100 : 0 },
		{ label: "100%", value: video.p100 ?? 0, pct: base > 0 ? ((video.p100 ?? 0) / base) * 100 : 0 },
	];
	if (points.every((p) => p.value === 0)) return <p className="text-xs text-[var(--muted-foreground)] py-8 text-center">No retention data</p>;

	return (
		<ResponsiveContainer width="100%" height={180}>
			<BarChart data={points} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
				<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
				<XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
				<YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => `${v.toFixed(0)}%`} domain={[0, 100]} />
				<Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, "Retention"]} />
				<Bar dataKey="pct" radius={[3, 3, 0, 0]} maxBarSize={32}>
					{points.map((_, i) => <Cell key={i} fill={`hsl(${210 - i * 15}, 70%, ${55 + i * 5}%)`} />)}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}

/* ── Demographics Bar Chart ────────────────────────────────────────── */

function DemographicsBarChart({ data, metric }: { data: { age: string; gender: string; impressions: number; spend: number }[]; metric: "impressions" | "spend" }) {
	const grouped: Record<string, { male: number; female: number; unknown: number }> = {};
	for (const r of data) {
		const age = r.age || "unknown";
		if (!grouped[age]) grouped[age] = { male: 0, female: 0, unknown: 0 };
		const g = r.gender === "male" ? "male" : r.gender === "female" ? "female" : "unknown";
		grouped[age][g] += r[metric];
	}
	const chartData = Object.entries(grouped).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([age, vals]) => ({ age, ...vals }));

	if (chartData.length === 0) return null;
	return (
		<ResponsiveContainer width="100%" height={200}>
			<BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
				<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
				<XAxis dataKey="age" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
				<YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
				<Tooltip />
				<Bar dataKey="male" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} name="Male" />
				<Bar dataKey="female" fill="#ec4899" stackId="a" radius={[3, 3, 0, 0]} name="Female" />
			</BarChart>
		</ResponsiveContainer>
	);
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function DetailField({ label, value, isLink }: { label: string; value?: string; isLink?: boolean }) {
	return (
		<div>
			<p className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted-foreground)] mb-0.5">{label}</p>
			{value ? (isLink ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--sq-primary)] hover:underline break-all">{value}</a> : <p className="text-sm text-[var(--foreground)]">{value}</p>) : <p className="text-sm text-[var(--muted-foreground)]">&mdash;</p>}
		</div>
	);
}

function MetricCell({ label, value }: { label: string; value?: number | string }) {
	return (
		<div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/20 px-3 py-2">
			<p className="text-[10px] text-[var(--muted-foreground)]">{label}</p>
			<p className="text-sm font-semibold text-[var(--foreground)] mt-0.5">{value !== undefined && value !== null ? (typeof value === "number" ? value.toLocaleString() : value) : "—"}</p>
		</div>
	);
}
