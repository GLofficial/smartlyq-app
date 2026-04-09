import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid, Database } from "lucide-react";
import { useCaptainBoards } from "@/api/captain-boards";

export function CaptainBoardsPage() {
	const { data, isLoading } = useCaptainBoards();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Captain Boards</h1>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !data?.boards.length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-3 py-12">
						<LayoutGrid size={48} className="text-[var(--muted-foreground)]" />
						<p className="text-[var(--muted-foreground)]">No boards created yet.</p>
						<p className="text-sm text-[var(--muted-foreground)]">
							Boards let you organize research sources for AI Captain to analyze.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{data.boards.map((board) => (
						<Card key={board.id}>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">{board.name}</CardTitle>
									<BoardBadge status={board.status} />
								</div>
							</CardHeader>
							<CardContent className="space-y-2">
								{board.description && (
									<p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
										{board.description}
									</p>
								)}
								<div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
									<span className="flex items-center gap-1">
										<Database size={12} />
										{board.source_count} source{board.source_count !== 1 ? "s" : ""}
									</span>
									<span>Created {new Date(board.created_at).toLocaleDateString()}</span>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

function BoardBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		active: "bg-green-100 text-green-700",
		processing: "bg-blue-100 text-blue-700",
		draft: "bg-gray-100 text-gray-600",
		archived: "bg-yellow-100 text-yellow-700",
	};
	return (
		<span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
			{status}
		</span>
	);
}
