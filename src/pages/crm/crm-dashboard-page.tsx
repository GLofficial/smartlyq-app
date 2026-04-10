import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useCrmStore } from "@/stores/crm-store";
import {
  STAGE_CONFIG,
  STAGE_ORDER,
  PRIORITY_CONFIG,
  formatCurrency,
  type Deal,
  type CrmTask,
} from "@/lib/crm-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CalendarCheck,
  Users,
  CheckSquare,
  BarChart3,
  ArrowRight,
  Clock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function relativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CrmDashboardPage() {
  const deals = useCrmStore((s) => s.deals);
  const tasks = useCrmStore((s) => s.tasks);
  const contacts = useCrmStore((s) => s.contacts);

  // --- KPI data ---
  const totalPipelineValue = useMemo(
    () => deals.reduce((sum, d) => sum + d.value, 0),
    [deals],
  );

  const activeDeals = useMemo(
    () => deals.filter((d) => d.stage !== "closed" && d.stage !== "published"),
    [deals],
  );

  const overdueDeals = useMemo(
    () => activeDeals.filter((d) => isOverdue(d.nextActionDate)),
    [activeDeals],
  );

  const overdueTasks = useMemo(
    () => tasks.filter((t) => t.status !== "done" && isOverdue(t.dueDate)),
    [tasks],
  );

  const tasksThisWeek = useMemo(
    () => tasks.filter((t) => t.status !== "done" && isThisWeek(t.dueDate)),
    [tasks],
  );

  const completedTasks = useMemo(
    () => tasks.filter((t) => t.status === "done"),
    [tasks],
  );

  // --- Pipeline value chart data (by stage) ---
  const pipelineChartData = useMemo(
    () =>
      STAGE_ORDER.filter((s) => s !== "closed").map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage);
        return {
          name: STAGE_CONFIG[stage]?.label ?? stage,
          value: stageDeals.reduce((sum, d) => sum + d.value, 0),
        };
      }),
    [deals],
  );

  // --- Deal distribution pie data ---
  const pieData = useMemo(
    () =>
      STAGE_ORDER.map((stage) => {
        const count = deals.filter((d) => d.stage === stage).length;
        return {
          name: STAGE_CONFIG[stage]?.label ?? stage,
          value: count,
          color: STAGE_CONFIG[stage]?.color ?? "220 14% 46%",
        };
      }).filter((d) => d.value > 0),
    [deals],
  );

  // --- Recent activity (communication history, newest first) ---
  const recentActivity = useMemo(() => {
    const items: { deal: Deal; date: string; message: string; from: string }[] = [];
    for (const deal of deals) {
      for (const entry of deal.communicationHistory) {
        items.push({ deal, ...entry });
      }
    }
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items.slice(0, 8);
  }, [deals]);

  // --- Quick stats ---
  const totalContentItems = useMemo(
    () =>
      deals.reduce((sum, d) => sum + (d.project?.items.length ?? 0), 0),
    [deals],
  );

  const approvedItems = useMemo(
    () =>
      deals.reduce(
        (sum, d) =>
          sum +
          (d.project?.items.filter(
            (i) => i.status === "approved" || i.status === "published",
          ).length ?? 0),
        0,
      ),
    [deals],
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Overview of your deal flow and task progress.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Pipeline Value"
          value={formatCurrency(totalPipelineValue)}
          subtitle={`${activeDeals.length} active deals`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          title="Contacts"
          value={String(contacts.length)}
          subtitle={`${contacts.filter((c) => c.status === "active").length} active`}
          icon={<Users className="w-4 h-4" />}
        />
        <KpiCard
          title="Tasks Completed"
          value={`${completedTasks.length}/${tasks.length}`}
          subtitle={`${overdueTasks.length} overdue`}
          icon={<CheckSquare className="w-4 h-4" />}
          alert={overdueTasks.length > 0}
        />
        <KpiCard
          title="Content Items"
          value={`${approvedItems}/${totalContentItems}`}
          subtitle="approved / total"
          icon={<BarChart3 className="w-4 h-4" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pipeline value area chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pipeline Value by Stage</CardTitle>
            <CardDescription>Revenue distribution across your pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pipelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Value"]}
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Deal distribution pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Deal Distribution</CardTitle>
            <CardDescription>Deals by stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={`hsl(${entry.color})`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} deal${value !== 1 ? "s" : ""}`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(${entry.color})` }}
                  />
                  <span className="text-[var(--muted-foreground)] truncate">{entry.name}</span>
                  <span className="font-medium text-[var(--foreground)] ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: tasks + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tasks this week */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Tasks This Week</CardTitle>
                <CardDescription>
                  {tasksThisWeek.length} task{tasksThisWeek.length !== 1 ? "s" : ""} due
                </CardDescription>
              </div>
              <Link
                to="/my/crm/tasks"
                className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksThisWeek.length === 0 && (
              <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">
                No tasks due this week.
              </p>
            )}
            {tasksThisWeek.map((task) => (
              <TaskRow key={task.id} task={task} deals={deals} />
            ))}

            {/* Overdue section */}
            {overdueDeals.length > 0 && (
              <>
                <Separator className="my-3" />
                <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Overdue deal actions
                </div>
                {overdueDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-md bg-orange-50 text-sm"
                  >
                    <span className="font-medium text-[var(--foreground)]">
                      {deal.clientName}
                    </span>
                    <span className="text-xs text-orange-600">
                      Due{" "}
                      {new Date(deal.nextActionDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription>Latest communication across deals</CardDescription>
              </div>
              <Link
                to="/my/crm/pipeline"
                className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                Pipeline <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((entry, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <span className="font-medium text-[var(--foreground)]">{entry.from}</span>
                    <span>&middot;</span>
                    <span>{relativeDate(entry.date)}</span>
                    <span>&middot;</span>
                    <span className="truncate">{entry.deal.clientCompany}</span>
                  </div>
                  <p className="text-sm text-[var(--foreground)] mt-0.5 line-clamp-2">
                    {entry.message}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick stats bar */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <QuickStat label="Active Deals" value={activeDeals.length} icon={<TrendingUp className="w-4 h-4" />} />
            <QuickStat
              label="Avg Deal Value"
              value={formatCurrency(Math.round(totalPipelineValue / Math.max(activeDeals.length, 1)))}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <QuickStat label="Tasks This Week" value={tasksThisWeek.length} icon={<CalendarCheck className="w-4 h-4" />} />
            <QuickStat
              label="Overdue Items"
              value={overdueTasks.length + overdueDeals.length}
              icon={<AlertTriangle className="w-4 h-4" />}
              alert={overdueTasks.length + overdueDeals.length > 0}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KpiCard({ title, value, subtitle, icon, alert = false }: {
  title: string; value: string; subtitle: string; icon: React.ReactNode; alert?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">{title}</span>
          <div className={alert ? "text-orange-500" : "text-[var(--muted-foreground)]"}>{icon}</div>
        </div>
        <div className="text-2xl font-bold text-[var(--foreground)]">{value}</div>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function TaskRow({ task, deals }: { task: CrmTask; deals: Deal[] }) {
  const linkedDeal = task.linkedDealId ? deals.find((d) => d.id === task.linkedDealId) : undefined;
  const priorityCfg = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.dueDate);

  return (
    <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-[var(--muted)]/50 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--foreground)] truncate">
            {task.title}
          </span>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityCfg.className}`}>
            {priorityCfg.label}
          </Badge>
        </div>
        {linkedDeal && (
          <span className="text-xs text-[var(--muted-foreground)]">
            {linkedDeal.clientCompany}
          </span>
        )}
      </div>
      <span className={`text-xs shrink-0 ml-3 ${overdue ? "text-red-500 font-medium" : "text-[var(--muted-foreground)]"}`}>
        {new Date(task.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
  );
}

function QuickStat({ label, value, icon, alert = false }: {
  label: string; value: string | number; icon: React.ReactNode; alert?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={alert ? "text-orange-500" : "text-[var(--muted-foreground)]"}>{icon}</div>
      <span className="text-lg font-bold text-[var(--foreground)]">{value}</span>
      <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
    </div>
  );
}
