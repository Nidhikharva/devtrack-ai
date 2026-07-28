import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { TASK_STATUSES, TASK_STATUS_LABEL, useTaskMutations, useTasks } from "@/lib/devtrack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — DevTrack AI" },
      { name: "description", content: "Create tasks, move their status and hit your deadlines." },
      { property: "og:title", content: "Tasks — DevTrack AI" },
      { property: "og:description", content: "Create tasks, move their status and hit your deadlines." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TasksPage,
});

const schema = z.object({
  task_name: z.string().trim().min(1, "Task name is required").max(160),
  deadline: z.string().max(20),
});

function TasksPage() {
  const { data, isLoading } = useTasks();
  const { create, update, remove } = useTaskMutations();
  const [taskName, setTaskName] = useState("");
  const [deadline, setDeadline] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ task_name: taskName, deadline });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    try {
      await create.mutateAsync({
        task_name: parsed.data.task_name,
        deadline: parsed.data.deadline || null,
        status: "todo",
      });
      setTaskName("");
      setDeadline("");
      toast.success("Task created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create task");
    }
  }

  const tasks = data ?? [];

  return (
    <AppShell title="Tasks" description="A lightweight board for the work that matters this week.">
      <form onSubmit={add} className="glass mb-6 grid gap-4 rounded-3xl p-6 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="task_name">Task</Label>
          <Input
            id="task_name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Refactor auth middleware"
            maxLength={160}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <Button type="submit" className="rounded-full glow" disabled={create.isPending}>
          <Plus className="size-4" /> Add task
        </Button>
      </form>

      <div className="grid gap-5 lg:grid-cols-3">
        {TASK_STATUSES.map((status) => {
          const column = tasks.filter((t) => t.status === status);
          return (
            <section key={status} className="glass animate-rise rounded-3xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">{TASK_STATUS_LABEL[status]}</h2>
                <Badge variant="secondary">{column.length}</Badge>
              </div>
              <div className="space-y-3">
                {column.map((t) => (
                  <div key={t.id} className="rounded-2xl bg-secondary/50 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{t.task_name}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        aria-label="Delete task"
                        onClick={() => remove.mutate(t.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {t.deadline ? `due ${t.deadline}` : "no deadline"}
                    </p>
                    <Select
                      value={t.status}
                      onValueChange={(value) => update.mutate({ id: t.id, status: value })}
                    >
                      <SelectTrigger className="mt-3 w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {TASK_STATUS_LABEL[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                {column.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nothing here.</p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading tasks…</p>}
    </AppShell>
  );
}
