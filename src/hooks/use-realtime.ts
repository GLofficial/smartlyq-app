// Subscribes the current (user, workspace) to the realtime socket and invalidates
// relevant React Query caches when server-pushed events arrive. Mount once in the
// authenticated shell — the socket singleton in src/lib/realtime.ts handles the
// connection lifecycle (reconnect on workspace switch, teardown on logout).

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { queryClient } from "@/lib/query-client";
import { getRealtimeSocket, disconnectRealtime } from "@/lib/realtime";

export function useRealtime(): void {
	const user = useAuthStore((s) => s.user);
	const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

	useEffect(() => {
		// No socket until both user + workspace are resolved.
		if (!user?.id || !workspaceId) {
			disconnectRealtime();
			return;
		}

		const socket = getRealtimeSocket({ uid: user.id, workspaceId });
		if (!socket) return;

		// Silent-refresh strategy: push events trigger a React Query invalidation,
		// which in turn re-fetches the relevant list. Unread badges + list order
		// update naturally from the refetch; no toast fires.
		const onInbox = () => {
			queryClient.invalidateQueries({ queryKey: ["social", "inbox"] });
		};
		const onInboxThread = (payload: { conversation_id?: number }) => {
			queryClient.invalidateQueries({ queryKey: ["social", "inbox"] });
			if (payload?.conversation_id) {
				queryClient.invalidateQueries({
					queryKey: ["social", "inbox", "thread", payload.conversation_id],
				});
			}
		};
		const onComments = () => {
			queryClient.invalidateQueries({ queryKey: ["social", "comments"] });
		};

		socket.on("inbox:new_message", onInboxThread);
		socket.on("inbox:new_conversation", onInbox);
		socket.on("inbox:updated", onInbox);
		socket.on("comments:new", onComments);
		socket.on("comments:updated", onComments);

		return () => {
			socket.off("inbox:new_message", onInboxThread);
			socket.off("inbox:new_conversation", onInbox);
			socket.off("inbox:updated", onInbox);
			socket.off("comments:new", onComments);
			socket.off("comments:updated", onComments);
		};
	}, [user?.id, workspaceId]);
}
