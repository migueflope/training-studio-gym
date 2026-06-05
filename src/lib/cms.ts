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
 * Visual state of a floating button:
 * - leftPct/topPct as % of viewport (responsive across sizes)
 * - scale 0.6–1.6 (admin-resizable)
 * `null` = use the component's CSS default (no admin override yet).
 */
export type ButtonAppearance = {
  leftPct: number;
  topPct: number;
  scale: number;
} | null;

/** Legacy shape, kept for backward-compat reads. */
export type ButtonCoords = { leftPct: number; topPct: number } | null;

/** Per-device appearance for a single floating button in one section. */
export type ButtonPerDevice = {
  desktop: ButtonAppearance;
  mobile: ButtonAppearance;
};

/** UI sections — each one persists its own position+scale per button. */
export const BUTTON_SECTIONS = ["landing", "public", "dashboard", "admin"] as const;
export type ButtonSection = (typeof BUTTON_SECTIONS)[number];

/** A button's appearance across all sections + devices. */
export type ButtonSettings = Record<ButtonSection, ButtonPerDevice>;

/** Positions for all admin-movable floating buttons. */
export type UiButtonPositions = {
  chatbot: ButtonSettings;
  audio: ButtonSettings;
  opacity: ButtonSettings;
  edit_toggle: ButtonSettings;
};

export type PlanSlug =
  | "mensualidad"
  | "quincenal"
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
    chatbot: emptyButtonSettings(),
    audio: emptyButtonSettings(),
    opacity: emptyButtonSettings(),
    edit_toggle: emptyButtonSettings(),
  },
  plan_pricing: {
    mensualidad: { price: 90000, discount_percentage: 33 },
    quincenal: { price: 30000, discount_percentage: 0 },
    sesion: { price: 10000, discount_percentage: 50 },
    valoracion: { price: 30000, discount_percentage: 50 },
    package_12: { price: 240000, discount_percentage: 38 },
    package_15: { price: 320000, discount_percentage: 38 },
    package_20: { price: 400000, discount_percentage: 38 },
  },
};

export function emptyButtonSettings(): ButtonSettings {
  return BUTTON_SECTIONS.reduce((acc, section) => {
    acc[section] = { desktop: null, mobile: null };
    return acc;
  }, {} as ButtonSettings);
}

function parseAppearance(v: unknown): ButtonAppearance {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (typeof o.leftPct !== "number" || typeof o.topPct !== "number") return null;
  const rawScale = typeof o.scale === "number" ? o.scale : 1;
  // Clamp to keep buttons usable even if DB has garbage.
  const scale = Math.max(0.4, Math.min(2, rawScale));
  return {
    leftPct: Math.max(0, Math.min(100, o.leftPct)),
    topPct: Math.max(0, Math.min(100, o.topPct)),
    scale,
  };
}

function sanitizeButtonSettings(raw: unknown): ButtonSettings {
  const out = emptyButtonSettings();
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Record<string, unknown>;

  // New shape: nested under section keys.
  const hasSectionKeys = BUTTON_SECTIONS.some((s) => s in r);
  if (hasSectionKeys) {
    for (const section of BUTTON_SECTIONS) {
      const sectionRaw = (r[section] ?? {}) as Record<string, unknown>;
      out[section] = {
        desktop: parseAppearance(sectionRaw.desktop),
        mobile: parseAppearance(sectionRaw.mobile),
      };
    }
    return out;
  }

  // Legacy shape: { desktop, mobile } directly. Replicate to all sections so
  // an admin who already arranged things in the old global model keeps that
  // arrangement everywhere as the new starting point.
  const legacyDesktop = parseAppearance(r.desktop);
  const legacyMobile = parseAppearance(r.mobile);
  for (const section of BUTTON_SECTIONS) {
    out[section] = { desktop: legacyDesktop, mobile: legacyMobile };
  }
  return out;
}

/**
 * Merge a stored plan_pricing object with defaults per-slug, so rows saved
 * before a new plan existed (e.g. "quincenal") don't leave that plan without
 * pricing and crash the landing/planes render.
 */
function sanitizePlanPricing(v: unknown): PlanPricingConfig {
  const out = { ...CMS_DEFAULTS.plan_pricing };
  if (!v || typeof v !== "object") return out;
  const r = v as Record<string, unknown>;
  for (const slug of Object.keys(out) as PlanSlug[]) {
    const entry = r[slug];
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    if (
      typeof e.price === "number" &&
      typeof e.discount_percentage === "number"
    ) {
      out[slug] = {
        price: e.price,
        discount_percentage: e.discount_percentage,
      };
    }
  }
  return out;
}

function sanitizeButtonPositions(v: unknown): UiButtonPositions {
  if (!v || typeof v !== "object") return CMS_DEFAULTS.ui_button_positions;
  const o = v as Record<string, unknown>;
  return {
    chatbot: sanitizeButtonSettings(o.chatbot),
    audio: sanitizeButtonSettings(o.audio),
    opacity: sanitizeButtonSettings(o.opacity),
    edit_toggle: sanitizeButtonSettings(o.edit_toggle),
  };
}

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
        if (row.key === "ui_button_positions") {
          merged.ui_button_positions = sanitizeButtonPositions(row.value);
        } else if (row.key === "plan_pricing") {
          merged.plan_pricing = sanitizePlanPricing(row.value);
        } else {
          // Trust DB shape; fall back per-key on any malformed value
          (merged as Record<string, unknown>)[row.key] = row.value;
        }
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
