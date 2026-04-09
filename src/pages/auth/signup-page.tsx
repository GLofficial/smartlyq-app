import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

export function SignupPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const data = await apiClient.post<{ access_token: string }>("/api/spa/signup", { name, email, password });
			apiClient.login(data.access_token);
			const base = import.meta.env.BASE_URL || "/";
			window.location.href = `${base}my`;
		} catch (err) {
			toast.error((err as { message?: string })?.message ?? "Signup failed.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle>Create Account</CardTitle>
				<CardDescription>Sign up to get started</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Name</label>
						<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Email</label>
						<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium">Password</label>
						<Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} />
					</div>
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Creating account..." : "Sign Up"}
					</Button>
					<p className="text-center text-sm">
						Already have an account?{" "}
						<Link to={ROUTES.LOGIN} className="text-[var(--sq-link)] hover:underline">Sign In</Link>
					</p>
				</form>
			</CardContent>
		</Card>
	);
}
