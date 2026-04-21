import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
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

// Bump this when the shape of any cached query changes — old cached data is
// thrown away on next load. Keep it in sync with cache-breaking releases.
const CACHE_BUSTER = "v1";

const persister = createAsyncStoragePersister({
	storage: typeof window !== "undefined" ? window.localStorage : undefined,
	key: "sq-rq-cache",
	// Throttle writes so rapid mutations don't thrash localStorage on slow devices.
	throttleTime: 1000,
});

// Queries that should NEVER be restored from localStorage — sensitive or highly
// volatile data where showing a stale value for ~100ms before revalidation
// would be confusing (credits) or wrong (auth).
const NON_PERSISTED_PREFIXES = new Set(["auth", "billing", "credits"]);

export function AppProviders({ children }: AppProvidersProps) {
	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{
				persister,
				maxAge: 1000 * 60 * 60 * 24, // 24h
				buster: CACHE_BUSTER,
				dehydrateOptions: {
					shouldDehydrateQuery: (query) => {
						if (query.state.status !== "success") return false;
						const firstKey = String(query.queryKey?.[0] ?? "");
						if (NON_PERSISTED_PREFIXES.has(firstKey)) return false;
						return true;
					},
				},
			}}
		>
			<AuthProvider>
				<TenantProvider>
					<ConfirmProvider>
						{children}
					</ConfirmProvider>
					<Toaster position="top-right" richColors closeButton />
					<AdCooldownDialog />
				</TenantProvider>
			</AuthProvider>
		</PersistQueryClientProvider>
	);
}
