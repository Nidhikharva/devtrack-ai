import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Minus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { useGoalMutations, useGoals } from "@/lib/devtrack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/_authenticated/learning")({
  head: () => ({
    meta: [
      { title: "Learning Tracker — DevTrack AI" },
      { name: "description", content: "Track the technologies you're learning and your progress." },
      { property: "og:title", content: "Learning Tracker — DevTrack AI" },
      { property: "og:description", content: "Track the technologies you're learning and your progress." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LearningPage,
});

const schema = z.object({ topic: z.string().trim().min(1, "Topic is required").max(80) });

function LearningPage() {
  const { data, isLoading } = useGoals();
  const { create, update, remove } = useGoalMutations();
  const [topic, setTopic] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ topic });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    try {
      await create.mutateAsync({ topic: parsed.data.topic, progress: 0 });
      setTopic("");
      toast.success("Topic added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add topic");
    }
  }

  function bump(id: string, current: number, delta: number) {
    const next = Math.min(100, Math.max(0, current + delta));
    update.mutate({ id, progress: next });
  }

  const goals = data ?? [];

  return (
    <AppShell title="Learning tracker" description="Add a technology, then nudge the percentage as you level up.">
      <form onSubmit={add} className="glass mb-6 flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="topic">Technology or topic</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Rust, System design, GraphQL…"
            maxLength={80}
            required
          />
        </div>
        <Button type="submit" className="rounded-full glow" disabled={create.isPending}>
          <Plus className="size-4" /> Add topic
        </Button>
      </form>

      {isLoading && <p className="text-sm text-muted-foreground">Loading topics…</p>}

      <div className="grid gap-5 md:grid-cols-2">
        {goals.map((g) => (
          <article key={g.id} className="glass animate-rise rounded-3xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{g.topic}</h2>
                <p className="font-mono text-sm text-primary">{g.progress}% mastered</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                aria-label="Delete topic"
                onClick={() => remove.mutate(g.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            <Progress value={g.progress} className="mt-4" />
            <div className="mt-5 flex items-center gap-3">
              <Button size="icon" variant="outline" aria-label="Decrease" onClick={() => bump(g.id, g.progress, -5)}>
                <Minus className="size-4" />
              </Button>
              <Slider
                value={[g.progress]}
                max={100}
                step={5}
                onValueCommit={(v) => update.mutate({ id: g.id, progress: v[0] })}
                className="flex-1"
              />
              <Button size="icon" variant="outline" aria-label="Increase" onClick={() => bump(g.id, g.progress, 5)}>
                <Plus className="size-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>

      {!isLoading && goals.length === 0 && (
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-muted-foreground">Nothing tracked yet. Add the tech you're studying.</p>
        </div>
      )}
    </AppShell>
  );
}
