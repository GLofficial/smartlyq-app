import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/app-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { AuthGuard } from "@/components/shared/auth-guard";
import { IframeBridge } from "@/components/shared/iframe-bridge";
import { AdminLayout } from "@/layouts/admin-layout";

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
const LabelsPage = lazy(() => import("@/pages/social/labels-page").then((m) => ({ default: m.LabelsPage })));
const QueuesPage = lazy(() => import("@/pages/social/queues-page").then((m) => ({ default: m.QueuesPage })));
const ReportsPage = lazy(() => import("@/pages/analyze/reports-page").then((m) => ({ default: m.ReportsPage })));
const ScheduledReportsPage = lazy(() => import("@/pages/analyze/scheduled-reports-page").then((m) => ({ default: m.ScheduledReportsPage })));
const UrlShortenerPage = lazy(() => import("@/pages/connect/url-shortener-page").then((m) => ({ default: m.UrlShortenerPage })));
const BrandsPage = lazy(() => import("@/pages/workspace/brands-page").then((m) => ({ default: m.BrandsPage })));
const BusinessesPage = lazy(() => import("@/pages/workspace/businesses-page").then((m) => ({ default: m.BusinessesPage })));
const DeveloperPage = lazy(() => import("@/pages/connect/developer-page").then((m) => ({ default: m.DeveloperPage })));
const ChatbotCreatePage = lazy(() => import("@/pages/chatbot/chatbot-create-page").then((m) => ({ default: m.ChatbotCreatePage })));
const ChatbotSettingsPage = lazy(() => import("@/pages/chatbot/chatbot-settings-page").then((m) => ({ default: m.ChatbotSettingsPage })));
const ChatbotHistoryPage = lazy(() => import("@/pages/chatbot/chatbot-history-page").then((m) => ({ default: m.ChatbotHistoryPage })));
const SignupPage = lazy(() => import("@/pages/auth/signup-page").then((m) => ({ default: m.SignupPage })));
const ResetPage = lazy(() => import("@/pages/auth/reset-page").then((m) => ({ default: m.ResetPage })));
const WhitelabelPage = lazy(() => import("@/pages/whitelabel/whitelabel-page").then((m) => ({ default: m.WhitelabelPage })));
const AgencyBillingPage = lazy(() => import("@/pages/whitelabel/agency-billing-page").then((m) => ({ default: m.AgencyBillingPage })));
const AgencyReportsPage = lazy(() => import("@/pages/whitelabel/agency-reports-page").then((m) => ({ default: m.AgencyReportsPage })));
const CaptainPage = lazy(() => import("@/pages/captain/captain-page").then((m) => ({ default: m.CaptainPage })));
const CaptainBoardsPage = lazy(() => import("@/pages/captain/captain-boards-page").then((m) => ({ default: m.CaptainBoardsPage })));
const VideoEditorPage = lazy(() => import("@/pages/video-editor/video-editor-page").then((m) => ({ default: m.VideoEditorPage })));
const PresentationsPage = lazy(() => import("@/pages/presentations/presentations-page").then((m) => ({ default: m.PresentationsPage })));
const AdminDashboardPage = lazy(() => import("@/pages/admin/admin-dashboard-page").then((m) => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import("@/pages/admin/admin-users-page").then((m) => ({ default: m.AdminUsersPage })));
const AdminPlansPage = lazy(() => import("@/pages/admin/admin-plans-page").then((m) => ({ default: m.AdminPlansPage })));
const AdminSubscriptionsPage = lazy(() => import("@/pages/admin/admin-subscriptions-page").then((m) => ({ default: m.AdminSubscriptionsPage })));
const AdminTransactionsPage = lazy(() => import("@/pages/admin/admin-transactions-page").then((m) => ({ default: m.AdminTransactionsPage })));
const AdminWhitelabelPage = lazy(() => import("@/pages/admin/admin-whitelabel-page").then((m) => ({ default: m.AdminWhitelabelPage })));
const AdminSettingsPage = lazy(() => import("@/pages/admin/admin-settings-page").then((m) => ({ default: m.AdminSettingsPage })));
const AdminPricingPage = lazy(() => import("@/pages/admin/admin-pricing-page").then((m) => ({ default: m.AdminPricingPage })));
const AdminBlogsPage = lazy(() => import("@/pages/admin/admin-blogs-page").then((m) => ({ default: m.AdminBlogsPage })));
const AdminCmsPagesPage = lazy(() => import("@/pages/admin/admin-cms-pages-page").then((m) => ({ default: m.AdminCmsPagesPage })));
const AdminTemplatesPageAdmin = lazy(() => import("@/pages/admin/admin-templates-page").then((m) => ({ default: m.AdminTemplatesPage })));
const AdminAssistantsPage = lazy(() => import("@/pages/admin/admin-assistants-page").then((m) => ({ default: m.AdminAssistantsPage })));
const AdminSupportPage = lazy(() => import("@/pages/admin/admin-support-page").then((m) => ({ default: m.AdminSupportPage })));
const AdminReportsPage = lazy(() => import("@/pages/admin/admin-reports-page").then((m) => ({ default: m.AdminReportsPage })));
const AdminTracesPage = lazy(() => import("@/pages/admin/admin-traces-page").then((m) => ({ default: m.AdminTracesPage })));
const AdminKbPage = lazy(() => import("@/pages/admin/admin-kb-page").then((m) => ({ default: m.AdminKbPage })));
const AdminSkillsPage = lazy(() => import("@/pages/admin/admin-skills-page").then((m) => ({ default: m.AdminSkillsPage })));
const AdminMonitoringPage = lazy(() => import("@/pages/admin/admin-monitoring-page").then((m) => ({ default: m.AdminMonitoringPage })));
const AdminBillingDebugPage = lazy(() => import("@/pages/admin/admin-billing-debug-page").then((m) => ({ default: m.AdminBillingDebugPage })));
const ChatPage = lazy(() => import("@/pages/chat/chat-page").then((m) => ({ default: m.ChatPage })));
const ContentRewriterPage = lazy(() => import("@/pages/ai/content-rewriter-page").then((m) => ({ default: m.ContentRewriterPage })));
const EditorPage = lazy(() => import("@/pages/ai/editor-page").then((m) => ({ default: m.EditorPage })));
const AnalystPage = lazy(() => import("@/pages/ai/analyst-page").then((m) => ({ default: m.AnalystPage })));
const ArticlesPage = lazy(() => import("@/pages/ai/articles-page").then((m) => ({ default: m.ArticlesPage })));
const PlansPage = lazy(() => import("@/pages/plans/plans-page").then((m) => ({ default: m.PlansPage })));
const SuspendedPage = lazy(() => import("@/pages/misc/suspended-page").then((m) => ({ default: m.SuspendedPage })));
const AdSetsPage = lazy(() => import("@/pages/ads/ad-sets-page").then((m) => ({ default: m.AdSetsPage })));
const AdsPage = lazy(() => import("@/pages/ads/ads-page").then((m) => ({ default: m.AdsPage })));
const AdAuditLogPage = lazy(() => import("@/pages/ads/ad-audit-log-page").then((m) => ({ default: m.AdAuditLogPage })));
const AdSettingsPage = lazy(() => import("@/pages/ads/ad-settings-page").then((m) => ({ default: m.AdSettingsPage })));
const AdsInsightsPage = lazy(() => import("@/pages/integrations/ads-insights-page").then((m) => ({ default: m.AdsInsightsPage })));
const GoogleInsightsPage = lazy(() => import("@/pages/integrations/google-insights-page").then((m) => ({ default: m.GoogleInsightsPage })));
const WoocommercePage = lazy(() => import("@/pages/integrations/woocommerce-page").then((m) => ({ default: m.WoocommercePage })));
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
			{ path: "/signup", element: <S><SignupPage /></S> },
			{ path: "/reset", element: <S><ResetPage /></S> },
		],
	},
	{
		element: <AuthGuard><AppLayout /></AuthGuard>,
		children: [
			/* ── Dashboard ── */
			{ path: "/my", element: <S><DashboardPage /></S> },

			/* ── AI Captain (embedded inside shell) ── */
			{ path: "/my/captain", element: <S><CaptainPage /></S> },
			{ path: "/my/ai-captain/boards", element: <S><CaptainBoardsPage /></S> },

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
			{ path: "/my/chatbot/create", element: <S><ChatbotCreatePage /></S> },
			{ path: "/my/chatbot/live-agent", element: <S><LiveAgentPage /></S> },
			{ path: "/my/chatbot/templates", element: <S><ChatbotTemplatesPage /></S> },
			{ path: "/my/chatbot/analytics", element: <S><ChatbotAnalyticsPage /></S> },
			{ path: "/my/chatbot/settings", element: <S><ChatbotSettingsPage /></S> },
			{ path: "/my/chatbot/history", element: <S><ChatbotHistoryPage /></S> },
			{ path: "/my/chatbot/*", element: <Bridge path="/my/chatbot" title="Chatbot" /> },

			/* ── AI Tools (all native) ── */
			{ path: "/my/templates", element: <S><TemplatesPage /></S> },
			{ path: "/my/image-generator", element: <S><ImageGeneratorPage /></S> },
			{ path: "/my/text-to-video", element: <S><VideoGeneratorPage /></S> },
			{ path: "/my/text-to-audio", element: <S><AudioPage /></S> },
			{ path: "/my/article-generator", element: <S><ArticleGeneratorPage /></S> },

			/* ── Ad Manager (native) ── */
			{ path: "/my/ad-manager", element: <S><AdManagerPage /></S> },
			{ path: "/my/ad-manager/ad-sets", element: <S><AdSetsPage /></S> },
			{ path: "/my/ad-manager/ads", element: <S><AdsPage /></S> },
			{ path: "/my/ad-manager/audit-log", element: <S><AdAuditLogPage /></S> },
			{ path: "/my/ad-manager/settings", element: <S><AdSettingsPage /></S> },
			{ path: "/my/ad-manager/*", element: <S><AdManagerPage /></S> },

			/* ── Media Library (native) ── */
			{ path: "/my/media", element: <S><MediaLibraryPage /></S> },

			/* ── Video Editor + Presentations (embedded inside shell) ── */
			{ path: "/my/video-editor", element: <S><VideoEditorPage /></S> },
			{ path: "/my/presentations", element: <S><PresentationsPage /></S> },

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

			/* ── Publish extras ── */
			{ path: "/my/social-media/labels", element: <S><LabelsPage /></S> },
			{ path: "/my/social-media/queues", element: <S><QueuesPage /></S> },
			{ path: "/my/bulk-scheduler", element: <S><QueuesPage /></S> },

			/* ── Analyze ── */
			{ path: "/my/social-media/report", element: <S><ReportsPage /></S> },
			{ path: "/my/social-media/custom-report", element: <S><ReportsPage /></S> },
			{ path: "/my/social-media/schedule-report", element: <S><ScheduledReportsPage /></S> },

			/* ── Content / AI (dedicated pages — NOT wrong mappings) ── */
			{ path: "/my/content-rewriter", element: <S><ContentRewriterPage /></S> },
			{ path: "/my/editor", element: <S><EditorPage /></S> },
			{ path: "/my/chat", element: <S><ChatPage /></S> },
			{ path: "/my/chat/assistants", element: <S><ChatPage /></S> },
			{ path: "/my/analyst", element: <S><AnalystPage /></S> },
			{ path: "/my/articles", element: <S><ArticlesPage /></S> },
			{ path: "/my/audio-to-text", element: <S><AudioPage /></S> },
			{ path: "/my/image-to-video", element: <S><VideoGeneratorPage /></S> },

			/* ── Plans ── */
			{ path: "/my/plans", element: <S><PlansPage /></S> },
			{ path: "/my/suspended", element: <S><SuspendedPage /></S> },

			/* ── Connect ── */
			{ path: "/my/url-shortener", element: <S><UrlShortenerPage /></S> },
			{ path: "/my/canva", element: <S><IntegrationsPage /></S> },
			{ path: "/my/developer", element: <S><DeveloperPage /></S> },

			/* ── Integration insights (ads, analytics, woocommerce) ── */
			{ path: "/my/integrations/facebook/ads", element: <S><AdsInsightsPage /></S> },
			{ path: "/my/integrations/facebook-ads/*", element: <S><AdsInsightsPage /></S> },
			{ path: "/my/integrations/google/ads", element: <S><AdsInsightsPage /></S> },
			{ path: "/my/integrations/google-ads/*", element: <S><AdsInsightsPage /></S> },
			{ path: "/my/integrations/tiktok/ads", element: <S><AdsInsightsPage /></S> },
			{ path: "/my/integrations/tiktok-ads/*", element: <S><AdsInsightsPage /></S> },
			{ path: "/my/integrations/linkedin/ads", element: <S><AdsInsightsPage /></S> },
			{ path: "/my/integrations/linkedin-ads/*", element: <S><AdsInsightsPage /></S> },
			{ path: "/my/integrations/google/projects", element: <S><GoogleInsightsPage /></S> },
			{ path: "/my/integrations/google/traffic", element: <S><GoogleInsightsPage /></S> },
			{ path: "/my/integrations/woocommerce/stores", element: <S><WoocommercePage /></S> },
			{ path: "/my/integrations/woocommerce/insights", element: <S><WoocommercePage /></S> },

			/* ── Workspace extras ── */
			{ path: "/my/brands", element: <S><BrandsPage /></S> },
			{ path: "/my/businesses", element: <S><BusinessesPage /></S> },
			{ path: "/my/business-details", element: <S><BusinessesPage /></S> },
			{ path: "/my/campaigns", element: <S><BrandsPage /></S> },
			{ path: "/my/workspace/members", element: <S><WorkspacePage /></S> },

			/* ── Agency + Whitelabel (native) ── */
			{ path: "/my/agency", element: <S><AgencyPage /></S> },
			{ path: "/my/agency/billing", element: <S><AgencyBillingPage /></S> },
			{ path: "/my/agency/reports", element: <S><AgencyReportsPage /></S> },
			{ path: "/my/agency/*", element: <S><AgencyPage /></S> },
			{ path: "/my/whitelabel", element: <S><WhitelabelPage /></S> },

			/* ── 404 ── */
			{ path: "*", element: <S><NotFoundPage /></S> },
		],
	},
	/* ── Admin Panel (separate layout, role=1 guard) ── */
	{
		element: <AuthGuard><AdminLayout /></AuthGuard>,
		children: [
			{ path: "/admin", element: <S><AdminDashboardPage /></S> },
			{ path: "/admin/users", element: <S><AdminUsersPage /></S> },
			{ path: "/admin/plans", element: <S><AdminPlansPage /></S> },
			{ path: "/admin/subscriptions", element: <S><AdminSubscriptionsPage /></S> },
			{ path: "/admin/transactions", element: <S><AdminTransactionsPage /></S> },
			{ path: "/admin/pricing", element: <S><AdminPricingPage /></S> },
			{ path: "/admin/templates", element: <S><AdminTemplatesPageAdmin /></S> },
			{ path: "/admin/assistants", element: <S><AdminAssistantsPage /></S> },
			{ path: "/admin/blogs", element: <S><AdminBlogsPage /></S> },
			{ path: "/admin/pages", element: <S><AdminCmsPagesPage /></S> },
			{ path: "/admin/ai-captain/traces", element: <S><AdminTracesPage /></S> },
			{ path: "/admin/ai-captain/kb", element: <S><AdminKbPage /></S> },
			{ path: "/admin/ai-captain/skills", element: <S><AdminSkillsPage /></S> },
			{ path: "/admin/reports", element: <S><AdminReportsPage /></S> },
			{ path: "/admin/support", element: <S><AdminSupportPage /></S> },
			{ path: "/admin/whitelabel", element: <S><AdminWhitelabelPage /></S> },
			{ path: "/admin/monitoring", element: <S><AdminMonitoringPage /></S> },
			{ path: "/admin/billing-debug", element: <S><AdminBillingDebugPage /></S> },
			{ path: "/admin/settings", element: <S><AdminSettingsPage /></S> },
		],
	},
], {
	basename: import.meta.env.BASE_URL.replace(/\/$/, ""),
});
