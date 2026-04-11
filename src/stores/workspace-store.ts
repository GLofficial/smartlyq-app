import { create } from "zustand";
import type { Workspace } from "@/lib/types";

interface WorkspaceState {
	workspaces: Workspace[];
	activeWorkspaceId: number | null;
	activeWorkspaceHash: string | null;
	setWorkspaces: (workspaces: Workspace[], activeId: number | null) => void;
	setActiveWorkspace: (id: number, hash: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
	workspaces: [],
	activeWorkspaceId: null,
	activeWorkspaceHash: null,
	setWorkspaces: (workspaces, activeWorkspaceId) => {
		const activeWs = workspaces.find((w) => w.id === activeWorkspaceId);
		set({ workspaces, activeWorkspaceId, activeWorkspaceHash: activeWs?.hash_id ?? null });
	},
	setActiveWorkspace: (activeWorkspaceId, activeWorkspaceHash) =>
		set({ activeWorkspaceId, activeWorkspaceHash }),
}));
