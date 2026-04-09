import { create } from "zustand";
import type { Plan, User } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

interface AuthState {
	user: User | null;
	plan: Plan | null;
	credits: number;
	isAuthenticated: boolean;
	isLoading: boolean;
	setAuth: (user: User, plan: Plan, credits?: number) => void;
	setCredits: (credits: number) => void;
	clearAuth: () => void;
	setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	plan: null,
	credits: 0,
	isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
	isLoading: true,
	setAuth: (user, plan, credits) => set({ user, plan, credits: credits ?? 0, isAuthenticated: true, isLoading: false }),
	setCredits: (credits) => set({ credits }),
	clearAuth: () => {
		localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
		set({ user: null, plan: null, isAuthenticated: false, isLoading: false });
	},
	setLoading: (isLoading) => set({ isLoading }),
}));
