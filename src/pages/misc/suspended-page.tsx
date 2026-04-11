import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export function SuspendedPage() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center">
			<Card className="max-w-md">
				<CardContent className="flex flex-col items-center gap-4 p-8 text-center">
					<AlertTriangle size={48} className="text-red-500" />
					<h1 className="text-xl font-bold">Account Suspended</h1>
					<p className="text-sm text-[var(--muted-foreground)]">
						Your account has been suspended due to a billing issue. Please update your payment method to restore access.
					</p>
					<Link to="../billing">
						<Button>Go to Billing</Button>
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
