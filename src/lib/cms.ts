import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type BankConfig = {
  name: string;
  holder: string;
  account: string;
  /** Path inside the `payment-qrs` bucket. null = no custom QR (auto-generate). */
  qr_path: string | null;
  enabled: boolean;
};

export type TrainerConfig = {
  name: string;
  /** Path inside the `trainer-photos` bucket. null = use the bundled fallback image. */
  photo_path: string | null;
  enabled: boolean;
};

/**
 * Pixel offset from the top-left of the viewport for a floating button.
 * `null` means "use the component's default CSS position" — that's the
 * initial value before an admin has dragged the button.
 */
export type ButtonCoords = { left: number; top: number } | null;

/** Per-device positions for a single floating button. */
export type ButtonPosition = {
  desktop: ButtonCoords;
  mobile: ButtonCoords;
};

/** Positions for all admin-movable floating buttons. */
export type UiButtonPositions = {
  chatbot: ButtonPosition;
  audio: ButtonPosition;
  opacity: ButtonPosition;
};

export type PlanSlug =
  | "mensualidad"
  | "sesion"
  | "valoracion"
  | "package_12"
  | "package_15"
  | "package_20";

/** Per-plan original price (COP) and discount percentage (0-100). */
export type PlanPricingEntry = {
  /** Original list price in COP. */
  price: number;
  /** 0-100. Final shown price = price * (1 - discount_percentage/100). */
  discount_percentage: number;
};

export type PlanPricingConfig = Record<PlanSlug, PlanPricingEntry>;

export type CmsContent = {
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
  whatsapp_number: string;
  whatsapp_display: string;
  chatbot_system_prompt: string;
  /** 0-100, applied to the hero background video on mobile (<768px) */
  hero_video_opacity_mobile: number;
  /** 0-100, applied to the hero background video on desktop (≥768px) */
  hero_video_opacity_desktop: number;
  bank_bancolombia: BankConfig;
  bank_nequi: BankConfig;
  bank_daviplata: BankConfig;
  trainer_1: TrainerConfig;
  trainer_2: TrainerConfig;
  ui_button_positions: UiButtonPositions;
  plan_pricing: PlanPricingConfig;
};

export const CMS_DEFAULTS: CmsContent = {
  hero_title: "Tu mejor versión empieza acá",
  hero_subtitle: "Entrenamos con propósito. Resultados reales en Cartagena.",
  about_text:
    "Somos un gimnasio boutique en Cartagena enfocado en entrenamiento personalizado, hipertrofia, fuerza y funcional. Nuestro equipo te acompaña paso a paso para que llegues a tu meta sin frustrarte en el camino.",
  address:
    "Urb. Villa Sol 2 Mz. E22, Variante Mamonal Calle Principal, Cartagena",
  hours_weekdays: "Lunes a Viernes 5:00am – 11:00am y 2:30pm – 9:00pm",
  hours_saturday: "Sábados 6:30am – 11:00am y 2:30pm – 6:00pm",
  hours_sunday: "Domingos y festivos 7:00am – 12:00pm",
  price_monthly: 60000,
  price_session: 5000,
  price_assessment: 30000,
  contact_email: "hola@trainingstudio.com",
  whatsapp_number: "573122765732",
  whatsapp_display: "+57 312 276 5732",
  chatbot_system_prompt: "",
  hero_video_opacity_mobile: 65,
  hero_video_opacity_desktop: 80,
  bank_bancolombia: {
    name: "Bancolombia",
    holder: "Training Studio S.A.S.",
    account: "Ahorros 123-456789-00",
    qr_path: null,
    enabled: true,
  },
  bank_nequi: {
    name: "Nequi",
    holder: "Training Studio",
    account: "300 123 4567",
    qr_path: null,
    enabled: true,
  },
  bank_daviplata: {
    name: "Daviplata",
    holder: "Training Studio",
    account: "300 123 4567",
    qr_path: null,
    enabled: true,
  },
  trainer_1: {
    name: "Camilo Ortiz",
    photo_path: null,
    enabled: true,
  },
  trainer_2: {
    name: "Juan Carlos Bork",
    photo_path: null,
    enabled: true,
  },
  ui_button_positions: {
    chatbot: { desktop: null, mobile: null },
    audio: { desktop: null, mobile: null },
    opacity: { desktop: null, mobile: null },
  },
  plan_pricing: {
    mensualidad: { price: 90000, discount_percentage: 33 },
    sesion: { price: 10000, discount_percentage: 50 },
    valoracion: { price: 30000, discount_percentage: 50 },
    package_12: { price: 240000, discount_percentage: 38 },
    package_15: { price: 320000, discount_percentage: 38 },
    package_20: { price: 400000, discount_percentage: 38 },
  },
};

/**
 * Read every CMS key in a single round-trip and return them merged with
 * defaults. Cached per-request so multiple components on the same page
 * don't re-query.
 */
export const getCmsContent = cache(async (): Promise<CmsContent> => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("content").select("key, value");
    if (error || !data) return CMS_DEFAULTS;

    const merged: CmsContent = { ...CMS_DEFAULTS };
    for (const row of data) {
      if (row.key in CMS_DEFAULTS) {
        // Trust DB shape; fall back per-key on any malformed value
        (merged as Record<string, unknown>)[row.key] = row.value;
      }
    }
    return merged;
  } catch {
    return CMS_DEFAULTS;
  }
});

/**
 * Resolve the public URL for a bank QR image. Returns null when the bank
 * has no custom QR uploaded yet (the UI falls back to auto-generated QR).
 */
export async function getBankQrUrl(qrPath: string | null): Promise<string | null> {
  if (!qrPath) return null;
  const supabase = await createClient();
  const { data } = supabase.storage.from("payment-qrs").getPublicUrl(qrPath);
  return data?.publicUrl ?? null;
}

export async function getTrainerPhotoUrl(
  photoPath: string | null,
): Promise<string | null> {
  if (!photoPath) return null;
  const supabase = await createClient();
  const { data } = supabase.storage.from("trainer-photos").getPublicUrl(photoPath);
  return data?.publicUrl ?? null;
}
