import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Bot, ExternalLink, Power, PowerOff } from "lucide-react";
import { useChatbotList } from "@/api/chatbot";

export function ChatbotListPage() {
	const { data, isLoading } = useChatbotList();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Chatbots</h1>
				<Link to="/my/chatbot/create">
					<Button><Plus size={16} /> Create Chatbot</Button>
				</Link>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !data?.chatbots.length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12">
						<Bot size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No chatbots yet. Create your first one.</p>
						<Link to="/my/chatbot/create">
							<Button><Plus size={16} /> Create Chatbot</Button>
						</Link>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{data.chatbots.map((bot) => (
						<Card key={bot.id} className="relative overflow-hidden">
							<div className="h-1" style={{ backgroundColor: bot.primary_color }} />
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">{bot.title}</CardTitle>
									{bot.is_active ? (
										<Power size={16} className="text-green-500" />
									) : (
										<PowerOff size={16} className="text-gray-400" />
									)}
								</div>
								<div className="flex items-center gap-2">
									<span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs">
										{bot.bot_type_label}
									</span>
									<TrainingBadge status={bot.training_status} />
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								{bot.welcome_message && (
									<p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
										{bot.welcome_message}
									</p>
								)}
								<div className="flex items-center gap-2">
									<Link to={`/my/chatbot/edit/${bot.id}`}>
										<Button variant="outline" size="sm">Edit</Button>
									</Link>
									<a
										href={`${window.location.origin}/chat/${bot.uuid}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Button variant="ghost" size="sm">
											<ExternalLink size={14} /> Preview
										</Button>
									</a>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

function TrainingBadge({ status }: { status: string }) {
	if (!status) return null;
	const colors: Record<string, string> = {
		completed: "bg-green-100 text-green-700",
		processing: "bg-blue-100 text-blue-700",
		pending: "bg-yellow-100 text-yellow-700",
		failed: "bg-red-100 text-red-700",
	};
	return (
		<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
			{status}
		</span>
	);
}
