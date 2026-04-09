import { Outlet } from "react-router-dom";
import { useTenantStore } from "@/stores/tenant-store";

export function AuthLayout() {
	const branding = useTenantStore((s) => s.branding);

	return (
		<div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4">
			<div className="w-full max-w-md space-y-8">
				{/* Logo */}
				<div className="flex flex-col items-center gap-3">
					{branding.logo_url ? (
						<img
							src={branding.logo_url}
							alt={branding.site_name}
							className="h-10 w-auto"
						/>
					) : (
						<h1 className="text-2xl font-bold text-[var(--foreground)]">
							{branding.site_name}
						</h1>
					)}
				</div>

				{/* Auth form rendered via Outlet */}
				<Outlet />
			</div>
		</div>
	);
}
