import { useState, useEffect } from "react";
import { ChevronDown, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { useAdminGateways, useSaveGateway, type Gateway } from "@/api/admin-gateways";
import { useAdminSettings, useSaveAdminSettings } from "@/api/admin-settings";

// Checkbox-type option keys (rendered as toggle, not text input)
const BOOL_OPTION_KEYS = ["live", "sandbox"];

const WEBHOOK_BASE = window.location.origin;

// ── Single gateway accordion ──────────────────────────────────────────────────

function GatewaySection({ gateway }: { gateway: Gateway }) {
	const [open, setOpen]           = useState(false);
	const [optValues, setOptValues] = useState<Record<string, string>>({});
	const [recurring, setRecurring] = useState(gateway.recurring);
	const [active, setActive]       = useState(gateway.status);
	const saveMut = useSaveGateway();

	// Initialise form values from gateway options
	useEffect(() => {
		const map: Record<string, string> = {};
		for (const opt of gateway.options) {
			map[opt.key] = opt.value;
		}
		setOptValues(map);
		setRecurring(gateway.recurring);
		setActive(gateway.status);
	}, [gateway]);

	const handleSave = () => {
		const options = gateway.options.map((opt) => ({
			key: opt.key,
			value: optValues[opt.key] ?? opt.value,
		}));
		saveMut.mutate(
			{ provider: gateway.provider, options, recurring, status: active },
			{
				onSuccess: (d) => toast.success(d.message),
				onError: () => toast.error("Failed to save."),
			},
		);
	};

	return (
		<Card>
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="flex w-full items-center justify-between px-6 py-4 text-left"
			>
				<div className="flex items-center gap-3">
					<span className="text-base font-semibold">{gateway.name} API Credential</span>
					<span className={cn(
						"rounded-full px-2 py-0.5 text-xs font-medium",
						gateway.status
							? "bg-green-100 text-green-700"
							: "bg-[var(--muted)] text-[var(--muted-foreground)]",
					)}>
						{gateway.status ? "Active" : "Inactive"}
					</span>
				</div>
				<ChevronDown size={16} className={cn("text-[var(--muted-foreground)] transition-transform shrink-0", open && "rotate-180")} />
			</button>

			{open && (
				<CardContent className="pt-0 space-y-4">
					{/* Webhook warning for recurring gateways */}
					{gateway.recurring && (
						<div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
							<div className="flex items-start gap-2">
								<AlertTriangle size={16} className="mt-0.5 shrink-0" />
								<div>
									<p>A webhook setup for automatic subscription renewal is required for recurring subscription payments at the end of the current subscription period.</p>
									<p className="mt-1 font-medium break-all">
										Endpoint URL: {WEBHOOK_BASE}/payment/webhook/{gateway.provider.toLowerCase()}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Gateway description / setup instructions */}
					{gateway.description && (
						<div className="rounded-md bg-[var(--muted)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--foreground)]">
							<div className="flex items-start gap-2">
								<Info size={15} className="mt-0.5 shrink-0 text-[var(--muted-foreground)]" />
								<pre className="whitespace-pre-wrap font-sans">{gateway.description}</pre>
							</div>
						</div>
					)}

					{/* Option fields */}
					<div className="space-y-4">
						{gateway.options.map((opt) => (
							<div key={opt.key}>
								{BOOL_OPTION_KEYS.includes(opt.key) ? (
									<label className="flex items-center gap-2 text-sm cursor-pointer select-none">
										<input
											type="checkbox"
											checked={optValues[opt.key] === "1" || optValues[opt.key] === "true"}
											onChange={(e) => setOptValues((v) => ({ ...v, [opt.key]: e.target.checked ? "1" : "0" }))}
											className="cursor-pointer"
										/>
										{opt.label}
									</label>
								) : (
									<div className="space-y-1.5">
										<label className="text-sm font-medium text-[var(--foreground)]">{opt.label}</label>
										<Input
											value={optValues[opt.key] ?? ""}
											onChange={(e) => setOptValues((v) => ({ ...v, [opt.key]: e.target.value }))}
											placeholder={opt.placeholder ?? ""}
										/>
									</div>
								)}
							</div>
						))}
					</div>

					{/* Recurring checkbox (Stripe) */}
					{gateway.recurring !== undefined && gateway.provider === "Stripe" && (
						<label className="flex items-center gap-2 text-sm cursor-pointer select-none">
							<input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="cursor-pointer" />
							Auto renewal at the end of the current subscription period. Note: webhook setup required.
						</label>
					)}

					{/* Active toggle */}
					<label className="flex items-center gap-2 text-sm cursor-pointer select-none">
						<input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="cursor-pointer" />
						Active payment gateway
					</label>

					<Button onClick={handleSave} disabled={saveMut.isPending}>
						{saveMut.isPending ? "Saving…" : "Save changes"}
					</Button>

					<p className="text-xs text-[var(--muted-foreground)]">
						Make sure this payment gateway supports your currency. API requests must be made over HTTPS — plain HTTP will fail.
					</p>
				</CardContent>
			)}
		</Card>
	);
}

// ── Offline payment section ───────────────────────────────────────────────────

function OfflinePaymentSection() {
	const { data, isLoading } = useAdminSettings("payment");
	const saveMut = useSaveAdminSettings();
	const [values, setValues] = useState<Record<string, string>>({});

	useEffect(() => {
		if (data?.settings) setValues(data.settings);
	}, [data?.settings]);

	const set = (k: string, v: string) => setValues((prev) => ({ ...prev, [k]: v }));

	const handleSave = () => {
		saveMut.mutate(
			{ tab: "payment", values },
			{
				onSuccess: (d) => toast.success(d.message),
				onError: () => toast.error("Failed to save."),
			},
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Offline Payment</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{isLoading ? (
					<div className="flex h-16 items-center justify-center">
						<div className="h-5 w-5 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
					</div>
				) : (
					<>
						<div className="space-y-1.5">
							<label className="text-sm font-medium">Payment title</label>
							<Input value={values.offline_payment_title ?? ""} onChange={(e) => set("offline_payment_title", e.target.value)} placeholder="e.g. Bank Transfer" />
						</div>
						<div className="space-y-1.5">
							<label className="text-sm font-medium">Payment guidelines</label>
							<textarea
								value={values.offline_payment_guidelines ?? ""}
								onChange={(e) => set("offline_payment_guidelines", e.target.value)}
								rows={3}
								placeholder="Describe payment guidelines"
								className="flex w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] resize-none"
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-sm font-medium">Payment recipient accounts</label>
							<textarea
								value={values.offline_payment_recipient ?? ""}
								onChange={(e) => set("offline_payment_recipient", e.target.value)}
								rows={4}
								placeholder="e.g. Bank name and Account number"
								className="flex w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] resize-none"
							/>
						</div>
						<label className="flex items-center gap-2 text-sm cursor-pointer select-none">
							<input
								type="checkbox"
								checked={values.offline_payment === "1"}
								onChange={(e) => set("offline_payment", e.target.checked ? "1" : "0")}
								className="cursor-pointer"
							/>
							Offline payment enable
						</label>
						<Button onClick={handleSave} disabled={saveMut.isPending}>
							{saveMut.isPending ? "Saving…" : "Save changes"}
						</Button>
					</>
				)}
			</CardContent>
		</Card>
	);
}

// ── Main export ───────────────────────────────────────────────────────────────

export function PaymentTab() {
	const { data, isLoading } = useAdminGateways();
	const gateways = data?.gateways ?? [];

	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">Payment</h2>

			{isLoading ? (
				<div className="flex h-32 items-center justify-center">
					<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : (
				<>
					{gateways.map((gw) => <GatewaySection key={gw.provider} gateway={gw} />)}
					<OfflinePaymentSection />
				</>
			)}
		</div>
	);
}
