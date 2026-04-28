"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

export interface SubmitPaymentInput {
  planId: string;
  amountCop: number;
  method: string;
  transactionRef: string;
  proofPath: string; // path inside the payment-receipts bucket
}

export async function submitPayment(input: SubmitPaymentInput) {
  const { supabase, user } = await requireUser();

  // One pending payment at a time per user.
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    return {
      ok: false as const,
      error:
        "Ya tenés un pago en revisión. Esperá a que el equipo lo confirme antes de subir otro.",
    };
  }

  if (!input.transactionRef.trim()) {
    return { ok: false as const, error: "Ingresá el número de referencia del banco" };
  }
  if (!Number.isFinite(input.amountCop) || input.amountCop <= 0) {
    return { ok: false as const, error: "Monto inválido" };
  }

  const { error } = await supabase.from("payments").insert({
    user_id: user.id,
    plan_id: input.planId,
    amount_cop: input.amountCop,
    method: input.method,
    transaction_ref: input.transactionRef.trim(),
    proof_url: input.proofPath,
    status: "pending",
  });

  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/dashboard/membresia");
  return { ok: true as const };
}
