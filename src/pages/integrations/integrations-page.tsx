import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { useIntegrations } from "@/api/general";
import { PlatformIcon } from "@/pages/social/platform-icon";

export function IntegrationsPage() {
	const { data, isLoading } = useIntegrations();
	const connected = data?.connected ?? [];
	const platforms = data?.platforms ?? {};

	const connectedPlatforms = new Set(connected.map((c) => c.platform));

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Integrations</h1>

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
									{acc.token_status === 'active' ? (
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
										<span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Connected</span>
									) : (
										<a href={`/${key}/login`} target="_blank" rel="noopener noreferrer">
											<Button variant="outline" size="sm">
												<ExternalLink size={14} /> Connect
											</Button>
										</a>
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
