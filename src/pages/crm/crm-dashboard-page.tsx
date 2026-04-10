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
import {
  useCrmDashboard,
  useCrmDeals,
  useCrmTasks,
  useCrmStages,
  type ApiDeal,
  type ApiTask,
  type ApiStage,
} from "@/api/crm";
import {
  PRIORITY_CONFIG,
  formatCurrency,
  type TaskPriority,
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
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isThisWeek(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CrmDashboardPage() {
  const { data: dashData, isLoading: dashLoading } = useCrmDashboard();
  const { data: dealsData, isLoading: dealsLoading } = useCrmDeals();
  const { data: tasksData, isLoading: tasksLoading } = useCrmTasks();
  const { data: stagesData } = useCrmStages();

  const dashboard = dashData?.dashboard;
  const deals = dealsData?.deals ?? [];
  const tasks = tasksData?.tasks ?? [];
  const stages = stagesData?.stages ?? [];

  const stageMap = useMemo(() => {
    const m: Record<string, ApiStage> = {};
    for (const s of stages) m[s.stage_key] = s;
    return m;
  }, [stages]);

  const isLoading = dashLoading || dealsLoading || tasksLoading;

  // --- Derived data ---
  const overdueTasks = useMemo(
    () => tasks.filter((t) => t.status !== "done" && isOverdue(t.due_date)),
    [tasks],
  );

  const tasksThisWeek = useMemo(
    () => tasks.filter((t) => t.status !== "done" && isThisWeek(t.due_date)),
    [tasks],
  );

  const overdueDeals = useMemo(
    () =>
      deals.filter(
        (d) =>
          d.stage !== "closed" &&
          d.stage !== "published" &&
          isOverdue(d.next_action_date),
      ),
    [deals],
  );

  // --- Pipeline value chart data (by stage) ---
  const pipelineChartData = useMemo(
    () =>
      (dashboard?.deal_count_by_stage ?? [])
        .filter((s) => s.stage !== "closed")
        .map((s) => ({
          name: stageMap[s.stage]?.label ?? s.stage,
          value: s.value,
        })),
    [dashboard, stageMap],
  );

  // --- Deal distribution pie data ---
  const pieData = useMemo(
    () =>
      (dashboard?.deal_count_by_stage ?? [])
        .filter((s) => s.count > 0)
        .map((s) => ({
          name: stageMap[s.stage]?.label ?? s.stage,
          value: s.count,
          color: stageMap[s.stage]?.color ?? "220 14% 46%",
        })),
    [dashboard, stageMap],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

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
          value={formatCurrency(dashboard?.total_pipeline_value ?? 0)}
          subtitle={`${dashboard?.active_deals_count ?? 0} active deals`}
          icon={<DollarSign className="w-4 h-4" />}
        />
        <KpiCard
          title="Contacts"
          value={String(dashboard?.total_contacts ?? 0)}
          subtitle="total contacts"
          icon={<Users className="w-4 h-4" />}
        />
        <KpiCard
          title="Tasks"
          value={`${dashboard?.total_tasks ?? 0}`}
          subtitle={`${dashboard?.overdue_tasks ?? 0} overdue`}
          icon={<CheckSquare className="w-4 h-4" />}
          alert={(dashboard?.overdue_tasks ?? 0) > 0}
        />
        <KpiCard
          title="Won Revenue"
          value={formatCurrency(dashboard?.won_revenue ?? 0)}
          subtitle="closed/won"
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

      {/* Bottom row: tasks + overdue deals */}
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
                      {deal.client_name}
                    </span>
                    <span className="text-xs text-orange-600">
                      Due{" "}
                      {deal.next_action_date
                        ? new Date(deal.next_action_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Quick Stats</CardTitle>
                <CardDescription>At-a-glance metrics</CardDescription>
              </div>
              <Link
                to="/my/crm/pipeline"
                className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                Pipeline <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center py-4">
              <QuickStat
                label="Active Deals"
                value={dashboard?.active_deals_count ?? 0}
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <QuickStat
                label="Open Tasks"
                value={dashboard?.open_tasks ?? 0}
                icon={<CheckSquare className="w-4 h-4" />}
              />
              <QuickStat
                label="Tasks This Week"
                value={dashboard?.tasks_due_this_week ?? 0}
                icon={<CalendarCheck className="w-4 h-4" />}
              />
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

function TaskRow({ task, deals }: { task: ApiTask; deals: ApiDeal[] }) {
  const linkedDeal = task.linked_deal_id
    ? deals.find((d) => d.id === task.linked_deal_id)
    : undefined;
  const priorityCfg = PRIORITY_CONFIG[task.priority as TaskPriority];
  const overdue = isOverdue(task.due_date);

  return (
    <div className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-[var(--muted)]/50 transition-colors">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--foreground)] truncate">
            {task.title}
          </span>
          {priorityCfg && (
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityCfg.className}`}>
              {priorityCfg.label}
            </Badge>
          )}
        </div>
        {linkedDeal && (
          <span className="text-xs text-[var(--muted-foreground)]">
            {linkedDeal.client_company}
          </span>
        )}
      </div>
      <span className={`text-xs shrink-0 ml-3 ${overdue ? "text-red-500 font-medium" : "text-[var(--muted-foreground)]"}`}>
        {task.due_date
          ? new Date(task.due_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "No date"}
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
