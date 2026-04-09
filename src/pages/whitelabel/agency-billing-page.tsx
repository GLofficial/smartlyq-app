import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export function AgencyBillingPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Agency Billing</h1>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CreditCard size={20} />
						Billing Overview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-[var(--muted-foreground)]">
						Manage billing for your whitelabel agency clients, invoices, and payment settings.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
