import { useState, useEffect } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPendingCooldown, clearPendingCooldown } from "@/api/ad-manager/mutations";

/**
 * Global cooldown confirmation dialog.
 * Renders when the Ad Manager mutation hook detects a cooldown_warning response.
 * Shows a warning about Facebook's learning phase and lets the user confirm or cancel.
 *
 * Mount this once in the app layout (e.g., inside AdManagerProvider or app-layout).
 */
export function AdCooldownDialog() {
	const [visible, setVisible] = useState(false);
	const [message, setMessage] = useState("");
	const [hoursRemaining, setHoursRemaining] = useState(0);

	// Poll for pending cooldown (set by mutation hook)
	useEffect(() => {
		const interval = setInterval(() => {
			const pending = getPendingCooldown();
			if (pending && !visible) {
				setMessage(pending.message);
				setHoursRemaining(pending.hoursRemaining);
				setVisible(true);
			}
		}, 200);
		return () => clearInterval(interval);
	}, [visible]);

	const handleConfirm = () => {
		const pending = getPendingCooldown();
		if (pending) pending.resolve(true);
		setVisible(false);
	};

	const handleCancel = () => {
		const pending = getPendingCooldown();
		if (pending) pending.resolve(false);
		clearPendingCooldown();
		setVisible(false);
	};

	if (!visible) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleCancel}>
			<div className="w-full max-w-md rounded-xl border border-amber-200 bg-[var(--card)] shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
				<div className="p-5">
					<div className="flex items-start gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
							<AlertTriangle size={20} className="text-amber-600" />
						</div>
						<div className="flex-1">
							<h3 className="text-base font-semibold text-[var(--foreground)]">Learning Phase Warning</h3>
							<p className="text-sm text-[var(--muted-foreground)] mt-1">{message}</p>
							{hoursRemaining > 0 && (
								<div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600">
									<Clock size={12} />
									<span>{Math.round(hoursRemaining)}h until safe to edit</span>
								</div>
							)}
						</div>
					</div>

					<div className="mt-4 rounded-lg bg-amber-50 p-3">
						<p className="text-xs text-amber-800">
							Facebook's learning phase restarts when you make significant changes to a campaign.
							During the learning phase, performance is typically worse and costs are higher.
							It's recommended to wait 72 hours between major edits.
						</p>
					</div>
				</div>

				<div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-3">
					<Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
					<Button size="sm" onClick={handleConfirm} className="bg-amber-600 hover:bg-amber-700 text-white">
						I understand, continue
					</Button>
				</div>
			</div>
		</div>
	);
}
