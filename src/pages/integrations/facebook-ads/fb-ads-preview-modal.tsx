import { useState, useEffect } from "react";
import { X, Loader2, ExternalLink, AlertCircle, RefreshCw, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PreviewResponse {
	ok: number;
	html: string;
	meta?: {
		headline?: string;
		body?: string;
		description?: string;
		call_to_action_type?: string;
		link_url?: string;
	};
}

interface VideoInsightsResponse {
	ok: number;
	data?: {
		video_3s_views?: number;
		video_thruplay?: number;
		video_p25_watched?: number;
		video_p50_watched?: number;
		video_p75_watched?: number;
		video_p100_watched?: number;
	};
}

/* ------------------------------------------------------------------ */
/*  FbAdsPreviewModal                                                  */
/* ------------------------------------------------------------------ */

interface FbAdsPreviewModalProps {
	adId: string | null;
	onClose: () => void;
	accountId?: string;
}

export function FbAdsPreviewModal({ adId, onClose, accountId }: FbAdsPreviewModalProps) {
	const [html, setHtml] = useState("");
	const [meta, setMeta] = useState<PreviewResponse["meta"]>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!adId) return;
		fetchPreview();
	}, [adId]); // eslint-disable-line react-hooks/exhaustive-deps

	async function fetchPreview() {
		setLoading(true);
		setError("");
		try {
			const res = await apiClient.post<PreviewResponse>(
				"/api/spa/integrations/facebook-ads/action",
				{ action: "fb_ads_ad_preview", ad_id: adId, format: "MOBILE_FEED_STANDARD" },
			);
			if (!res.ok) throw new Error("Preview unavailable");
			setHtml(res.html);
			setMeta(res.meta);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Failed to load preview";
			setError(msg);
		} finally {
			setLoading(false);
		}
	}

	if (!adId) return null;

	const adsManagerUrl = accountId
		? `https://www.facebook.com/adsmanager/manage/ads?act=${accountId}&selected_ad_ids=${adId}`
		: `https://www.facebook.com/adsmanager/manage/ads?selected_ad_ids=${adId}`;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
			onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
		>
			<div className="w-full max-w-[1100px] max-h-[90vh] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl flex flex-col mx-4">
				{/* Header */}
				<div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
					<h2 className="text-base font-semibold text-[var(--foreground)]">Ad Preview</h2>
					<button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--muted)] transition-colors">
						<X size={18} className="text-[var(--muted-foreground)]" />
					</button>
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
							<Button variant="outline" size="sm" onClick={fetchPreview} className="gap-1.5">
								<RefreshCw size={14} /> Retry
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-5 gap-5">
							{/* Left – Preview (3/5 = 60%) */}
							<div className="md:col-span-3">
								<div
									className="rounded-lg border border-[var(--border)] bg-white overflow-auto"
									style={{ maxHeight: 500 }}
									dangerouslySetInnerHTML={{ __html: html }}
								/>
								{/* Video metrics below preview */}
								<FbAdsVideoMetrics adId={adId} />
							</div>

							{/* Right – Details (2/5 = 40%) */}
							<div className="md:col-span-2">
								<div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
									<h3 className="text-sm font-semibold text-[var(--foreground)]">Ad Details</h3>

									<DetailField label="Headline" value={meta?.headline} />
									<DetailField label="Primary Text" value={meta?.body} />
									<DetailField label="Description" value={meta?.description} />
									<DetailField label="CTA" value={formatCta(meta?.call_to_action_type)} />
									<DetailField label="Link URL" value={meta?.link_url} isLink />

									<p className="text-[10px] text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
										Read from the ad creative (best-effort)
									</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)]">
					<a
						href={adsManagerUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-xs text-[var(--sq-primary)] hover:underline"
					>
						<ExternalLink size={12} /> Open in Ads Manager
					</a>
					<Button variant="outline" size="sm" onClick={onClose}>Close</Button>
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  DetailField                                                        */
/* ------------------------------------------------------------------ */

function DetailField({ label, value, isLink }: { label: string; value?: string; isLink?: boolean }) {
	return (
		<div>
			<p className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted-foreground)] mb-0.5">
				{label}
			</p>
			{value ? (
				isLink ? (
					<a
						href={value}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-[var(--sq-primary)] hover:underline break-all"
					>
						{value}
					</a>
				) : (
					<p className="text-sm text-[var(--foreground)]">{value}</p>
				)
			) : (
				<p className="text-sm text-[var(--muted-foreground)]">&mdash;</p>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  FbAdsVideoMetrics                                                  */
/* ------------------------------------------------------------------ */

interface FbAdsVideoMetricsProps {
	adId: string;
}

export function FbAdsVideoMetrics({ adId }: FbAdsVideoMetricsProps) {
	const [data, setData] = useState<VideoInsightsResponse["data"]>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await apiClient.post<VideoInsightsResponse>(
					"/api/spa/integrations/facebook-ads/action",
					{ action: "fb_ads_video_insights", ad_id: adId },
				);
				if (!cancelled && res.ok && res.data) setData(res.data);
			} catch {
				/* non-video ads simply won't have data */
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => { cancelled = true; };
	}, [adId]);

	if (loading) {
		return (
			<div className="flex items-center gap-2 mt-3">
				<Loader2 size={12} className="animate-spin text-[var(--muted-foreground)]" />
				<span className="text-[11px] text-[var(--muted-foreground)]">Loading video metrics...</span>
			</div>
		);
	}

	if (!data) return null;

	const metrics = [
		{ label: "3s Views", value: data.video_3s_views },
		{ label: "ThruPlay", value: data.video_thruplay },
		{ label: "25% Watched", value: data.video_p25_watched },
		{ label: "50% Watched", value: data.video_p50_watched },
		{ label: "75% Watched", value: data.video_p75_watched },
		{ label: "100% Watched", value: data.video_p100_watched },
	].filter((m) => m.value !== undefined && m.value !== null);

	if (metrics.length === 0) return null;

	return (
		<div className="mt-4">
			<div className="flex items-center gap-1.5 mb-2">
				<Play size={13} className="text-[var(--sq-primary)]" />
				<h4 className="text-xs font-semibold text-[var(--foreground)]">Video Metrics</h4>
			</div>
			<div className="grid grid-cols-3 gap-2">
				{metrics.map((m) => (
					<div
						key={m.label}
						className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2 text-center"
					>
						<p className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">
							{m.label}
						</p>
						<p className="text-sm font-semibold text-[var(--foreground)] mt-0.5">
							{(m.value ?? 0).toLocaleString()}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCta(raw?: string): string | undefined {
	if (!raw) return undefined;
	return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
