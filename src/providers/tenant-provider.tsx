import { useEffect, type ReactNode } from "react";
import { useTenantStore } from "@/stores/tenant-store";

/**
 * Injects tenant branding as CSS custom properties on :root.
 * This mirrors the PHP Head.php logic for white-label theming.
 */
export function TenantProvider({ children }: { children: ReactNode }) {
	const branding = useTenantStore((s) => s.branding);

	useEffect(() => {
		const root = document.documentElement;
		root.style.setProperty("--sq-primary", branding.primary_color);
		root.style.setProperty("--sq-secondary", branding.secondary_color);
		root.style.setProperty("--sq-accent", branding.accent_color);
		root.style.setProperty("--sq-bg", branding.bg_color);
		root.style.setProperty("--sq-surface", branding.surface_color);
		root.style.setProperty("--sq-text", branding.text_color);
		root.style.setProperty("--sq-muted", branding.muted_color);
		root.style.setProperty("--sq-link", branding.link_color);
		root.style.setProperty("--ring", branding.primary_color);

		// Update favicon if tenant provides one
		if (branding.favicon_url) {
			const link =
				document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
				document.createElement("link");
			link.rel = "icon";
			link.href = branding.favicon_url;
			if (!link.parentElement) document.head.appendChild(link);
		}

		// Update page title
		if (branding.site_name) {
			document.title = branding.site_name;
		}
	}, [branding]);

	return <>{children}</>;
}
