import { create } from "zustand";
import type { Plan, User } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

interface AuthState {
	user: User | null;
	plan: Plan | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	setAuth: (user: User, plan: Plan) => void;
	clearAuth: () => void;
	setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	plan: null,
	isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
	isLoading: true,
	setAuth: (user, plan) => set({ user, plan, isAuthenticated: true, isLoading: false }),
	clearAuth: () => {
		localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
		set({ user: null, plan: null, isAuthenticated: false, isLoading: false });
	},
	setLoading: (isLoading) => set({ isLoading }),
}));
