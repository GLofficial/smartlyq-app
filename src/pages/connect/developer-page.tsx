import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Key, Shield } from "lucide-react";
import { useDeveloperKeys } from "@/api/developer";

export function DeveloperPage() {
	const { data, isLoading } = useDeveloperKeys();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Developer</h1>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<Code2 size={18} /> API Documentation
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-[var(--muted-foreground)]">
						Use the SmartlyQ API to integrate with your apps. Base URL: <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-xs">{window.location.origin}/api/v1</code>
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Key size={18} /> API Keys</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-20 items-center justify-center">
							<div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" />
						</div>
					) : !(data?.api_keys ?? []).length ? (
						<p className="text-sm text-[var(--muted-foreground)]">No API keys created yet.</p>
					) : (
						<div className="space-y-2">
							{data?.api_keys.map((k) => (
								<div key={k.id} className="flex items-center gap-3 rounded-md border border-[var(--border)] p-3">
									<Shield size={16} className={k.status === "active" ? "text-green-500" : "text-gray-400"} />
									<div className="min-w-0 flex-1">
										<p className="font-medium text-sm">{k.name}</p>
										<p className="text-xs text-[var(--muted-foreground)]">
											{k.key_prefix}... · {k.rate_limit} req/min
										</p>
									</div>
									<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${k.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
										{k.status}
									</span>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
