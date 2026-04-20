import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/crm-data";
import type { ApiDashboardCrm } from "@/api/crm";

/**
 * Extra CRM dashboard insights rendered below the primary charts row:
 * - New leads line chart
 * - Won revenue bar chart
 * - Contact status horizontal bar
 * - Top lead sources (tags)
 *
 * Kept in a separate file so crm-dashboard-page.tsx stays under the 500-line rule.
 */
export function CrmDashboardInsights({ dashboard }: { dashboard?: ApiDashboardCrm }) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">New Leads</CardTitle>
            <CardDescription>Contacts created in the selected range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              {(dashboard?.leads_trend?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboard?.leads_trend ?? []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
                      tickFormatter={(d: string) => { try { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth()+1}`; } catch { return d; } }} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip cursor={false} contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }} />
                    <Line type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--muted-foreground)]">No leads in this range</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Won Revenue Trend</CardTitle>
            <CardDescription>Monthly won deals value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              {(dashboard?.revenue_trend?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboard?.revenue_trend ?? []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false}
                      tickFormatter={(v: number) => formatCurrency(v)} />
                    <Tooltip cursor={false} formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                      contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }} />
                    <Bar dataKey="value" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--muted-foreground)]">No won deals in this range</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Contact Status</CardTitle>
            <CardDescription>Breakdown of your contact pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              {(dashboard?.status_funnel?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboard?.status_funnel ?? []} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="status" width={90}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={false} contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }} />
                    <Bar dataKey="count" fill="var(--primary)" radius={[0, 3, 3, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--muted-foreground)]">No contacts yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {(dashboard?.top_tags?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Lead Sources</CardTitle>
            <CardDescription>Most common tags on your contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(dashboard?.top_tags ?? []).map((t) => (
                <span key={t.tag} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--muted)]/50 border border-[var(--border)] px-3 py-1 text-xs">
                  <span className="text-[var(--muted-foreground)]">{t.tag}</span>
                  <span className="font-semibold text-[var(--foreground)]">{t.count}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
