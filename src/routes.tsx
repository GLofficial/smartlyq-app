import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/app-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { AuthGuard } from "@/components/shared/auth-guard";
import { IframeBridge } from "@/components/shared/iframe-bridge";

// ── Lazy-loaded native pages ──
const LoginPage = lazy(() => import("@/pages/auth/login-page").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("@/pages/dashboard/dashboard-page").then((m) => ({ default: m.DashboardPage })));
const SocialDashboardPage = lazy(() => import("@/pages/social/social-dashboard-page").then((m) => ({ default: m.SocialDashboardPage })));
const ManagePostsPage = lazy(() => import("@/pages/social/manage-posts-page").then((m) => ({ default: m.ManagePostsPage })));
const CreatePostPage = lazy(() => import("@/pages/social/create-post-page").then((m) => ({ default: m.CreatePostPage })));
const CalendarPage = lazy(() => import("@/pages/social/calendar-page").then((m) => ({ default: m.CalendarPage })));
const CommentsPage = lazy(() => import("@/pages/social/comments-page").then((m) => ({ default: m.CommentsPage })));
const InboxPage = lazy(() => import("@/pages/social/inbox-page").then((m) => ({ default: m.InboxPage })));
const AnalyticsPage = lazy(() => import("@/pages/social/analytics-page").then((m) => ({ default: m.AnalyticsPage })));
const NotFoundPage = lazy(() => import("@/pages/misc/not-found-page").then((m) => ({ default: m.NotFoundPage })));

function PageLoader() {
	return (
		<div className="flex h-[50vh] items-center justify-center">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
		</div>
	);
}

function S({ children }: { children: React.ReactNode }) {
	return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function Bridge({ path, title }: { path: string; title: string }) {
	return <IframeBridge path={path} title={title} />;
}

export const router = createBrowserRouter([
	{ path: "/", element: <Navigate to="/my" replace /> },
	{
		element: <AuthLayout />,
		children: [
			{ path: "/login", element: <S><LoginPage /></S> },
			{ path: "/signup", element: <Bridge path="/signup" title="Sign Up" /> },
			{ path: "/reset", element: <Bridge path="/reset" title="Reset Password" /> },
		],
	},
	{
		element: <AuthGuard><AppLayout /></AuthGuard>,
		children: [
			/* ── Dashboard ── */
			{ path: "/my", element: <S><DashboardPage /></S> },

			/* ── AI Captain ── */
			{ path: "/my/captain", element: <Bridge path="/my/ai-captain" title="AI Captain" /> },

			/* ── Social Media (all native React) ── */
			{ path: "/my/social-media", element: <S><SocialDashboardPage /></S> },
			{ path: "/my/social-media/create-post", element: <S><CreatePostPage /></S> },
			{ path: "/my/social-media/posts", element: <S><ManagePostsPage /></S> },
			{ path: "/my/social-media/calendar", element: <S><CalendarPage /></S> },
			{ path: "/my/social-media/comments", element: <S><CommentsPage /></S> },
			{ path: "/my/social-media/inbox", element: <S><InboxPage /></S> },
			{ path: "/my/social-media/analytics", element: <S><AnalyticsPage /></S> },
			{ path: "/my/social-media/accounts", element: <Bridge path="/my/social-media/accounts" title="Social Accounts" /> },

			/* ── Chatbot ── */
			{ path: "/my/chatbot", element: <Bridge path="/my/chatbot" title="My Chatbots" /> },
			{ path: "/my/chatbot/create", element: <Bridge path="/my/chatbot/create" title="Create Chatbot" /> },
			{ path: "/my/chatbot/live-agent", element: <Bridge path="/my/chatbot/live-agent" title="Live Agent" /> },
			{ path: "/my/chatbot/templates", element: <Bridge path="/my/chatbot/templates" title="Chatbot Templates" /> },
			{ path: "/my/chatbot/analytics", element: <Bridge path="/my/chatbot/analytics" title="Chatbot Analytics" /> },
			{ path: "/my/chatbot/settings", element: <Bridge path="/my/chatbot/settings" title="Chatbot Settings" /> },
			{ path: "/my/chatbot/*", element: <Bridge path="/my/chatbot" title="Chatbot" /> },

			/* ── AI Tools ── */
			{ path: "/my/templates", element: <Bridge path="/my/templates" title="Templates" /> },
			{ path: "/my/image-generator", element: <Bridge path="/my/image-generator" title="Image Generator" /> },
			{ path: "/my/text-to-video", element: <Bridge path="/my/text-to-video" title="Video Generator" /> },
			{ path: "/my/text-to-audio", element: <Bridge path="/my/text-to-audio" title="Text to Audio" /> },
			{ path: "/my/article-generator", element: <Bridge path="/my/article-generator" title="Article Generator" /> },

			/* ── Ad Manager ── */
			{ path: "/my/ad-manager", element: <Bridge path="/my/ad-manager" title="Ad Manager" /> },
			{ path: "/my/ad-manager/campaigns", element: <Bridge path="/my/ad-manager/campaigns" title="Campaigns" /> },
			{ path: "/my/ad-manager/creatives", element: <Bridge path="/my/ad-manager/creatives" title="Creatives" /> },
			{ path: "/my/ad-manager/audiences", element: <Bridge path="/my/ad-manager/audiences" title="Audiences" /> },
			{ path: "/my/ad-manager/analytics", element: <Bridge path="/my/ad-manager/analytics" title="Ad Analytics" /> },
			{ path: "/my/ad-manager/*", element: <Bridge path="/my/ad-manager" title="Ad Manager" /> },

			/* ── Media / Video / Presentations ── */
			{ path: "/my/media", element: <Bridge path="/my/media" title="Media Library" /> },
			{ path: "/my/video-editor", element: <Bridge path="/my/video-editor" title="Video Editor" /> },
			{ path: "/my/presentations", element: <Bridge path="/my/presentations" title="Presentations" /> },

			/* ── Integrations ── */
			{ path: "/my/integrations", element: <Bridge path="/my/integrations" title="Integrations" /> },
			{ path: "/my/integrations/*", element: <Bridge path="/my/integrations" title="Integrations" /> },

			/* ── Billing ── */
			{ path: "/my/billing", element: <Bridge path="/my/billing" title="Billing" /> },
			{ path: "/my/billing/payments", element: <Bridge path="/my/billing/payments" title="Payments" /> },
			{ path: "/my/billing/subscriptions", element: <Bridge path="/my/billing/subscriptions" title="Subscriptions" /> },
			{ path: "/my/billing/*", element: <Bridge path="/my/billing" title="Billing" /> },

			/* ── Workspace / Account ── */
			{ path: "/my/workspace", element: <Bridge path="/my/workspace" title="Workspace" /> },
			{ path: "/my/account", element: <Bridge path="/my/account" title="Account" /> },
			{ path: "/my/history", element: <Bridge path="/my/history" title="History" /> },
			{ path: "/my/documents", element: <Bridge path="/my/documents" title="Documents" /> },

			/* ── Agency / Whitelabel ── */
			{ path: "/my/agency", element: <Bridge path="/my/agency" title="Agency" /> },
			{ path: "/my/agency/*", element: <Bridge path="/my/agency" title="Agency" /> },
			{ path: "/my/whitelabel", element: <Bridge path="/my/whitelabel" title="Whitelabel" /> },

			/* ── 404 ── */
			{ path: "*", element: <S><NotFoundPage /></S> },
		],
	},
], {
	basename: import.meta.env.BASE_URL.replace(/\/$/, ""),
});
