import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useAvailablePlans } from "@/api/content";
import { useCheckout } from "@/api/billing";
import { useAuthStore } from "@/stores/auth-store";
import { PlanCard } from "./plan-card";
import { cn } from "@/lib/cn";
import { toast } from "sonner";

type Cycle = "month" | "year" | "lifetime";

const FAQ = [
	{ q: "How do credits work?", a: "Credits are a unified currency for all AI features. Each action costs credits based on the model and complexity. Credits refresh monthly with your subscription." },
	{ q: "Can I change my plan later?", a: "Yes! Upgrade or downgrade anytime. Upgrades give instant access; downgrades take effect at the end of your billing period." },
	{ q: "Do unused credits roll over?", a: "Monthly credits reset each cycle. Purchased credit top-ups never expire." },
	{ q: "Can I cancel my subscription anytime?", a: "Yes. Cancel from your Billing page anytime. You keep access until the end of the billing period. No cancellation fees." },
	{ q: "What happens if I run out of credits?", a: "Purchase one-time credit top-ups or upgrade your plan. Your content and data remain accessible." },
	{ q: "Are there any hidden fees?", a: "No hidden fees. Extra team seats are billed at the rate shown on the plan." },
	{ q: "What is the Lifetime plan?", a: "A one-time payment for Enterprise features forever. Credits replenish monthly, indefinitely." },
	{ q: "How are Chatbot messages charged?", a: "Included in your plan allowance. Messages beyond the limit use credits." },
];

export function PlansPage() {
	const { data, isLoading } = useAvailablePlans();
	const currentPlan = useAuthStore((s) => s.plan);
	const checkoutMut = useCheckout();
	const [cycle, setCycle] = useState<Cycle>("month");

	const plans = data?.plans ?? [];
	const currency = data?.currency ?? "EUR";
	const monthlyPlans = plans.filter(p => p.duration === "month");
	const yearlyPlans = plans.filter(p => p.duration === "year");
	const lifetimePlans = plans.filter(p => p.duration === "lifetime");
	const prepaidPacks = plans.filter(p => p.duration === "prepaid");
	const activePlans = cycle === "month" ? monthlyPlans : cycle === "year" ? yearlyPlans : lifetimePlans;

	const handleCheckout = (planId: number, planCycle: string) => {
		checkoutMut.mutate({ plan_id: planId, cycle: planCycle === "prepaid" ? "month" : planCycle }, {
			onError: (e) => toast.error((e as { error?: string })?.error ?? "Checkout failed."),
		});
	};

	if (isLoading) return <div className="flex h-60 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>;

	return (
		<div className="space-y-12 pb-16">
			<div className="text-center space-y-3">
				<h1 className="text-4xl font-bold">Plans & Pricing</h1>
				<p className="text-lg text-[var(--muted-foreground)]">Credits power everything — text, images, video, audio, agents & more.</p>
			</div>

			{/* Cycle Toggle */}
			<div className="flex justify-center">
				<div className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] p-1">
					<button onClick={() => setCycle("month")} className={cn("rounded-full px-6 py-2 text-sm font-medium transition-all", cycle === "month" ? "bg-pink-500 text-white shadow-md" : "text-[var(--muted-foreground)]")}>Monthly</button>
					<button onClick={() => setCycle("year")} className={cn("rounded-full px-6 py-2 text-sm font-medium transition-all flex items-center gap-1.5", cycle === "year" ? "bg-[var(--sq-primary)] text-white shadow-md" : "text-[var(--muted-foreground)]")}>Yearly <span className="rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">-20%</span></button>
					<button onClick={() => setCycle("lifetime")} className={cn("rounded-full px-6 py-2 text-sm font-medium transition-all flex items-center gap-1.5", cycle === "lifetime" ? "bg-[var(--sq-primary)] text-white shadow-md" : "text-[var(--muted-foreground)]")}>Lifetime <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">HOT</span></button>
				</div>
			</div>

			{/* Plan Cards */}
			<div className={cn("grid gap-6 mx-auto", activePlans.length <= 1 ? "max-w-md" : activePlans.length <= 3 ? "sm:grid-cols-2 lg:grid-cols-3 max-w-5xl" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5")}>
				{activePlans.map(plan => (
					<PlanCard key={plan.id} plan={plan} currency={currency} isCurrent={currentPlan?.id === plan.id} onCheckout={handleCheckout} checkoutLoading={checkoutMut.isPending} />
				))}
			</div>

			{/* Credit Top-ups */}
			{prepaidPacks.length > 0 && (
				<div className="text-center space-y-6">
					<div><h2 className="text-2xl font-bold">Need More Credits?</h2><p className="text-[var(--muted-foreground)]">One-time top-ups — use for any AI feature, no expiration.</p></div>
					<div className="flex justify-center gap-4 flex-wrap">
						{prepaidPacks.map(pack => {
							const sym = currency === "EUR" ? "€" : "$";
							return (
								<Card key={pack.id} className="w-40 text-center hover:border-pink-300 transition-colors">
									<CardContent className="p-4 space-y-2">
										<p className="text-2xl font-bold text-pink-500">{pack.credits.toLocaleString()}</p>
										<p className="text-xs text-[var(--muted-foreground)]">AI Credits</p>
										<p className="text-lg font-bold">{sym}{Math.round(pack.price)}</p>
										<Button variant="outline" size="sm" className="w-full border-pink-200 text-pink-600 hover:bg-pink-50" onClick={() => handleCheckout(pack.id, "prepaid")} disabled={checkoutMut.isPending}>Buy now</Button>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</div>
			)}

			{/* "What Can Credits Buy?" */}
			<div className="mx-auto max-w-2xl">
				<details className="rounded-xl border border-[var(--border)]">
					<summary className="flex items-center justify-between px-5 py-4 text-sm font-medium cursor-pointer">🌀 What Can Credits Buy? <ChevronDown size={16} /></summary>
					<div className="px-5 pb-4 text-sm text-[var(--muted-foreground)] space-y-1">
						<p>• <strong>Text generation</strong> — blog posts, social captions, rewrites, templates</p>
						<p>• <strong>Image generation</strong> — DALL-E, Flux, Recraft, Imagen</p>
						<p>• <strong>Video generation</strong> — text-to-video, image-to-video</p>
						<p>• <strong>Audio tools</strong> — text-to-speech, transcription</p>
						<p>• <strong>AI Captain</strong> — autonomous workflows, boards, agents</p>
						<p>• <strong>Chatbot messages</strong> — AI-powered customer support</p>
						<p>• <strong>Data Analyst</strong> — file analysis with AI</p>
						<p>• <strong>Presentations</strong> — AI-generated slide decks</p>
					</div>
				</details>
			</div>

			{/* FAQ */}
			<div className="mx-auto max-w-2xl space-y-4">
				<h2 className="text-center text-2xl font-bold">Frequently Asked Questions</h2>
				<div className="rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
					{FAQ.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
				</div>
			</div>
		</div>
	);
}

function FaqItem({ q, a }: { q: string; a: string }) {
	const [open, setOpen] = useState(false);
	return (
		<div>
			<button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-[var(--accent)] transition-colors">
				<span>{q}</span><span className="text-lg">{open ? "−" : "+"}</span>
			</button>
			{open && <div className="px-5 pb-4 text-sm text-[var(--muted-foreground)]">{a}</div>}
		</div>
	);
}
