import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function NotFoundPage() {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
			<h1 className="text-6xl font-bold text-[var(--muted-foreground)]">404</h1>
			<p className="text-lg text-[var(--muted-foreground)]">Page not found</p>
			<Link to={ROUTES.DASHBOARD}>
				<Button>Back to Dashboard</Button>
			</Link>
		</div>
	);
}
