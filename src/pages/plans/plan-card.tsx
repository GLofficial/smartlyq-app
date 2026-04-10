import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface Tier { id: number; name: string; credits: number; price_per_credit: number; price: number; is_default: boolean; }
interface Plan { id: number; name: string; title: string; price: number; duration: string; credits: number; description: string; highlight: boolean; tiers: Tier[]; }

interface Props {
	plan: Plan;
	currency: string;
	isCurrent: boolean;
	onCheckout: (planId: number, cycle: string) => void;
	checkoutLoading: boolean;
}

export function PlanCard({ plan, currency, isCurrent, onCheckout, checkoutLoading }: Props) {
	const [selectedTier, setSelectedTier] = useState<Tier | null>(plan.tiers.find(t => t.is_default) ?? plan.tiers[0] ?? null);
	const features = (plan.description || "").split("\n").filter(f => f.trim() && !f.match(/^\d+.*Credits/));
	const displayCredits = selectedTier ? selectedTier.credits : plan.credits;
	const displayPrice = selectedTier ? selectedTier.price : plan.price;
	const isPrepaid = plan.duration === "prepaid";
	const isLifetime = plan.duration === "lifetime";
	const isFreePlan = plan.price === 0;
	const sym = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency;

	const durationLabel = isPrepaid ? "" : isLifetime ? "one-time payment" : plan.duration === "year" ? "per year" : "per month";
	const ctaLabel = isFreePlan ? "Start Free" : isPrepaid ? "Buy now" : isLifetime ? "Get Lifetime Access" : `Go ${plan.name}`;
	const ctaColor = isFreePlan ? "outline" as const : plan.highlight ? "default" as const : "default" as const;

	return (
		<Card className={cn(
			"relative flex flex-col",
			plan.highlight && "border-2 border-[var(--sq-primary)] shadow-lg",
			isPrepaid && "border-pink-200",
		)}>
			{plan.highlight && (
				<div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--sq-primary)] px-4 py-1 text-xs font-bold text-white uppercase tracking-wide">
					Most Popular
				</div>
			)}
			<CardContent className="flex flex-1 flex-col p-6 pt-8">
				{/* Header — fixed height for alignment */}
				<div className="h-14">
					<h3 className="text-xl font-bold">{plan.name}</h3>
					{plan.title && <p className="mt-0.5 text-xs text-[var(--muted-foreground)] line-clamp-2">{plan.title}</p>}
				</div>

				{/* Credit Tier Selector — fixed height for alignment */}
				<div className="h-16 mt-2">
					{plan.tiers.length > 0 ? (
						<>
							<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Credit Tier</p>
							<select
								value={selectedTier?.id ?? ""}
								onChange={(e) => setSelectedTier(plan.tiers.find(t => t.id === Number(e.target.value)) ?? null)}
								className="mt-1 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm"
							>
								{plan.tiers.map(t => (
									<option key={t.id} value={t.id}>
										{t.credits.toLocaleString()} credits/mo ({sym}{t.price_per_credit.toFixed(3)}/cr)
									</option>
								))}
							</select>
						</>
					) : isFreePlan ? (
						<>
							<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Credit Tier</p>
							<div className="mt-1 rounded-md border border-[var(--input)] px-3 py-2 text-sm text-[var(--muted-foreground)]">Pay-as-you-go  {sym}0.020  /credit</div>
						</>
					) : null}
				</div>

				{/* Credits Display */}
				<div className={cn("rounded-lg py-3 text-center", plan.highlight ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" : "bg-[var(--muted)]")}>
					<p className="text-3xl font-bold">{displayCredits.toLocaleString()}</p>
					<p className="text-xs opacity-80">AI Credits/{isPrepaid ? "pack" : isLifetime ? "mo" : "mo"}</p>
				</div>

				{/* Price */}
				<div className="mt-4 h-14 text-center">
					<span className="text-3xl font-bold">{sym}{Math.round(displayPrice)}</span>
					{durationLabel && <span className="ml-1 text-sm text-[var(--muted-foreground)]">{durationLabel}</span>}
					{isLifetime && <p className="text-xs text-[var(--muted-foreground)]">(replenished monthly, forever)</p>}
				</div>

				{/* CTA */}
				<div>
					{isCurrent ? (
						<Button variant="outline" className="w-full" disabled>Current Plan</Button>
					) : (
						<Button
							variant={ctaColor}
							className={cn("w-full", plan.highlight && "bg-[var(--sq-primary)] hover:bg-[var(--sq-primary)]/90")}
							onClick={() => onCheckout(plan.id, plan.duration)}
							disabled={checkoutLoading}
						>
							{checkoutLoading ? "Redirecting..." : ctaLabel}
						</Button>
					)}
				</div>

				{!isPrepaid && plan.price > 0 && !isLifetime && (
					<p className="mt-2 text-center text-xs text-green-600 font-medium">
						Replaces {sym}{Math.round(plan.price * 3)}+/mo in separate tools
					</p>
				)}

				{/* Features */}
				{features.length > 0 && (
					<div className="mt-6 flex-1">
						{features[0]?.includes("Everything in") && (
							<p className="mb-2 text-xs font-medium text-[var(--muted-foreground)] flex items-center gap-1">↑ {features[0]}</p>
						)}
						<div className="space-y-2">
							{features.slice(features[0]?.includes("Everything") ? 1 : 0).map((f, i) => (
								<div key={i} className="flex items-start gap-2 text-xs">
									<Check size={14} className={cn("mt-0.5 shrink-0", plan.highlight ? "text-blue-500" : "text-green-500")} />
									<span>{f.trim()}</span>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
