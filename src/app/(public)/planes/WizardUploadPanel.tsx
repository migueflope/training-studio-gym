"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogIn,
  Phone,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitPayment } from "@/app/dashboard/membresia/payment-actions";

interface WizardUploadPanelProps {
  /** Wizard plan id like "mensualidad", "12-clases", "sesion"… */
  wizardPlanId: string | null;
  /** Method id from the wizard buttons: "bancolombia" | "nequi" | "daviplata" */
  method: string;
  /** Display total e.g. "$60.000" — only for the header */
  priceLabel: string;
}

/** Wizard plan ids that map to a real DB plan (memberships). */
const WIZARD_TO_DB_NAME: Record<string, string> = {
  mensualidad: "Mensualidad del Gym",
  "12-clases": "Paquete 12 Clases",
  "15-clases": "Paquete 15 Clases",
  "20-clases": "Paquete 20 Clases",
};

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

interface DbPlan {
  id: string;
  priceCop: number;
}

export function WizardUploadPanel({
  wizardPlanId,
  method,
  priceLabel,
}: WizardUploadPanelProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [dbPlan, setDbPlan] = useState<DbPlan | null | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  const [transactionRef, setTransactionRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Load session and DB plan in parallel.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    const dbName = wizardPlanId ? WIZARD_TO_DB_NAME[wizardPlanId] : null;
    if (!dbName) {
      setDbPlan(null);
      return;
    }
    supabase
      .from("plans")
      .select("id, price_cop")
      .eq("name", dbName)
      .maybeSingle()
      .then(({ data }) => {
        setDbPlan(data ? { id: data.id, priceCop: Number(data.price_cop) } : null);
      });
  }, [wizardPlanId]);

  // Loading state
  if (userId === undefined || dbPlan === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  // Service plans (sesion, valoracion) — pay in person, no upload
  if (!dbPlan) {
    return (
      <div className="space-y-4">
        <Header priceLabel={priceLabel} />
        <div className="rounded-2xl border border-border bg-secondary/20 p-6 text-center">
          <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
          <h5 className="font-bold mb-2">Coordiná en el club</h5>
          <p className="text-sm text-muted-foreground mb-4">
            Para este servicio podés pagar directamente en el club o
            coordinar por WhatsApp con el equipo.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Contactar al equipo
          </Link>
        </div>
      </div>
    );
  }

  // Not logged in — prompt sign-in/up, preserving wizard state on return
  if (!userId) {
    const next = encodeURIComponent(
      `/planes?plan=${wizardPlanId}&step=3`,
    );
    return (
      <div className="space-y-4">
        <Header priceLabel={priceLabel} />
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <h5 className="font-bold mb-2">Crea tu cuenta para activar el plan</h5>
          <p className="text-sm text-muted-foreground mb-4">
            Necesitamos asociar el comprobante a tu cuenta para que el
            equipo pueda verificar tu pago y activarte la membresía.
          </p>
          <Link
            href={`/login?next=${next}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Iniciar sesión / Crear cuenta
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="space-y-4">
        <Header priceLabel={priceLabel} />
        <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
          <h5 className="font-bold mb-2">¡Comprobante enviado!</h5>
          <p className="text-sm text-muted-foreground mb-4">
            El equipo verifica tu pago contra el banco. Apenas se confirme
            te activamos la membresía. Suele tardar pocas horas.
          </p>
          <Link
            href="/dashboard/membresia"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            Ir a mi panel
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) return setError("Subí la foto o PDF del comprobante");
    if (!ACCEPTED.includes(file.type))
      return setError("Formato no soportado. Usá JPG, PNG, WebP o PDF.");
    if (file.size > MAX_BYTES) return setError("El archivo pesa más de 5 MB.");

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

      const res = await submitPayment({
        planId: dbPlan.id,
        amountCop: dbPlan.priceCop,
        method,
        transactionRef,
        proofPath: path,
      });

      if (!res.ok) {
        await supabase.storage.from("payment-receipts").remove([path]);
        setError(res.error);
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo el comprobante");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Header priceLabel={priceLabel} />

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Subir un comprobante falso constituye fraude y resulta en bloqueo
          permanente de la cuenta. Verificamos cada pago contra el banco antes
          de activar tu membresía.
        </span>
      </div>

      <div>
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
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm disabled:opacity-50"
        >
          {file ? (
            <>
              <CheckCircle2 className="w-7 h-7 text-success" />
              <span className="font-medium truncate max-w-full">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB · click para cambiar
              </span>
            </>
          ) : (
            <>
              <UploadCloud className="w-7 h-7 text-muted-foreground" />
              <span className="font-bold">Subí tu comprobante</span>
              <span className="text-xs text-muted-foreground text-center">
                JPG, PNG, WebP o PDF · máx 5 MB
              </span>
            </>
          )}
        </button>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Número de referencia{" "}
          <span className="font-normal normal-case text-muted-foreground/60">
            (opcional)
          </span>
        </label>
        <input
          type="text"
          value={transactionRef}
          onChange={(e) => setTransactionRef(e.target.value)}
          placeholder="Ayuda a verificar más rápido"
          className="mt-1 w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm font-mono"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={uploading || !file}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-[0_0_18px_rgba(212,175,55,0.4)] hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(212,175,55,0.6)] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando…
          </>
        ) : (
          <>
            <UploadCloud className="w-4 h-4" />
            Enviar comprobante
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        El equipo verifica el pago antes de activar la membresía. En general no
        tarda más de unas horas.
      </p>
    </form>
  );
}

function Header({ priceLabel }: { priceLabel: string }) {
  return (
    <div>
      <h4 className="text-lg font-bold mb-1">Total a pagar:</h4>
      <p className="text-4xl font-mono text-primary font-bold">{priceLabel}</p>
    </div>
  );
}
