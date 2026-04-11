import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/constants";

export interface DashboardData {
	credits: number;
	currency: string;
	scheduled_posts: number;
	chatbot_count: number;
	social_accounts: number;
	recent_articles: { id: number; title: string; created: string }[];
	recent_posts: {
		id: number;
		title: string;
		status: string;
		scheduled_time: string | null;
		platforms: string[];
	}[];
}

export function useDashboard() {
	return useQuery({
		queryKey: ["dashboard"],
		queryFn: () => apiClient.get<DashboardData>(ENDPOINTS.DASHBOARD),
	});
}
