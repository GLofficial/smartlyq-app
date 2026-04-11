import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Returns a currency formatter using the user's business currency.
 * Usage: const fmt = useCurrency(); fmt(1234.56) → "€1,235" or "$1,235"
 */
export function useCurrency() {
	const currency = useAuthStore((s) => s.currency);

	return useCallback(
		(value: number, options?: { decimals?: number }) => {
			const decimals = options?.decimals ?? 0;
			return new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: currency || "USD",
				minimumFractionDigits: decimals,
				maximumFractionDigits: decimals,
			}).format(value);
		},
		[currency],
	);
}

/** Non-hook version for use outside components (reads from store directly) */
export function formatCurrencyValue(value: number, currencyCode?: string): string {
	const code = currencyCode || useAuthStore.getState().currency || "USD";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: code,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}
