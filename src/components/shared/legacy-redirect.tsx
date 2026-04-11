import { Navigate, useLocation } from "react-router-dom";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Catches old /my/* URLs (bookmarks, email links, external references)
 * and redirects to /w/{hash}/*. Preserves the subpath.
 * Example: /my/social-media/calendar → /w/{hash}/social-media/calendar
 */
export function LegacyRedirect() {
	const hash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const isLoading = useAuthStore((s) => s.isLoading);
	const location = useLocation();

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
			</div>
		);
	}

	if (!hash) {
		return <Navigate to="/login" replace />;
	}

	const subpath = location.pathname.replace(/^\/my\/?/, "");
	return <Navigate to={`/w/${hash}/${subpath}`} replace />;
}
