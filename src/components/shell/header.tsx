import { Link } from "react-router-dom";
import { LogOut, Moon, Sun, User, Coins } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { apiClient } from "@/lib/api-client";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function Header() {
	const user = useAuthStore((s) => s.user);
	const plan = useAuthStore((s) => s.plan);
	const credits = useAuthStore((s) => s.credits);
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
		<header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6">
			<div />

			<div className="flex items-center gap-2">
				{/* Credits badge — shows remaining user credits, not plan allowance */}
				{plan && (
					<Link to={ROUTES.BILLING}>
						<div className="flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)] px-3 py-1.5 text-xs font-medium text-[var(--sq-primary)] hover:bg-[color-mix(in_srgb,var(--sq-primary)_15%,transparent)] transition-colors">
							<Coins size={14} />
							<span>{Math.round(credits).toLocaleString()}</span>
						</div>
					</Link>
				)}

				{/* Plan badge */}
				{plan && (
					<Link to={ROUTES.BILLING}>
						<span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)]">
							{plan.name}
						</span>
					</Link>
				)}

				{/* Theme toggle */}
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setTheme(theme === "light" ? "dark" : "light")}
					className="h-8 w-8"
				>
					{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
				</Button>

				{/* User */}
				{user && (
					<>
						<span className="text-sm text-[var(--muted-foreground)] hidden sm:inline">
							{user.name}
						</span>
						<Link to={ROUTES.ACCOUNT}>
							{user.avatar_url ? (
								<img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover hover:ring-2 hover:ring-[var(--sq-primary)] transition-shadow" />
							) : (
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<User size={16} />
								</Button>
							)}
						</Link>
						<Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
							<LogOut size={16} />
						</Button>
					</>
				)}
			</div>
		</header>
	);
}
