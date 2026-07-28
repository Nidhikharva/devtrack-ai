import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Terminal, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — DevTrack AI" },
      {
        name: "description",
        content: "Sign in or create your DevTrack AI account to track projects, tasks and learning.",
      },
      { property: "og:title", content: "Sign in — DevTrack AI" },
      { property: "og:description", content: "Access your DevTrack AI developer dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const credentials = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72),
  fullName: z.string().trim().max(100).optional(),
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = credentials.safeParse({ email, password, fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsed.data.fullName || null },
          },
        });
        if (error) throw error;
        toast.success("Account created — welcome aboard!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate({ to: "/dashboard", replace: true });
      else toast.info("Check your inbox to confirm your email, then sign in.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-rise">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
            <Terminal className="size-5" />
          </span>
          <span className="font-display text-lg font-bold">DevTrack AI</span>
        </Link>

        <div className="glass rounded-3xl p-7">
          <h1 className="text-2xl font-bold">{isSignUp ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isSignUp
              ? "Start tracking projects, tasks and learning goals."
              : "Sign in to open your developer dashboard."}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full rounded-xl"
            onClick={handleGoogle}
            disabled={loading}
          >
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or use email{" "}
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ada Lovelace"
                  maxLength={100}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                maxLength={72}
              />
            </div>
            <Button type="submit" className="w-full rounded-xl glow" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {isSignUp ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "New to DevTrack AI?"}{" "}
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => setIsSignUp((v) => !v)}
            >
              {isSignUp ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
