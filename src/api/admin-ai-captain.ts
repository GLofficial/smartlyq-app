import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useAdminTraces(page = 1) {
	return useQuery({
		queryKey: ["admin", "traces", page],
		queryFn: () => apiClient.get<{
			traces: { id: number; chat_id: number; chat_title: string; user_name: string; content: string; has_tool_calls: boolean; created_at: string }[];
			total: number; page: number; pages: number;
		}>(`/api/spa/admin/ai-captain/traces?page=${page}`),
	});
}

export function useAdminKnowledgeBase() {
	return useQuery({
		queryKey: ["admin", "kb"],
		queryFn: () => apiClient.get<{
			sources: { id: number; workspace_id: number; type: string; title: string; url: string; status: string; created_at: string }[];
		}>("/api/spa/admin/ai-captain/kb"),
	});
}

export function useAdminSkills() {
	return useQuery({
		queryKey: ["admin", "skills"],
		queryFn: () => apiClient.get<{
			skills: { id: number; name: string; description: string; type: string; is_active: boolean; created_at: string }[];
		}>("/api/spa/admin/ai-captain/skills"),
	});
}
