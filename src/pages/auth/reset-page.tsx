import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

export function ResetPage() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const data = await apiClient.post<{ message: string }>("/api/spa/reset-password", { email });
			toast.success(data.message);
			setSent(true);
		} catch (err) {
			toast.error((err as { message?: string })?.message ?? "Request failed.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader className="text-center">
				<CardTitle>Reset Password</CardTitle>
				<CardDescription>Enter your email to receive a reset link</CardDescription>
			</CardHeader>
			<CardContent>
				{sent ? (
					<div className="space-y-4 text-center">
						<p className="text-sm text-[var(--muted-foreground)]">
							If an account exists with that email, a reset link has been sent. Check your inbox.
						</p>
						<Link to={ROUTES.LOGIN}>
							<Button variant="outline">Back to Sign In</Button>
						</Link>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Email</label>
							<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
						</div>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Sending..." : "Send Reset Link"}
						</Button>
						<p className="text-center text-sm">
							<Link to={ROUTES.LOGIN} className="text-[var(--sq-link)] hover:underline">Back to Sign In</Link>
						</p>
					</form>
				)}
			</CardContent>
		</Card>
	);
}
