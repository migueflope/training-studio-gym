import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PaymentsAdminTable, type AdminPaymentRow } from "./PaymentsAdminTable";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("payments")
    .select(
      "id, user_id, amount_cop, method, status, transaction_ref, rejection_reason, proof_url, created_at, plans(id, name, price_cop), profiles(id, full_name, avatar_url)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  const userIds = Array.from(
    new Set((rows ?? []).map((r) => r.user_id).filter(Boolean)),
  );

  const emailsById = new Map<string, string>();
  if (userIds.length > 0) {
    try {
      const admin = createAdminClient();
      const { data: usersList } = await admin.auth.admin.listUsers({
        perPage: 1000,
      });
      for (const u of usersList?.users ?? []) {
        if (u.email) emailsById.set(u.id, u.email);
      }
    } catch (err) {
      console.error("[admin/pagos] listUsers failed:", err);
    }
  }

  const payments: AdminPaymentRow[] = await Promise.all(
    (rows ?? []).map(async (r) => {
      const plan = Array.isArray(r.plans) ? r.plans[0] : r.plans;
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      let signedUrl: string | null = null;
      if (r.proof_url) {
        const { data: signed } = await supabase.storage
          .from("payment-receipts")
          .createSignedUrl(r.proof_url, 60 * 30);
        signedUrl = signed?.signedUrl ?? null;
      }
      return {
        id: r.id,
        status: r.status,
        amountCop: Number(r.amount_cop),
        method: r.method,
        transactionRef: r.transaction_ref,
        rejectionReason: r.rejection_reason,
        proofUrl: signedUrl,
        createdAt: r.created_at,
        user: {
          id: profile?.id ?? r.user_id,
          fullName: profile?.full_name ?? "—",
          email: emailsById.get(r.user_id) ?? "—",
          avatarUrl: profile?.avatar_url ?? null,
        },
        plan: {
          id: plan?.id ?? "",
          name: plan?.name ?? "Plan",
          priceCop: Number(plan?.price_cop ?? 0),
        },
      };
    }),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Pagos</h1>
        <p className="text-muted-foreground">
          Verificá cada comprobante contra tu app del banco antes de confirmar.
          Al confirmar se activa la membresía automáticamente.
        </p>
      </div>
      <PaymentsAdminTable payments={payments} />
    </div>
  );
}
