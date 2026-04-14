import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/app-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { AuthGuard } from "@/components/shared/auth-guard";
import { WorkspaceRouteGuard } from "@/components/shared/workspace-route-guard";
import { LegacyRedirect } from "@/components/shared/legacy-redirect";
import { IframeBridge } from "@/components/shared/iframe-bridge";
import { AdminLayout } from "@/layouts/admin-layout";
import { SettingsLayout } from "@/layouts/settings-layout";
import { AdManagerProvider } from "@/pages/ad-manager/ad-context";

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
const SocialAccountsPage = lazy(() => import("@/pages/social/social-accounts-page").then((m) => ({ default: m.SocialAccountsPage })));
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
const AdCreativesPage = lazy(() => import("@/pages/ads/ad-creatives-page").then((m) => ({ default: m.AdCreativesPage })));
const AdAudiencesPage = lazy(() => import("@/pages/ads/ad-audiences-page").then((m) => ({ default: m.AdAudiencesPage })));
const AdCampaignsPage = lazy(() => import("@/pages/ads/ad-campaigns-page").then((m) => ({ default: m.AdCampaignsPage })));
const AdAnalyticsPage = lazy(() => import("@/pages/ads/ad-analytics-page").then((m) => ({ default: m.AdAnalyticsPage })));
const IntegrationsPage = lazy(() => import("@/pages/integrations/integrations-page").then((m) => ({ default: m.IntegrationsPage })));
const BillingPage = lazy(() => import("@/pages/billing/billing-page").then((m) => ({ default: m.BillingPage })));
const WorkspacePage = lazy(() => import("@/pages/workspace/workspace-page").then((m) => ({ default: m.WorkspacePage })));
const MembersPage = lazy(() => import("@/pages/workspace/members-page").then((m) => ({ default: m.MembersPage })));
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
const CampaignWizard = lazy(() => import("@/pages/ad-manager/campaign-wizard/wizard-layout").then((m) => ({ default: m.CampaignWizard })));
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
const CrmDashboardPage = lazy(() => import("@/pages/crm/crm-dashboard-page").then((m) => ({ default: m.CrmDashboardPage })));
const CrmPipelinePage = lazy(() => import("@/pages/crm/crm-pipeline-page").then((m) => ({ default: m.CrmPipelinePage })));
const CrmProjectsPage = lazy(() => import("@/pages/crm/crm-projects-page").then((m) => ({ default: m.CrmProjectsPage })));
const CrmContactsPage = lazy(() => import("@/pages/crm/crm-contacts-page").then((m) => ({ default: m.CrmContactsPage })));
const CrmTasksPage = lazy(() => import("@/pages/crm/crm-tasks-page").then((m) => ({ default: m.CrmTasksPage })));
const CrmPreviewPage = lazy(() => import("@/pages/crm/crm-preview-page").then((m) => ({ default: m.CrmPreviewPage })));
const SettingsPage = lazy(() => import("@/pages/settings/settings-page").then((m) => ({ default: m.SettingsPage })));

function S({ children }: { children: React.ReactNode }) {
	return <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>}>{children}</Suspense>;
}

function Bridge({ path, title }: { path: string; title: string }) {
	return <IframeBridge path={path} title={title} />;
}

export const router = createBrowserRouter([
	{ path: "/", element: <Navigate to="/my" replace /> },

	/* ── Auth (public) ── */
	{
		element: <AuthLayout />,
		children: [
			{ path: "/login", element: <S><LoginPage /></S> },
			{ path: "/signup", element: <S><SignupPage /></S> },
			{ path: "/reset", element: <S><ResetPage /></S> },
		],
	},

	/* ── Legacy /my/* redirects → /w/{hash}/* ── */
	{ path: "/my", element: <AuthGuard><LegacyRedirect /></AuthGuard> },
	{ path: "/my/*", element: <AuthGuard><LegacyRedirect /></AuthGuard> },

	/* ── Workspace-scoped routes (/w/:hashId/*) ── */
	{
		path: "/w/:hashId",
		element: <AuthGuard><WorkspaceRouteGuard /></AuthGuard>,
		children: [
			{
				element: <AppLayout />,
				children: [
					/* Dashboard */
					{ index: true, element: <S><DashboardPage /></S> },
					{ path: "dashboard", element: <S><DashboardPage /></S> },

					/* AI Captain (embedded) */
					{ path: "captain", element: <S><CaptainPage /></S> },
					{ path: "ai-captain/boards", element: <S><CaptainBoardsPage /></S> },

					/* Social Media */
					{ path: "social-media", element: <S><SocialDashboardPage /></S> },
					{ path: "social-media/create-post", element: <S><CreatePostPage /></S> },
					{ path: "social-media/posts", element: <S><ManagePostsPage /></S> },
					{ path: "social-media/calendar", element: <S><CalendarPage /></S> },
					{ path: "social-media/comments", element: <S><CommentsPage /></S> },
					{ path: "social-media/inbox", element: <S><InboxPage /></S> },
					{ path: "social-media/analytics", element: <S><AnalyticsPage /></S> },
					{ path: "social-media/accounts", element: <S><SocialAccountsPage /></S> },
					{ path: "social-media/labels", element: <S><LabelsPage /></S> },
					{ path: "social-media/queues", element: <S><QueuesPage /></S> },
					{ path: "social-media/report", element: <S><ReportsPage /></S> },
					{ path: "social-media/custom-report", element: <S><ReportsPage /></S> },
					{ path: "social-media/schedule-report", element: <S><ScheduledReportsPage /></S> },

					/* Chatbot */
					{ path: "chatbot", element: <S><ChatbotListPage /></S> },
					{ path: "chatbot/create", element: <S><ChatbotCreatePage /></S> },
					{ path: "chatbot/live-agent", element: <S><LiveAgentPage /></S> },
					{ path: "chatbot/templates", element: <S><ChatbotTemplatesPage /></S> },
					{ path: "chatbot/analytics", element: <S><ChatbotAnalyticsPage /></S> },
					{ path: "chatbot/settings", element: <S><ChatbotSettingsPage /></S> },
					{ path: "chatbot/history", element: <S><ChatbotHistoryPage /></S> },
					{ path: "chatbot/*", element: <Bridge path="/my/chatbot" title="Chatbot" /> },

					/* AI Tools */
					{ path: "templates", element: <S><TemplatesPage /></S> },
					{ path: "image-generator", element: <S><ImageGeneratorPage /></S> },
					{ path: "text-to-video", element: <S><VideoGeneratorPage /></S> },
					{ path: "text-to-audio", element: <S><AudioPage /></S> },
					{ path: "article-generator", element: <S><ArticleGeneratorPage /></S> },
					{ path: "content-rewriter", element: <S><ContentRewriterPage /></S> },
					{ path: "editor", element: <S><EditorPage /></S> },
					{ path: "chat", element: <S><ChatPage /></S> },
					{ path: "chat/assistants", element: <S><ChatPage /></S> },
					{ path: "analyst", element: <S><AnalystPage /></S> },
					{ path: "articles", element: <S><ArticlesPage /></S> },
					{ path: "audio-to-text", element: <S><AudioPage /></S> },
					{ path: "image-to-video", element: <S><VideoGeneratorPage /></S> },

					/* Ad Manager (wrapped in AdManagerProvider for shared filter state) */
					{ path: "ad-manager", element: <S><AdManagerProvider><AdManagerPage /></AdManagerProvider></S> },
					{ path: "ad-manager/ad-sets", element: <S><AdManagerProvider><AdSetsPage /></AdManagerProvider></S> },
					{ path: "ad-manager/ads", element: <S><AdManagerProvider><AdsPage /></AdManagerProvider></S> },
					{ path: "ad-manager/audit-log", element: <S><AdManagerProvider><AdAuditLogPage /></AdManagerProvider></S> },
					{ path: "ad-manager/settings", element: <S><AdManagerProvider><AdSettingsPage /></AdManagerProvider></S> },
					{ path: "ad-manager/campaigns", element: <S><AdManagerProvider><AdCampaignsPage /></AdManagerProvider></S> },
					{ path: "ad-manager/campaigns/new", element: <S><CampaignWizard /></S> },
					{ path: "ad-manager/creatives", element: <S><AdManagerProvider><AdCreativesPage /></AdManagerProvider></S> },
					{ path: "ad-manager/audiences", element: <S><AdManagerProvider><AdAudiencesPage /></AdManagerProvider></S> },
					{ path: "ad-manager/analytics", element: <S><AdManagerProvider><AdAnalyticsPage /></AdManagerProvider></S> },
					{ path: "ad-manager/*", element: <S><AdManagerProvider><AdManagerPage /></AdManagerProvider></S> },

					/* Media, Video Editor, Presentations */
					{ path: "media", element: <S><MediaLibraryPage /></S> },
					{ path: "video-editor", element: <S><VideoEditorPage /></S> },
					{ path: "presentations", element: <S><PresentationsPage /></S> },

					/* Integrations */
					{ path: "integrations", element: <S><IntegrationsPage /></S> },
					{ path: "integrations/*", element: <S><IntegrationsPage /></S> },
					{ path: "integrations/facebook/ads", element: <S><AdsInsightsPage /></S> },
					{ path: "integrations/facebook-ads/*", element: <S><AdsInsightsPage /></S> },
					{ path: "integrations/google/ads", element: <S><AdsInsightsPage /></S> },
					{ path: "integrations/google-ads/*", element: <S><AdsInsightsPage /></S> },
					{ path: "integrations/tiktok/ads", element: <S><AdsInsightsPage /></S> },
					{ path: "integrations/tiktok-ads/*", element: <S><AdsInsightsPage /></S> },
					{ path: "integrations/linkedin/ads", element: <S><AdsInsightsPage /></S> },
					{ path: "integrations/linkedin-ads/*", element: <S><AdsInsightsPage /></S> },
					{ path: "integrations/google/projects", element: <S><GoogleInsightsPage /></S> },
					{ path: "integrations/google/traffic", element: <S><GoogleInsightsPage /></S> },
					{ path: "integrations/woocommerce/stores", element: <S><WoocommercePage /></S> },
					{ path: "integrations/woocommerce/insights", element: <S><WoocommercePage /></S> },

					/* Workspace + Billing (legacy direct routes still work) */
					{ path: "workspace", element: <S><WorkspacePage /></S> },
					{ path: "workspace/members", element: <S><MembersPage /></S> },
					{ path: "billing", element: <S><BillingPage /></S> },
					{ path: "billing/*", element: <S><BillingPage /></S> },
					{ path: "account", element: <S><AccountPage /></S> },
					{ path: "history", element: <S><HistoryPage /></S> },
					{ path: "documents", element: <S><HistoryPage /></S> },
					{ path: "plans", element: <S><PlansPage /></S> },
					{ path: "suspended", element: <S><SuspendedPage /></S> },

					/* Connect */
					{ path: "url-shortener", element: <S><UrlShortenerPage /></S> },
					{ path: "canva", element: <S><IntegrationsPage /></S> },
					{ path: "developer", element: <S><DeveloperPage /></S> },
					{ path: "bulk-scheduler", element: <S><QueuesPage /></S> },

					/* Workspace extras */
					{ path: "brands", element: <S><BrandsPage /></S> },
					{ path: "businesses", element: <S><BusinessesPage /></S> },
					{ path: "business-details", element: <S><BusinessesPage /></S> },
					{ path: "campaigns", element: <S><BrandsPage /></S> },

					/* CRM */
					{ path: "crm", element: <S><CrmDashboardPage /></S> },
					{ path: "crm/pipeline", element: <S><CrmPipelinePage /></S> },
					{ path: "crm/projects", element: <S><CrmProjectsPage /></S> },
					{ path: "crm/contacts", element: <S><CrmContactsPage /></S> },
					{ path: "crm/tasks", element: <S><CrmTasksPage /></S> },
					{ path: "crm/preview/:dealId", element: <S><CrmPreviewPage /></S> },

					/* Whitelabel + Agency */
					{ path: "agency", element: <S><AgencyPage /></S> },
					{ path: "agency/billing", element: <S><AgencyBillingPage /></S> },
					{ path: "agency/reports", element: <S><AgencyReportsPage /></S> },
					{ path: "agency/*", element: <S><AgencyPage /></S> },
					{ path: "whitelabel", element: <S><WhitelabelPage /></S> },

					/* 404 within workspace */
					{ path: "*", element: <S><NotFoundPage /></S> },
				],
			},
		],
	},

	/* ── Settings (full-page takeover with own sidebar, like GHL) ── */
	{
		path: "/w/:hashId/settings",
		element: <AuthGuard><WorkspaceRouteGuard /></AuthGuard>,
		children: [
			{
				element: <SettingsLayout />,
				children: [
					{ index: true, element: <S><SettingsPage /></S> },
				],
			},
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
