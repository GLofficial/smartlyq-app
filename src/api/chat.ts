import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export function useChatConversations() {
	return useQuery({
		queryKey: ["chat", "conversations"],
		queryFn: () =>
			apiClient.get<{
				chats: { id: number; title: string; has_assistant: boolean; created: string }[];
			}>("/api/spa/chat/conversations"),
	});
}

export function useChatMessages(chatId: number) {
	return useQuery({
		queryKey: ["chat", "messages", chatId],
		enabled: chatId > 0,
		queryFn: () =>
			apiClient.get<{
				messages: { id: number; role: string; content: string; created: string }[];
			}>(`/api/spa/chat/messages?chat_id=${chatId}`),
	});
}

export function useSendMessage() {
	return useMutation({
		mutationFn: (data: { chat_id: number; message: string }) =>
			apiClient.post<{ reply: string }>("/api/spa/chat/send", data),
		onSuccess: (_d, vars) =>
			queryClient.invalidateQueries({ queryKey: ["chat", "messages", vars.chat_id] }),
	});
}

export function useChatAssistants() {
	return useQuery({
		queryKey: ["chat", "assistants"],
		queryFn: () =>
			apiClient.get<{
				assistants: { id: number; name: string; description: string; model: string }[];
			}>("/api/spa/chat/assistants"),
	});
}
