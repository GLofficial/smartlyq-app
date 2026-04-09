import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/lib/constants";

/**
 * Protects routes that require authentication.
 * Shows a loading spinner while bootstrap is in progress.
 * Redirects to /login if not authenticated.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const isLoading = useAuthStore((s) => s.isLoading);
	const user = useAuthStore((s) => s.user);
	const location = useLocation();

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
			</div>
		);
	}

	if (!isAuthenticated || !user) {
		return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
	}

	return <>{children}</>;
}
