import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, Crown, History, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile, isAdminRole } from "@/lib/auth/getUserProfile";
import { getActiveMembership } from "@/lib/auth/getActiveMembership";
import { MembershipTabs } from "./MembershipTabs";
import { PaymentsTab, type UserPaymentRow } from "./PaymentsTab";
import type { PlanOption } from "./UploadPaymentDialog";

export const dynamic = "force-dynamic";

interface MembershipHistoryRow {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "pending";
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function MembershipPage() {
  const profile = await getUserProfile();
  if (!profile) redirect("/login?next=/dashboard/membresia");

  const isAdmin = isAdminRole(profile.role);
  const supabase = await createClient();

  const active = isAdmin ? null : await getActiveMembership(profile.id);

  const { data: rawHistory } = await supabase
    .from("memberships")
    .select("id, start_date, end_date, status, plans(name)")
    .eq("user_id", profile.id)
    .order("start_date", { ascending: false });

  const history: MembershipHistoryRow[] = (rawHistory ?? []).map((m) => {
    const plan = Array.isArray(m.plans) ? m.plans[0] : m.plans;
    return {
      id: m.id,
      planName: plan?.name ?? "Plan",
      startDate: m.start_date,
      endDate: m.end_date,
      status: m.status,
    };
  });

  const { data: rawPayments } = await supabase
    .from("payments")
    .select(
      "id, amount_cop, method, status, transaction_ref, rejection_reason, proof_url, created_at, plans(name)",
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const payments: UserPaymentRow[] = await Promise.all(
    (rawPayments ?? []).map(async (p) => {
      const plan = Array.isArray(p.plans) ? p.plans[0] : p.plans;
      let signedUrl: string | null = null;
      if (p.proof_url) {
        const { data: signed } = await supabase.storage
          .from("payment-receipts")
          .createSignedUrl(p.proof_url, 60 * 30);
        signedUrl = signed?.signedUrl ?? null;
      }
      return {
        id: p.id,
        planName: plan?.name ?? "Plan",
        amountCop: Number(p.amount_cop),
        method: p.method,
        status: p.status,
        rejectionReason: p.rejection_reason,
        transactionRef: p.transaction_ref,
        proofUrl: signedUrl,
        createdAt: p.created_at,
      };
    }),
  );

  const { data: rawPlans } = await supabase
    .from("plans")
    .select("id, name, price_cop")
    .order("price_cop", { ascending: true });
  const plans: PlanOption[] = (rawPlans ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    priceCop: Number(p.price_cop),
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Mi membresía</h1>
        <p className="text-muted-foreground">
          Tu plan actual, historial y pagos en un solo lugar.
        </p>
      </div>

      <MembershipTabs
        activeContent={<ActiveSection isAdmin={isAdmin} membership={active} />}
        historyContent={<HistorySection history={history} />}
        paymentsContent={
          <PaymentsTab userId={profile.id} payments={payments} plans={plans} />
        }
      />
    </div>
  );
}

function ActiveSection({
  isAdmin,
  membership,
}: {
  isAdmin: boolean;
  membership: Awaited<ReturnType<typeof getActiveMembership>>;
}) {
  if (isAdmin) {
    return (
      <div className="glass-panel rounded-2xl border border-primary/30 bg-primary/5 p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/15 rounded-xl shrink-0">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold mb-2">
              Acceso de administrador
            </h2>
            <p className="text-muted-foreground">
              Tu cuenta tiene acceso completo al panel sin necesidad de
              membresía. Si querés ver la experiencia de socio, creá una cuenta
              de prueba.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="glass-panel rounded-2xl border border-border p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-muted/30 rounded-xl shrink-0">
            <Calendar className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-display font-bold mb-2">
              No tenés un plan activo
            </h2>
            <p className="text-muted-foreground mb-4">
              Activá un plan para desbloquear tu panel completo y empezar a
              entrenar con nosotros.
            </p>
            <Link
              href="/planes"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ver planes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const expiringSoon = membership.daysRemaining <= 7;

  return (
    <div
      className={`glass-panel rounded-2xl border p-8 ${
        expiringSoon
          ? "border-destructive/40 bg-destructive/5"
          : "border-primary/30 bg-primary/5"
      }`}
    >
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`p-3 rounded-xl shrink-0 ${
            expiringSoon ? "bg-destructive/15" : "bg-primary/15"
          }`}
        >
          {expiringSoon ? (
            <AlertTriangle className="w-6 h-6 text-destructive" />
          ) : (
            <Calendar className="w-6 h-6 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Plan activo
          </p>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-1">
            {membership.planName}
          </h2>
          <p
            className={`text-sm font-bold ${
              expiringSoon ? "text-destructive" : "text-success"
            }`}
          >
            {membership.daysRemaining === 0
              ? "Vence hoy"
              : membership.daysRemaining === 1
              ? "Vence mañana"
              : `${membership.daysRemaining} días restantes`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl bg-background/60 border border-border p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Inicio
          </p>
          <p className="text-sm font-mono">{fmtDate(membership.startDate)}</p>
        </div>
        <div className="rounded-xl bg-background/60 border border-border p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Vencimiento
          </p>
          <p className="text-sm font-mono">{fmtDate(membership.endDate)}</p>
        </div>
      </div>

      <Link
        href="/planes"
        className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition-colors ${
          expiringSoon
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {expiringSoon ? "Renovar ahora" : "Cambiar / Renovar plan"}
      </Link>
    </div>
  );
}

function HistorySection({ history }: { history: MembershipHistoryRow[] }) {
  if (history.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-border p-8 text-center">
        <History className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-display font-bold text-lg mb-1">
          Sin historial todavía
        </h3>
        <p className="text-sm text-muted-foreground">
          Tus membresías van a aparecer acá apenas tengas la primera.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-border overflow-hidden">
      <ul className="divide-y divide-border">
        {history.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between gap-4 p-4 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <StatusIcon status={m.status} />
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{m.planName}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtDate(m.startDate)} → {fmtDate(m.endDate)}
                </p>
              </div>
            </div>
            <StatusBadge status={m.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusIcon({ status }: { status: MembershipHistoryRow["status"] }) {
  if (status === "active")
    return <CheckCircle2 className="w-5 h-5 text-success shrink-0" />;
  if (status === "pending")
    return <Clock className="w-5 h-5 text-muted-foreground shrink-0" />;
  return <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />;
}

function StatusBadge({ status }: { status: MembershipHistoryRow["status"] }) {
  const map = {
    active: {
      label: "Activa",
      className: "bg-success/15 text-success border-success/30",
    },
    expired: {
      label: "Vencida",
      className: "bg-muted/30 text-muted-foreground border-border",
    },
    pending: {
      label: "Pendiente",
      className: "bg-primary/10 text-primary border-primary/30",
    },
  } as const;
  const v = map[status];
  return (
    <span
      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${v.className} shrink-0`}
    >
      {v.label}
    </span>
  );
}

