import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Project = Tables<"projects">;
export type Task = Tables<"tasks">;
export type Goal = Tables<"learning_goals">;
export type Profile = Tables<"profiles">;

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

/* ---------------- projects ---------------- */

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () =>
      unwrap(await supabase.from("projects").select("*").order("created_at", { ascending: false })),
  });
}

export function useProjectMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["projects"] });

  return {
    create: useMutation({
      mutationFn: async (values: TablesInsert<"projects">) =>
        unwrap(await supabase.from("projects").insert(values).select().single()),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...values }: TablesUpdate<"projects"> & { id: string }) =>
        unwrap(await supabase.from("projects").update(values).eq("id", id).select().single()),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) throw new Error(error.message);
      },
      onSuccess: invalidate,
    }),
  };
}

/* ---------------- tasks ---------------- */

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABEL: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () =>
      unwrap(await supabase.from("tasks").select("*").order("created_at", { ascending: false })),
  });
}

export function useTaskMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["tasks"] });

  return {
    create: useMutation({
      mutationFn: async (values: TablesInsert<"tasks">) =>
        unwrap(await supabase.from("tasks").insert(values).select().single()),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...values }: TablesUpdate<"tasks"> & { id: string }) =>
        unwrap(await supabase.from("tasks").update(values).eq("id", id).select().single()),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("tasks").delete().eq("id", id);
        if (error) throw new Error(error.message);
      },
      onSuccess: invalidate,
    }),
  };
}

/* ---------------- learning goals ---------------- */

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () =>
      unwrap(
        await supabase.from("learning_goals").select("*").order("created_at", { ascending: false }),
      ),
  });
}

export function useGoalMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["goals"] });

  return {
    create: useMutation({
      mutationFn: async (values: TablesInsert<"learning_goals">) =>
        unwrap(await supabase.from("learning_goals").insert(values).select().single()),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...values }: TablesUpdate<"learning_goals"> & { id: string }) =>
        unwrap(await supabase.from("learning_goals").update(values).eq("id", id).select().single()),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("learning_goals").delete().eq("id", id);
        if (error) throw new Error(error.message);
      },
      onSuccess: invalidate,
    }),
  };
}

/* ---------------- profile ---------------- */

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw new Error(error.message);

      if (!data) {
        const created = await supabase.from("profiles").insert({ id: user.id }).select().single();
        if (created.error) throw new Error(created.error.message);
        return { profile: created.data as unknown as Profile, email: user.email ?? "" };
      }
      return { profile: data as Profile, email: user.email ?? "" };

    },
  });
}

export function useAvatarUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["avatar", path],
    enabled: !!path,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path as string, 3600);
      if (error) throw new Error(error.message);
      return data.signedUrl;
    },
  });
}
