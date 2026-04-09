import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	CreditCard,
	Calendar,
	MessageSquare,
	Share2,
	FileText,
	Clock,
} from "lucide-react";
import { useDashboard } from "@/api/dashboard";

export function DashboardPage() {
	const user = useAuthStore((s) => s.user);
	const plan = useAuthStore((s) => s.plan);
	const { data, isLoading } = useDashboard();

	return (
		<div className="space-y-6">
			{/* Welcome */}
			<div>
				<h1 className="text-2xl font-bold text-[var(--foreground)]">
					Welcome back, {user?.name ?? "there"}
				</h1>
				<p className="text-[var(--muted-foreground)]">{plan?.name ?? "Free"} plan</p>
			</div>

			{/* Stats */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					icon={CreditCard}
					label="Credits"
					value={isLoading ? "..." : Math.round(data?.credits ?? 0).toLocaleString()}
				/>
				<StatCard
					icon={Calendar}
					label="Scheduled Posts"
					value={isLoading ? "..." : String(data?.scheduled_posts ?? 0)}
				/>
				<StatCard
					icon={MessageSquare}
					label="Chatbots"
					value={isLoading ? "..." : String(data?.chatbot_count ?? 0)}
				/>
				<StatCard
					icon={Share2}
					label="Social Accounts"
					value={isLoading ? "..." : String(data?.social_accounts ?? 0)}
				/>
			</div>

			{/* Recent Activity */}
			<div className="grid gap-6 lg:grid-cols-2">
				<RecentPosts posts={data?.recent_posts} isLoading={isLoading} />
				<RecentArticles articles={data?.recent_articles} isLoading={isLoading} />
			</div>
		</div>
	);
}

function StatCard({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ElementType;
	label: string;
	value: string;
}) {
	return (
		<Card>
			<CardContent className="flex items-center gap-4 p-6">
				<div className="rounded-lg bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)] p-3">
					<Icon size={20} className="text-[var(--sq-primary)]" />
				</div>
				<div>
					<p className="text-2xl font-bold">{value}</p>
					<p className="text-sm text-[var(--muted-foreground)]">{label}</p>
				</div>
			</CardContent>
		</Card>
	);
}

function RecentPosts({
	posts,
	isLoading,
}: {
	posts?: { id: number; title: string; status: string; platforms: string[] }[];
	isLoading: boolean;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Clock size={18} />
					Recent Posts
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p className="text-sm text-[var(--muted-foreground)]">Loading...</p>
				) : !posts?.length ? (
					<p className="text-sm text-[var(--muted-foreground)]">No posts yet</p>
				) : (
					<div className="space-y-3">
						{posts.map((post) => (
							<div
								key={post.id}
								className="flex items-center justify-between rounded-md border border-[var(--border)] p-3"
							>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">
										{post.title || "Untitled post"}
									</p>
									<p className="text-xs text-[var(--muted-foreground)]">
										{post.platforms.join(", ")}
									</p>
								</div>
								<StatusBadge status={post.status} />
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function RecentArticles({
	articles,
	isLoading,
}: {
	articles?: { id: number; title: string; created: string }[];
	isLoading: boolean;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<FileText size={18} />
					Recent Articles
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p className="text-sm text-[var(--muted-foreground)]">Loading...</p>
				) : !articles?.length ? (
					<p className="text-sm text-[var(--muted-foreground)]">No articles yet</p>
				) : (
					<div className="space-y-3">
						{articles.map((article) => (
							<div
								key={article.id}
								className="flex items-center justify-between rounded-md border border-[var(--border)] p-3"
							>
								<p className="truncate text-sm font-medium">{article.title}</p>
								<p className="shrink-0 text-xs text-[var(--muted-foreground)]">
									{new Date(article.created).toLocaleDateString()}
								</p>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		scheduled: "bg-blue-100 text-blue-700",
		published: "bg-green-100 text-green-700",
		draft: "bg-gray-100 text-gray-600",
		failed: "bg-red-100 text-red-700",
		partially_published: "bg-yellow-100 text-yellow-700",
	};
	return (
		<span
			className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}
		>
			{status.replace("_", " ")}
		</span>
	);
}
