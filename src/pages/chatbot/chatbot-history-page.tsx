import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export function ChatbotHistoryPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Chatbot History</h1>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<History size={20} />
						Conversation History
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-[var(--muted-foreground)]">
						Browse and search past chatbot conversations across all your bots.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
