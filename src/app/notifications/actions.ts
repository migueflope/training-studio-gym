"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin/assertAdmin";

type Result = { ok: true } | { ok: false; error: string };

export async function markAllNotificationsRead(): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function markNotificationRead(id: string): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export interface SendNotificationInput {
  audience: "user" | "all_members";
  userId?: string | null;
  title: string;
  body?: string;
  link?: string | null;
}

export async function sendAdminNotification(
  input: SendNotificationInput,
): Promise<Result & { sent?: number }> {
  const { supabase } = await assertAdmin();

  const title = input.title.trim();
  if (title.length < 3) return { ok: false, error: "El título es muy corto." };
  if (title.length > 120) return { ok: false, error: "El título es muy largo (máx 120)." };

  const body = (input.body ?? "").trim() || null;
  const link = (input.link ?? "").trim() || null;

  const type = input.audience === "all_members" ? "broadcast" : "admin_message";

  if (input.audience === "user") {
    const userId = (input.userId ?? "").trim();
    if (!userId) return { ok: false, error: "Elegí un socio destinatario." };

    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      type,
      title,
      body,
      link,
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/admin/contenido");
    return { ok: true, sent: 1 };
  }

  // Broadcast: insert one row per active member.
  const today = new Date().toISOString().slice(0, 10);
  const { data: activeMembers } = await supabase
    .from("memberships")
    .select("user_id")
    .eq("status", "active")
    .gte("end_date", today);

  const userIds = Array.from(
    new Set((activeMembers ?? []).map((m) => m.user_id as string)),
  );

  if (userIds.length === 0) {
    return { ok: false, error: "No hay miembros activos a quienes mandar." };
  }

  const rows = userIds.map((user_id) => ({
    user_id,
    type,
    title,
    body,
    link,
  }));

  const { error } = await supabase.from("notifications").insert(rows);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/contenido");
  return { ok: true, sent: rows.length };
}
