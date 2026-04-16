import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AdActionResponse {
	updated?: boolean;
	created?: boolean;
	deleted?: boolean;
	id?: number;
	error?: string;
	// Anti-ban middleware responses
	cooldown_warning?: boolean;
	message?: string;
	hours_remaining?: number;
	violations?: string[];
}

/** Pending cooldown confirmation — stored so the UI can show a dialog */
let pendingCooldown: {
	resolve: (confirmed: boolean) => void;
	message: string;
	hoursRemaining: number;
} | null = null;

export function getPendingCooldown() { return pendingCooldown; }
export function clearPendingCooldown() { pendingCooldown = null; }

/**
 * Detect rate limit errors from any API response or error message.
 */
function isRateLimitError(msg: string): boolean {
	const lower = msg.toLowerCase();
	return lower.includes("rate limit") || lower.includes("too many requests") || lower.includes("rate_limited");
}

/**
 * Central Ad Manager action hook with anti-ban response handling.
 * Detects cooldown warnings, rate limits, compliance violations.
 */
function useAdAction(endpoint: string, invalidateKeys: string[]) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (body: Record<string, unknown>): Promise<AdActionResponse> => {
			const res = await apiClient.post<AdActionResponse>(`/api/spa/ad-manager/${endpoint}`, body);

			// Cooldown warning — needs user confirmation
			if (res.cooldown_warning && !body.confirm_cooldown) {
				return new Promise<AdActionResponse>((resolve) => {
					pendingCooldown = {
						resolve: (confirmed: boolean) => {
							pendingCooldown = null;
							if (confirmed) {
								// Re-send with confirm_cooldown flag
								apiClient.post<AdActionResponse>(`/api/spa/ad-manager/${endpoint}`, { ...body, confirm_cooldown: true })
									.then(resolve)
									.catch(() => resolve({ error: "Failed to confirm action" }));
							} else {
								resolve({ error: "Action cancelled by user" });
							}
						},
						message: res.message || "This entity was recently edited. Editing within 72 hours restarts Facebook's learning phase.",
						hoursRemaining: res.hours_remaining || 0,
					};
					// Trigger a re-render by returning a special response
					resolve({ cooldown_warning: true, message: res.message, hours_remaining: res.hours_remaining });
				});
			}

			return res;
		},
		onSuccess: (data, variables) => {
			// Don't show success for cooldown warnings (dialog will handle it)
			if (data.cooldown_warning) return;

			// Compliance violations
			if (data.violations && data.violations.length > 0) {
				data.violations.forEach((v) => toast.error(v, { duration: 8000 }));
				return;
			}

			// Rate limit errors
			if (data.error && isRateLimitError(data.error)) {
				toast.error(data.error, {
					duration: 10000,
					description: "The platform is limiting API requests. Please wait a few minutes before making changes.",
				});
				return;
			}

			// Generic error
			if (data.error) {
				toast.error(data.error);
				return;
			}

			// Success
			const action = String(variables.action ?? "");
			toast.success(`${action.replace(/_/g, " ")} successful`);
			invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: ["ad-manager", k] }));
		},
		onError: (err: Error) => {
			if (isRateLimitError(err.message)) {
				toast.error("Rate limit reached", {
					duration: 10000,
					description: "Too many requests. Please wait a few minutes before trying again.",
				});
			} else {
				toast.error(err.message || "Action failed");
			}
		},
	});
}

export function useCampaignAction() {
	return useAdAction("campaigns", ["campaigns", "dashboard"]);
}

export function useAdSetAction() {
	return useAdAction("ad-sets", ["ad-sets"]);
}

export function useAdAction2() {
	return useAdAction("ads", ["ads"]);
}

export function useSettingsAction() {
	return useAdAction("settings", ["settings"]);
}

export function useSync() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => apiClient.post<Record<string, unknown>>("/api/spa/ad-manager/sync", {}),
		onSuccess: () => {
			toast.success("Sync started");
			qc.invalidateQueries({ queryKey: ["ad-manager"] });
		},
		onError: (err: Error) => toast.error(err.message || "Sync failed"),
	});
}
