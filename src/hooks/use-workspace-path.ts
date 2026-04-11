import { useWorkspaceStore } from "@/stores/workspace-store";

/**
 * Returns a function that builds workspace-scoped paths.
 * Usage: const wp = useWorkspacePath(); wp("social-media/create-post") → "/w/{hash}/social-media/create-post"
 */
export function useWorkspacePath() {
	const hash = useWorkspaceStore((s) => s.activeWorkspaceHash);
	return (subpath: string) => `/w/${hash}/${subpath.replace(/^\//, "")}`;
}
