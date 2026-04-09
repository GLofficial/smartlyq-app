import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/app-layout";
import { AuthLayout } from "@/layouts/auth-layout";

// Lazy-loaded pages
const LoginPage = lazy(() =>
	import("@/pages/auth/login-page").then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
	import("@/pages/dashboard/dashboard-page").then((m) => ({ default: m.DashboardPage })),
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

/** Placeholder for pages not yet migrated */
function ComingSoon() {
	return (
		<div className="flex h-[50vh] flex-col items-center justify-center gap-2">
			<h2 className="text-xl font-semibold text-[var(--foreground)]">Coming Soon</h2>
			<p className="text-[var(--muted-foreground)]">This page is being migrated to the new UI.</p>
		</div>
	);
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
			{ path: "/signup", element: <SuspenseWrap><ComingSoon /></SuspenseWrap> },
			{ path: "/reset", element: <SuspenseWrap><ComingSoon /></SuspenseWrap> },
		],
	},
	{
		element: <AppLayout />,
		children: [
			{ path: "/my", element: <SuspenseWrap><DashboardPage /></SuspenseWrap> },
			{ path: "/my/captain", element: <ComingSoon /> },
			{ path: "/my/social-media", element: <ComingSoon /> },
			{ path: "/my/social-media/*", element: <ComingSoon /> },
			{ path: "/my/chatbot", element: <ComingSoon /> },
			{ path: "/my/chatbot/*", element: <ComingSoon /> },
			{ path: "/my/ad-manager", element: <ComingSoon /> },
			{ path: "/my/ad-manager/*", element: <ComingSoon /> },
			{ path: "/my/templates", element: <ComingSoon /> },
			{ path: "/my/media", element: <ComingSoon /> },
			{ path: "/my/video-editor", element: <ComingSoon /> },
			{ path: "/my/presentations", element: <ComingSoon /> },
			{ path: "/my/integrations", element: <ComingSoon /> },
			{ path: "/my/integrations/*", element: <ComingSoon /> },
			{ path: "/my/history", element: <ComingSoon /> },
			{ path: "/my/documents", element: <ComingSoon /> },
			{ path: "/my/billing", element: <ComingSoon /> },
			{ path: "/my/billing/*", element: <ComingSoon /> },
			{ path: "/my/workspace", element: <ComingSoon /> },
			{ path: "/my/account", element: <ComingSoon /> },
			{ path: "/my/agency", element: <ComingSoon /> },
			{ path: "/my/agency/*", element: <ComingSoon /> },
			{ path: "/my/whitelabel", element: <ComingSoon /> },
			{ path: "*", element: <SuspenseWrap><NotFoundPage /></SuspenseWrap> },
		],
	},
]);
