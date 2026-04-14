import { useState } from "react";
import { ReportsSidebar } from "./reports/reports-sidebar";
import { SummaryTab } from "./reports/summary-tab";
import { AudienceTab } from "./reports/audience-tab";
import { PostsTab } from "./reports/posts-tab";
import type { ReportFilters } from "@/api/social-reports";
import { useEmailReport } from "@/api/social-reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Mail } from "lucide-react";
import { toast } from "sonner";

const TABS = ["Summary", "Audience", "Posts & Engagement"] as const;

const defaultFrom = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
const defaultTo = new Date().toISOString().slice(0, 10);

export function AnalyticsPage() {
	const [tab, setTab] = useState<string>("Summary");
	const [filters, setFilters] = useState<ReportFilters>({
		dateFrom: defaultFrom, dateTo: defaultTo, accountId: null, platform: "",
	});
	const [emailOpen, setEmailOpen] = useState(false);
	const [emailTo, setEmailTo] = useState("");
	const emailMut = useEmailReport();

	const updateFilters = (partial: Partial<ReportFilters>) => {
		setFilters((prev) => ({ ...prev, ...partial }));
	};

	const daysDiff = Math.max(1, Math.ceil((new Date(filters.dateTo).getTime() - new Date(filters.dateFrom).getTime()) / 86400000));

	function handleSendReport() {
		if (!emailTo.trim()) return;
		emailMut.mutate(
			{
				email: emailTo.trim(),
				date_from: filters.dateFrom,
				date_to: filters.dateTo,
				social_account_id: filters.accountId,
			},
			{
				onSuccess: (d) => { toast.success(d.message); setEmailOpen(false); setEmailTo(""); },
				onError: (e: Error) => toast.error(e.message || "Failed to send report"),
			},
		);
	}

	return (
		<div className="flex gap-6 min-h-[calc(100vh-8rem)]">
			{/* Left Sidebar */}
			<ReportsSidebar filters={filters} onFiltersChange={updateFilters} />

			{/* Right Panel */}
			<div className="flex-1 min-w-0 space-y-5">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-[var(--foreground)]">Social Media Report</h1>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-sm text-[var(--muted-foreground)]">Last {daysDiff} days</span>
						<Button variant="outline" size="sm" onClick={() => setEmailOpen(true)} title="Email Report">
							<Mail size={16} />
						</Button>
					</div>
				</div>

				{/* Tabs */}
				<div className="flex gap-1 border-b border-[var(--border)] pb-px">
					{TABS.map((t) => (
						<button key={t} onClick={() => setTab(t)}
							className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
								tab === t ? "border-[var(--sq-primary)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
							}`}>{t}</button>
					))}
				</div>

				{/* Tab Content */}
				{tab === "Summary" && <SummaryTab filters={filters} />}
				{tab === "Audience" && <AudienceTab filters={filters} />}
				{tab === "Posts & Engagement" && <PostsTab filters={filters} />}
			</div>

			{/* Email Report Modal */}
			<Dialog open={emailOpen} onOpenChange={setEmailOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Mail size={18} /> Email Report
						</DialogTitle>
						<DialogDescription>
							Send a summary of this report to any email address.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3 py-2">
						<div className="space-y-1.5">
							<Label>Recipient email</Label>
							<Input
								type="email"
								placeholder="team@example.com"
								value={emailTo}
								onChange={(e) => setEmailTo(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSendReport()}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
						<Button onClick={handleSendReport} disabled={!emailTo.trim() || emailMut.isPending}>
							<Mail size={14} className="mr-1.5" />
							{emailMut.isPending ? "Sending..." : "Send Report"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
