import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS, ROUTES } from "@/lib/constants";
import type { AuthResponse } from "@/lib/types";
import { toast } from "sonner";

export function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	// Clear any stale tokens when landing on login page
	useEffect(() => {
		apiClient.logout();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const data = await apiClient.post<AuthResponse>(ENDPOINTS.LOGIN, {
				email,
				password,
			});

			// Store JWT then reload — bootstrap will pick up the token and hydrate
			apiClient.login(data.access_token);
			const base = import.meta.env.BASE_URL || "/";
			window.location.href = `${base}my`;
		} catch (err) {
			const message = (err as { message?: string })?.message ?? "Login failed";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle>Sign In</CardTitle>
				<CardDescription>Enter your credentials to access your account</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium">
							Email
						</label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							required
							autoComplete="email"
						/>
					</div>
					<div className="space-y-2">
						<label htmlFor="password" className="text-sm font-medium">
							Password
						</label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Your password"
							required
							autoComplete="current-password"
						/>
					</div>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Signing in..." : "Sign In"}
					</Button>
					<div className="flex justify-between text-sm">
						<Link to={ROUTES.RESET} className="text-[var(--sq-link)] hover:underline">
							Forgot password?
						</Link>
						<Link to={ROUTES.SIGNUP} className="text-[var(--sq-link)] hover:underline">
							Create account
						</Link>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
