"use client";

import { useState, useTransition } from "react";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  MapPin,
  Wallet,
  Landmark,
  Users2,
  ChevronDown,
} from "lucide-react";
import { saveCmsContent } from "./actions";
import { BankQrUploader } from "./BankQrUploader";
import { TrainerPhotoUploader } from "./TrainerPhotoUploader";
import type { BankConfig, TrainerConfig } from "@/lib/cms";

type BankKey = "bank_bancolombia" | "bank_nequi" | "bank_daviplata";
type TrainerKey = "trainer_1" | "trainer_2";

type BankWithUrl = BankConfig & { qrUrl: string | null };
type TrainerWithUrl = TrainerConfig & {
  photoUrl: string | null;
  fallbackUrl: string;
};

export function CmsForm({
  initial,
}: {
  initial: {
    hero_title: string;
    hero_subtitle: string;
    about_text: string;
    address: string;
    hours_weekdays: string;
    hours_saturday: string;
    hours_sunday: string;
    price_monthly: number;
    price_session: number;
    price_assessment: number;
    contact_email: string;
    bank_bancolombia: BankWithUrl;
    bank_nequi: BankWithUrl;
    bank_daviplata: BankWithUrl;
    trainer_1: TrainerWithUrl;
    trainer_2: TrainerWithUrl;
  };
}) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<
    { tone: "ok" | "err"; text: string } | null
  >(null);
  const [dirty, setDirty] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await saveCmsContent(fd);
      if (res.ok) {
        setFeedback({ tone: "ok", text: "Cambios guardados." });
        setDirty(false);
      } else {
        setFeedback({ tone: "err", text: res.error });
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      onInput={() => setDirty(true)}
      className="space-y-6 pb-24"
    >
      <Section
        icon={<Sparkles className="w-5 h-5 text-primary" />}
        title="Identidad del Sitio"
        subtitle="Lo primero que ven los visitantes en el landing."
      >
        <Field label="Título del Hero">
          <input
            name="hero_title"
            defaultValue={initial.hero_title}
            required
            className={inputCls}
          />
        </Field>
        <Field label="Subtítulo del Hero">
          <input
            name="hero_subtitle"
            defaultValue={initial.hero_subtitle}
            required
            className={inputCls}
          />
        </Field>
        <Field label="Texto Sobre Nosotros">
          <textarea
            name="about_text"
            defaultValue={initial.about_text}
            required
            rows={4}
            className={`${inputCls} resize-y`}
          />
        </Field>
      </Section>

      <Section
        icon={<MapPin className="w-5 h-5 text-primary" />}
        title="Información de Contacto"
        subtitle="Aparece en footer, página de contacto y respuestas del bot."
      >
        <Field label="Dirección">
          <input
            name="address"
            defaultValue={initial.address}
            required
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Horario L–V">
            <input
              name="hours_weekdays"
              defaultValue={initial.hours_weekdays}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Horario Sábado">
            <input
              name="hours_saturday"
              defaultValue={initial.hours_saturday}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Horario Domingo">
            <input
              name="hours_sunday"
              defaultValue={initial.hours_sunday}
              required
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Email de contacto">
          <input
            type="email"
            name="contact_email"
            defaultValue={initial.contact_email}
            required
            className={inputCls}
          />
        </Field>
      </Section>

      <Section
        icon={<Wallet className="w-5 h-5 text-primary" />}
        title="Precios"
        subtitle="Precios sueltos que aparecen en el landing y en el chatbot."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Mensualidad (COP)">
            <input
              type="number"
              min={0}
              step={1000}
              name="price_monthly"
              defaultValue={initial.price_monthly}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Sesión suelta (COP)">
            <input
              type="number"
              min={0}
              step={1000}
              name="price_session"
              defaultValue={initial.price_session}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Valoración física (COP)">
            <input
              type="number"
              min={0}
              step={1000}
              name="price_assessment"
              defaultValue={initial.price_assessment}
              required
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      <Section
        icon={<Landmark className="w-5 h-5 text-primary" />}
        title="Datos Bancarios"
        subtitle="Cuentas y QR oficiales que ven los usuarios al pagar."
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BankCard bankKey="bank_bancolombia" data={initial.bank_bancolombia} />
          <BankCard bankKey="bank_nequi" data={initial.bank_nequi} />
          <BankCard bankKey="bank_daviplata" data={initial.bank_daviplata} />
        </div>
      </Section>

      <Section
        icon={<Users2 className="w-5 h-5 text-primary" />}
        title="Entrenadores"
        subtitle="Nombre y foto de perfil que aparecen en el landing y en /entrenadores."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TrainerCard trainerKey="trainer_1" data={initial.trainer_1} />
          <TrainerCard trainerKey="trainer_2" data={initial.trainer_2} />
        </div>
      </Section>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-card/95 backdrop-blur border-t border-border px-8 py-3 flex items-center justify-between gap-4 z-20">
        <div className="text-sm">
          {feedback ? (
            <span
              className={`inline-flex items-center gap-2 ${
                feedback.tone === "ok" ? "text-success" : "text-destructive"
              }`}
            >
              {feedback.tone === "ok" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {feedback.text}
            </span>
          ) : dirty ? (
            <span className="text-muted-foreground">Cambios sin guardar</span>
          ) : (
            <span className="text-muted-foreground">Todo al día</span>
          )}
        </div>
        <button
          type="submit"
          disabled={pending || !dirty}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Guardar cambios
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="glass-panel rounded-2xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
          <div className="text-left">
            <h3 className="font-display font-bold text-lg leading-tight">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-6 pb-6 space-y-4 border-t border-border pt-5">
          {children}
        </div>
      )}
    </div>
  );
}

function TrainerCard({
  trainerKey,
  data,
}: {
  trainerKey: TrainerKey;
  data: TrainerWithUrl;
}) {
  return (
    <div className="bg-background border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <input
          name={`${trainerKey}__name`}
          defaultValue={data.name}
          required
          className="bg-transparent font-display font-bold text-lg flex-1 focus:outline-none"
        />
        <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            name={`${trainerKey}__enabled`}
            defaultChecked={data.enabled}
            className="accent-primary"
          />
          <span className="text-muted-foreground">Mostrar</span>
        </label>
      </div>
      <TrainerPhotoUploader
        trainerKey={trainerKey}
        initialPath={data.photo_path}
        initialUrl={data.photoUrl}
        fallbackUrl={data.fallbackUrl}
      />
    </div>
  );
}

function BankCard({
  bankKey,
  data,
}: {
  bankKey: BankKey;
  data: BankWithUrl;
}) {
  return (
    <div className="bg-background border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <input
          name={`${bankKey}__name`}
          defaultValue={data.name}
          required
          className="bg-transparent font-display font-bold text-lg flex-1 focus:outline-none"
        />
        <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            name={`${bankKey}__enabled`}
            defaultChecked={data.enabled}
            className="accent-primary"
          />
          <span className="text-muted-foreground">Activo</span>
        </label>
      </div>
      <Field label="Titular de la cuenta">
        <input
          name={`${bankKey}__holder`}
          defaultValue={data.holder}
          required
          className={inputCls}
        />
      </Field>
      <Field label="Número de cuenta">
        <input
          name={`${bankKey}__account`}
          defaultValue={data.account}
          required
          className={`${inputCls} font-mono`}
        />
      </Field>
      <BankQrUploader
        bankKey={bankKey}
        initialPath={data.qr_path}
        initialUrl={data.qrUrl}
      />
    </div>
  );
}
