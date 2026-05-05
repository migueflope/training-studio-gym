"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { createClient } from "@/lib/supabase/client";
import { submitPayment } from "@/app/dashboard/membresia/payment-actions";
import { whatsappUrlFor } from "@/lib/whatsapp";

interface WizardUploadPanelProps {
  /** Wizard plan id like "mensualidad", "12-clases", "sesion"… */
  wizardPlanId: string | null;
  /** Method id from the wizard buttons: "bancolombia" | "nequi" | "daviplata" */
  method: string;
  /** Display total e.g. "$60.000" — only for the header */
  priceLabel: string;
  /** WhatsApp number from CMS, used for the "coordinate at the club" panel. */
  whatsappNumber: string;
}

interface RealPlan {
  dbPlanId: string;
  amountCop: number;
  displayName: string;
}

/**
 * Maps the wizard's hardcoded plan ids to the membership plans seeded into
 * Supabase by migration 0008. Services that aren't real memberships (single
 * sessions, fitness assessments) are deliberately not in this map — those
 * fall back to the "coordinate at the club" panel.
 */
const WIZARD_TO_DB: Record<string, RealPlan> = {
  mensualidad: {
    dbPlanId: "d5f76b5d-e134-4bc9-bb7d-b5f76b5de134",
    amountCop: 60000,
    displayName: "Mensualidad del Gym",
  },
  "12-clases": {
    dbPlanId: "c4e65a4c-d023-3ab8-aa6c-a4e65a4cd023",
    amountCop: 150000,
    displayName: "Paquete 12 Clases",
  },
  "15-clases": {
    dbPlanId: "b3d5493b-c912-29a7-995b-93d5493bc912",
    amountCop: 200000,
    displayName: "Paquete 15 Clases",
  },
  "20-clases": {
    dbPlanId: "a2c4382a-b801-1896-884a-82c4382ab801",
    amountCop: 250000,
    displayName: "Paquete 20 Clases",
  },
};

const METHOD_LABEL: Record<string, string> = {
  bancolombia: "Bancolombia",
  nequi: "Nequi",
  daviplata: "Daviplata",
};

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_BYTES = 5 * 1024 * 1024;

function fmtCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function WizardUploadPanel({
  wizardPlanId,
  method,
  priceLabel,
  whatsappNumber,
}: WizardUploadPanelProps) {
  const realPlan = wizardPlanId ? WIZARD_TO_DB[wizardPlanId] ?? null : null;

  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [userName, setUserName] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [transactionRef, setTransactionRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id ?? null;
      setUserId(id);
      if (id) {
        const meta = data.user?.user_metadata ?? {};
        const fallback = meta.full_name ?? meta.name ?? data.user?.email?.split("@")[0] ?? "";
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", id)
          .maybeSingle();
        setUserName(profile?.full_name ?? fallback);
      }
    });
  }, []);

  if (userId === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  // One-off services — pay in person
  if (!realPlan) {
    return (
      <div className="space-y-4">
        <Header priceLabel={priceLabel} />
        <div className="rounded-2xl border border-border bg-secondary/20 p-6 text-center">
          <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
          <h5 className="font-bold mb-2">Coordiná en el club</h5>
          <p className="text-sm text-muted-foreground mb-4">
            Para este servicio podés pagar directamente en el club o coordinar
            por WhatsApp con el equipo.
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

  if (!userId) {
    const next = encodeURIComponent(`/planes?plan=${wizardPlanId}&step=3`);
    return (
      <div className="space-y-4">
        <Header priceLabel={priceLabel} />
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
          <h5 className="font-bold mb-2">Crea tu cuenta para activar el plan</h5>
          <p className="text-sm text-muted-foreground mb-4">
            Necesitamos asociar el comprobante a tu cuenta para que el equipo
            pueda verificar tu pago y activarte la membresía.
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

  if (success) {
    const lines = [
      `Hola! Acabo de pagar mi membresía:`,
      ``,
      `📋 Plan: ${realPlan.displayName}`,
      `💵 Monto: ${fmtCop(realPlan.amountCop)}`,
      `🏦 Método: ${METHOD_LABEL[method] ?? method}`,
    ];
    if (transactionRef.trim()) {
      lines.push(`🔢 Ref: ${transactionRef.trim()}`);
    }
    lines.push(``, `Ya subí el comprobante a la app. Avísame cuando lo confirmes 🙏`);
    if (userName) lines.push(`— ${userName}`);
    const waLink = whatsappUrlFor(whatsappNumber, lines.join("\n"));

    return (
      <div className="space-y-4">
        <Header priceLabel={priceLabel} />
        <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
          <h5 className="font-bold mb-2">¡Comprobante enviado!</h5>
          <p className="text-sm text-muted-foreground mb-4">
            El equipo verifica el pago contra el banco. Apenas se confirme te
            activamos la membresía.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] text-white rounded-lg text-sm font-bold hover:bg-[#1fb157] transition-colors mb-3"
          >
            <WhatsAppIcon className="w-4 h-4" />
            Avisar al equipo por WhatsApp
          </a>
          <Link
            href="/dashboard/membresia"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary/10 text-primary border border-primary/30 rounded-lg text-sm font-bold hover:bg-primary/20 transition-colors"
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
        planId: realPlan.dbPlanId,
        amountCop: realPlan.amountCop,
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
