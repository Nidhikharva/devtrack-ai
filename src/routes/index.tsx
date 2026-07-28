import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Terminal,
  FolderGit2,
  ListChecks,
  GraduationCap,
  BarChart3,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DevTrack AI — Track Projects, Tasks & Learning" },
      {
        name: "description",
        content:
          "A dark, glassmorphic developer dashboard to track projects, ship tasks and level up your learning goals.",
      },
      { property: "og:title", content: "DevTrack AI — Developer Productivity Dashboard" },
      {
        property: "og:description",
        content: "Track coding projects, tasks and learning goals in one focused dashboard.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: FolderGit2,
    title: "Project manager",
    body: "Catalogue every repo with its stack, description and GitHub link. Edit or archive in a click.",
  },
  {
    icon: ListChecks,
    title: "Task board",
    body: "Create tasks, move them from todo to shipped, and keep deadlines honest.",
  },
  {
    icon: GraduationCap,
    title: "Learning tracker",
    body: "Add the technologies you're studying and nudge the percentage as you master them.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    body: "Charts for task throughput and learning progress so momentum is visible.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Row level security means your data is scoped to your account. Always.",
  },
  {
    icon: Sparkles,
    title: "Portfolio-grade UI",
    body: "Glass surfaces, deep space palette and a layout that works on any screen.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
            <Terminal className="size-5" />
          </span>
          <span className="font-display text-lg font-bold">DevTrack AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/auth" search={{ mode: "signup" }}>
              Get started
            </Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" /> Your developer command center
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] sm:text-6xl">
              Ship more. <span className="text-gradient">Forget less.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              DevTrack AI keeps your side projects, task list and learning goals in one dark,
              distraction-free dashboard — with charts that prove you're moving.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full glow">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start tracking free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/auth">I already have an account</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-4">
              {[
                ["3", "Trackers"],
                ["100%", "Private"],
                ["0", "Setup steps"],
              ].map(([value, label]) => (
                <div key={label} className="glass rounded-2xl p-4">
                  <dt className="font-display text-2xl font-bold text-primary">{value}</dt>
                  <dd className="text-xs text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-float">
            <div className="glass rounded-3xl p-5">
              <div className="mb-4 flex gap-1.5">
                <span className="size-3 rounded-full bg-destructive/70" />
                <span className="size-3 rounded-full bg-warning/70" />
                <span className="size-3 rounded-full bg-success/70" />
              </div>
              <div className="space-y-3 font-mono text-xs">
                {[
                  ["portfolio-v3", "React · TS · Tailwind", 82],
                  ["rust-cli-tool", "Rust · Clap", 46],
                  ["ml-notebook", "Python · Torch", 61],
                ].map(([name, stack, pct]) => (
                  <div key={name as string} className="rounded-2xl bg-secondary/60 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{name}</span>
                      <span className="text-primary">{pct}%</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{stack}</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-3xl font-bold sm:text-4xl">Everything a builder needs</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Six focused surfaces instead of a dozen scattered tools.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="glass rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/12 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="glass-strong relative overflow-hidden rounded-[2rem] px-8 py-14 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Your next commit deserves a <span className="text-gradient">better dashboard</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Create an account and start tracking projects, tasks and learning in under a minute.
          </p>
          <Button asChild size="lg" className="mt-8 rounded-full glow">
            <Link to="/auth" search={{ mode: "signup" }}>
              Create your dashboard <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} DevTrack AI</span>
          <span className="inline-flex items-center gap-2">
            <Github className="size-4" /> Built for developers
          </span>
        </div>
      </footer>
    </div>
  );
}
