import { useState, useEffect } from "react";
import { useGoogleAdsInsights } from "@/api/google-ads-insights";
import { GoogleAdsPerformanceChart } from "./google-ads-performance-chart";
import { GoogleAdsDataTable } from "./google-ads-data-table";
import { GoogleAdsAiInsights } from "./google-ads-ai-insights";
import { GoogleAdsDeviceBreakdown } from "./google-ads-device-breakdown";
import { GoogleAdsTopInsights } from "./google-ads-top-insights";
import { GoogleAdsPatternsCard } from "./google-ads-patterns";
import { GoogleAdsVerdictPills } from "./google-ads-verdict-pills";
import { OverviewKeywordsTable, OverviewAdGroupsTable } from "./google-ads-overview-sections";
import type { GoogleAdsRow, GoogleAdsVerdict } from "./google-ads-types";
import type { GoogleAdsResponse } from "./google-ads-types";

interface Props {
	data: GoogleAdsResponse;
	currency: string;
	insights: GoogleAdsVerdict[];
	isLoading: boolean;
	customerId: string;
	dateRange: { start: string; end: string };
	onTriageChange: (id: string, level: string, decision: string) => void;
	onAiChipClick: (q: string) => void;
	onQuickAction: (a: string) => void;
	onShowVerdicts: () => void;
	onPatternsAnalyze: () => void;
}

export function GoogleAdsOverviewLayout({
	data, currency, insights, isLoading, customerId, dateRange,
	onTriageChange, onAiChipClick, onQuickAction, onShowVerdicts, onPatternsAnalyze,
}: Props) {
	const [demoRows, setDemoRows] = useState<GoogleAdsRow[]>([]);
	const [hoursRows, setHoursRows] = useState<GoogleAdsRow[]>([]);
	const [regionsRows, setRegionsRows] = useState<GoogleAdsRow[]>([]);
	const [devicesRows, setDevicesRows] = useState<GoogleAdsRow[]>([]);

	return (
		<div className="space-y-5">
			<GoogleAdsTopInsights demographicsRows={demoRows} hoursRows={hoursRows} regionsRows={regionsRows} />
			<GoogleAdsVerdictPills verdicts={insights} onView={onShowVerdicts} />

			<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
				<div className="space-y-5">
					<GoogleAdsPerformanceChart timeseries={data.timeseries} timeseriesPrev={data.timeseries_prev} currency={currency} />
					{data.rows.length > 0 && (
						<GoogleAdsDataTable rows={data.rows} tab="campaigns" currency={currency} onTriageChange={onTriageChange} />
					)}
					{devicesRows.length > 0 && <GoogleAdsDeviceBreakdown rows={devicesRows} currency={currency} />}
					{data.adgroups_overview && data.adgroups_overview.length > 0 && (
						<OverviewAdGroupsTable rows={data.adgroups_overview} currency={currency} />
					)}
					{data.keywords && data.keywords.length > 0 && (
						<OverviewKeywordsTable rows={data.keywords} currency={currency} />
					)}
					<GoogleAdsPatternsCard onAnalyze={onPatternsAnalyze} />
				</div>
				<GoogleAdsAiInsights insights={insights} isLoading={isLoading} onAiChipClick={onAiChipClick} onQuickAction={onQuickAction} onShowVerdicts={onShowVerdicts} />
			</div>

			<LazyOverviewFetches
				customerId={customerId}
				dateRange={dateRange}
				onDemographics={setDemoRows}
				onHours={setHoursRows}
				onRegions={setRegionsRows}
				onDevices={setDevicesRows}
			/>
		</div>
	);
}

interface LazyProps {
	customerId: string;
	dateRange: { start: string; end: string };
	onDemographics: (r: GoogleAdsRow[]) => void;
	onHours: (r: GoogleAdsRow[]) => void;
	onRegions: (r: GoogleAdsRow[]) => void;
	onDevices: (r: GoogleAdsRow[]) => void;
}

function LazyOverviewFetches({ customerId, dateRange, onDemographics, onHours, onRegions, onDevices }: LazyProps) {
	const [enabled, setEnabled] = useState(false);
	useEffect(() => {
		const t = setTimeout(() => setEnabled(true), 1500);
		return () => clearTimeout(t);
	}, [customerId, dateRange.start, dateRange.end]);

	const base = { start: dateRange.start, end: dateRange.end, ...(customerId ? { customer_id: customerId } : {}) } as const;
	const demo = useGoogleAdsInsights({ tab: "demographics", ...base }, enabled);
	const hrs = useGoogleAdsInsights({ tab: "hours", ...base }, enabled);
	const regions = useGoogleAdsInsights({ tab: "regions", ...base }, enabled);
	const devices = useGoogleAdsInsights({ tab: "devices", ...base }, enabled);

	useEffect(() => { if (demo.data?.rows) onDemographics(demo.data.rows); }, [demo.data?.rows, onDemographics]);
	useEffect(() => { if (hrs.data?.rows) onHours(hrs.data.rows); }, [hrs.data?.rows, onHours]);
	useEffect(() => { if (regions.data?.rows) onRegions(regions.data.rows); }, [regions.data?.rows, onRegions]);
	useEffect(() => { if (devices.data?.rows) onDevices(devices.data.rows); }, [devices.data?.rows, onDevices]);

	return null;
}
