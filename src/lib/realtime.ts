// Thin singleton wrapper around socket.io-client. One socket per (uid, workspaceId)
// is maintained; reconnects happen automatically. Consumers should go through the
// `useRealtime` hook rather than touching this directly.

import { io, type Socket } from "socket.io-client";
import { STORAGE_KEYS } from "./constants";

interface RealtimeKey {
	uid: number;
	workspaceId: number;
}

let current: { key: string; socket: Socket } | null = null;

function keyOf(k: RealtimeKey): string {
	return `${k.uid}:${k.workspaceId}`;
}

/**
 * Get (or create) the global realtime socket for the given user+workspace.
 * If the key changed (e.g. workspace switch), the old socket is torn down.
 * Returns `null` when there's no token — caller should skip subscribing.
 */
export function getRealtimeSocket(k: RealtimeKey): Socket | null {
	const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
	if (!token || k.uid <= 0 || k.workspaceId <= 0) return null;

	const needed = keyOf(k);
	if (current && current.key === needed && current.socket.connected !== false) {
		return current.socket;
	}

	// Tear down any existing socket before creating a new one.
	if (current) {
		current.socket.removeAllListeners();
		current.socket.disconnect();
		current = null;
	}

	// Nginx proxies /ws/ → websocket:3000 (see docker/nginx/default.conf). The
	// socket.io server itself serves at /socket.io/, so the client path becomes
	// /ws/socket.io/ once proxied.
	const socket = io({
		path: "/ws/socket.io/",
		auth: { uid: k.uid, token, workspaceId: k.workspaceId },
		reconnection: true,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 10_000,
		transports: ["websocket", "polling"],
	});

	socket.on("connect_error", (err) => {
		// Don't spam — a single line is enough; backoff handles retries.
		console.warn("[realtime] connect_error:", err.message);
	});

	current = { key: needed, socket };
	return socket;
}

/** Return the current socket without any side effects (no teardown, no creation). */
export function getCurrentSocket(): Socket | null {
	return current?.socket ?? null;
}

/** Disconnect and drop the singleton — call on logout. */
export function disconnectRealtime(): void {
	if (!current) return;
	current.socket.removeAllListeners();
	current.socket.disconnect();
	current = null;
}
