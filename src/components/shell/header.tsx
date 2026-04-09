import { Link } from "react-router-dom";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { apiClient } from "@/lib/api-client";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function Header() {
	const user = useAuthStore((s) => s.user);
	const clearAuth = useAuthStore((s) => s.clearAuth);
	const theme = useUiStore((s) => s.theme);
	const setTheme = useUiStore((s) => s.setTheme);

	const handleLogout = () => {
		apiClient.logout();
		clearAuth();
		const base = import.meta.env.BASE_URL || "/";
		window.location.href = `${base}login`;
	};

	return (
		<header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6">
			<div className="flex items-center gap-4">
				<h1 className="text-lg font-semibold text-[var(--foreground)]">
					{/* Page title will be set by each page */}
				</h1>
			</div>

			<div className="flex items-center gap-3">
				{/* Theme toggle */}
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setTheme(theme === "light" ? "dark" : "light")}
				>
					{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
				</Button>

				{/* User info */}
				{user && (
					<div className="flex items-center gap-3">
						<span className="text-sm text-[var(--muted-foreground)] hidden sm:inline">
							{user.name}
						</span>
						<Link to={ROUTES.ACCOUNT}>
							<Button variant="ghost" size="icon">
								<User size={18} />
							</Button>
						</Link>
						<Button variant="ghost" size="icon" onClick={handleLogout}>
							<LogOut size={18} />
						</Button>
					</div>
				)}
			</div>
		</header>
	);
}
