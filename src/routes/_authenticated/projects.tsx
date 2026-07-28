import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Github, Pencil, Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { useProjectMutations, useProjects, type Project } from "@/lib/devtrack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({
    meta: [
      { title: "Projects — DevTrack AI" },
      { name: "description", content: "Add, edit and organise every project you're building." },
      { property: "og:title", content: "Projects — DevTrack AI" },
      { property: "og:description", content: "Add, edit and organise every project you're building." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProjectsPage,
});

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(1000).optional(),
  github_url: z.union([z.string().trim().url("GitHub URL must be a valid URL").max(300), z.literal("")]),
  tech_stack: z.string().max(300),
});

const EMPTY = { title: "", description: "", github_url: "", tech_stack: "" };

function ProjectsPage() {
  const { data, isLoading } = useProjects();
  const { create, update, remove } = useProjectMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [detail, setDetail] = useState<Project | null>(null);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description ?? "",
      github_url: p.github_url ?? "",
      tech_stack: p.tech_stack.join(", "),
    });
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const values = {
      title: parsed.data.title,
      description: parsed.data.description || null,
      github_url: parsed.data.github_url || null,
      tech_stack: parsed.data.tech_stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...values });
        toast.success("Project updated");
      } else {
        await create.mutateAsync(values);
        toast.success("Project added");
      }
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save project");
    }
  }

  async function del(id: string) {
    try {
      await remove.mutateAsync(id);
      setDetail(null);
      toast.success("Project deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete project");
    }
  }

  return (
    <AppShell title="Projects" description="Every repo, side project and experiment in one place.">
      <div className="mb-6">
        <Button onClick={openNew} className="rounded-full glow">
          <Plus className="size-4" /> New project
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading projects…</p>}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(data ?? []).map((p) => (
          <article key={p.id} className="glass animate-rise flex flex-col rounded-3xl p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{p.title}</h2>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => openEdit(p)} aria-label="Edit">
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => del(p.id)}
                  aria-label="Delete"
                  className="text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
            <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
              {p.description || "No description yet."}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.tech_stack.map((t) => (
                <Badge key={t} variant="secondary" className="font-mono text-[11px]">
                  {t}
                </Badge>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setDetail(p)}>
                View details
              </Button>
              {p.github_url && (
                <a
                  href={p.github_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <Github className="size-4" /> Repo
                </a>
              )}
            </div>
          </article>
        ))}
      </div>

      {!isLoading && (data ?? []).length === 0 && (
        <div className="glass rounded-3xl p-10 text-center">
          <p className="text-muted-foreground">No projects yet. Add your first one to get going.</p>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle>
            <DialogDescription>Describe what you're building and the stack behind it.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={120}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={1000}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                placeholder="https://github.com/you/repo"
                maxLength={300}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tech_stack">Tech stack (comma separated)</Label>
              <Input
                id="tech_stack"
                value={form.tech_stack}
                onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
                placeholder="React, TypeScript, Postgres"
                maxLength={300}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="rounded-full" disabled={create.isPending || update.isPending}>
                {editing ? "Save changes" : "Add project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>{detail?.title}</DialogTitle>
            <DialogDescription>
              Created {detail ? new Date(detail.created_at).toLocaleDateString() : ""}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{detail?.description || "No description."}</p>
          <div className="flex flex-wrap gap-1.5">
            {detail?.tech_stack.map((t) => (
              <Badge key={t} variant="secondary" className="font-mono text-[11px]">
                {t}
              </Badge>
            ))}
          </div>
          {detail?.github_url && (
            <a
              href={detail.github_url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="size-4" /> {detail.github_url}
            </a>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
