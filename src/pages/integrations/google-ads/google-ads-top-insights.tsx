import { User, Users as UsersIcon, MapPin, Clock } from "lucide-react";
import type { GoogleAdsRow } from "./google-ads-types";

interface Props {
	demographicsRows?: GoogleAdsRow[];
	hoursRows?: GoogleAdsRow[];
	regionsRows?: GoogleAdsRow[];
}

function topByConversions(rows: GoogleAdsRow[] | undefined): GoogleAdsRow | null {
	if (!rows?.length) return null;
	return rows.reduce((best, r) => (r.conversions > (best?.conversions ?? 0) ? r : best), rows[0]!);
}

function topBySpend(rows: GoogleAdsRow[] | undefined): GoogleAdsRow | null {
	if (!rows?.length) return null;
	return rows.reduce((best, r) => (r.spend > (best?.spend ?? 0) ? r : best), rows[0]!);
}

function formatHour(h: string): string {
	const n = parseInt(h, 10);
	if (isNaN(n)) return h;
	return `${String(n).padStart(2, "0")}:00 – ${String(n + 1).padStart(2, "0")}:00`;
}

export function GoogleAdsTopInsights({ demographicsRows, hoursRows, regionsRows }: Props) {
	const ageRow = topByConversions((demographicsRows || []).filter((r) => r.dimension === "age"));
	const genderRow = topByConversions((demographicsRows || []).filter((r) => r.dimension === "gender"));
	const hourRow = topBySpend(hoursRows);
	const regionRow = topByConversions(regionsRows);

	const cards = [
		ageRow && { icon: User, color: "text-pink-600", bg: "bg-pink-50", label: "Top Age", value: ageRow.age_range || ageRow.key, sub: `${ageRow.conversions} conversions` },
		genderRow && { icon: UsersIcon, color: "text-indigo-600", bg: "bg-indigo-50", label: "Top Gender", value: genderRow.gender || genderRow.key, sub: `${genderRow.conversions} conversions` },
		regionRow && { icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50", label: "Top Region", value: regionRow.key || "—", sub: `${regionRow.conversions} conversions` },
		hourRow && { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Best Hour", value: formatHour(hourRow.key), sub: `Spend peak` },
	].filter((c): c is Exclude<typeof c, false | null | undefined> => Boolean(c));

	if (!cards.length) return null;

	return (
		<div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
			{cards.map((c, i) => {
				const Icon = c.icon;
				return (
					<div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
						<div className="flex items-center gap-3">
							<div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.bg}`}>
								<Icon size={16} className={c.color} />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-[10px] font-medium tracking-wider text-[var(--muted-foreground)] uppercase">{c.label}</p>
								<p className="text-sm font-bold text-[var(--foreground)] truncate">{c.value}</p>
								<p className="text-[10px] text-[var(--muted-foreground)] truncate">{c.sub}</p>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
