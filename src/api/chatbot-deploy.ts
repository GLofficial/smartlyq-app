import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export function useChatbotDeploy(botId: number) {
	return useQuery({
		queryKey: ["chatbot", "deploy", botId],
		queryFn: () => apiClient.get<{ embed_url: string; embed_script: string; uuid: string }>(`/api/spa/chatbot/deploy?bot_id=${botId}`),
		enabled: botId > 0,
	});
}

export function useUploadTraining() {
	return useMutation({
		mutationFn: (data: { bot_id: number; file: File }) => {
			const fd = new FormData();
			fd.append("bot_id", String(data.bot_id));
			fd.append("file", data.file);
			return apiClient.upload<{ message: string; id: number }>("/api/spa/chatbot/training/upload", fd);
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chatbot"] }),
	});
}

export function useDeleteTraining() {
	return useMutation({
		mutationFn: (fileId: number) => apiClient.post<{ message: string }>("/api/spa/chatbot/training/delete", { file_id: fileId }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chatbot"] }),
	});
}

export function useSaveFaqs() {
	return useMutation({
		mutationFn: (data: { bot_id: number; faqs: { question: string; answer: string }[] }) =>
			apiClient.post<{ message: string }>("/api/spa/chatbot/faqs/save", data),
	});
}

export function useSaveDomains() {
	return useMutation({
		mutationFn: (data: { bot_id: number; domains: string }) =>
			apiClient.post<{ message: string }>("/api/spa/chatbot/domains/save", data),
	});
}
