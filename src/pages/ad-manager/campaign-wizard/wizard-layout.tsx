import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { type WizardState, DEFAULT_STATE } from "./wizard-types";
import { LaunchCampaignDialog } from "@/pages/ads/ad-dialogs-2";
import { StepAccount } from "./step-account";
import { StepPlatform } from "./step-platform";
import { StepObjective } from "./step-objective";
import { StepAudience } from "./step-audience";
import { StepBudget } from "./step-budget";
import { StepPlacement } from "./step-placement";
import { StepCreative } from "./step-creative";
import { StepTracking } from "./step-tracking";
import { StepReview } from "./step-review";

const STEPS = [
	{ label: "Account", num: 1 }, { label: "Platform", num: 2 },
	{ label: "Campaign Type", num: 3 }, { label: "Audience", num: 4 },
	{ label: "Budget & Bid", num: 5 }, { label: "Placements", num: 6 },
	{ label: "Creative", num: 7 }, { label: "Tracking", num: 8 },
	{ label: "Review", num: 9 },
] as const;

export type { WizardState };

export function CampaignWizard() {
	const [step, setStep] = useState(0);
	const [state, setState] = useState<WizardState>({ ...DEFAULT_STATE });
	const [submitting, setSubmitting] = useState(false);
	const [showLaunchDialog, setShowLaunchDialog] = useState(false);
	const navigate = useNavigate();
	const wsHash = useWorkspaceStore((s) => s.activeWorkspaceHash);

	const update = (partial: Partial<WizardState>) => setState((prev) => ({ ...prev, ...partial }));
	const canNext = validateStep(step, state);

	const handleNext = () => {
		if (!canNext) { toast.error("Please complete the required fields before proceeding."); return; }
		setStep(step + 1);
	};

	const handleLaunch = async (asDraft: boolean) => {
		setSubmitting(true);
		try {
			const body = {
				action: asDraft ? "save-draft" : "launch",
				name: state.name || "Untitled Campaign",
				platform: state.platform, objective: state.objective,
				integration_id: state.integration_id,
				budget: state.budget, budget_type: state.budget_type,
				start_date: state.start_date || null, end_date: state.end_date || null,
				targeting: { locations: state.locations, languages: state.languages, interests: state.interests,
					gender: state.gender, age_min: state.age_min, age_max: state.age_max,
					excluded_audiences: state.excluded_audiences, advantage_audience: state.advantage_audience,
					detailed_targeting_expansion: state.detailed_targeting_expansion, devices: state.devices },
				creative: { format: state.creative_format, dynamic_creative: state.dynamic_creative,
					primary_text: state.primary_text, headlines: state.headlines, descriptions: state.descriptions,
					cta: state.cta, destination_url: state.destination_url, image_url: state.image_url, video_url: state.video_url },
				settings: { bid_strategy: state.bid_strategy, ad_scheduling: state.ad_scheduling,
					placements: state.placements, conversion_event: state.conversion_event,
					pixel_tracking: state.pixel_tracking, utm_source: state.utm_source,
					utm_medium: state.utm_medium, utm_campaign: state.utm_campaign, sandbox_mode: state.sandbox_mode },
			};
			const res = await apiClient.post<{ created?: boolean; id?: number; error?: string; violations?: string[] }>("/api/spa/ad-manager/campaigns/new", body);
			if (res.created) {
				toast.success(asDraft ? "Campaign saved as draft" : "Campaign launched!");
				navigate(wsHash ? `/w/${wsHash}/ad-manager/campaigns` : "/ad-manager/campaigns");
			} else if (res.violations && res.violations.length > 0) {
				// Ad copy compliance violations — show each one
				res.violations.forEach((v) => toast.error(v, { duration: 8000 }));
			} else if (res.error?.toLowerCase().includes("rate limit")) {
				toast.error("Rate limit reached", { description: "Too many requests. Please wait a few minutes.", duration: 10000 });
			} else { toast.error(res.error || "Failed to create campaign"); }
		} catch (e: unknown) { toast.error((e as Error).message || "Failed"); }
		finally { setSubmitting(false); }
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="flex items-center gap-3">
				<button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-[var(--muted)]"><ArrowLeft size={18} /></button>
				<div>
					<h1 className="text-2xl font-bold text-[var(--foreground)]">Create Campaign</h1>
					<p className="text-sm text-[var(--muted-foreground)]">Set up a new ad campaign step by step.</p>
				</div>
			</div>

			{/* Step Indicator */}
			<div className="flex items-center gap-0">
				{STEPS.map((s, i) => (
					<div key={s.num} className="flex items-center">
						<button onClick={() => i <= step && setStep(i)} className="flex items-center gap-1.5 px-1 py-1 text-xs font-medium">
							<span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
								i === step ? "bg-[var(--sq-primary)] text-white" : i < step ? "bg-emerald-500 text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
							}`}>{i < step ? <Check size={11} /> : s.num}</span>
							<span className={`hidden sm:inline ${i === step ? "text-[var(--foreground)] font-semibold" : "text-[var(--muted-foreground)]"}`}>{s.label}</span>
						</button>
						{i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? "bg-emerald-400" : "bg-[var(--border)]"}`} />}
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
				{step === 7 && <StepTracking state={state} update={update} />}
				{step === 8 && <StepReview state={state} update={update}
					onLaunch={(asDraft) => { if (asDraft) handleLaunch(true); else setShowLaunchDialog(true); }} submitting={submitting} />}
			</div>

			<LaunchCampaignDialog open={showLaunchDialog} onClose={() => setShowLaunchDialog(false)}
				campaignName={state.name || "Untitled Campaign"} sandboxMode={state.sandbox_mode}
				onConfirm={() => { setShowLaunchDialog(false); handleLaunch(false); }} loading={submitting} />

			{/* Navigation */}
			<div className="flex items-center justify-between pt-4">
				<Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
					<ArrowLeft size={14} className="mr-1" /> Back
				</Button>
				{step < STEPS.length - 1 && (
					<Button onClick={handleNext}>Next <ArrowRight size={14} className="ml-1" /></Button>
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
		case 3: return true;
		case 4: return s.budget > 0;
		case 5: return true;
		case 6: return true;
		case 7: return true;
		case 8: return true;
		default: return true;
	}
}
