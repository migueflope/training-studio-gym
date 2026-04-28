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
  return { supabase, adminId: user.id };
}

export async function approvePayment(paymentId: string) {
  const { supabase, adminId } = await assertAdmin();

  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .select("id, user_id, plan_id, status")
    .eq("id", paymentId)
    .maybeSingle();

  if (payErr || !payment) {
    return { ok: false as const, error: "Pago no encontrado" };
  }
  if (payment.status !== "pending") {
    return { ok: false as const, error: "El pago ya fue procesado" };
  }

  const { data: plan, error: planErr } = await supabase
    .from("plans")
    .select("duration_days")
    .eq("id", payment.plan_id)
    .maybeSingle();
  if (planErr || !plan) {
    return { ok: false as const, error: "Plan no encontrado" };
  }

  const today = new Date();
  const startDate = today.toISOString().slice(0, 10);
  const end = new Date(today);
  end.setDate(end.getDate() + plan.duration_days);
  const endDate = end.toISOString().slice(0, 10);

  // Expire any other active membership the user might have, so the new one is
  // the single source of truth.
  await supabase
    .from("memberships")
    .update({ status: "expired" })
    .eq("user_id", payment.user_id)
    .eq("status", "active");

  const { data: newMembership, error: memErr } = await supabase
    .from("memberships")
    .insert({
      user_id: payment.user_id,
      plan_id: payment.plan_id,
      start_date: startDate,
      end_date: endDate,
      status: "active",
      payment_id: payment.id,
    })
    .select("id")
    .maybeSingle();
  if (memErr || !newMembership) {
    return { ok: false as const, error: memErr?.message ?? "No se pudo crear la membresía" };
  }

  const { error: updErr } = await supabase
    .from("payments")
    .update({
      status: "confirmed",
      confirmed_by: adminId,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", paymentId);
  if (updErr) {
    return { ok: false as const, error: updErr.message };
  }

  revalidatePath("/admin/pagos");
  revalidatePath("/admin/usuarios");
  revalidatePath("/dashboard/membresia");
  return { ok: true as const };
}

export async function rejectPayment(paymentId: string, reason: string) {
  const { supabase } = await assertAdmin();

  const trimmed = reason.trim();
  if (trimmed.length < 4) {
    return { ok: false as const, error: "Escribí un motivo más descriptivo" };
  }

  const { error } = await supabase
    .from("payments")
    .update({ status: "rejected", rejection_reason: trimmed })
    .eq("id", paymentId)
    .eq("status", "pending");
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin/pagos");
  revalidatePath("/dashboard/membresia");
  return { ok: true as const };
}
