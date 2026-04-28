"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdminRole } from "@/lib/auth/roles";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !isAdminRole(profile.role)) {
    throw new Error("No autorizado");
  }
  return supabase;
}

export interface ActivateMembershipInput {
  userId: string;
  planId: string;
  startDate: string; // ISO yyyy-mm-dd
}

export async function activateMembership({
  userId,
  planId,
  startDate,
}: ActivateMembershipInput) {
  const supabase = await assertAdmin();

  const { data: plan, error: planErr } = await supabase
    .from("plans")
    .select("duration_days")
    .eq("id", planId)
    .maybeSingle();

  if (planErr || !plan) {
    return { ok: false as const, error: "Plan no encontrado" };
  }

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return { ok: false as const, error: "Fecha de inicio inválida" };
  }
  const end = new Date(start);
  end.setDate(end.getDate() + plan.duration_days);
  const endDate = end.toISOString().slice(0, 10);

  // Cancel any active membership the user might have so the new one is the
  // single source of truth.
  await supabase
    .from("memberships")
    .update({ status: "expired" })
    .eq("user_id", userId)
    .eq("status", "active");

  const { error } = await supabase.from("memberships").insert({
    user_id: userId,
    plan_id: planId,
    start_date: startDate,
    end_date: endDate,
    status: "active",
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/admin/usuarios");
  return { ok: true as const };
}

export async function cancelMembership(membershipId: string) {
  const supabase = await assertAdmin();

  const { error } = await supabase
    .from("memberships")
    .update({ status: "expired" })
    .eq("id", membershipId);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/admin/usuarios");
  return { ok: true as const };
}
