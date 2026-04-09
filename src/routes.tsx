import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/app-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { AuthGuard } from "@/components/shared/auth-guard";
import { IframeBridge } from "@/components/shared/iframe-bridge";

// ── All pages lazy-loaded ──
const LoginPage = lazy(() => import("@/pages/auth/login-page").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("@/pages/dashboard/dashboard-page").then((m) => ({ default: m.DashboardPage })));
const SocialDashboardPage = lazy(() => import("@/pages/social/social-dashboard-page").then((m) => ({ default: m.SocialDashboardPage })));
const ManagePostsPage = lazy(() => import("@/pages/social/manage-posts-page").then((m) => ({ default: m.ManagePostsPage })));
const CreatePostPage = lazy(() => import("@/pages/social/create-post-page").then((m) => ({ default: m.CreatePostPage })));
const CalendarPage = lazy(() => import("@/pages/social/calendar-page").then((m) => ({ default: m.CalendarPage })));
const CommentsPage = lazy(() => import("@/pages/social/comments-page").then((m) => ({ default: m.CommentsPage })));
const InboxPage = lazy(() => import("@/pages/social/inbox-page").then((m) => ({ default: m.InboxPage })));
const AnalyticsPage = lazy(() => import("@/pages/social/analytics-page").then((m) => ({ default: m.AnalyticsPage })));
const ChatbotListPage = lazy(() => import("@/pages/chatbot/chatbot-list-page").then((m) => ({ default: m.ChatbotListPage })));
const ChatbotAnalyticsPage = lazy(() => import("@/pages/chatbot/chatbot-analytics-page").then((m) => ({ default: m.ChatbotAnalyticsPage })));
const ChatbotTemplatesPage = lazy(() => import("@/pages/chatbot/chatbot-templates-page").then((m) => ({ default: m.ChatbotTemplatesPage })));
const LiveAgentPage = lazy(() => import("@/pages/chatbot/live-agent-page").then((m) => ({ default: m.LiveAgentPage })));
const TemplatesPage = lazy(() => import("@/pages/ai/templates-page").then((m) => ({ default: m.TemplatesPage })));
const ImageGeneratorPage = lazy(() => import("@/pages/ai/image-generator-page").then((m) => ({ default: m.ImageGeneratorPage })));
const VideoGeneratorPage = lazy(() => import("@/pages/ai/video-generator-page").then((m) => ({ default: m.VideoGeneratorPage })));
const AudioPage = lazy(() => import("@/pages/ai/audio-page").then((m) => ({ default: m.AudioPage })));
const ArticleGeneratorPage = lazy(() => import("@/pages/ai/article-generator-page").then((m) => ({ default: m.ArticleGeneratorPage })));
const AdManagerPage = lazy(() => import("@/pages/ad-manager/ad-manager-page").then((m) => ({ default: m.AdManagerPage })));
const IntegrationsPage = lazy(() => import("@/pages/integrations/integrations-page").then((m) => ({ default: m.IntegrationsPage })));
const BillingPage = lazy(() => import("@/pages/billing/billing-page").then((m) => ({ default: m.BillingPage })));
const WorkspacePage = lazy(() => import("@/pages/workspace/workspace-page").then((m) => ({ default: m.WorkspacePage })));
const MediaLibraryPage = lazy(() => import("@/pages/media/media-library-page").then((m) => ({ default: m.MediaLibraryPage })));
const AccountPage = lazy(() => import("@/pages/account/account-page").then((m) => ({ default: m.AccountPage })));
const HistoryPage = lazy(() => import("@/pages/history/history-page").then((m) => ({ default: m.HistoryPage })));
const AgencyPage = lazy(() => import("@/pages/agency/agency-page").then((m) => ({ default: m.AgencyPage })));
const NotFoundPage = lazy(() => import("@/pages/misc/not-found-page").then((m) => ({ default: m.NotFoundPage })));

function S({ children }: { children: React.ReactNode }) {
	return <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>}>{children}</Suspense>;
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

			/* ── AI Captain (iframe — separate React app) ── */
			{ path: "/my/captain", element: <Bridge path="/my/ai-captain" title="AI Captain" /> },

			/* ── Social Media (all native) ── */
			{ path: "/my/social-media", element: <S><SocialDashboardPage /></S> },
			{ path: "/my/social-media/create-post", element: <S><CreatePostPage /></S> },
			{ path: "/my/social-media/posts", element: <S><ManagePostsPage /></S> },
			{ path: "/my/social-media/calendar", element: <S><CalendarPage /></S> },
			{ path: "/my/social-media/comments", element: <S><CommentsPage /></S> },
			{ path: "/my/social-media/inbox", element: <S><InboxPage /></S> },
			{ path: "/my/social-media/analytics", element: <S><AnalyticsPage /></S> },
			{ path: "/my/social-media/accounts", element: <S><IntegrationsPage /></S> },

			/* ── Chatbot (native + iframe for create) ── */
			{ path: "/my/chatbot", element: <S><ChatbotListPage /></S> },
			{ path: "/my/chatbot/create", element: <Bridge path="/my/chatbot/create" title="Create Chatbot" /> },
			{ path: "/my/chatbot/live-agent", element: <S><LiveAgentPage /></S> },
			{ path: "/my/chatbot/templates", element: <S><ChatbotTemplatesPage /></S> },
			{ path: "/my/chatbot/analytics", element: <S><ChatbotAnalyticsPage /></S> },
			{ path: "/my/chatbot/settings", element: <Bridge path="/my/chatbot/settings" title="Chatbot Settings" /> },
			{ path: "/my/chatbot/*", element: <Bridge path="/my/chatbot" title="Chatbot" /> },

			/* ── AI Tools (all native) ── */
			{ path: "/my/templates", element: <S><TemplatesPage /></S> },
			{ path: "/my/image-generator", element: <S><ImageGeneratorPage /></S> },
			{ path: "/my/text-to-video", element: <S><VideoGeneratorPage /></S> },
			{ path: "/my/text-to-audio", element: <S><AudioPage /></S> },
			{ path: "/my/article-generator", element: <S><ArticleGeneratorPage /></S> },

			/* ── Ad Manager (native) ── */
			{ path: "/my/ad-manager", element: <S><AdManagerPage /></S> },
			{ path: "/my/ad-manager/*", element: <S><AdManagerPage /></S> },

			/* ── Media Library (native) ── */
			{ path: "/my/media", element: <S><MediaLibraryPage /></S> },

			/* ── Video Editor + Presentations (iframe — separate apps) ── */
			{ path: "/my/video-editor", element: <Bridge path="/my/video-editor" title="Video Editor" /> },
			{ path: "/my/presentations", element: <Bridge path="/my/presentations" title="Presentations" /> },

			/* ── Integrations (native) ── */
			{ path: "/my/integrations", element: <S><IntegrationsPage /></S> },
			{ path: "/my/integrations/*", element: <S><IntegrationsPage /></S> },

			/* ── Billing (native) ── */
			{ path: "/my/billing", element: <S><BillingPage /></S> },
			{ path: "/my/billing/*", element: <S><BillingPage /></S> },

			/* ── Workspace + Account + History (native) ── */
			{ path: "/my/workspace", element: <S><WorkspacePage /></S> },
			{ path: "/my/account", element: <S><AccountPage /></S> },
			{ path: "/my/history", element: <S><HistoryPage /></S> },
			{ path: "/my/documents", element: <S><HistoryPage /></S> },

			/* ── Agency + Whitelabel (native) ── */
			{ path: "/my/agency", element: <S><AgencyPage /></S> },
			{ path: "/my/agency/*", element: <S><AgencyPage /></S> },
			{ path: "/my/whitelabel", element: <Bridge path="/my/whitelabel" title="Whitelabel" /> },

			/* ── 404 ── */
			{ path: "*", element: <S><NotFoundPage /></S> },
		],
	},
], {
	basename: import.meta.env.BASE_URL.replace(/\/$/, ""),
});
