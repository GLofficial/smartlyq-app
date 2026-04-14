import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

/** POST action to an ad-manager endpoint. Invalidates related queries on success. */
function useAdAction(endpoint: string, invalidateKeys: string[]) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: Record<string, unknown>) =>
			apiClient.post<{ updated?: boolean; created?: boolean; deleted?: boolean; id?: number; error?: string }>(
				`/api/spa/ad-manager/${endpoint}`, body
			),
		onSuccess: (_data, variables) => {
			const action = String(variables.action ?? "");
			toast.success(`${action.replace("_", " ")} successful`);
			invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: ["ad-manager", k] }));
		},
		onError: (err: Error) => {
			toast.error(err.message || "Action failed");
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
