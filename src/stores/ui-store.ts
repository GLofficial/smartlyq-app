import { create } from "zustand";
import { STORAGE_KEYS } from "@/lib/constants";

interface UiState {
	sidebarCollapsed: boolean;
	theme: "light" | "dark";
	toggleSidebar: () => void;
	setTheme: (theme: "light" | "dark") => void;
}

export const useUiStore = create<UiState>((set) => ({
	sidebarCollapsed: localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === "true",
	theme: (localStorage.getItem(STORAGE_KEYS.THEME) as "light" | "dark") || "light",
	toggleSidebar: () =>
		set((state) => {
			const collapsed = !state.sidebarCollapsed;
			localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(collapsed));
			return { sidebarCollapsed: collapsed };
		}),
	setTheme: (theme) => {
		localStorage.setItem(STORAGE_KEYS.THEME, theme);
		document.documentElement.classList.toggle("dark", theme === "dark");
		set({ theme });
	},
}));
