import { create } from "zustand";
import type { Workspace } from "@/lib/types";

interface WorkspaceState {
	workspaces: Workspace[];
	activeWorkspaceId: number | null;
	setWorkspaces: (workspaces: Workspace[], activeId: number | null) => void;
	setActiveWorkspace: (id: number) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
	workspaces: [],
	activeWorkspaceId: null,
	setWorkspaces: (workspaces, activeWorkspaceId) =>
		set({ workspaces, activeWorkspaceId }),
	setActiveWorkspace: (activeWorkspaceId) => set({ activeWorkspaceId }),
}));
