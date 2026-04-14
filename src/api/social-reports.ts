import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

/* eslint-disable @typescript-eslint/no-explicit-any */

function buildQs(params: Record<string, string | number | null | undefined>): string {
	return Object.entries(params).filter(([, v]) => v != null && v !== "").map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

export interface ReportFilters {
	dateFrom: string;
	dateTo: string;
	accountId: number | null;
	platform: string;
}

export function useSocialAccounts() {
	return useQuery({
		queryKey: ["social", "reports", "accounts"],
		queryFn: () => apiClient.get<{
			accounts: {
				id: number; platform: string; account_name: string; account_username: string;
				profile_picture: string; followers_count: number; token_status: string;
				is_active: boolean; needs_reconnect: boolean;
			}[];
			needs_reconnect_count: number;
		}>("/api/spa/social/reports?feed=accounts"),
	});
}

export function useReportSummary(f: ReportFilters) {
	const qs = buildQs({ feed: "summary", date_from: f.dateFrom, date_to: f.dateTo, social_account_id: f.accountId, platform: f.platform });
	return useQuery({
		queryKey: ["social", "reports", "summary", qs],
		queryFn: () => apiClient.get<{
			audience: { total_followers: number; new_followers: number; followers_lost: number; new_followers_change: number };
			engagement: { total_posts: number; total_engagements: number; avg_engagement_rate: number; total_likes: number; total_comments: number; total_shares: number; total_saves: number; total_clicks: number; total_impressions: number };
			performance: { total: number; change_pct: number; avg_per_day: number };
			impressions: { page_views: number; page_reach: number; page_views_change: number; page_reach_change: number };
		}>(`/api/spa/social/reports?${qs}`),
	});
}

export function useReportAudience(f: ReportFilters) {
	const qs = buildQs({ feed: "audience", date_from: f.dateFrom, date_to: f.dateTo, social_account_id: f.accountId });
	return useQuery({
		queryKey: ["social", "reports", "audience", qs],
		queryFn: () => apiClient.get<{
			labels: string[]; new_followers: number[]; net_followers: number[]; lost_followers: number[];
		}>(`/api/spa/social/reports?${qs}`),
	});
}

export function useReportPostsEngagement(f: ReportFilters) {
	const qs = buildQs({ feed: "posts_engagement", date_from: f.dateFrom, date_to: f.dateTo, social_account_id: f.accountId, platform: f.platform });
	return useQuery({
		queryKey: ["social", "reports", "posts_engagement", qs],
		queryFn: () => apiClient.get<{
			posts_vs_engagement: { labels: string[]; posts: number[]; engagements: number[] };
			top_posts: any[];
			engagements_vs_impressions: { labels: string[]; impressions: number[]; engagements: number[] };
			breakdown: { account_name: string; platform: string; profile_picture: string; posts: number; engagements: number; impressions: number; clicks: number }[];
		}>(`/api/spa/social/reports?${qs}`),
	});
}

export function useEmailReport() {
	return useMutation({
		mutationFn: (body: { email: string; date_from: string; date_to: string; social_account_id?: number | null }) =>
			apiClient.post<{ message: string }>("/api/spa/social/reports/email", body),
	});
}

export function useReportChart(f: ReportFilters) {
	const qs = buildQs({ feed: "chart", date_from: f.dateFrom, date_to: f.dateTo, social_account_id: f.accountId });
	return useQuery({
		queryKey: ["social", "reports", "chart", qs],
		queryFn: () => apiClient.get<{
			labels: string[]; series: { followers: number[]; impressions: number[]; reach: number[]; engagements: number[]; new_followers: number[] };
		}>(`/api/spa/social/reports?${qs}`),
	});
}
