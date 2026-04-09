import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Palette, Shield } from "lucide-react";
import { useAgency } from "@/api/tools";

export function WhitelabelPage() {
	const { data, isLoading } = useAgency();
	const tenants = data?.tenants ?? [];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Whitelabel</h1>
			</div>

			{isLoading ? (
				<div className="flex h-40 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
				</div>
			) : !tenants.length ? (
				<Card>
					<CardContent className="flex flex-col items-center gap-4 py-12">
						<Globe size={48} className="text-[var(--muted-foreground)]" />
						<h2 className="text-lg font-semibold">Launch Your Own Branded Platform</h2>
						<p className="max-w-md text-center text-sm text-[var(--muted-foreground)]">
							Create a white-labeled version of SmartlyQ with your own domain, logo, colors, and branding.
							Your clients will see your brand, not ours.
						</p>
						<div className="flex gap-3">
							<div className="flex items-center gap-2 rounded-lg border border-[var(--border)] p-3">
								<Globe size={16} className="text-[var(--sq-primary)]" /> Custom Domain
							</div>
							<div className="flex items-center gap-2 rounded-lg border border-[var(--border)] p-3">
								<Palette size={16} className="text-[var(--sq-primary)]" /> Your Branding
							</div>
							<div className="flex items-center gap-2 rounded-lg border border-[var(--border)] p-3">
								<Shield size={16} className="text-[var(--sq-primary)]" /> SSL Included
							</div>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2">
					{tenants.map((t) => (
						<Card key={t.id}>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">{t.site_name || t.subdomain}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<p className="text-sm text-[var(--muted-foreground)]">
									{t.custom_domain || `${t.subdomain}.app.smartlyq.com`}
								</p>
								<div className="flex items-center gap-2">
									<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
										{t.status}
									</span>
									{t.license_active && (
										<span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Licensed</span>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
