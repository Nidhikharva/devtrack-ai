import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderGit2, ListChecks, GraduationCap, Flame, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { useGoals, useProjects, useTasks, TASK_STATUS_LABEL } from "@/lib/devtrack";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — DevTrack AI" },
      { name: "description", content: "Your coding stats, projects, tasks and learning at a glance." },
      { property: "og:title", content: "Dashboard — DevTrack AI" },
      { property: "og:description", content: "Coding stats, projects, tasks and learning at a glance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const projects = useProjects();
  const tasks = useTasks();
  const goals = useGoals();

  const allTasks = tasks.data ?? [];
  const done = allTasks.filter((t) => t.status === "done").length;
  const active = allTasks.filter((t) => t.status !== "done").length;
  const allGoals = goals.data ?? [];
  const avgProgress = allGoals.length
    ? Math.round(allGoals.reduce((sum, g) => sum + g.progress, 0) / allGoals.length)
    : 0;
  const techCount = new Set((projects.data ?? []).flatMap((p) => p.tech_stack)).size;

  return (
    <AppShell title="Dashboard" description="A live snapshot of everything you're building.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderGit2}
          label="Total projects"
          value={projects.data?.length ?? 0}
          hint={`${techCount} technologies in play`}
        />
        <StatCard
          icon={ListChecks}
          label="Completed tasks"
          value={done}
          hint={`${active} still open`}
        />
        <StatCard
          icon={GraduationCap}
          label="Learning progress"
          value={`${avgProgress}%`}
          hint={`${allGoals.length} topics tracked`}
        />
        <StatCard
          icon={Flame}
          label="Completion rate"
          value={`${allTasks.length ? Math.round((done / allTasks.length) * 100) : 0}%`}
          hint={`${allTasks.length} tasks total`}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent projects</h2>
            <Link to="/projects" className="text-sm text-primary hover:underline">
              Manage <ArrowUpRight className="inline size-3.5" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(projects.data ?? []).slice(0, 4).map((p) => (
              <div key={p.id} className="rounded-2xl bg-secondary/50 p-4">
                <p className="font-semibold">{p.title}</p>
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {p.description || "No description"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.tech_stack.slice(0, 4).map((t) => (
                    <Badge key={t} variant="secondary" className="font-mono text-[11px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {!projects.isLoading && (projects.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">
                No projects yet — add your first one in the Projects tab.
              </p>
            )}
          </div>
        </section>

        <section className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Learning goals</h2>
            <Link to="/learning" className="text-sm text-primary hover:underline">
              Track <ArrowUpRight className="inline size-3.5" />
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {allGoals.slice(0, 5).map((g) => (
              <div key={g.id}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium">{g.topic}</span>
                  <span className="font-mono text-primary">{g.progress}%</span>
                </div>
                <Progress value={g.progress} />
              </div>
            ))}
            {!goals.isLoading && allGoals.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add a technology you're learning to see progress here.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="glass mt-5 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upcoming tasks</h2>
          <Link to="/tasks" className="text-sm text-primary hover:underline">
            Open board <ArrowUpRight className="inline size-3.5" />
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allTasks
            .filter((t) => t.status !== "done")
            .slice(0, 6)
            .map((t) => (
              <div key={t.id} className="rounded-2xl bg-secondary/50 p-4">
                <p className="font-medium">{t.task_name}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="outline">{TASK_STATUS_LABEL[t.status] ?? t.status}</Badge>
                  <span className="font-mono">{t.deadline ?? "no deadline"}</span>
                </div>
              </div>
            ))}
          {!tasks.isLoading && active === 0 && (
            <p className="text-sm text-muted-foreground">Nothing open. Beautifully done.</p>
          )}
        </div>
      </section>
    </AppShell>
  );
}
