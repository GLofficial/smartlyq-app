import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useAdminPricing() {
	return useQuery({
		queryKey: ["admin", "pricing"],
		queryFn: () => apiClient.get<{ pricing: { id: number; endpoint: string; cost: number; type: string; vendor_cost: number; description: string; status: number }[] }>("/api/spa/admin/pricing"),
	});
}

export function useAdminBlogs() {
	return useQuery({
		queryKey: ["admin", "blogs"],
		queryFn: () => apiClient.get<{ blogs: { id: number; title: string; slug: string; status: number; created_at: string }[] }>("/api/spa/admin/blogs"),
	});
}

export function useAdminPages() {
	return useQuery({
		queryKey: ["admin", "pages"],
		queryFn: () => apiClient.get<{ pages: { id: number; title: string; slug: string; status: number; created_at: string }[] }>("/api/spa/admin/pages"),
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
