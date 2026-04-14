import { ServerHealth } from "./monitoring/server-health";
import { ServicesPanel } from "./monitoring/services-panel";
import { DatabasePanel, EndpointsPanel, SSLPanel, RedisPanel, FpmPanel, R2Panel } from "./monitoring/infra-panels";
import { SocialApiPanel, CronPanel, AiQueuePanel, ErrorLogsPanel, NginxPanel, AuthAuditPanel } from "./monitoring/ops-panels";

export function AdminMonitoringPage() {
	return (
		<div className="space-y-6 max-w-[1600px]">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[var(--foreground)]">Command Center</h1>
					<p className="text-sm text-[var(--muted-foreground)] mt-0.5">Real-time system monitoring and diagnostics</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="flex items-center gap-1.5 text-xs text-emerald-600">
						<span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
						Auto-refresh active
					</span>
				</div>
			</div>

			{/* Row 1: Server + Services */}
			<div className="grid gap-6 lg:grid-cols-2">
				<ServerHealth />
				<ServicesPanel />
			</div>

			{/* Row 2: Endpoints + SSL + Nginx */}
			<div className="grid gap-6 lg:grid-cols-3">
				<EndpointsPanel />
				<SSLPanel />
				<NginxPanel />
			</div>

			{/* Row 3: Database + Redis + PHP-FPM */}
			<div className="grid gap-6 lg:grid-cols-3">
				<DatabasePanel />
				<RedisPanel />
				<FpmPanel />
			</div>

			{/* Row 4: AI Queue + Social APIs */}
			<div className="grid gap-6 lg:grid-cols-2">
				<AiQueuePanel />
				<SocialApiPanel />
			</div>

			{/* Row 5: R2 Storage */}
			<R2Panel />

			{/* Row 6: Cron Jobs */}
			<CronPanel />

			{/* Row 7: Error Logs + Auth Audit */}
			<div className="grid gap-6 lg:grid-cols-2">
				<ErrorLogsPanel />
				<AuthAuditPanel />
			</div>
		</div>
	);
}
