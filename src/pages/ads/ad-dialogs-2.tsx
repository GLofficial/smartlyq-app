import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Rocket } from "lucide-react";
import { PlatformIcon } from "@/pages/social/platform-icon";

interface DialogProps { open: boolean; onClose: () => void; }

// ── View Audience Details ────────────────────────────────────────────────

interface AudienceDetailsDialogProps extends DialogProps {
	audience: {
		id: number; name: string; platform: string; type: string; size: number;
		status: string; source: string; description: string; created_at: string;
	};
}

export function AudienceDetailsDialog({ open, onClose, audience: a }: AudienceDetailsDialogProps) {
	const platformMap: Record<string, string> = { meta: "facebook", google: "google", tiktok: "tiktok", linkedin: "linkedin" };
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<PlatformIcon platform={platformMap[a.platform] ?? a.platform} size={24} />
						<div>
							<DialogTitle className="text-base">{a.name}</DialogTitle>
							{a.description && <DialogDescription>{a.description}</DialogDescription>}
						</div>
					</div>
				</DialogHeader>
				<div className="space-y-0 py-2">
					<div className="flex items-center justify-between mb-3">
						<span className={`rounded-full px-3 py-1 text-xs font-medium ${
							a.status === "ready" ? "bg-emerald-100 text-emerald-700" :
							a.status === "processing" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
						}`}>{a.status}</span>
					</div>
					<DetailRow label="Type" value={a.type} />
					<DetailRow label="Platform" value={a.platform} />
					<DetailRow label="Size" value={Number(a.size).toLocaleString()} />
					<DetailRow label="Source" value={a.source || "—"} />
					<DetailRow label="Created" value={new Date(a.created_at).toLocaleDateString()} />
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ── Launch Campaign Confirmation ─────────────────────────────────────────

interface LaunchDialogProps extends DialogProps {
	campaignName: string;
	sandboxMode: boolean;
	onConfirm: () => void;
	loading?: boolean;
}

export function LaunchCampaignDialog({ open, onClose, campaignName, sandboxMode, onConfirm, loading }: LaunchDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
							<Rocket size={20} className="text-blue-600" />
						</div>
						<div>
							<DialogTitle>Launch Campaign?</DialogTitle>
							<DialogDescription>You're about to launch this campaign.</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<div className="py-3 space-y-3">
					<div className="rounded-lg bg-[var(--muted)] p-3">
						<p className="text-sm font-medium text-[var(--foreground)]">{campaignName || "Untitled Campaign"}</p>
					</div>
					{sandboxMode ? (
						<div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
							<AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
							<p className="text-xs text-amber-700">Sandbox Mode — No real ads will be delivered. This is a test campaign.</p>
						</div>
					) : (
						<div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
							<Rocket size={14} className="text-blue-600 mt-0.5 shrink-0" />
							<p className="text-xs text-blue-700">This will create a live campaign and may incur real costs on the ad platform.</p>
						</div>
					)}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
					<Button onClick={onConfirm} disabled={loading} className="bg-[var(--sq-primary)]">
						{loading ? "Launching..." : "Confirm Launch"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ── Disconnect Platform Confirmation ─────────────────────────────────────

interface DisconnectDialogProps extends DialogProps {
	platformName: string;
	onConfirm: () => void;
	loading?: boolean;
}

export function DisconnectDialog({ open, onClose, platformName, onConfirm, loading }: DisconnectDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
							<AlertTriangle size={20} className="text-red-600" />
						</div>
						<div>
							<DialogTitle>Disconnect {platformName}?</DialogTitle>
							<DialogDescription>This will remove access to this ad account.</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<div className="py-3">
					<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
						<AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
						<p className="text-xs text-red-700">You won't be able to manage campaigns on this platform until you reconnect. Existing campaigns will remain on the platform but won't sync.</p>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
					<Button variant="destructive" onClick={onConfirm} disabled={loading}>
						{loading ? "Disconnecting..." : "Disconnect"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function DetailRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
			<span className="text-sm text-[var(--muted-foreground)]">{label}</span>
			<span className="text-sm font-medium text-[var(--foreground)] capitalize">{value}</span>
		</div>
	);
}
