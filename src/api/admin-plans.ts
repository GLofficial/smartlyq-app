import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

const invalidatePlans = () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });

export function useAdminPlansFull() {
	return useQuery({
		queryKey: ["admin", "plans", "full"],
		queryFn: () => apiClient.get<{ plans: Record<string, unknown>[] }>("/api/spa/admin/plans/full"),
	});
}

export function useAdminPlanGet(id: number) {
	return useQuery({
		queryKey: ["admin", "plans", id],
		queryFn: () => apiClient.get<{ plan: Record<string, unknown> }>(`/api/spa/admin/plans/get?id=${id}`),
		enabled: id > 0,
	});
}

export function useAdminPlanSave() {
	return useMutation({
		mutationFn: (data: Record<string, unknown>) =>
			apiClient.post<{ message: string; id: number }>("/api/spa/admin/plans/save", data),
		onSuccess: invalidatePlans,
	});
}

export function useAdminPlanDelete() {
	return useMutation({
		mutationFn: (data: { id: number; hard?: boolean }) =>
			apiClient.post<{ message: string }>("/api/spa/admin/plans/delete", data),
		onSuccess: invalidatePlans,
	});
}

export function useAdminPlanDuplicate() {
	return useMutation({
		mutationFn: (id: number) =>
			apiClient.post<{ message: string; id: number }>("/api/spa/admin/plans/duplicate", { id }),
		onSuccess: invalidatePlans,
	});
}
