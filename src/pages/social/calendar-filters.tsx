import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarFiltersProps {
	search: string;
	onSearchChange: (val: string) => void;
	statusFilter: string;
	onStatusFilterChange: (val: string) => void;
	platformFilter: string;
	onPlatformFilterChange: (val: string) => void;
}

const STATUSES = [
	{ value: "", label: "All statuses" },
	{ value: "draft", label: "Draft" },
	{ value: "scheduled", label: "Scheduled" },
	{ value: "published", label: "Published" },
	{ value: "processing", label: "Processing" },
	{ value: "failed", label: "Failed" },
];

const PLATFORMS = [
	{ value: "", label: "All platforms" },
	{ value: "facebook", label: "Facebook" },
	{ value: "instagram", label: "Instagram" },
	{ value: "twitter", label: "X (Twitter)" },
	{ value: "linkedin", label: "LinkedIn" },
	{ value: "tiktok", label: "TikTok" },
	{ value: "youtube", label: "YouTube" },
	{ value: "pinterest", label: "Pinterest" },
	{ value: "threads", label: "Threads" },
	{ value: "bluesky", label: "Bluesky" },
	{ value: "reddit", label: "Reddit" },
];

export function CalendarFilters({ search, onSearchChange, statusFilter, onStatusFilterChange, platformFilter, onPlatformFilterChange }: CalendarFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<div className="relative flex-1 min-w-[200px]">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
				<Input placeholder="Search posts..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 h-8 text-xs" />
			</div>
			<Select value={statusFilter || "all"} onValueChange={(v) => onStatusFilterChange(v === "all" ? "" : v)}>
				<SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
				<SelectContent>
					{STATUSES.map((s) => <SelectItem key={s.value || "all"} value={s.value || "all"}>{s.label}</SelectItem>)}
				</SelectContent>
			</Select>
			<Select value={platformFilter || "all"} onValueChange={(v) => onPlatformFilterChange(v === "all" ? "" : v)}>
				<SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
				<SelectContent>
					{PLATFORMS.map((p) => <SelectItem key={p.value || "all"} value={p.value || "all"}>{p.label}</SelectItem>)}
				</SelectContent>
			</Select>
		</div>
	);
}
