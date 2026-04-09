import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { useAvailablePlans } from "@/api/content";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

export function PlansPage() {
	const { data, isLoading } = useAvailablePlans();
	const currentPlan = useAuthStore((s) => s.plan);

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h1 className="text-2xl font-bold">Choose Your Plan</h1>
				<p className="mt-1 text-[var(--muted-foreground)]">Scale your marketing with the right plan.</p>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{(data?.plans ?? []).map((plan) => {
						const isCurrent = currentPlan?.id === plan.id;
						const features = (plan.description || "").split("\n").filter(Boolean);

						return (
							<Card key={plan.id} className={cn("relative", plan.highlight && "border-[var(--sq-primary)] shadow-md")}>
								{plan.highlight && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--sq-primary)] px-3 py-0.5 text-xs font-medium text-white">
										<Star size={10} className="inline mr-1" /> Popular
									</div>
								)}
								<CardHeader className="text-center pb-2">
									<CardTitle className="text-lg">{plan.name}</CardTitle>
									{plan.title && <p className="text-xs text-[var(--muted-foreground)]">{plan.title}</p>}
								</CardHeader>
								<CardContent className="text-center space-y-4">
									<div>
										<span className="text-3xl font-bold">${plan.price}</span>
										<span className="text-sm text-[var(--muted-foreground)]">/{plan.duration}</span>
									</div>
									<p className="text-sm text-[var(--muted-foreground)]">{plan.credits.toLocaleString()} credits</p>

									{features.length > 0 && (
										<div className="space-y-1.5 text-left">
											{features.slice(0, 8).map((f) => (
												<div key={f} className="flex items-start gap-2 text-xs">
													<Check size={12} className="mt-0.5 shrink-0 text-green-500" />
													<span>{f}</span>
												</div>
											))}
										</div>
									)}

									{isCurrent ? (
										<Button variant="outline" className="w-full" disabled>Current Plan</Button>
									) : (
										<Button className="w-full" onClick={() => toast.info("Plan upgrade coming soon.")}>
											{plan.price === 0 ? "Get Started" : "Upgrade"}
										</Button>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
