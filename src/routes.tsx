import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/app-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { AuthGuard } from "@/components/shared/auth-guard";
import { IframeBridge } from "@/components/shared/iframe-bridge";

// Lazy-loaded pages
const LoginPage = lazy(() =>
	import("@/pages/auth/login-page").then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
	import("@/pages/dashboard/dashboard-page").then((m) => ({ default: m.DashboardPage })),
);
const SocialDashboardPage = lazy(() =>
	import("@/pages/social/social-dashboard-page").then((m) => ({ default: m.SocialDashboardPage })),
);
const ManagePostsPage = lazy(() =>
	import("@/pages/social/manage-posts-page").then((m) => ({ default: m.ManagePostsPage })),
);
const CreatePostPage = lazy(() =>
	import("@/pages/social/create-post-page").then((m) => ({ default: m.CreatePostPage })),
);
const CalendarPage = lazy(() =>
	import("@/pages/social/calendar-page").then((m) => ({ default: m.CalendarPage })),
);
const CommentsPage = lazy(() =>
	import("@/pages/social/comments-page").then((m) => ({ default: m.CommentsPage })),
);
const InboxPage = lazy(() =>
	import("@/pages/social/inbox-page").then((m) => ({ default: m.InboxPage })),
);
const AnalyticsPage = lazy(() =>
	import("@/pages/social/analytics-page").then((m) => ({ default: m.AnalyticsPage })),
);
const NotFoundPage = lazy(() =>
	import("@/pages/misc/not-found-page").then((m) => ({ default: m.NotFoundPage })),
);

function PageLoader() {
	return (
		<div className="flex h-[50vh] items-center justify-center">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
		</div>
	);
}

function SuspenseWrap({ children }: { children: React.ReactNode }) {
	return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

/** Iframe bridge shortcut */
function Bridge({ path, title }: { path: string; title: string }) {
	return <IframeBridge path={path} title={title} />;
}

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Navigate to="/my" replace />,
	},
	{
		element: <AuthLayout />,
		children: [
			{ path: "/login", element: <SuspenseWrap><LoginPage /></SuspenseWrap> },
			{ path: "/signup", element: <SuspenseWrap><Bridge path="/signup" title="Sign Up" /></SuspenseWrap> },
			{ path: "/reset", element: <SuspenseWrap><Bridge path="/reset" title="Reset Password" /></SuspenseWrap> },
		],
	},
	{
		element: (
			<AuthGuard>
				<AppLayout />
			</AuthGuard>
		),
		children: [
			/* ── Native React pages ── */
			{ path: "/my", element: <SuspenseWrap><DashboardPage /></SuspenseWrap> },

			/* ── Iframe bridges (legacy PHP pages inside React shell) ── */
			{ path: "/my/captain", element: <Bridge path="/my/ai-captain" title="AI Captain" /> },
			{ path: "/my/social-media", element: <SuspenseWrap><SocialDashboardPage /></SuspenseWrap> },
			{ path: "/my/social-media/posts", element: <SuspenseWrap><ManagePostsPage /></SuspenseWrap> },
			{ path: "/my/social-media/create-post", element: <SuspenseWrap><CreatePostPage /></SuspenseWrap> },
			{ path: "/my/social-media/calendar", element: <SuspenseWrap><CalendarPage /></SuspenseWrap> },
			{ path: "/my/social-media/comments", element: <SuspenseWrap><CommentsPage /></SuspenseWrap> },
			{ path: "/my/social-media/inbox", element: <SuspenseWrap><InboxPage /></SuspenseWrap> },
			{ path: "/my/social-media/analytics", element: <SuspenseWrap><AnalyticsPage /></SuspenseWrap> },
			{ path: "/my/chatbot", element: <Bridge path="/my/chatbot" title="Chatbots" /> },
			{ path: "/my/chatbot/*", element: <Bridge path="/my/chatbot" title="Chatbots" /> },
			{ path: "/my/ad-manager", element: <Bridge path="/my/ad-manager" title="Ad Manager" /> },
			{ path: "/my/ad-manager/*", element: <Bridge path="/my/ad-manager" title="Ad Manager" /> },
			{ path: "/my/templates", element: <Bridge path="/my/templates" title="Templates" /> },
			{ path: "/my/media", element: <Bridge path="/my/media" title="Media Library" /> },
			{ path: "/my/video-editor", element: <Bridge path="/my/video-editor" title="Video Editor" /> },
			{ path: "/my/presentations", element: <Bridge path="/my/presentations" title="Presentations" /> },
			{ path: "/my/integrations", element: <Bridge path="/my/integrations" title="Integrations" /> },
			{ path: "/my/integrations/*", element: <Bridge path="/my/integrations" title="Integrations" /> },
			{ path: "/my/history", element: <Bridge path="/my/history" title="History" /> },
			{ path: "/my/documents", element: <Bridge path="/my/documents" title="Documents" /> },
			{ path: "/my/billing", element: <Bridge path="/my/billing" title="Billing" /> },
			{ path: "/my/billing/*", element: <Bridge path="/my/billing" title="Billing" /> },
			{ path: "/my/workspace", element: <Bridge path="/my/workspace" title="Workspace" /> },
			{ path: "/my/account", element: <Bridge path="/my/account" title="Account" /> },
			{ path: "/my/agency", element: <Bridge path="/my/agency" title="Agency" /> },
			{ path: "/my/agency/*", element: <Bridge path="/my/agency" title="Agency" /> },
			{ path: "/my/whitelabel", element: <Bridge path="/my/whitelabel" title="Whitelabel" /> },
			{ path: "*", element: <SuspenseWrap><NotFoundPage /></SuspenseWrap> },
		],
	},
], {
	basename: import.meta.env.BASE_URL.replace(/\/$/, ""),
});
