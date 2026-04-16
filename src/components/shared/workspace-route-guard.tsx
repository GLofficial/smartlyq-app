import { useEffect, useRef, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Wraps all /w/:hashId/* routes.
 * Syncs the URL hash with the active workspace:
 * - If hash matches active workspace → render page
 * - If hash belongs to another workspace → switch JWT + render
 * - If hash not found → show 404
 */
export function WorkspaceRouteGuard() {
	const { hashId } = useParams<{ hashId: string }>();
	const workspaces = useWorkspaceStore((s) => s.workspaces);
	const activeHash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
	const isLoading = useAuthStore((s) => s.isLoading);
	const [switching, setSwitching] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inflightRef = useRef<string | null>(null);

	useEffect(() => {
		if (!hashId || isLoading || workspaces.length === 0) return;
		if (hashId === activeHash) return; // Already on the right workspace

		// Check if hash exists in user's workspace list
		const target = workspaces.find((w) => w.hash_id === hashId);
		if (!target) {
			setError("Workspace not found.");
			return;
		}

		// Switch to this workspace
		if (inflightRef.current === hashId) return; // Already switching
		inflightRef.current = hashId;
		setSwitching(true);
		setError(null);

		apiClient
			.post<{ access_token: string; active_workspace_id: number; active_workspace_hash: string }>(
				"/api/spa/workspace/switch-by-hash",
				{ hash_id: hashId },
			)
			.then((res) => {
				if (inflightRef.current !== hashId) return; // Stale response
				localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.access_token);
				// Clear all cached data BEFORE updating state — prevents components
				// from re-rendering and reading stale cache from the old workspace
				queryClient.clear();
				setActiveWorkspace(res.active_workspace_id, res.active_workspace_hash);
			})
			.catch(() => {
				if (inflightRef.current !== hashId) return;
				setError("Failed to switch workspace.");
			})
			.finally(() => {
				if (inflightRef.current === hashId) {
					inflightRef.current = null;
					setSwitching(false);
				}
			});
	}, [hashId, activeHash, workspaces, isLoading, setActiveWorkspace]);

	// Show spinner while auth loads, during active switch, OR when hash doesn't match
	// (prevents a flash where Outlet renders with stale JWT before the switch fires)
	const needsSwitch = hashId && activeHash && hashId !== activeHash;
	if (isLoading || switching || needsSwitch) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
			</div>
		);
	}

	if (error) {
		const defaultHash = workspaces[0]?.hash_id;
		return (
			<div className="flex h-screen flex-col items-center justify-center gap-4">
				<p className="text-lg font-semibold text-[var(--foreground)]">{error}</p>
				{defaultHash && (
					<a
						href={`/w/${defaultHash}/`}
						className="rounded-md bg-[var(--sq-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
					>
						Go to default workspace
					</a>
				)}
			</div>
		);
	}

	return <Outlet />;
}
