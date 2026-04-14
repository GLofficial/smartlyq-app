import { useState } from "react";
import { ReportsSidebar } from "./reports/reports-sidebar";
import { SummaryTab } from "./reports/summary-tab";
import { AudienceTab } from "./reports/audience-tab";
import { PostsTab } from "./reports/posts-tab";
import type { ReportFilters } from "@/api/social-reports";

const TABS = ["Summary", "Audience", "Posts & Engagement"] as const;

const defaultFrom = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
const defaultTo = new Date().toISOString().slice(0, 10);

export function AnalyticsPage() {
	const [tab, setTab] = useState<string>("Summary");
	const [filters, setFilters] = useState<ReportFilters>({
		dateFrom: defaultFrom, dateTo: defaultTo, accountId: null, platform: "",
	});

	const updateFilters = (partial: Partial<ReportFilters>) => {
		setFilters((prev) => ({ ...prev, ...partial }));
	};

	const daysDiff = Math.max(1, Math.ceil((new Date(filters.dateTo).getTime() - new Date(filters.dateFrom).getTime()) / 86400000));

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
					<span className="text-sm text-[var(--muted-foreground)]">Last {daysDiff} days</span>
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
		</div>
	);
}
