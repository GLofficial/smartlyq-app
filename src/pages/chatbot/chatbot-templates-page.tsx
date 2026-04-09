import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Copy } from "lucide-react";
import { useChatbotTemplates } from "@/api/chatbot";
import { toast } from "sonner";

export function ChatbotTemplatesPage() {
	const { data, isLoading } = useChatbotTemplates();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Chatbot Templates</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !data?.templates.length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12">
						<BookOpen size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No templates available.</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{data.templates.map((t) => (
						<Card key={t.id}>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">{t.title}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<p className="text-sm text-[var(--muted-foreground)] line-clamp-3">
									{t.instruction}
								</p>
								{t.welcome_message && (
									<p className="rounded bg-[var(--muted)] p-2 text-xs italic">
										"{t.welcome_message}"
									</p>
								)}
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										toast.success("Template selected — use it when creating a chatbot.");
									}}
								>
									<Copy size={14} /> Use Template
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
