import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

export function useAdminAdjustCredits() {
	return useMutation({
		mutationFn: (data: { user_id: number; credits: number }) =>
			apiClient.post<{ message: string }>("/api/spa/admin/users/credits", data),
		onSuccess: invalidateUsers,
	});
}

export function useAdminToggleStatus() {
	return useMutation({
		mutationFn: (data: { user_id: number; status: number }) =>
			apiClient.post<{ message: string }>("/api/spa/admin/users/status", data),
		onSuccess: invalidateUsers,
	});
}

export function useAdminChangeRole() {
	return useMutation({
		mutationFn: (data: { user_id: number; role: number }) =>
			apiClient.post<{ message: string }>("/api/spa/admin/users/role", data),
		onSuccess: invalidateUsers,
	});
}

export function useAdminAssignPlan() {
	return useMutation({
		mutationFn: (data: { user_id: number; plan_id: number }) =>
			apiClient.post<{ message: string }>("/api/spa/admin/users/plan", data),
		onSuccess: invalidateUsers,
	});
}

export function useAdminDeleteUser() {
	return useMutation({
		mutationFn: (userId: number) =>
			apiClient.post<{ message: string }>("/api/spa/admin/users/delete", { user_id: userId }),
		onSuccess: invalidateUsers,
	});
}
