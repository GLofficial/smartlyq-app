import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface Chatbot {
	id: number;
	uuid: string;
	title: string;
	bot_type: number;
	bot_type_label: string;
	is_active: boolean;
	training_status: string;
	primary_color: string;
	welcome_message: string;
	created_at: string;
}

export interface ChatbotAnalytics {
	total_conversations: number;
	total_messages: number;
	thumbs_up: number;
	thumbs_down: number;
	satisfaction: number;
	escalations: number;
}

export interface ChatbotTemplate {
	id: number;
	title: string;
	instruction: string;
	welcome_message: string;
}

export interface Escalation {
	id: number;
	conversation_id: number;
	chatbot_title: string;
	status: string;
	assigned_agent: number;
	created_at: string;
	resolved_at: string | null;
}

export function useChatbotList() {
	return useQuery({
		queryKey: ["chatbot", "list"],
		queryFn: () => apiClient.get<{ chatbots: Chatbot[] }>("/api/spa/chatbot/list"),
	});
}

export function useChatbotAnalytics() {
	return useQuery({
		queryKey: ["chatbot", "analytics"],
		queryFn: () => apiClient.get<ChatbotAnalytics>("/api/spa/chatbot/analytics"),
	});
}

export function useChatbotTemplates() {
	return useQuery({
		queryKey: ["chatbot", "templates"],
		queryFn: () => apiClient.get<{ templates: ChatbotTemplate[] }>("/api/spa/chatbot/templates"),
	});
}

export function useLiveAgent() {
	return useQuery({
		queryKey: ["chatbot", "live-agent"],
		queryFn: () =>
			apiClient.get<{ escalations: Escalation[]; pending: number; assigned: number }>(
				"/api/spa/chatbot/live-agent",
			),
	});
}

export function useSaveChatbot() {
	return useMutation({
		mutationFn: (data: Record<string, string | number>) =>
			apiClient.post<{ message: string }>("/api/spa/chatbot/save", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chatbot"] }),
	});
}

export function useChatbotSettings() {
	return useQuery({
		queryKey: ["chatbot", "settings"],
		queryFn: () => apiClient.get<{ settings: Record<string, string> }>("/api/spa/chatbot/settings"),
	});
}

export function useSaveChatbotSettings() {
	return useMutation({
		mutationFn: (settings: Record<string, string>) =>
			apiClient.post<{ message: string }>("/api/spa/chatbot/settings/save", settings),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chatbot", "settings"] }),
	});
}
