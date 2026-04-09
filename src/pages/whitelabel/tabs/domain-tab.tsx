import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Globe, CheckCircle, XCircle, Shield } from "lucide-react";
import type { WhitelabelSettings } from "@/api/whitelabel";

interface Props {
	domain: WhitelabelSettings["domain"];
}

export function DomainTab({ domain }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Globe size={18} />
					Domain Settings
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Subdomain (read-only) */}
				<div className="space-y-1.5">
					<label className="text-sm font-medium">Subdomain</label>
					<div className="flex items-center gap-2">
						<Input
							value={domain.subdomain ?? ""}
							disabled
							className="bg-[var(--accent)] text-[var(--muted-foreground)]"
						/>
						<span className="shrink-0 text-sm text-[var(--muted-foreground)]">
							.app.smartlyq.com
						</span>
					</div>
					<p className="text-xs text-[var(--muted-foreground)]">
						Your subdomain is assigned automatically and cannot be changed.
					</p>
				</div>

				{/* Custom Domain */}
				<div className="space-y-1.5">
					<label className="text-sm font-medium">Custom Domain</label>
					<Input
						value={domain.custom_domain ?? ""}
						disabled
						placeholder="app.yourdomain.com"
					/>
					<p className="text-xs text-[var(--muted-foreground)]">
						To change your custom domain, contact support.
					</p>
				</div>

				{/* Status Cards */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-4">
						{domain.domain_verified ? (
							<CheckCircle size={20} className="text-green-500" />
						) : (
							<XCircle size={20} className="text-red-500" />
						)}
						<div>
							<p className="text-sm font-medium">Domain Verification</p>
							<p className="text-xs text-[var(--muted-foreground)]">
								{domain.domain_verified
									? "Your domain is verified and active."
									: "Domain not yet verified. Add the CNAME record."}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-4">
						{domain.ssl_active ? (
							<Shield size={20} className="text-green-500" />
						) : (
							<Shield size={20} className="text-yellow-500" />
						)}
						<div>
							<p className="text-sm font-medium">SSL Certificate</p>
							<p className="text-xs text-[var(--muted-foreground)]">
								{domain.ssl_active
									? "SSL is active and secure."
									: "SSL is provisioning. This may take a few minutes."}
							</p>
						</div>
					</div>
				</div>

				{/* DNS Instructions */}
				{!domain.domain_verified && domain.custom_domain && (
					<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
						<p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
							DNS Configuration Required
						</p>
						<p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
							Add a CNAME record pointing{" "}
							<code className="rounded bg-yellow-100 px-1 dark:bg-yellow-900">
								{domain.custom_domain}
							</code>{" "}
							to{" "}
							<code className="rounded bg-yellow-100 px-1 dark:bg-yellow-900">
								{domain.subdomain}.app.smartlyq.com
							</code>
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
