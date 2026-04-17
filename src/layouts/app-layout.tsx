import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { useRealtime } from "@/hooks/use-realtime";

export function AppLayout() {
	// One global realtime socket for the authenticated shell — pushes inbox/comment
	// updates and invalidates the corresponding React Query caches.
	useRealtime();
	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<Header />
				<main className="flex-1 overflow-y-auto p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
