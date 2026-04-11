import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	CreditCard, Calendar, MessageSquare, Share2, FileText, Clock,
	Building2, Users, PenSquare, CheckCircle2, Circle, ArrowRight, Rocket,
} from "lucide-react";
import { useDashboard } from "@/api/dashboard";
import { useWorkspacePath } from "@/hooks/use-workspace-path";

export function DashboardPage() {
	const user = useAuthStore((s) => s.user);
	const plan = useAuthStore((s) => s.plan);
	const { data, isLoading } = useDashboard();
	const wp = useWorkspacePath();

	const steps = data ? [
		{ key: "profile", label: "Set up your Business Profile", description: "Add your business name, logo, and contact details", icon: Building2, done: data.has_business_profile, href: wp("settings?tab=business-profile") },
		{ key: "social", label: "Connect a Social Account", description: "Link at least one social media platform to start publishing", icon: Share2, done: data.social_accounts > 0, href: wp("integrations") },
		{ key: "post", label: "Create your first Post", description: "Compose and schedule a post to your connected accounts", icon: PenSquare, done: data.total_posts > 0, href: wp("social-media/create-post") },
		{ key: "team", label: "Invite your Team", description: "Add members to collaborate on your workspace", icon: Users, done: data.team_members > 1, href: wp("settings?tab=members") },
	] : [];

	const completedCount = steps.filter((s) => s.done).length;
	const allDone = completedCount === steps.length && steps.length > 0;

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
				<StatCard icon={CreditCard} label="Credits" value={isLoading ? "..." : Math.round(data?.credits ?? 0).toLocaleString()} />
				<StatCard icon={Calendar} label="Scheduled Posts" value={isLoading ? "..." : String(data?.scheduled_posts ?? 0)} />
				<StatCard icon={MessageSquare} label="Chatbots" value={isLoading ? "..." : String(data?.chatbot_count ?? 0)} />
				<StatCard icon={Share2} label="Social Accounts" value={isLoading ? "..." : String(data?.social_accounts ?? 0)} />
			</div>

			{/* Getting Started checklist */}
			{!isLoading && !allDone && steps.length > 0 && (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Rocket size={20} className="text-[var(--sq-primary)]" />
							Getting Started
						</CardTitle>
						<div className="flex items-center gap-3 mt-2">
							<div className="flex-1 h-2 rounded-full bg-[var(--muted)] overflow-hidden">
								<div
									className="h-full rounded-full bg-[var(--sq-primary)] transition-all duration-500"
									style={{ width: `${(completedCount / steps.length) * 100}%` }}
								/>
							</div>
							<span className="text-sm font-medium text-[var(--muted-foreground)]">{completedCount}/{steps.length}</span>
						</div>
					</CardHeader>
					<CardContent className="space-y-2 pt-0">
						{steps.map((step) => {
							const Icon = step.icon;
							return (
								<Link
									key={step.key}
									to={step.href}
									className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
										step.done
											? "border-green-200 bg-green-50/50"
											: "border-[var(--border)] hover:border-[var(--sq-primary)] hover:bg-[color-mix(in_srgb,var(--sq-primary)_3%,transparent)]"
									}`}
								>
									{step.done ? (
										<CheckCircle2 size={22} className="shrink-0 text-green-500" />
									) : (
										<Circle size={22} className="shrink-0 text-[var(--muted-foreground)]" />
									)}
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--sq-primary)_8%,transparent)]">
										<Icon size={18} className="text-[var(--sq-primary)]" />
									</div>
									<div className="min-w-0 flex-1">
										<p className={`text-sm font-medium ${step.done ? "text-green-700 line-through" : ""}`}>{step.label}</p>
										<p className="text-xs text-[var(--muted-foreground)]">{step.description}</p>
									</div>
									{!step.done && (
										<Button variant="outline" size="sm" className="shrink-0 gap-1">
											Start <ArrowRight size={14} />
										</Button>
									)}
								</Link>
							);
						})}
					</CardContent>
				</Card>
			)}

			{/* Recent Activity */}
			<div className="grid gap-6 lg:grid-cols-2">
				<RecentPosts posts={data?.recent_posts} isLoading={isLoading} />
				<RecentArticles articles={data?.recent_articles} isLoading={isLoading} />
			</div>
		</div>
	);
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
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

function RecentPosts({ posts, isLoading }: { posts?: { id: number; title: string; status: string; platforms: string[] }[]; isLoading: boolean }) {
	return (
		<Card>
			<CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Clock size={18} /> Recent Posts</CardTitle></CardHeader>
			<CardContent>
				{isLoading ? <p className="text-sm text-[var(--muted-foreground)]">Loading...</p> : !posts?.length ? (
					<p className="text-sm text-[var(--muted-foreground)]">No posts yet</p>
				) : (
					<div className="space-y-3">
						{posts.map((post) => (
							<div key={post.id} className="flex items-center justify-between rounded-md border border-[var(--border)] p-3">
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">{post.title || "Untitled post"}</p>
									<p className="text-xs text-[var(--muted-foreground)]">{post.platforms.join(", ")}</p>
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

function RecentArticles({ articles, isLoading }: { articles?: { id: number; title: string; created: string }[]; isLoading: boolean }) {
	return (
		<Card>
			<CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FileText size={18} /> Recent Articles</CardTitle></CardHeader>
			<CardContent>
				{isLoading ? <p className="text-sm text-[var(--muted-foreground)]">Loading...</p> : !articles?.length ? (
					<p className="text-sm text-[var(--muted-foreground)]">No articles yet</p>
				) : (
					<div className="space-y-3">
						{articles.map((article) => (
							<div key={article.id} className="flex items-center justify-between rounded-md border border-[var(--border)] p-3">
								<p className="truncate text-sm font-medium">{article.title}</p>
								<p className="shrink-0 text-xs text-[var(--muted-foreground)]">{new Date(article.created).toLocaleDateString()}</p>
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
		scheduled: "bg-blue-100 text-blue-700", published: "bg-green-100 text-green-700",
		draft: "bg-gray-100 text-gray-600", failed: "bg-red-100 text-red-700",
		partially_published: "bg-yellow-100 text-yellow-700",
	};
	return <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>{status.replace("_", " ")}</span>;
}
