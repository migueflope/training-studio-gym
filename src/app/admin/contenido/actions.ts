"use server";

import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin/assertAdmin";
import {
  CMS_DEFAULTS,
  type BankConfig,
  type ButtonCoords,
  type PlanPricingConfig,
  type PlanPricingEntry,
  type PlanSlug,
  type TrainerConfig,
  type UiButtonPositions,
} from "@/lib/cms";

function looksLikeHeic(file: File, buffer: Buffer): boolean {
  const name = file.name.toLowerCase();
  if (name.endsWith(".heic") || name.endsWith(".heif")) return true;
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  // ISO BMFF magic: bytes 4..8 are "ftyp", brand at 8..12 is one of:
  // heic, heix, hevc, hevx, mif1, msf1
  if (buffer.length < 12) return false;
  const ftyp = buffer.subarray(4, 8).toString("ascii");
  if (ftyp !== "ftyp") return false;
  const brand = buffer.subarray(8, 12).toString("ascii");
  return ["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(brand);
}

async function processImageToJpeg(
  file: File,
  opts: { maxSize: number; rotation?: number; quality?: number },
): Promise<{ buffer: Buffer; contentType: "image/jpeg" }> {
  const arrayBuffer = await file.arrayBuffer();
  let workingBuffer = Buffer.from(arrayBuffer);

  // Sharp's prebuilt libheif on Vercel ships without libde265, so HEIC
  // (HEVC-compressed HEIF) fails to decode. Run those through heic-convert
  // first to get a JPEG buffer that sharp can then resize/rotate.
  if (looksLikeHeic(file, workingBuffer)) {
    // heic-convert types want an ArrayBufferLike; cast keeps Buffer compatible.
    const heicConvert = (await import("heic-convert")).default;
    const jpegArr = await heicConvert({
      buffer: workingBuffer as unknown as ArrayBuffer,
      format: "JPEG",
      quality: 0.9,
    });
    workingBuffer = Buffer.from(jpegArr);
  }

  // First pass: auto-rotate from EXIF (this also strips the orientation tag)
  let pipeline = sharp(workingBuffer, { failOn: "none" }).rotate();
  // Apply manual rotation as a second pass (sharp's rotate(angle) replaces
  // the EXIF auto-rotate, so we have to chain via an intermediate buffer).
  if (opts.rotation && opts.rotation % 360 !== 0) {
    const intermediate = await pipeline.toBuffer();
    pipeline = sharp(intermediate).rotate(opts.rotation);
  }
  const buffer = await pipeline
    .resize(opts.maxSize, opts.maxSize, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: opts.quality ?? 85, mozjpeg: true })
    .toBuffer();
  return { buffer, contentType: "image/jpeg" };
}

type Result<T = void> =
  | (T extends void ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string };

const TEXT_KEYS = [
  "hero_title",
  "hero_subtitle",
  "about_text",
  "address",
  "hours_weekdays",
  "hours_saturday",
  "hours_sunday",
  "contact_email",
  "whatsapp_display",
] as const;

const BANK_KEYS = ["bank_bancolombia", "bank_nequi", "bank_daviplata"] as const;
type BankKey = (typeof BANK_KEYS)[number];

const TRAINER_KEYS = ["trainer_1", "trainer_2"] as const;
type TrainerKey = (typeof TRAINER_KEYS)[number];

const PLAN_SLUGS: readonly PlanSlug[] = [
  "mensualidad",
  "sesion",
  "valoracion",
  "package_12",
  "package_15",
  "package_20",
] as const;

export async function saveCmsContent(formData: FormData): Promise<Result> {
  const { supabase } = await assertAdmin();

  const updates: { key: string; value: unknown }[] = [];

  for (const k of TEXT_KEYS) {
    const v = String(formData.get(k) ?? "").trim();
    if (!v) return { ok: false, error: `El campo "${k}" no puede estar vacío.` };
    updates.push({ key: k, value: v });
  }

  const whatsappNumber = String(formData.get("whatsapp_number") ?? "").trim();
  if (!/^\d{8,15}$/.test(whatsappNumber)) {
    return {
      ok: false,
      error: "WhatsApp inválido (solo dígitos, con código país, ej. 573122765732).",
    };
  }
  updates.push({ key: "whatsapp_number", value: whatsappNumber });

  for (const k of BANK_KEYS) {
    const name = String(formData.get(`${k}__name`) ?? "").trim();
    const holder = String(formData.get(`${k}__holder`) ?? "").trim();
    const account = String(formData.get(`${k}__account`) ?? "").trim();
    const enabled = formData.get(`${k}__enabled`) === "on";
    const qrPath = String(formData.get(`${k}__qr_path`) ?? "").trim() || null;

    if (!name || !holder || !account) {
      return {
        ok: false,
        error: `Datos bancarios incompletos para ${k.replace("bank_", "")}.`,
      };
    }
    const value: BankConfig = { name, holder, account, qr_path: qrPath, enabled };
    updates.push({ key: k, value });
  }

  for (const k of TRAINER_KEYS) {
    const name = String(formData.get(`${k}__name`) ?? "").trim();
    const enabled = formData.get(`${k}__enabled`) === "on";
    const photoPath = String(formData.get(`${k}__photo_path`) ?? "").trim() || null;
    if (!name) {
      return {
        ok: false,
        error: `Falta el nombre del entrenador (${k}).`,
      };
    }
    const value: TrainerConfig = { name, photo_path: photoPath, enabled };
    updates.push({ key: k, value });
  }

  // Per-plan original price + discount %. Final price shown to users is
  // computed at render time as price * (1 - discount/100).
  const planPricing: Partial<PlanPricingConfig> = {};
  for (const slug of PLAN_SLUGS) {
    const priceRaw = String(formData.get(`plan_${slug}__price`) ?? "").replace(
      /[^\d]/g,
      "",
    );
    const discountRaw = String(
      formData.get(`plan_${slug}__discount_percentage`) ?? "",
    ).replace(/[^\d.-]/g, "");
    const price = Number(priceRaw);
    const discount = Number(discountRaw);
    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, error: `Precio inválido en plan ${slug}.` };
    }
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      return {
        ok: false,
        error: `Descuento inválido en plan ${slug} (debe ser 0-100).`,
      };
    }
    const entry: PlanPricingEntry = {
      price: Math.round(price),
      discount_percentage: Math.round(discount),
    };
    planPricing[slug] = entry;
  }
  updates.push({ key: "plan_pricing", value: planPricing as PlanPricingConfig });

  // Mirror the basic-plan prices into the legacy `price_monthly/session/
  // assessment` keys so anything that still reads them (chatbot context,
  // older callers) stays in sync without a separate edit.
  updates.push({ key: "price_monthly", value: planPricing.mensualidad!.price });
  updates.push({ key: "price_session", value: planPricing.sesion!.price });
  updates.push({ key: "price_assessment", value: planPricing.valoracion!.price });

  for (const u of updates) {
    const { error } = await supabase.from("content").upsert(
      {
        key: u.key,
        value: u.value as never,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/contenido");
  revalidatePath("/", "layout");
  return { ok: true };
}

type ButtonKey = keyof UiButtonPositions;
const BUTTON_KEYS: readonly ButtonKey[] = ["chatbot", "audio", "opacity"] as const;

function isButtonKey(v: unknown): v is ButtonKey {
  return typeof v === "string" && (BUTTON_KEYS as readonly string[]).includes(v);
}

/**
 * Persist the pixel position for one floating button (chatbot / hero audio /
 * hero opacity editor) for a given device class. Reads the current value to
 * preserve the slot the admin isn't editing.
 */
export async function saveButtonPosition(input: {
  key: ButtonKey;
  device: "desktop" | "mobile";
  coords: ButtonCoords;
}): Promise<Result> {
  const { supabase } = await assertAdmin();

  if (!isButtonKey(input.key)) return { ok: false, error: "Botón inválido." };
  if (input.device !== "desktop" && input.device !== "mobile") {
    return { ok: false, error: "Dispositivo inválido." };
  }

  let coords: ButtonCoords;
  if (input.coords === null) {
    coords = null;
  } else {
    const leftPct = Number(input.coords.leftPct);
    const topPct = Number(input.coords.topPct);
    if (!Number.isFinite(leftPct) || !Number.isFinite(topPct)) {
      return { ok: false, error: "Coordenadas inválidas." };
    }
    coords = {
      leftPct: Math.max(0, Math.min(100, leftPct)),
      topPct: Math.max(0, Math.min(100, topPct)),
    };
  }

  const { data: row } = await supabase
    .from("content")
    .select("value")
    .eq("key", "ui_button_positions")
    .maybeSingle();
  const current =
    (row?.value as Partial<UiButtonPositions> | null) ??
    CMS_DEFAULTS.ui_button_positions;

  const next: UiButtonPositions = {
    chatbot: current.chatbot ?? CMS_DEFAULTS.ui_button_positions.chatbot,
    audio: current.audio ?? CMS_DEFAULTS.ui_button_positions.audio,
    opacity: current.opacity ?? CMS_DEFAULTS.ui_button_positions.opacity,
  };
  next[input.key] = { ...next[input.key], [input.device]: coords };

  const { error } = await supabase.from("content").upsert(
    {
      key: "ui_button_positions",
      value: next as never,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Persist the hero video opacity sliders driven by the in-page admin
 * editor. Both values are integers 0-100; we clamp + round defensively.
 */
export async function saveHeroVideoOpacity(input: {
  mobile: number;
  desktop: number;
}): Promise<Result> {
  const { supabase } = await assertAdmin();

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  const mobile = clamp(Number(input.mobile));
  const desktop = clamp(Number(input.desktop));
  if (!Number.isFinite(mobile) || !Number.isFinite(desktop)) {
    return { ok: false, error: "Valor de opacidad inválido." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("content").upsert(
    [
      { key: "hero_video_opacity_mobile", value: mobile as never, updated_at: now },
      { key: "hero_video_opacity_desktop", value: desktop as never, updated_at: now },
    ],
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function uploadBankQr(
  bankKey: BankKey,
  formData: FormData,
): Promise<
  | { ok: true; path: string; publicUrl: string | null }
  | { ok: false; error: string }
> {
  const { supabase } = await assertAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecciona una imagen." };
  }
  if (file.size > 4 * 1024 * 1024) {
    return { ok: false, error: "Imagen muy pesada (máx 4MB por límite de Vercel)." };
  }
  const rotation = Number(formData.get("rotation") ?? 0);

  let processed;
  try {
    processed = await processImageToJpeg(file, {
      maxSize: 1200,
      rotation: Number.isFinite(rotation) ? rotation : 0,
      quality: 90,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: `No se pudo procesar la imagen (${detail}).`,
    };
  }

  const path = `${bankKey}-${Date.now()}.jpg`;
  const { error: upErr } = await supabase.storage
    .from("payment-qrs")
    .upload(path, processed.buffer, {
      upsert: true,
      contentType: processed.contentType,
    });
  if (upErr) return { ok: false, error: upErr.message };
  const { data: publicData } = supabase.storage
    .from("payment-qrs")
    .getPublicUrl(path);
  const publicUrl = publicData?.publicUrl ?? null;

  // Update the bank record so the new QR is live immediately. We need to
  // preserve the rest of the bank fields, so read first.
  const { data: row } = await supabase
    .from("content")
    .select("value")
    .eq("key", bankKey)
    .maybeSingle();
  const current = (row?.value ?? {}) as Partial<BankConfig>;
  const next: BankConfig = {
    name: current.name ?? "",
    holder: current.holder ?? "",
    account: current.account ?? "",
    enabled: current.enabled ?? true,
    qr_path: path,
  };

  const { error: updErr } = await supabase.from("content").upsert(
    { key: bankKey, value: next as never, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/admin/contenido");
  revalidatePath("/", "layout");
  return { ok: true, path, publicUrl };
}

export async function removeBankQr(
  bankKey: BankKey,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase } = await assertAdmin();

  const { data: row } = await supabase
    .from("content")
    .select("value")
    .eq("key", bankKey)
    .maybeSingle();
  const current = (row?.value ?? {}) as Partial<BankConfig>;

  if (current.qr_path) {
    await supabase.storage.from("payment-qrs").remove([current.qr_path]);
  }

  const next: BankConfig = {
    name: current.name ?? "",
    holder: current.holder ?? "",
    account: current.account ?? "",
    enabled: current.enabled ?? true,
    qr_path: null,
  };

  const { error } = await supabase.from("content").upsert(
    { key: bankKey, value: next as never, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/contenido");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function uploadTrainerPhoto(
  trainerKey: TrainerKey,
  formData: FormData,
): Promise<
  | { ok: true; path: string; publicUrl: string | null }
  | { ok: false; error: string }
> {
  const { supabase } = await assertAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecciona una imagen." };
  }
  if (file.size > 4 * 1024 * 1024) {
    return { ok: false, error: "Imagen muy pesada (máx 4MB por límite de Vercel)." };
  }
  const rotation = Number(formData.get("rotation") ?? 0);

  let processed;
  try {
    processed = await processImageToJpeg(file, {
      maxSize: 1600,
      rotation: Number.isFinite(rotation) ? rotation : 0,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: `No se pudo procesar la imagen (${detail}). Si es HEIC del iPhone, prueba activando "Más compatible" en Ajustes → Cámara → Formatos.`,
    };
  }

  const path = `${trainerKey}-${Date.now()}.jpg`;
  const { error: upErr } = await supabase.storage
    .from("trainer-photos")
    .upload(path, processed.buffer, {
      upsert: true,
      contentType: processed.contentType,
    });
  if (upErr) return { ok: false, error: upErr.message };
  const { data: publicData } = supabase.storage
    .from("trainer-photos")
    .getPublicUrl(path);
  const publicUrl = publicData?.publicUrl ?? null;

  const { data: row } = await supabase
    .from("content")
    .select("value")
    .eq("key", trainerKey)
    .maybeSingle();
  const current = (row?.value ?? {}) as Partial<TrainerConfig>;
  const next: TrainerConfig = {
    name: current.name ?? "",
    enabled: current.enabled ?? true,
    photo_path: path,
  };

  const { error: updErr } = await supabase.from("content").upsert(
    { key: trainerKey, value: next as never, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/admin/contenido");
  revalidatePath("/", "layout");
  return { ok: true, path, publicUrl };
}

export async function removeTrainerPhoto(
  trainerKey: TrainerKey,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase } = await assertAdmin();

  const { data: row } = await supabase
    .from("content")
    .select("value")
    .eq("key", trainerKey)
    .maybeSingle();
  const current = (row?.value ?? {}) as Partial<TrainerConfig>;

  if (current.photo_path) {
    await supabase.storage.from("trainer-photos").remove([current.photo_path]);
  }

  const next: TrainerConfig = {
    name: current.name ?? "",
    enabled: current.enabled ?? true,
    photo_path: null,
  };

  const { error } = await supabase.from("content").upsert(
    { key: trainerKey, value: next as never, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/contenido");
  revalidatePath("/", "layout");
  return { ok: true };
}
