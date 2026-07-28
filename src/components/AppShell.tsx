import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FolderGit2,
  ListChecks,
  GraduationCap,
  BarChart3,
  UserRound,
  LogOut,
  Menu,
  X,
  Terminal,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderGit2 },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/learning", label: "Learning", icon: GraduationCap },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-primary/15 text-primary glow"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between rounded-none border-y-0 border-l-0 p-5 lg:flex">
        <div>
          <Link to="/" className="mb-8 flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <Terminal className="size-5" />
            </span>
            <span className="font-display text-lg font-bold">DevTrack AI</span>
          </Link>
          {nav}
        </div>
        <Button variant="ghost" className="justify-start gap-3" onClick={signOut}>
          <LogOut className="size-4" /> Sign out
        </Button>
      </aside>

      {/* Mobile header */}
      <div className="glass sticky top-0 z-40 flex items-center justify-between rounded-none border-x-0 border-t-0 px-4 py-3 lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/15 text-primary">
            <Terminal className="size-4" />
          </span>
          <span className="font-display font-bold">DevTrack AI</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open && (
        <div className="glass-strong fixed inset-x-0 top-[57px] z-40 space-y-3 p-4 lg:hidden">
          {nav}
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <header className="mb-8 animate-rise">
          <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        </header>
        {children}
      </main>
    </div>
  );
}
