"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Receipt,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { UploadPaymentDialog, type PlanOption } from "./UploadPaymentDialog";

export type PaymentStatus = "pending" | "confirmed" | "rejected";

export interface UserPaymentRow {
  id: string;
  planName: string;
  amountCop: number;
  method: string;
  status: PaymentStatus;
  rejectionReason: string | null;
  transactionRef: string | null;
  proofUrl: string | null; // signed URL, generated server-side
  createdAt: string;
}

interface PaymentsTabProps {
  userId: string;
  payments: UserPaymentRow[];
  plans: PlanOption[];
}

function fmtCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const METHOD_LABELS: Record<string, string> = {
  bancolombia: "Bancolombia",
  nequi: "Nequi",
  daviplata: "Daviplata",
  efectivo: "Efectivo",
};

export function PaymentsTab({ userId, payments, plans }: PaymentsTabProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasPending = payments.some((p) => p.status === "pending");

  // Auto-open the upload dialog when arriving from /planes with ?upload=1.
  useEffect(() => {
    if (searchParams.get("upload") === "1" && !hasPending) {
      setShowDialog(true);
      // Clean the query string so the dialog doesn't reopen on refresh.
      const params = new URLSearchParams(searchParams.toString());
      params.delete("upload");
      const next = params.toString() ? `?${params}` : "";
      router.replace(`/dashboard/membresia${next}`);
    }
  }, [searchParams, hasPending, router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-display font-bold text-lg">Tus pagos</h3>
          <p className="text-sm text-muted-foreground">
            Subí el comprobante de tu transferencia y el equipo lo va a revisar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowDialog(true)}
          disabled={hasPending}
          title={hasPending ? "Tenés un pago en revisión" : ""}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          Subir comprobante
        </button>
      </div>

      {justSubmitted && (
        <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 p-4 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-success" />
          <div>
            <p className="font-bold text-success mb-1">Comprobante enviado</p>
            <p className="text-muted-foreground">
              Vamos a verificarlo contra la cuenta bancaria y te avisamos en
              cuanto se confirme. En general no tarda más de unas horas.
            </p>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-border p-8 text-center">
          <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-display font-bold text-lg mb-1">
            Sin pagos todavía
          </h4>
          <p className="text-sm text-muted-foreground">
            Cuando subas tu primer comprobante va a aparecer acá.
          </p>
        </div>
      ) : (
        <ul className="glass-panel rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {payments.map((p) => (
            <li key={p.id} className="p-4 flex items-start gap-4">
              <PaymentStatusIcon status={p.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <p className="font-bold text-sm">{p.planName}</p>
                  <span className="text-sm font-mono">{fmtCop(p.amountCop)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {METHOD_LABELS[p.method] ?? p.method} ·{" "}
                  {fmtDateTime(p.createdAt)}
                  {p.transactionRef && (
                    <>
                      {" · "}
                      <span className="font-mono">Ref {p.transactionRef}</span>
                    </>
                  )}
                </p>
                {p.status === "rejected" && p.rejectionReason && (
                  <p className="text-xs text-destructive mt-1">
                    Motivo: {p.rejectionReason}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <PaymentStatusBadge status={p.status} />
                  {p.proofUrl && (
                    <a
                      href={p.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Ver comprobante
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showDialog && (
        <UploadPaymentDialog
          userId={userId}
          plans={plans}
          onClose={() => setShowDialog(false)}
          onSuccess={() => {
            setShowDialog(false);
            setJustSubmitted(true);
            setTimeout(() => setJustSubmitted(false), 8000);
          }}
        />
      )}
    </div>
  );
}

function PaymentStatusIcon({ status }: { status: PaymentStatus }) {
  if (status === "confirmed")
    return <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />;
  if (status === "rejected")
    return <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />;
  return <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />;
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = {
    pending: {
      label: "Pendiente",
      className: "bg-muted/30 text-muted-foreground border-border",
    },
    confirmed: {
      label: "Confirmado",
      className: "bg-success/15 text-success border-success/30",
    },
    rejected: {
      label: "Rechazado",
      className: "bg-destructive/10 text-destructive border-destructive/30",
    },
  } as const;
  const v = cfg[status];
  return (
    <span
      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${v.className}`}
    >
      {v.label}
    </span>
  );
}
