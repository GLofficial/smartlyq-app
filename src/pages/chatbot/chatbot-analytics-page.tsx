import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, ThumbsDown, Users, AlertTriangle, Smile } from "lucide-react";
import { useChatbotAnalytics } from "@/api/chatbot";

export function ChatbotAnalyticsPage() {
	const { data, isLoading } = useChatbotAnalytics();
	const v = (n?: number) => (isLoading ? "..." : String(n ?? 0));

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Chatbot Analytics</h1>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Stat icon={Users} label="Conversations" value={v(data?.total_conversations)} color="text-blue-600" />
				<Stat icon={MessageSquare} label="Messages" value={v(data?.total_messages)} color="text-purple-600" />
				<Stat icon={Smile} label="Satisfaction" value={isLoading ? "..." : `${data?.satisfaction ?? 0}%`} color="text-green-600" />
				<Stat icon={ThumbsUp} label="Thumbs Up" value={v(data?.thumbs_up)} color="text-green-500" />
				<Stat icon={ThumbsDown} label="Thumbs Down" value={v(data?.thumbs_down)} color="text-red-500" />
				<Stat icon={AlertTriangle} label="Escalations" value={v(data?.escalations)} color="text-orange-600" />
			</div>
		</div>
	);
}

function Stat({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
	return (
		<Card>
			<CardContent className="flex items-center gap-4 p-6">
				<Icon size={24} className={color} />
				<div>
					<p className="text-2xl font-bold">{value}</p>
					<p className="text-sm text-[var(--muted-foreground)]">{label}</p>
				</div>
			</CardContent>
		</Card>
	);
}
