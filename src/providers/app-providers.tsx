import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryClient } from "@/lib/query-client";
import { Toaster } from "sonner";
import { TenantProvider } from "./tenant-provider";
import { AuthProvider } from "./auth-provider";

interface AppProvidersProps {
	children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<TenantProvider>
					{children}
					<Toaster position="top-right" richColors closeButton />
				</TenantProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}
