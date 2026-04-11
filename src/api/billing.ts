import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface BillingPlan {
	id: number;
	name: string;
	price: number;
	duration: string;
	title?: string;
}

export interface BillingOverview {
	credits: number;
	plan: BillingPlan | null;
	subscription: { id: number; status: number; created_at: string; expires_at: string | null } | null;
	has_active_subscription: boolean;
	available_plans: BillingPlan[];
}

export interface Payment {
	id: number;
	amount: number;
	currency: string;
	status: string;
	gateway: string;
	created_at: string;
}

export interface Subscription {
	id: number;
	plan_name: string;
	price: number;
	status: number;
	created_at: string;
	expires_at: string | null;
}

export interface WalletTransaction {
	id: number;
	type: string;
	amount: number;
	balance_after: number;
	description: string;
	created_at: string;
}

export function useBillingOverview() {
	return useQuery({
		queryKey: ["billing", "overview"],
		queryFn: () => apiClient.get<BillingOverview>("/api/spa/billing/overview"),
	});
}

export function useBillingPayments(page = 1) {
	return useQuery({
		queryKey: ["billing", "payments", page],
		queryFn: () => apiClient.get<{ payments: Payment[]; total: number; page: number; pages: number }>(`/api/spa/billing/payments?page=${page}`),
	});
}

export function useBillingSubscriptions() {
	return useQuery({
		queryKey: ["billing", "subscriptions"],
		queryFn: () => apiClient.get<{ subscriptions: Subscription[] }>("/api/spa/billing/subscriptions"),
	});
}

export function useBillingTransactions(page = 1) {
	return useQuery({
		queryKey: ["billing", "transactions", page],
		queryFn: () => apiClient.get<{ transactions: WalletTransaction[]; total: number; page: number; pages: number }>(`/api/spa/billing/transactions?page=${page}`),
	});
}

export function useCheckout() {
	return useMutation({
		mutationFn: (data: { plan_id: number; cycle: string }) =>
			apiClient.post<{ checkout_url: string }>("/api/spa/billing/checkout", data),
		onSuccess: (data) => { window.location.href = data.checkout_url; },
	});
}

export function useCancelSubscription() {
	return useMutation({
		mutationFn: () => apiClient.post<{ message: string }>("/api/spa/billing/cancel"),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["billing"] }),
	});
}

// Payment method + billing address
export interface PaymentMethodData {
	card: { brand: string; last4: string; exp_month: number; exp_year: number } | null;
	billing_address: { address: string; city: string; state: string; country: string; postal: string };
	customer_id: string;
}

export function usePaymentMethod() {
	return useQuery({
		queryKey: ["billing", "payment-method"],
		queryFn: () => apiClient.get<PaymentMethodData>("/api/spa/billing/payment-method"),
	});
}

export function useSaveBillingAddress() {
	return useMutation({
		mutationFn: (data: { address: string; city: string; state: string; country: string; postal: string }) =>
			apiClient.post<{ message: string }>("/api/spa/billing/billing-address", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["billing", "payment-method"] }),
	});
}

// Auto-recharge
export interface AutoRechargeData {
	enabled: boolean;
	threshold: number;
	pack_plan_id: number;
	packs: { id: number; name: string; price: number; credits: number }[];
}

export function useAutoRecharge() {
	return useQuery({
		queryKey: ["billing", "auto-recharge"],
		queryFn: () => apiClient.get<AutoRechargeData>("/api/spa/billing/auto-recharge"),
	});
}

export function useSaveAutoRecharge() {
	return useMutation({
		mutationFn: (data: { enabled: boolean; threshold: number; pack_plan_id: number }) =>
			apiClient.post<{ message: string }>("/api/spa/billing/auto-recharge", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["billing", "auto-recharge"] }),
	});
}

// Spending alerts
export interface SpendingAlertData {
	enabled: boolean;
	threshold: number;
	frequency: string;
	recipients: string[];
}

export function useSpendingAlerts() {
	return useQuery({
		queryKey: ["billing", "spending-alerts"],
		queryFn: () => apiClient.get<SpendingAlertData>("/api/spa/billing/spending-alerts"),
	});
}

export function useSaveSpendingAlerts() {
	return useMutation({
		mutationFn: (data: { enabled: boolean; threshold: number; frequency: string; recipients: string[] }) =>
			apiClient.post<{ message: string }>("/api/spa/billing/spending-alerts", data),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["billing", "spending-alerts"] }),
	});
}
