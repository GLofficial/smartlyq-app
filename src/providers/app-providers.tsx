import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryClient } from "@/lib/query-client";
import { Toaster } from "sonner";
import { TenantProvider } from "./tenant-provider";
import { AuthProvider } from "./auth-provider";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { AdCooldownDialog } from "@/components/ad-cooldown-dialog";

interface AppProvidersProps {
	children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<TenantProvider>
					<ConfirmProvider>
						{children}
					</ConfirmProvider>
					<Toaster position="top-right" richColors closeButton />
					<AdCooldownDialog />
				</TenantProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}
