"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
  return { supabase, currentUserId: user.id };
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
  const { supabase } = await assertAdmin();

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
  const { supabase } = await assertAdmin();

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

/**
 * Wipe a user's payments and memberships but keep their account. Use this to
 * "reset" a test user: their confirmed payments stop counting toward the
 * monthly earnings shown in the admin dashboard, while they can still log in.
 */
export async function resetUserData(userId: string) {
  const { supabase, currentUserId } = await assertAdmin();

  if (userId === currentUserId) {
    return { ok: false as const, error: "No podés reiniciar tu propia cuenta." };
  }

  // Service-role client so the deletes aren't blocked by RLS.
  const admin = createAdminClient();

  const { error: payErr } = await admin
    .from("payments")
    .delete()
    .eq("user_id", userId);
  if (payErr) {
    return { ok: false as const, error: payErr.message };
  }

  const { error: memErr } = await admin
    .from("memberships")
    .delete()
    .eq("user_id", userId);
  if (memErr) {
    return { ok: false as const, error: memErr.message };
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
  return { ok: true as const };
}

/**
 * Permanently delete a user. Removing the auth user cascades to their profile,
 * payments, memberships and notifications (all FK'd ON DELETE CASCADE), so the
 * user disappears from the admin panel and the monthly earnings entirely.
 * Admins (owner/partner) and your own account cannot be deleted.
 */
export async function deleteUser(userId: string) {
  const { supabase, currentUserId } = await assertAdmin();

  if (userId === currentUserId) {
    return { ok: false as const, error: "No podés eliminar tu propia cuenta." };
  }

  const { data: target } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (target && isAdminRole(target.role)) {
    return {
      ok: false as const,
      error: "No se puede eliminar a un administrador.",
    };
  }

  const admin = createAdminClient();

  // Clear the two references that point at this profile WITHOUT a cascade, so
  // the delete isn't blocked: other users they referred, and any payment they
  // may have confirmed.
  await admin.from("profiles").update({ referred_by: null }).eq("referred_by", userId);
  await admin.from("payments").update({ confirmed_by: null }).eq("confirmed_by", userId);

  // Deleting the auth user cascades to profile → payments/memberships/notifications.
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
  return { ok: true as const };
}
