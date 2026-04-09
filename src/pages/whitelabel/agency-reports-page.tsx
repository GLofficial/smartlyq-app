import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export function AgencyReportsPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Agency Reports</h1>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 size={20} />
						Reports
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-[var(--muted-foreground)]">
						Generate and view reports across all your whitelabel agency clients.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
