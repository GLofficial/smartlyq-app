import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

// ── Types ────────────────────────────────────────────────────

export interface AdminPage {
	id: number;
	title: string;
	name: string;
	slug: string;
	status: number;
	deletable: boolean;
	created: string | null;
}

export interface AdminPageFull extends AdminPage {
	description: string;
}

export interface AdminBlog {
	id: number;
	title: string;
	slug: string;
	thumbnail: string;
	category: string;
	status: number;
	created: string | null;
}

export interface AdminBlogFull extends AdminBlog {
	description: string;
	category_name: string;
}

// ── Pages ────────────────────────────────────────────────────

export function useAdminPages() {
	return useQuery({
		queryKey: ["admin", "pages"],
		queryFn: () => apiClient.get<{ pages: AdminPage[] }>("/api/spa/admin/pages"),
	});
}

export function useAdminPageGet(id: number) {
	return useQuery({
		queryKey: ["admin", "pages", id],
		queryFn: () => apiClient.get<{ page: AdminPageFull }>(`/api/spa/admin/pages/get?id=${id}`),
		enabled: id > 0,
	});
}

export function useAdminPageSave() {
	return useMutation({
		mutationFn: (data: { id?: number; name?: string; title: string; description: string; status: number }) =>
			apiClient.post<{ message: string; id: number }>("/api/spa/admin/pages/save", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "pages"] }),
	});
}

export function useAdminPageDelete() {
	return useMutation({
		mutationFn: (id: number) =>
			apiClient.post<{ message: string }>("/api/spa/admin/pages/delete", { id }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "pages"] }),
	});
}

// ── Blogs ────────────────────────────────────────────────────

export function useAdminBlogs() {
	return useQuery({
		queryKey: ["admin", "blogs"],
		queryFn: () => apiClient.get<{ blogs: AdminBlog[] }>("/api/spa/admin/blogs"),
	});
}

export function useAdminBlogGet(id: number) {
	return useQuery({
		queryKey: ["admin", "blogs", id],
		queryFn: () => apiClient.get<{ blog: AdminBlogFull }>(`/api/spa/admin/blogs/get?id=${id}`),
		enabled: id > 0,
	});
}

export function useAdminBlogSave() {
	return useMutation({
		mutationFn: (data: { id?: number; title: string; description: string; category_name: string; status: number }) =>
			apiClient.post<{ message: string; id: number }>("/api/spa/admin/blogs/save", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] }),
	});
}

export function useAdminBlogDelete() {
	return useMutation({
		mutationFn: (id: number) =>
			apiClient.post<{ message: string }>("/api/spa/admin/blogs/delete", { id }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] }),
	});
}

// ── Other admin content (read-only) ─────────────────────────

export function useAdminPricing() {
	return useQuery({
		queryKey: ["admin", "pricing"],
		queryFn: () => apiClient.get<{ pricing: { id: number; endpoint: string; unit_name: string; cost: number; min_units: number; max_units: number; is_active: boolean; updated_at: string | null }[] }>("/api/spa/admin/pricing"),
	});
}

export function useAdminTemplates() {
	return useQuery({
		queryKey: ["admin", "templates"],
		queryFn: () => apiClient.get<{ templates: { id: number; name: string; description: string; category: string; icon: string; premium: boolean; status: number }[] }>("/api/spa/admin/templates"),
	});
}

export function useAdminAssistants() {
	return useQuery({
		queryKey: ["admin", "assistants"],
		queryFn: () => apiClient.get<{ assistants: { id: number; name: string; description: string; model: string; status: number }[] }>("/api/spa/admin/assistants"),
	});
}

export function useAdminSupport() {
	return useQuery({
		queryKey: ["admin", "support"],
		queryFn: () => apiClient.get<{ tickets: { id: number; subject: string; status: string; user_id: number; created_at: string }[] }>("/api/spa/admin/support"),
	});
}

export function useAdminReports() {
	return useQuery({
		queryKey: ["admin", "reports"],
		queryFn: () => apiClient.get<{ total_users: number; total_posts: number; total_revenue: number; new_users_30d: number }>("/api/spa/admin/reports"),
	});
}

export function useAdminReportFeed(feed: string, from: string, to: string) {
	return useQuery({
		queryKey: ["admin", "reports", "feed", feed, from, to],
		queryFn: () => apiClient.get<{ feed: string; from: string; to: string; data: Record<string, unknown>[] }>(
			`/api/spa/admin/reports/feed?feed=${feed}&from=${from}&to=${to}`
		),
		enabled: !!from && !!to,
	});
}

export function useAdminReportsBackfill() {
	return useMutation({
		mutationFn: (body: { from: string; to: string }) =>
			apiClient.post<{ ok: boolean; days: number; updated: number; failed: number }>("/api/spa/admin/reports/backfill", body),
	});
}
