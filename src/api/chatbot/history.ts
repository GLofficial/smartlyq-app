import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ChatSession {
	id: number;
	visitor_name: string;
	visitor_email: string;
	bot_name: string;
	message_count: number;
	started_at: string;
	last_message_at: string;
	status: string;
}

export function useChatbotHistory(page = 1) {
	return useQuery({
		queryKey: ["chatbot", "history", page],
		queryFn: () =>
			apiClient.get<{ sessions: ChatSession[]; total: number; page: number; pages: number }>(
				`/api/spa/chatbot/history?page=${page}`
			),
	});
}
