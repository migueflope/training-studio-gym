"use client";

import { useRef, useState, useTransition } from "react";
import {
  X,
  Upload,
  Loader2,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitPayment } from "./payment-actions";

export interface PlanOption {
  id: string;
  name: string;
  priceCop: number;
}

const PAYMENT_METHODS = [
  { id: "bancolombia", label: "Bancolombia" },
  { id: "nequi", label: "Nequi" },
  { id: "daviplata", label: "Daviplata" },
  { id: "efectivo", label: "Efectivo (en el club)" },
] as const;

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

interface UploadPaymentDialogProps {
  userId: string;
  plans: PlanOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadPaymentDialog({
  userId,
  plans,
  onClose,
  onSuccess,
}: UploadPaymentDialogProps) {
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const selectedPlan = plans.find((p) => p.id === planId);

  const [amount, setAmount] = useState<string>(
    selectedPlan ? String(selectedPlan.priceCop) : "",
  );
  const [method, setMethod] = useState<string>("bancolombia");
  const [transactionRef, setTransactionRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const updatePlan = (id: string) => {
    setPlanId(id);
    const p = plans.find((pp) => pp.id === id);
    if (p) setAmount(String(p.priceCop));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) return setError("Subí el comprobante de pago");
    if (!ACCEPTED.includes(file.type))
      return setError("Formato no soportado. Usá JPG, PNG, WebP o PDF.");
    if (file.size > MAX_BYTES)
      return setError("El archivo pesa más de 5 MB. Probá con uno más liviano.");

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return setError("Monto inválido");
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
      if (uploadError) throw uploadError;

      startTransition(async () => {
        const res = await submitPayment({
          planId,
          amountCop: amountNum,
          method,
          transactionRef,
          proofPath: path,
        });
        if (!res.ok) {
          // Best-effort cleanup so we don't leave an orphan file behind.
          await supabase.storage.from("payment-receipts").remove([path]);
          setError(res.error);
          return;
        }
        onSuccess();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error subiendo el comprobante";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const busy = uploading || pending;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10 overflow-y-auto"
      onClick={busy ? undefined : onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xl">Subir comprobante de pago</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Subir un comprobante falso constituye fraude y resulta en bloqueo
            permanente de la cuenta. El equipo verifica cada pago contra la
            cuenta bancaria antes de activar tu membresía.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Plan
            </label>
            <select
              value={planId}
              onChange={(e) => updatePlan(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {fmtCop(p.priceCop)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Monto pagado (COP)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
              step={1000}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Método
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Número de referencia / transacción
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="Lo encontrás en el recibo del banco"
              required
              className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Comprobante (foto o PDF)
            </label>
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPTED.join(",")}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
              className="mt-1 w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm disabled:opacity-50"
            >
              {file ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="truncate">{file.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Elegir archivo (JPG, PNG, WebP o PDF · máx 5 MB)
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-secondary transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Enviar comprobante
          </button>
        </div>
      </form>
    </div>
  );
}

function fmtCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}
