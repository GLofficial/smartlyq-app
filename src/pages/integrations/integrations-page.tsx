import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ExternalLink, RefreshCw } from "lucide-react";
import { useIntegrations } from "@/api/general";
import { PlatformIcon } from "@/pages/social/platform-icon";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";

export function IntegrationsPage() {
	const { data, isLoading } = useIntegrations();
	const connected = data?.connected ?? [];
	const platforms = data?.platforms ?? {};
	const connectedPlatforms = new Set(connected.map((c) => c.platform));

	const handleConnect = useCallback((platform: string) => {
		// Open OAuth in popup window — user stays in React app
		const width = 600;
		const height = 700;
		const left = window.screenX + (window.outerWidth - width) / 2;
		const top = window.screenY + (window.outerHeight - height) / 2;

		const popup = window.open(
			`/${platform}/login`,
			`connect_${platform}`,
			`width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`,
		);

		if (!popup) {
			toast.error("Popup blocked. Please allow popups for this site.");
			return;
		}

		// Poll for popup close — when it closes, OAuth is complete
		const timer = setInterval(() => {
			if (popup.closed) {
				clearInterval(timer);
				// Refresh integrations data
				queryClient.invalidateQueries({ queryKey: ["integrations"] });
				queryClient.invalidateQueries({ queryKey: ["social"] });
				toast.success(`${platform} connection flow completed. Refreshing...`);
			}
		}, 500);

		// Clean up after 5 minutes
		setTimeout(() => clearInterval(timer), 5 * 60 * 1000);
	}, []);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Integrations</h1>
				<Button
					variant="outline"
					size="sm"
					onClick={() => queryClient.invalidateQueries({ queryKey: ["integrations"] })}
				>
					<RefreshCw size={14} /> Refresh
				</Button>
			</div>

			{/* Connected */}
			{connected.length > 0 && (
				<div className="space-y-3">
					<h2 className="text-lg font-semibold">Connected ({connected.length})</h2>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{connected.map((acc) => (
							<Card key={acc.id}>
								<CardContent className="flex items-center gap-3 p-4">
									{acc.profile_picture ? (
										<img src={acc.profile_picture} alt="" className="h-10 w-10 rounded-full" />
									) : (
										<PlatformIcon platform={acc.platform} size={24} />
									)}
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">{acc.account_name}</p>
										<p className="text-xs capitalize text-[var(--muted-foreground)]">{acc.platform}</p>
									</div>
									{acc.token_status === "active" ? (
										<CheckCircle size={18} className="text-green-500" />
									) : (
										<XCircle size={18} className="text-red-500" />
									)}
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}

			{/* Available */}
			<div className="space-y-3">
				<h2 className="text-lg font-semibold">Available Platforms</h2>
				{isLoading ? (
					<div className="flex h-32 items-center justify-center">
						<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
					</div>
				) : (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{Object.entries(platforms).map(([key, info]) => (
							<Card key={key}>
								<CardContent className="flex items-center gap-3 p-4">
									<PlatformIcon platform={key} size={24} />
									<div className="flex-1">
										<p className="font-medium">{info.name}</p>
									</div>
									{connectedPlatforms.has(key) ? (
										<span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
											Connected
										</span>
									) : (
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleConnect(key)}
										>
											<ExternalLink size={14} /> Connect
										</Button>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
