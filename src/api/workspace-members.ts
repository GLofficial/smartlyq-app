import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryClient } from "@/lib/query-client";

export interface WorkspaceMember { id: number; user_id: number; name: string; email: string; role: string; avatar: string; }
export interface WorkspaceInvite { id: number; email: string; role: string; created_at: string | null; }

const inv = () => queryClient.invalidateQueries({ queryKey: ["workspace", "members"] });

export function useWorkspaceMembers() {
	return useQuery({
		queryKey: ["workspace", "members"],
		queryFn: () => apiClient.get<{ members: WorkspaceMember[]; invites: WorkspaceInvite[] }>("/api/spa/workspace/members"),
	});
}

export function useInviteMember() {
	return useMutation({
		mutationFn: (data: { email: string; role?: string }) => apiClient.post<{ message: string; id: number }>("/api/spa/workspace/members/invite", data),
		onSuccess: inv,
	});
}

export function useCancelInvite() {
	return useMutation({
		mutationFn: (inviteId: number) => apiClient.post<{ message: string }>("/api/spa/workspace/members/cancel-invite", { invite_id: inviteId }),
		onSuccess: inv,
	});
}

export function useRemoveMember() {
	return useMutation({
		mutationFn: (memberId: number) => apiClient.post<{ message: string }>("/api/spa/workspace/members/remove", { member_id: memberId }),
		onSuccess: inv,
	});
}

export function useChangeMemberRole() {
	return useMutation({
		mutationFn: (data: { member_id: number; role: string }) => apiClient.post<{ message: string }>("/api/spa/workspace/members/role", data),
		onSuccess: inv,
	});
}
