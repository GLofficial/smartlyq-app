import { useEffect, type ReactNode } from "react";
import { ENDPOINTS, STORAGE_KEYS } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { useTenantStore } from "@/stores/tenant-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import type { BootstrapResponse } from "@/lib/types";

/**
 * Runs the /api/spa/bootstrap call on mount.
 * Uses raw fetch (not apiClient) to avoid the 401 redirect loop.
 * If authenticated, populates user + plan + workspaces.
 * If not, clears auth state so AuthGuard redirects to login.
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
				const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
				const headers: Record<string, string> = { Accept: "application/json" };
				if (token) {
					headers.Authorization = `Bearer ${token}`;
				}

				const response = await fetch(ENDPOINTS.BOOTSTRAP, {
					method: "GET",
					headers,
					credentials: "include",
				});

				if (!response.ok) {
					// Token is invalid/expired — clear it and show login
					if (token) localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
					if (!cancelled) clearAuth();
					return;
				}

				const data: BootstrapResponse = await response.json();
				if (cancelled) return;

				// Always apply tenant branding (even on login page)
				setBranding(data.tenant, data.is_whitelabel);

				if (data.user && data.plan) {
					setAuth(data.user, data.plan, data.credits ?? 0);
					setWorkspaces(data.workspaces, data.active_workspace_id);
				} else {
					// Token was sent but user is null — token is invalid
					if (token) localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
					clearAuth();
				}
			} catch {
				if (!cancelled) clearAuth();
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
