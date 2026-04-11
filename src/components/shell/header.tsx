import { Moon, Sun, User, Coins } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { UserProfilePopover } from "./user-profile-popover";

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
				{/* Credits badge */}
				{plan && (
					<div className="flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--sq-primary)_10%,transparent)] px-3 py-1.5 text-xs font-medium text-[var(--sq-primary)]">
						<Coins size={14} />
						<span>{Math.round(credits).toLocaleString()}</span>
					</div>
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

				{/* User profile popover */}
				{user && (
					<UserProfilePopover
						userName={user.name}
						userEmail={user.email}
						planName={plan?.name}
						credits={credits}
						avatarUrl={user.avatar_url}
						onLogout={handleLogout}
					>
						<button className="flex items-center gap-0 rounded-full hover:ring-2 hover:ring-[var(--sq-primary)] transition-shadow">
							{user.avatar_url ? (
								<img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
							) : (
								<div className="h-8 w-8 rounded-full bg-[color-mix(in_srgb,var(--sq-primary)_15%,transparent)] flex items-center justify-center">
									<User size={16} className="text-[var(--sq-primary)]" />
								</div>
							)}
						</button>
					</UserProfilePopover>
				)}
			</div>
		</header>
	);
}
