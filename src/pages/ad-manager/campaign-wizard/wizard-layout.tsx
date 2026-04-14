import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { StepAccount } from "./step-account";
import { StepPlatform } from "./step-platform";
import { StepObjective } from "./step-objective";
import { StepAudience } from "./step-audience";
import { StepBudget } from "./step-budget";
import { StepPlacement } from "./step-placement";
import { StepCreative } from "./step-creative";
import { StepTracking } from "./step-tracking";

const STEPS = [
	{ label: "Account", num: 1 },
	{ label: "Platform", num: 2 },
	{ label: "Campaign Type", num: 3 },
	{ label: "Audience", num: 4 },
	{ label: "Budget & Bid", num: 5 },
	{ label: "Placements", num: 6 },
	{ label: "Creative", num: 7 },
	{ label: "Tracking", num: 8 },
] as const;

export interface WizardState {
	integration_id: number;
	platform: string;
	account_name: string;
	objective: string;
	name: string;
	budget: number;
	budget_type: string;
	start_date: string;
	end_date: string;
	targeting: { locations: string[]; age_min: number; age_max: number; genders: string[] };
	placements: string[];
	creative: { format: string; headline: string; description: string; cta: string; destination_url: string };
	tracking: { pixel_id: string; conversion_event: string };
}

const DEFAULT_STATE: WizardState = {
	integration_id: 0, platform: "", account_name: "", objective: "", name: "New Campaign",
	budget: 10, budget_type: "daily", start_date: "", end_date: "",
	targeting: { locations: [], age_min: 18, age_max: 65, genders: [] },
	placements: [], creative: { format: "image", headline: "", description: "", cta: "LEARN_MORE", destination_url: "" },
	tracking: { pixel_id: "", conversion_event: "" },
};

export function CampaignWizard() {
	const [step, setStep] = useState(0);
	const [state, setState] = useState<WizardState>(DEFAULT_STATE);
	const [submitting, setSubmitting] = useState(false);
	const navigate = useNavigate();
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);

	const update = (partial: Partial<WizardState>) => setState((prev) => ({ ...prev, ...partial }));
	const canNext = validateStep(step, state);

	const handleLaunch = async (asDraft: boolean) => {
		setSubmitting(true);
		try {
			const res = await apiClient.post<{ created?: boolean; id?: number; error?: string }>(
				"/api/spa/ad-manager/campaigns/new",
				{ ...state, action: asDraft ? "save-draft" : "launch" }
			);
			if (res.created) {
				toast.success(asDraft ? "Campaign saved as draft" : "Campaign launched!");
				navigate(wsHash ? `/w/${wsHash}/ad-manager/campaigns` : "/ad-manager/campaigns");
			} else {
				toast.error(res.error || "Failed to create campaign");
			}
		} catch (e: unknown) {
			toast.error((e as Error).message || "Failed");
		} finally { setSubmitting(false); }
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-[var(--muted)]"><ArrowLeft size={18} /></button>
				<div>
					<h1 className="text-2xl font-bold text-[var(--foreground)]">Create Campaign</h1>
					<p className="text-sm text-[var(--muted-foreground)]">Set up a new ad campaign step by step.</p>
				</div>
			</div>

			{/* Step Indicator */}
			<div className="flex items-center gap-1">
				{STEPS.map((s, i) => (
					<div key={s.num} className="flex items-center gap-1">
						<button onClick={() => i <= step && setStep(i)}
							className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
								i === step ? "bg-[var(--sq-primary)] text-white" :
								i < step ? "bg-emerald-100 text-emerald-700" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
							}`}>
							{i < step ? <Check size={12} /> : <span>{s.num}</span>}
							<span className="hidden sm:inline">{s.label}</span>
						</button>
						{i < STEPS.length - 1 && <div className={`h-px w-4 ${i < step ? "bg-emerald-400" : "bg-[var(--border)]"}`} />}
					</div>
				))}
			</div>

			{/* Step Content */}
			<div className="min-h-[400px]">
				{step === 0 && <StepAccount state={state} update={update} />}
				{step === 1 && <StepPlatform state={state} update={update} />}
				{step === 2 && <StepObjective state={state} update={update} />}
				{step === 3 && <StepAudience state={state} update={update} />}
				{step === 4 && <StepBudget state={state} update={update} />}
				{step === 5 && <StepPlacement state={state} update={update} />}
				{step === 6 && <StepCreative state={state} update={update} />}
				{step === 7 && <StepTracking state={state} update={update} onLaunch={handleLaunch} submitting={submitting} />}
			</div>

			{/* Navigation */}
			<div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
				<Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
					<ArrowLeft size={14} className="mr-1" /> Back
				</Button>
				{step < STEPS.length - 1 ? (
					<Button onClick={() => setStep(step + 1)} disabled={!canNext}>
						Next <ArrowRight size={14} className="ml-1" />
					</Button>
				) : (
					<div className="flex gap-2">
						<Button variant="outline" onClick={() => handleLaunch(true)} disabled={submitting}>Save as Draft</Button>
						<Button onClick={() => handleLaunch(false)} disabled={submitting || !canNext}>Launch Campaign</Button>
					</div>
				)}
			</div>
		</div>
	);
}

function validateStep(step: number, s: WizardState): boolean {
	switch (step) {
		case 0: return s.integration_id > 0;
		case 1: return s.platform !== "";
		case 2: return s.objective !== "";
		case 3: return true; // audience is optional
		case 4: return s.budget > 0;
		case 5: return true; // placements optional
		case 6: return true; // creative optional for draft
		case 7: return true;
		default: return true;
	}
}
