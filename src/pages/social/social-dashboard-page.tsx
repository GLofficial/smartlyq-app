import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Calendar,
	CheckCircle,
	AlertTriangle,
	MessageSquare,
	MessagesSquare,
	Plus,
	Clock,
	Users,
} from "lucide-react";
import { useSocialHub } from "@/api/social";
import { PlatformIcon } from "./platform-icon";

export function SocialDashboardPage() {
	const { data, isLoading } = useSocialHub();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Social Media</h1>
				<Link to="/my/social-media/create-post">
					<Button>
						<Plus size={16} />
						Create Post
					</Button>
				</Link>
			</div>

			{/* Stats */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
				<StatCard
					icon={CheckCircle}
					label="Published Today"
					value={data?.stats.published_today}
					loading={isLoading}
					color="text-green-600"
				/>
				<StatCard
					icon={Calendar}
					label="Scheduled"
					value={data?.stats.scheduled}
					loading={isLoading}
					color="text-blue-600"
				/>
				<StatCard
					icon={AlertTriangle}
					label="Failed"
					value={data?.stats.failed}
					loading={isLoading}
					color="text-red-600"
				/>
				<StatCard
					icon={MessageSquare}
					label="Unread DMs"
					value={data?.stats.unread_messages}
					loading={isLoading}
					color="text-purple-600"
				/>
				<StatCard
					icon={MessagesSquare}
					label="Unreplied"
					value={data?.stats.unreplied_comments}
					loading={isLoading}
					color="text-orange-600"
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Connected Accounts */}
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Users size={18} />
							Accounts ({data?.accounts.length ?? 0})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<p className="text-sm text-[var(--muted-foreground)]">Loading...</p>
						) : !(data?.accounts ?? []).length ? (
							<p className="text-sm text-[var(--muted-foreground)]">
								No accounts connected yet.
							</p>
						) : (
							<div className="space-y-3">
								{data?.accounts.map((acc) => (
									<div
										key={acc.id}
										className="flex items-center gap-3 rounded-md border border-[var(--border)] p-3"
									>
										{acc.profile_picture ? (
											<img
												src={acc.profile_picture}
												alt={acc.account_name}
												className="h-9 w-9 rounded-full object-cover"
											/>
										) : (
											<PlatformIcon platform={acc.platform} size={20} />
										)}
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium">
												{acc.account_name}
											</p>
											<p className="text-xs text-[var(--muted-foreground)] capitalize">
												{acc.platform}
											</p>
										</div>
										<TokenBadge status={acc.token_status} />
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Upcoming Posts */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Clock size={18} />
							Upcoming Posts
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<p className="text-sm text-[var(--muted-foreground)]">Loading...</p>
						) : !(data?.upcoming_posts ?? []).length ? (
							<p className="text-sm text-[var(--muted-foreground)]">
								No scheduled posts.
							</p>
						) : (
							<div className="space-y-3">
								{data?.upcoming_posts.map((post) => (
									<div
										key={post.id}
										className="flex items-center justify-between rounded-md border border-[var(--border)] p-3"
									>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium">
												{post.title || post.content || "Untitled"}
											</p>
											<div className="mt-1 flex items-center gap-2">
												{post.platforms.map((p) => (
													<PlatformIcon key={p} platform={p} size={14} />
												))}
												<span className="text-xs text-[var(--muted-foreground)]">
													{post.scheduled_time
														? new Date(post.scheduled_time).toLocaleString()
														: ""}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Recent Posts */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="text-lg">Recent Posts</CardTitle>
					<Link to="/my/social-media/posts">
						<Button variant="outline" size="sm">
							View All
						</Button>
					</Link>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<p className="text-sm text-[var(--muted-foreground)]">Loading...</p>
					) : !(data?.recent_posts ?? []).length ? (
						<p className="text-sm text-[var(--muted-foreground)]">No posts yet.</p>
					) : (
						<div className="space-y-2">
							{data?.recent_posts.map((post) => (
								<div
									key={post.id}
									className="flex items-center justify-between rounded-md border border-[var(--border)] p-3"
								>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium">
											{post.title || post.content || "Untitled"}
										</p>
										<div className="mt-1 flex items-center gap-2">
											{post.platforms.map((p) => (
												<PlatformIcon key={p} platform={p} size={14} />
											))}
										</div>
									</div>
									<StatusBadge status={post.status} />
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function StatCard({
	icon: Icon,
	label,
	value,
	loading,
	color,
}: {
	icon: React.ElementType;
	label: string;
	value?: number;
	loading: boolean;
	color: string;
}) {
	return (
		<Card>
			<CardContent className="flex items-center gap-3 p-4">
				<Icon size={20} className={color} />
				<div>
					<p className="text-xl font-bold">{loading ? "..." : (value ?? 0)}</p>
					<p className="text-xs text-[var(--muted-foreground)]">{label}</p>
				</div>
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

function TokenBadge({ status }: { status: string }) {
	const bad = ["expired", "revoked", "invalid", "error"].includes(status.toLowerCase());
	return bad ? (
		<span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
			{status}
		</span>
	) : null;
}
