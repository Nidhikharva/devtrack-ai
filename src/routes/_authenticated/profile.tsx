import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { useAvatarUrl, useProfile } from "@/lib/devtrack";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — DevTrack AI" },
      { name: "description", content: "Update your developer profile and avatar." },
      { property: "og:title", content: "Profile — DevTrack AI" },
      { property: "og:description", content: "Update your developer profile and avatar." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

const schema = z.object({
  full_name: z.string().trim().max(100),
  github_username: z.string().trim().max(60),
  bio: z.string().trim().max(500),
});

function ProfilePage() {
  const { data, isLoading } = useProfile();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ full_name: "", github_username: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const avatar = useAvatarUrl(data?.profile.avatar_url);

  useEffect(() => {
    if (data?.profile) {
      setForm({
        full_name: data.profile.full_name ?? "",
        github_username: data.profile.github_username ?? "",
        bio: data.profile.bio ?? "",
      });
    }
  }, [data?.profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!data?.profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.full_name || null,
        github_username: parsed.data.github_username || null,
        bio: parsed.data.bio || null,
      })
      .eq("id", data.profile.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile saved");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !data?.profile) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${data.profile.id}/avatar-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
    });
    if (uploadError) {
      setUploading(false);
      toast.error(uploadError.message);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: path })
      .eq("id", data.profile.id);
    setUploading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Avatar updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  }

  const initials = (form.full_name || data?.email || "D").slice(0, 2).toUpperCase();

  return (
    <AppShell title="Profile" description="How you show up across DevTrack AI.">
      {isLoading && <p className="text-sm text-muted-foreground">Loading profile…</p>}

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <section className="glass rounded-3xl p-6 text-center">
          <Avatar className="mx-auto size-28">
            {avatar.data && <AvatarImage src={avatar.data} alt="Profile image" />}
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <p className="mt-4 font-semibold">{form.full_name || "Unnamed developer"}</p>
          <p className="text-sm text-muted-foreground">{data?.email}</p>
          <Label
            htmlFor="avatar"
            className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/20"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Upload image
          </Label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={uploadAvatar}
            disabled={uploading}
          />
        </section>

        <form onSubmit={save} className="glass space-y-4 rounded-3xl p-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github_username">GitHub username</Label>
            <Input
              id="github_username"
              value={form.github_username}
              onChange={(e) => setForm({ ...form, github_username: e.target.value })}
              maxLength={60}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={5}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              maxLength={500}
            />
          </div>
          <Button type="submit" className="rounded-full glow" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />} Save profile
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
