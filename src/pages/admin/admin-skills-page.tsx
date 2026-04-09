import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Power, PowerOff } from "lucide-react";
import { useAdminSkills } from "@/api/admin-ai-captain";

export function AdminSkillsPage() {
	const { data, isLoading } = useAdminSkills();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">AI Captain Skills</h1>
			<Card>
				<CardHeader><CardTitle className="text-lg">Skills ({(data?.skills ?? []).length ?? 0})</CardTitle></CardHeader>
				<CardContent>
					{isLoading ? <Spinner /> : !(data?.skills ?? []).length ? (
						<div className="flex flex-col items-center gap-2 py-8"><Zap size={32} className="text-[var(--muted-foreground)]" /><p className="text-sm text-[var(--muted-foreground)]">No skills configured.</p></div>
					) : (
						<div className="space-y-2">
							{data?.skills.map((s) => (
								<div key={s.id} className="flex items-center gap-3 rounded border border-[var(--border)] p-3">
									<Zap size={16} className="text-[var(--sq-primary)]" />
									<div className="min-w-0 flex-1">
										<p className="font-medium text-sm">{s.name}</p>
										<p className="text-xs text-[var(--muted-foreground)]">{s.description}</p>
									</div>
									<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs">{s.type}</span>
									{s.is_active ? <Power size={14} className="text-green-500" /> : <PowerOff size={14} className="text-gray-400" />}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function Spinner() { return <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--sq-primary)] border-t-transparent" /></div>; }
