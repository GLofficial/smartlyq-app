import { useEffect, type ReactNode } from "react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { BootstrapResponse } from "@/lib/types";

/**
 * Runs the /api/spa/bootstrap call on mount.
 * If authenticated (JWT in localStorage), populates user + plan + workspaces.
 * If not, clears auth state so the router can redirect to login.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const setAuth = useAuthStore((s) => s.setAuth);
	const clearAuth = useAuthStore((s) => s.clearAuth);
	const setLoading = useAuthStore((s) => s.setLoading);
	const setBranding = useTenantStore((s) => s.setBranding);
	const setWorkspaces = useWorkspaceStore((s) => s.setWorkspaces);

	useEffect(() => {
		let cancelled = false;

		async function bootstrap() {
			try {
				const data = await apiClient.get<BootstrapResponse>(ENDPOINTS.BOOTSTRAP);
				if (cancelled) return;

				// Always apply tenant branding (even on login page)
				setBranding(data.tenant, data.is_whitelabel);

				if (data.user && data.plan) {
					setAuth(data.user, data.plan);
					setWorkspaces(data.workspaces, data.active_workspace_id);
				} else {
					clearAuth();
				}
			} catch {
				if (!cancelled) {
					clearAuth();
				}
			}
		}

		setLoading(true);
		bootstrap();

		return () => {
			cancelled = true;
		};
	}, [setAuth, clearAuth, setLoading, setBranding, setWorkspaces]);

	return <>{children}</>;
}
