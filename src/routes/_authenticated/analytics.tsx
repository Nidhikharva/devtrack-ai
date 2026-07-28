import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { TASK_STATUSES, TASK_STATUS_LABEL, useGoals, useTasks } from "@/lib/devtrack";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — DevTrack AI" },
      { name: "description", content: "Charts for task completion and learning progress over time." },
      { property: "og:title", content: "Analytics — DevTrack AI" },
      { property: "og:description", content: "Charts for task completion and learning progress." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalyticsPage,
});

const PIE_COLORS = ["var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function AnalyticsPage() {
  const tasks = useTasks().data ?? [];
  const goals = useGoals().data ?? [];

  const statusData = TASK_STATUSES.map((s) => ({
    name: TASK_STATUS_LABEL[s],
    value: tasks.filter((t) => t.status === s).length,
  }));

  const goalData = goals.map((g) => ({ name: g.topic, progress: g.progress }));

  return (
    <AppShell title="Analytics" description="Momentum, made visible.">
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="glass rounded-3xl p-6">
          <h2 className="text-lg font-semibold">Tasks by status</h2>
          <div className="mt-6 h-72">
            {tasks.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--popover-foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Add tasks to see this chart.</p>
            )}
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm">
            {statusData.map((d, i) => (
              <span key={d.name} className="inline-flex items-center gap-2 text-muted-foreground">
                <span className="size-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </section>

        <section className="glass rounded-3xl p-6">
          <h2 className="text-lg font-semibold">Learning progress</h2>
          <div className="mt-6 h-72">
            {goalData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "var(--secondary)" }}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar dataKey="progress" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Add learning topics to see this chart.</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
