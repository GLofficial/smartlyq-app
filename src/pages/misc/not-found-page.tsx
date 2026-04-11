import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWorkspacePath } from "@/hooks/use-workspace-path";

export function NotFoundPage() {
	const wp = useWorkspacePath();
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
			<h1 className="text-6xl font-bold text-[var(--muted-foreground)]">404</h1>
			<p className="text-lg text-[var(--muted-foreground)]">Page not found</p>
			<Link to={wp("dashboard")}>
				<Button>Back to Dashboard</Button>
			</Link>
		</div>
	);
}
