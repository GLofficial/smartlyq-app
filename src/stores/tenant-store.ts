import { create } from "zustand";
import type { TenantBranding } from "@/lib/types";

const DEFAULT_BRANDING: TenantBranding = {
	site_name: "SmartlyQ",
	primary_color: "#377DEE",
	secondary_color: "#6B7280",
	accent_color: "#377DEE",
	bg_color: "#F8FAFC",
	surface_color: "#FFFFFF",
	text_color: "#111827",
	muted_color: "#6B7280",
	link_color: "#377DEE",
	logo_url: null,
	logo_dark_url: null,
	logo_light_url: null,
	favicon_url: null,
	remove_watermark: false,
};

interface TenantState {
	branding: TenantBranding;
	isWhitelabel: boolean;
	setBranding: (branding: TenantBranding | null, isWhitelabel: boolean) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
	branding: DEFAULT_BRANDING,
	isWhitelabel: false,
	setBranding: (branding, isWhitelabel) =>
		set({
			branding: branding ?? DEFAULT_BRANDING,
			isWhitelabel,
		}),
}));
