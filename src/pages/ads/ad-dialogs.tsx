import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2, Pause, DollarSign, Pencil } from "lucide-react";

interface DialogProps {
	open: boolean;
	onClose: () => void;
}

// ── Delete Confirmation ─────────────────────────────────────────────────

interface DeleteDialogProps extends DialogProps {
	entityType: string; // "campaign" | "ad set" | "ad"
	entityName: string;
	spent?: number;
	onConfirm: () => void;
	loading?: boolean;
}

export function DeleteDialog({ open, onClose, entityType, entityName, spent, onConfirm, loading }: DeleteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
							<Trash2 size={20} className="text-red-600" />
						</div>
						<div>
							<DialogTitle>Delete {entityType}?</DialogTitle>
							<DialogDescription>This action cannot be undone.</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<div className="space-y-3 py-3">
					<div className="rounded-lg bg-[var(--muted)] p-3">
						<p className="text-sm font-medium text-[var(--foreground)]">{entityName}</p>
						{spent != null && spent > 0 && (
							<p className="text-xs text-[var(--muted-foreground)] mt-1">Total spent: €{spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
						)}
					</div>
					<div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
						<AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
						<p className="text-xs text-red-700">Live action — will permanently delete this {entityType} on the ad platform. All child entities will also be removed.</p>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
					<Button variant="destructive" onClick={onConfirm} disabled={loading}>
						{loading ? "Deleting..." : `Delete ${entityType}`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ── Pause Confirmation ──────────────────────────────────────────────────

interface PauseDialogProps extends DialogProps {
	entityType: string;
	entityName: string;
	isPaused: boolean;
	onConfirm: () => void;
	loading?: boolean;
}

export function PauseDialog({ open, onClose, entityType, entityName, isPaused, onConfirm, loading }: PauseDialogProps) {
	const action = isPaused ? "Resume" : "Pause";
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className={`flex h-10 w-10 items-center justify-center rounded-full ${isPaused ? "bg-emerald-100" : "bg-amber-100"}`}>
							<Pause size={20} className={isPaused ? "text-emerald-600" : "text-amber-600"} />
						</div>
						<div>
							<DialogTitle>{action} {entityType}?</DialogTitle>
							<DialogDescription>{isPaused ? "Ads will start delivering again." : "Ads will stop delivering immediately."}</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<div className="py-3">
					<div className="rounded-lg bg-[var(--muted)] p-3">
						<p className="text-sm font-medium text-[var(--foreground)]">{entityName}</p>
					</div>
					<div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 mt-3">
						<AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
						<p className="text-xs text-amber-700">Live action — will {action.toLowerCase()} this {entityType} on the ad platform.</p>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
					<Button onClick={onConfirm} disabled={loading}>{loading ? `${action}ing...` : action}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ── Edit Budget ─────────────────────────────────────────────────────────

interface EditBudgetDialogProps extends DialogProps {
	entityName: string;
	currentBudget: number;
	budgetType: string;
	onConfirm: (amount: number) => void;
	loading?: boolean;
}

export function EditBudgetDialog({ open, onClose, entityName, currentBudget, budgetType, onConfirm, loading }: EditBudgetDialogProps) {
	const [amount, setAmount] = useState(currentBudget);
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
							<DollarSign size={20} className="text-blue-600" />
						</div>
						<div>
							<DialogTitle>Edit Budget</DialogTitle>
							<DialogDescription>{entityName}</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<div className="space-y-4 py-3">
					<div className="flex items-center justify-between text-sm">
						<span className="text-[var(--muted-foreground)]">Current budget ({budgetType})</span>
						<span className="font-medium">€{currentBudget.toFixed(2)}</span>
					</div>
					<div>
						<label className="text-sm font-medium text-[var(--foreground)]">New Budget Amount (€)</label>
						<Input type="number" min={1} step={0.01} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1" />
					</div>
					<div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
						<AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
						<p className="text-xs text-amber-700">Live action — will update budget on the ad platform immediately.</p>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
					<Button onClick={() => onConfirm(amount)} disabled={loading || amount <= 0}>
						{loading ? "Updating..." : "Update Budget"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ── Edit Name ───────────────────────────────────────────────────────────

interface EditNameDialogProps extends DialogProps {
	entityType: string;
	currentName: string;
	onConfirm: (name: string) => void;
	loading?: boolean;
}

export function EditNameDialog({ open, onClose, entityType, currentName, onConfirm, loading }: EditNameDialogProps) {
	const [name, setName] = useState(currentName);
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
							<Pencil size={20} className="text-blue-600" />
						</div>
						<DialogTitle>Rename {entityType}</DialogTitle>
					</div>
				</DialogHeader>
				<div className="py-3">
					<label className="text-sm font-medium text-[var(--foreground)]">{entityType} Name</label>
					<Input value={name} onChange={(e) => setName(e.target.value)} maxLength={255} className="mt-1" />
					<div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 mt-3">
						<AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
						<p className="text-xs text-amber-700">Live action — will rename on the ad platform.</p>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
					<Button onClick={() => onConfirm(name.trim())} disabled={loading || !name.trim()}>
						{loading ? "Renaming..." : "Rename"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// ── Campaign Analytics ──────────────────────────────────────────────────

interface CampaignAnalyticsDialogProps extends DialogProps {
	campaign: {
		name: string; platform: string; objective: string; status: string;
		budget: number; spent: number; roas: number;
		impressions: number; clicks: number; ctr: number;
		conversions: number; cpa: number; purchase_value: number; leads: number;
	};
}

export function CampaignAnalyticsDialog({ open, onClose, campaign: c }: CampaignAnalyticsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<span className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs capitalize">{c.platform}</span>
						<DialogTitle className="text-base">{c.name}</DialogTitle>
					</div>
					<DialogDescription>{c.objective} · <span className="capitalize">{c.status}</span></DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-2">
					{/* Top 3 stats */}
					<div className="grid grid-cols-3 gap-3">
						<StatBox label="Budget" value={`€${c.budget.toFixed(2)}`} />
						<StatBox label="Spent" value={`€${c.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
						<StatBox label="ROAS" value={`${c.roas.toFixed(1)}x`} highlight />
					</div>
					{/* Metrics grid */}
					<div className="grid grid-cols-4 gap-3">
						<StatBox label="Impressions" value={c.impressions.toLocaleString()} />
						<StatBox label="Clicks" value={c.clicks.toLocaleString()} />
						<StatBox label="CTR" value={`${c.ctr.toFixed(2)}%`} />
						<StatBox label="Conversions" value={String(c.conversions)} />
					</div>
					<div className="grid grid-cols-3 gap-3">
						<StatBox label="CPA" value={`€${c.cpa.toFixed(2)}`} />
						<StatBox label="Purchase Value" value={`€${c.purchase_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
						<StatBox label="Leads" value={String(c.leads)} />
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function StatBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
	return (
		<div className={`rounded-lg border border-[var(--border)] p-3 ${highlight ? "bg-emerald-50" : ""}`}>
			<p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">{label}</p>
			<p className={`text-sm font-bold mt-0.5 ${highlight ? "text-emerald-700" : "text-[var(--foreground)]"}`}>{value}</p>
		</div>
	);
}
